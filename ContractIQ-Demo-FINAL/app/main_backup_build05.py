import os
import math
import uuid
from pathlib import Path
from typing import Optional

import fitz
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL", "qwen2.5vl:latest"
).rstrip("/")

CHAT_MODEL = os.getenv("CHAT_MODEL", "llama3.2:latest")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text:latest")
FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN", "http://localhost:3000"
)

# Project root/documents
DOCUMENTS_DIR = Path(__file__).resolve().parent.parent / "documents"
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)

# Temporary in-memory document index.
# Documents must be re-indexed after a backend restart.
DOCUMENT_STORE = {}

DEFAULT_CHAT_PROMPT = (
    "You are ContractIQ AI, a careful commercial contract analyst. "
    "Explain contract concepts clearly. Do not invent contract wording, "
    "dates, amounts or obligations. If no contract evidence is provided, "
    "say you are giving general information. Do not present your response "
    "as legal advice."
)

DOCUMENT_QA_PROMPT = """
You are ContractIQ AI, an expert commercial contract intelligence assistant.

You must carefully inspect ALL supplied contract evidence before answering.

IMPORTANT RULES:

1. Search every supplied passage for information relevant to the question.
2. Extract exact amounts, dates, names, percentages and contractual periods.
3. Do not say information is missing if it appears anywhere in the evidence.
4. Do not confuse a liability cap with the contract value.
5. Distinguish contract fees from taxes and other potential obligations.
6. If the answer is genuinely absent, say:
   "This information is not specified in the provided contract."
7. Cite the relevant section and page number.
8. Never invent contractual terms.
9. Do not provide legal advice.

ANSWER FORMAT:

Answer: Give the direct answer first.

Explanation: Briefly explain the contractual provision.

Evidence: Quote the relevant contract wording.

Source: State the section and page number.
""".strip()

app = FastAPI(
    title="ContractIQ AI Backend",
    version="0.3.0",
    description="Local contract intelligence powered by Ollama."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ORIGIN,
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=12000)
    system_prompt: Optional[str] = None


class EmbedRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20000)


class IndexRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)


class DocumentAskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=12000)


async def ollama_get(path: str):
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                f"{OLLAMA_BASE_URL}{path}"
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot reach Ollama: {exc}"
        )


async def ollama_post(
    path: str,
    payload: dict,
    timeout: float = 180.0
):
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}{path}",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama error: {exc.response.text[:1000]}"
        )

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot reach Ollama: {exc}"
        )


async def create_embedding(text: str):
    result = await ollama_post(
        "/api/embed",
        {
            "model": EMBED_MODEL,
            "input": text
        },
        timeout=120.0
    )

    vectors = result.get("embeddings", [])

    if not vectors:
        raise HTTPException(
            status_code=502,
            detail="Embedding model returned no vector."
        )

    return vectors[0]


def cosine_similarity(a, b):
    if len(a) != len(b):
        return 0.0

    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (norm_a * norm_b)


def split_text(text: str, chunk_size=1200, overlap=150):
    text = " ".join(text.split())

    if len(text) <= chunk_size:
        return [text] if text else []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])

        if end == len(text):
            break

        start = end - overlap

    return chunks


@app.get("/")
async def root():
    return {
        "name": "ContractIQ AI Backend",
        "version": "0.3.0",
        "status": "running"
    }


@app.get("/api/health")
async def health():
    tags = await ollama_get("/api/tags")
    installed = {
        m.get("name")
        for m in tags.get("models", [])
    }

    return {
        "api": "ok",
        "ollama": "connected",
        "chat_model": CHAT_MODEL,
        "chat_model_installed": CHAT_MODEL in installed,
        "embedding_model": EMBED_MODEL,
        "embedding_model_installed": EMBED_MODEL in installed,
        "indexed_documents": len(DOCUMENT_STORE)
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    system = request.system_prompt or DEFAULT_CHAT_PROMPT

    result = await ollama_post(
        "/api/chat",
        {
            "model": CHAT_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": request.message}
            ],
            "stream": False
        }
    )

    return {
        "model": result.get("model", CHAT_MODEL),
        "response": result.get("message", {}).get("content", ""),
        "done": result.get("done", True)
    }


@app.post("/api/embed")
async def embed(request: EmbedRequest):
    vector = await create_embedding(request.text)

    return {
        "model": EMBED_MODEL,
        "dimensions": len(vector),
        "embedding": vector
    }


@app.post("/api/documents/index-local")
async def index_local_document(request: IndexRequest):
    # Only permit a filename, not arbitrary filesystem paths.
    filename = Path(request.filename).name

    if filename != request.filename:
        raise HTTPException(
            status_code=400,
            detail="Please provide only the PDF filename."
        )

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    pdf_path = DOCUMENTS_DIR / filename

    if not pdf_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"PDF not found in documents folder: {filename}"
        )

    try:
        pdf = fitz.open(str(pdf_path))
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not read PDF: {exc}"
        )

    chunks = []

    try:
        for page_number, page in enumerate(pdf, start=1):
            page_text = page.get_text("text").strip()

            if not page_text:
                continue

            for part in split_text(page_text):
                vector = await create_embedding(part)

                chunks.append({
                    "page": page_number,
                    "text": part,
                    "embedding": vector
                })
    finally:
        pdf.close()

    if not chunks:
        raise HTTPException(
            status_code=422,
            detail=(
                "No selectable text was found in this PDF. "
                "It may be scanned and require OCR."
            )
        )

    document_id = str(uuid.uuid4())

    DOCUMENT_STORE[document_id] = {
        "filename": filename,
        "chunks": chunks
    }

    return {
        "message": "PDF indexed successfully.",
        "document_id": document_id,
        "filename": filename,
        "pages_indexed": len(set(c["page"] for c in chunks)),
        "chunks_created": len(chunks)
    }


@app.post("/api/documents/{document_id}/ask")
async def ask_document(
    document_id: str,
    request: DocumentAskRequest
):
    document = DOCUMENT_STORE.get(document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found. Please index it again."
        )

    query_vector = await create_embedding(request.question)

    ranked = []

    for chunk in document["chunks"]:
        score = cosine_similarity(
            query_vector,
            chunk["embedding"]
        )

        ranked.append((score, chunk))

    ranked.sort(key=lambda item: item[0], reverse=True)

    selected = ranked[:4]

    context_parts = []
    sources = []

    for score, chunk in selected:
        context_parts.append(
            f"[Page {chunk['page']}]\n{chunk['text']}"
        )

        sources.append({
            "page": chunk["page"],
            "text": chunk["text"],
            "similarity": round(score, 4)
        })

    context = "\n\n".join(context_parts)

    result = await ollama_post(
        "/api/chat",
        {
            "model": CHAT_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": DOCUMENT_QA_PROMPT
                },
                {
                    "role": "user",
                    "content": (
                        f"Contract filename: {document['filename']}\n\n"
                        f"Contract evidence:\n{context}\n\n"
                        f"Question: {request.question}"
                    )
                }
            ],
            "stream": False,
            "options": {
                "temperature": 0,
                "num_ctx": 8192
            }
        }
    )

    return {
        "document_id": document_id,
        "filename": document["filename"],
        "model": CHAT_MODEL,
        "question": request.question,
        "answer": result.get("message", {}).get("content", ""),
        "sources": sources
    }


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF, save it in documents/, and automatically index it.
    """

    original_name = Path(file.filename or "").name

    if not original_name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    content = await file.read()

    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid PDF."
        )

    max_size = 20 * 1024 * 1024

    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail="PDF exceeds the 20 MB upload limit."
        )

    # Generate a unique server-side filename.
    safe_name = Path(original_name).stem[:100]
    stored_name = f"{uuid.uuid4().hex}_{safe_name}.pdf"

    destination = DOCUMENTS_DIR / stored_name
    destination.write_bytes(content)

    # Reuse the existing PDF extraction and embedding pipeline.
    result = await index_local_document(
        IndexRequest(filename=stored_name)
    )

    return {
        "message": "Contract uploaded and indexed successfully.",
        **result
    }


@app.get("/api/documents")
async def list_documents():
    """
    List documents indexed during the current backend session.
    """

    results = []

    for document_id, document in DOCUMENT_STORE.items():
        chunks = document["chunks"]

        results.append({
            "document_id": document_id,
            "filename": document["filename"],
            "pages": len(set(c["page"] for c in chunks)),
            "chunks": len(chunks),
            "status": "indexed"
        })

    return {
        "total": len(results),
        "documents": results
    }