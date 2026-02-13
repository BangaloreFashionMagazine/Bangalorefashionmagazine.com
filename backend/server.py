"""
Bangalore Fashion Magazine API
Refactored into modular structure for maintainability
"""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Bangalore Fashion Magazine API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import route factories
from routes import (
    create_auth_routes,
    create_talent_routes,
    create_admin_routes,
    create_content_routes
)
from routes.analytics import create_analytics_routes
from services import TALENT_CATEGORIES


# ============== Health Check Endpoint ==============
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Service is running"}


# ============== API Root ==============
@api_router.get("/")
async def root():
    return {"message": "Bangalore Fashion Magazine API"}


@api_router.get("/categories")
async def get_categories():
    return {"categories": TALENT_CATEGORIES}


# Register all route modules
auth_routes = create_auth_routes(db)
talent_routes = create_talent_routes(db)
admin_routes = create_admin_routes(db)
content_routes = create_content_routes(db)
analytics_routes = create_analytics_routes(db)

# Include all routes in the API router
api_router.include_router(auth_routes)
api_router.include_router(talent_routes)
api_router.include_router(admin_routes)
api_router.include_router(content_routes)
api_router.include_router(analytics_routes)

# Include the API router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
