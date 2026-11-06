import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.db_models import DocumentChunk

DOC_ID = "bb34d8d7-1ccc-4f34-a5f3-5da74539c07d"

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(DocumentChunk)
            .where(DocumentChunk.contract_id == DOC_ID)
            .order_by(DocumentChunk.page_number, DocumentChunk.id)
        )
        chunks = result.scalars().all()
        print("Total chunks:", len(chunks))
        for chunk in chunks:
            print(f"\n--- Chunk {chunk.id} | Page {chunk.page_number} | {len(chunk.chunk_text)} chars ---")
            print(chunk.chunk_text[:700])

asyncio.run(main())
