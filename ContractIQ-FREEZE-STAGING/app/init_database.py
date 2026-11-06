
import asyncio

from app.database import init_db, close_db
from app.db_models import (
    Contract,
    DocumentChunk,
    ContractAnalysis,
    ContractRisk,
    ContractTerm,
)



async def main():
    print("Connecting to ContractIQ AI database...")

    try:
        await init_db()
        print("Database tables created successfully!")
    finally:
        await close_db()


if __name__ == "__main__":
    asyncio.run(main())
