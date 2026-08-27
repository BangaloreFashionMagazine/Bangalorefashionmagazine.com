"""
Bangalore Fashion Magazine API
Refactored into modular structure for maintainability
"""
from fastapi import FastAPI, APIRouter, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
import secrets
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
from routes.store import create_store_routes
from services import TALENT_CATEGORIES
from dependencies.auth import get_current_admin


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


@api_router.get("/share-settings")
async def get_public_share_settings():
    """Public endpoint to check if sharing is enabled"""
    settings = await db.settings.find_one({"type": "share_settings"}, {"_id": 0})
    return {"share_enabled": settings.get("share_enabled", True) if settings else True}


# Combined homepage data endpoint for faster loading
@api_router.get("/homepage-data")
async def get_homepage_data():
    """Get all homepage data in a single request for faster loading"""
    try:
        # Fetch all data in parallel
        hero_images = await db.hero_images.find({}, {"_id": 0}).sort("order", 1).to_list(20)
        awards = await db.awards.find({"is_active": {"$ne": False}}, {"_id": 0}).to_list(10)
        ads = await db.advertisements.find({}, {"_id": 0}).sort("order", 1).to_list(20)
        magazine = await db.magazine.find_one({}, {"_id": 0})
        music = await db.music.find_one({}, {"_id": 0})
        video = await db.video.find_one({}, {"_id": 0})
        party_events = await db.party_events.find({"is_active": {"$ne": False}}, {"_id": 0}).sort("event_date", -1).to_list(10)

        return {
            "hero_images": hero_images or [],
            "awards": awards or [],
            "ads": ads or [],
            "magazine": magazine if magazine and magazine.get("id") else None,
            "music": music if music and music.get("id") and music.get("file_data") else None,
            "video": video if video and video.get("id") else None,
            "party_events": party_events or []
        }
    except Exception as e:
        logger.error(f"Error fetching homepage data: {e}")
        return {
            "hero_images": [],
            "awards": [],
            "ads": [],
            "magazine": None,
            "music": None,
            "video": None,
            "party_events": []
        }


# Register all route modules
auth_routes = create_auth_routes(db)
talent_routes = create_talent_routes(db)
admin_routes = create_admin_routes(db)
content_routes = create_content_routes(db)
analytics_routes = create_analytics_routes(db)
store_routes = create_store_routes(db)

from routes.instagram import create_instagram_routes
instagram_routes = create_instagram_routes(db)

from routes.magazine_builder import create_magazine_builder_router
magazine_builder_routes = create_magazine_builder_router(db)

from routes.password_reset import create_password_reset_routes
password_reset_routes = create_password_reset_routes(db)

from routes.payments import create_payments_router
payments_routes = create_payments_router(db)

from routes.hero import create_hero_routes
hero_routes = create_hero_routes(db)

from routes.seo import create_seo_routes
seo_routes = create_seo_routes(db)

from routes.categories import create_category_routes
category_routes = create_category_routes(db)

from routes.magazine_features import create_magazine_feature_routes
magazine_feature_routes = create_magazine_feature_routes(db)

# Include all routes in the API router
api_router.include_router(auth_routes)
api_router.include_router(talent_routes)
api_router.include_router(admin_routes)
api_router.include_router(content_routes)
api_router.include_router(analytics_routes)
api_router.include_router(store_routes)
api_router.include_router(instagram_routes, dependencies=[Depends(get_current_admin)])
api_router.include_router(magazine_builder_routes, dependencies=[Depends(get_current_admin)])
api_router.include_router(password_reset_routes)
api_router.include_router(payments_routes)
api_router.include_router(hero_routes)
api_router.include_router(seo_routes)
api_router.include_router(category_routes)
api_router.include_router(magazine_feature_routes)

# Include the API router in the main app
app.include_router(api_router)

# CORS middleware
_cors_origins_raw = os.environ.get('CORS_ORIGINS', '')
_cors_origins = [o.strip() for o in _cors_origins_raw.split(',') if o.strip()]
if not _cors_origins or '*' in _cors_origins:
    logger.warning(
        "CORS_ORIGINS is unset or contains '*' - falling back to no cross-origin credentialed access. "
        "Set CORS_ORIGINS in .env to an explicit comma-separated list of allowed origins."
    )
    _cors_origins = []

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_ensure_admin():
    """Ensure an admin user exists. Only creates one if none exists yet - never
    overwrites an existing admin's password, so a password change made through
    the app or the database survives every restart/deploy."""
    import uuid as _uuid
    from services import hash_password

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@bangalorefashionmag.com")
    admin_password = os.environ.get("ADMIN_PASSWORD")

    existing = await db.users.find_one({"is_admin": True})
    if existing:
        return

    if not admin_password:
        admin_password = secrets.token_urlsafe(16)
        logger.warning(
            f"No admin account exists and ADMIN_PASSWORD is not set. Creating {admin_email} "
            f"with a generated one-time password - check the server logs to retrieve it, then "
            f"change it immediately. Set ADMIN_EMAIL/ADMIN_PASSWORD in .env to control this."
        )
        logger.warning(f"Generated admin password for {admin_email}: {admin_password}")

    await db.users.insert_one({
        "id": str(_uuid.uuid4()),
        "name": "Admin",
        "email": admin_email,
        "password_hash": hash_password(admin_password),
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    print(f"✅ Admin user created: {admin_email}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
