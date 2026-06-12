import os
import time

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    sessionmaker,
    declarative_base,
)

from dotenv import load_dotenv


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")


DB_RETRIES = int(
    os.getenv(
        "DB_RETRIES",
        10,
    )
)


DB_RETRY_DELAY = int(
    os.getenv(
        "DB_RETRY_DELAY",
        3,
    )
)


DB_POOL_SIZE = int(
    os.getenv(
        "DB_POOL_SIZE",
        10,
    )
)


DB_MAX_OVERFLOW = int(
    os.getenv(
        "DB_MAX_OVERFLOW",
        20,
    )
)


DB_ECHO = (
    os.getenv(
        "DB_ECHO",
        "false",
    ).lower()
    == "true"
)



if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL missing in environment"
    )



def create_engine_with_retry(
    url: str,
):

    for attempt in range(
        1,
        DB_RETRIES + 1,
    ):

        try:

            engine = create_engine(
                url,
                pool_pre_ping=True,
                pool_size=DB_POOL_SIZE,
                max_overflow=DB_MAX_OVERFLOW,
                echo=DB_ECHO,
            )


            with engine.connect():
                pass


            print(
                f"Database connected on attempt {attempt}"
            )


            return engine


        except Exception as error:

            print(
                f"DB connection failed "
                f"({attempt}/{DB_RETRIES})"
            )


            if attempt < DB_RETRIES:

                time.sleep(
                    DB_RETRY_DELAY
                )

            else:

                raise error



engine = create_engine_with_retry(
    DATABASE_URL
)



SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)



Base = declarative_base()



def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()