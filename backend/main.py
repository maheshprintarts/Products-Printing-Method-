from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from database import init_db, UPLOADS_DIR
from routers import products, recommend, auth, images


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Printing Method Recommendation System",
    description="API for recommending printing methods for promotional products.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded product images as static files
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(products.router)
app.include_router(images.router)
app.include_router(recommend.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "message": "Printing Method Recommendation System API",
        "docs": "/docs",
        "version": "1.0.0"
    }
