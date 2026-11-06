
import asyncio
import json

from app.analysis_engine import analyse_contract


async def main():
    sample_contract = """
    SERVICE AGREEMENT

    Section 1: Parties
    This agreement is between the Customer and the Provider.

    Section 2: Implementation Fee
    Customer will pay Provider a fixed implementation fee of
    INR 4,80,000 (Indian Rupees Four Lakh Eighty Thousand),
    exclusive of applicable taxes.

    Section 3: Services
    Provider will deliver implementation services to Customer.
    """

    result = await analyse_contract(sample_contract)

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())
