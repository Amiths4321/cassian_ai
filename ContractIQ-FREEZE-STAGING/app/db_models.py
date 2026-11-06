
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    Text,
    DateTime,
    Date,
    Float,
    Numeric,
    ForeignKey,
    JSON,
)
from sqlalchemy import (
    String,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector

from app.database import Base


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="indexed",
        nullable=False,
    )

    pages_indexed: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    chunks_created: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    contract_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    page_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    chunk_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    embedding: Mapped[list] = mapped_column(
        Vector(768),
        nullable=False,
    )



class ContractAnalysis(Base):
    __tablename__ = "contract_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    contract_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    analysis_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    result: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class ContractRisk(Base):
    __tablename__ = "contract_risks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    contract_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    analysis_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("contract_analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    risk: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    evidence: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    review_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
    )

    review_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

class ContractTerm(Base):
    __tablename__ = "contract_terms"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    contract_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Classification
    term_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    term_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Original contract evidence
    original_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    clause_reference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    source_chunk_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("document_chunks.id", ondelete="SET NULL"),
        nullable=True,
    )

    # AI interpretation
    interpretation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # Time-related details
    effective_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    expiry_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Commercial information
    financial_impact: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Missing information and ambiguity flags
    missing_information: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Human review
    review_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending",
    )

    review_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

class ContractClause(Base):
    __tablename__ = "contract_clauses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    contract_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    parent_clause_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("contract_clauses.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    clause_reference: Mapped[str | None] = mapped_column(String(150), nullable=True)
    heading: Mapped[str | None] = mapped_column(String(500), nullable=True)

    original_text: Mapped[str] = mapped_column(Text, nullable=False)

    page_start: Mapped[int | None] = mapped_column(Integer, nullable=True)
    page_end: Mapped[int | None] = mapped_column(Integer, nullable=True)

    sequence_number: Mapped[int | None] = mapped_column(Integer, nullable=True)

    source_chunk_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)

    extraction_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending"
    )

    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    review_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending"
    )

    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class ContractRule(Base):
    __tablename__ = "contract_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    contract_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("contracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    clause_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("contract_clauses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    source_chunk_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("document_chunks.id", ondelete="SET NULL"),
        nullable=True,
    )

    rule_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[str | None] = mapped_column(String(150), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)

    actor: Mapped[str | None] = mapped_column(String(500), nullable=True)
    beneficiary: Mapped[str | None] = mapped_column(String(500), nullable=True)

    modality: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action: Mapped[str | None] = mapped_column(Text, nullable=True)

    trigger_condition: Mapped[str | None] = mapped_column(Text, nullable=True)
    deadline_or_duration: Mapped[str | None] = mapped_column(Text, nullable=True)

    amount_or_formula: Mapped[str | None] = mapped_column(Text, nullable=True)
    exceptions_or_qualifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    consequence_or_remedy: Mapped[str | None] = mapped_column(Text, nullable=True)

    cross_references: Mapped[list | None] = mapped_column(JSON, nullable=True)

    original_text: Mapped[str] = mapped_column(Text, nullable=False)
    plain_language_explanation: Mapped[str] = mapped_column(Text, nullable=False)

    contractual_interpretation: Mapped[str | None] = mapped_column(Text, nullable=True)
    uncertainty_or_ambiguity: Mapped[str | None] = mapped_column(Text, nullable=True)

    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    review_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending"
    )

    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

class ContractCommercialDetail(Base):
    """
    Machine-readable commercial attributes linked to an
    evidence-backed ContractTerm.
    """

    __tablename__ = "contract_commercial_details"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    term_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("contract_terms.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    commercial_type: Mapped[str | None] = mapped_column(
        String(60), nullable=True
    )

    rate_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 6), nullable=True
    )

    currency: Mapped[str | None] = mapped_column(
        String(10), nullable=True
    )

    rate_unit: Mapped[str | None] = mapped_column(
        String(120), nullable=True
    )

    rate_basis: Mapped[str | None] = mapped_column(
        String(150), nullable=True
    )

    percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 6), nullable=True
    )

    index_name: Mapped[str | None] = mapped_column(
        String(120), nullable=True
    )

    index_base_value: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 6), nullable=True
    )

    indexation_frequency: Mapped[str | None] = mapped_column(
        String(80), nullable=True
    )

    indexation_cap_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 6), nullable=True
    )

    indexation_floor_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 6), nullable=True
    )

    fx_reference: Mapped[str | None] = mapped_column(
        String(120), nullable=True
    )

    fx_date_rule: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    volume_min: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 6), nullable=True
    )

    volume_max: Mapped[Decimal | None] = mapped_column(
        Numeric(20, 6), nullable=True
    )

    volume_unit: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    payment_due_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    renewal_notice_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    exit_notice_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
