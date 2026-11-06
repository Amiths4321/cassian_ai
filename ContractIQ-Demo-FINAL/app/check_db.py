
import asyncio
from sqlalchemy import text
from app.database import engine


async def main():
    async with engine.connect() as connection:
        result = await connection.execute(
            text("""
                SELECT
                    current_database(),
                    current_user,
                    inet_server_addr(),
                    inet_server_port(),
                    version()
            """)
        )

        print("DATABASE CONNECTION:")
        print(result.fetchone())

        extension = await connection.execute(
            text("""
                SELECT extname
                FROM pg_extension
                WHERE extname = 'vector'
            """)
        )

        print("PGVECTOR EXTENSION:")
        print(extension.fetchall())

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
