from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text


from app.database import (
    Base,
    engine,
)


# IMPORTANT:
# import all models before create_all()
from app.models.accident import Accident
from app.models.district import District


from app.routers import dashboard
from app.routers import gis



@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Initializing database...")


    with engine.connect() as conn:

        conn.execute(
            text(
                "CREATE EXTENSION IF NOT EXISTS postgis;"
            )
        )

        conn.commit()


    Base.metadata.create_all(
        bind=engine
    )


    print("Database ready.")


    yield



app = FastAPI(
    title="Dashboard GIS API",
    lifespan=lifespan
)



app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_methods=["*"],

    allow_headers=["*"],

)



app.include_router(
    dashboard.router
)


app.include_router(
    gis.router
)



@app.get("/health")
def health_check():

    return {
        "status": "ok"
    }



@app.get("/")
def home():

    return {
        "message": "Dashboard GIS API is running"
    }