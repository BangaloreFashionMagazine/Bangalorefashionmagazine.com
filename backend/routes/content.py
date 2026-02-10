from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid

from models import (
    HeroImageCreate, HeroImageUpdate,
    AwardCreate, AwardUpdate,
    AdvertisementCreate, AdvertisementUpdate,
    VoteCreate
)

import logging
logger = logging.getLogger(__name__)


def create_content_routes(db):
    router = APIRouter()
    
    # ============== Hero Images ==============
    @router.get("/hero-images")
    async def get_hero_images():
        images = await db.hero_images.find({}, {"_id": 0}).sort("order", 1).to_list(10)
        return images


    @router.post("/admin/hero-images")
    async def create_hero_image(data: HeroImageCreate):
        image_id = str(uuid.uuid4())
        doc = {
            "id": image_id,
            "image_data": data.image_data,
            "title": data.title,
            "subtitle": data.subtitle,
            "category": data.category,
            "order": data.order,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.hero_images.insert_one(doc)
        return {"message": "Hero image created", "id": image_id}


    @router.put("/admin/hero-images/{image_id}")
    async def update_hero_image(image_id: str, data: HeroImageUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_data:
            await db.hero_images.update_one({"id": image_id}, {"$set": update_data})
        return {"message": "Hero image updated"}


    @router.delete("/admin/hero-images/{image_id}")
    async def delete_hero_image(image_id: str):
        result = await db.hero_images.delete_one({"id": image_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image not found")
        return {"message": "Hero image deleted"}


    # ============== Awards (Contest & Winners) ==============
    @router.get("/awards")
    async def get_awards(active_only: bool = True):
        query = {"is_active": True} if active_only else {}
        awards = await db.awards.find(query, {"_id": 0}).to_list(100)
        return awards


    @router.post("/admin/awards")
    async def create_award(data: dict):
        award_id = str(uuid.uuid4())
        # Support multiple images (up to 5)
        images = data.get("winner_images", [])
        if data.get("winner_image"):
            images = [data.get("winner_image")] + images
        images = images[:5]  # Limit to 5 images
        
        doc = {
            "id": award_id,
            "title": data.get("title", ""),
            "winner_name": data.get("winner_name", ""),
            "winner_image": images[0] if images else "",
            "winner_images": images,
            "description": data.get("description", ""),
            "category": data.get("category", ""),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.awards.insert_one(doc)
        return {"message": "Award created", "id": award_id}


    @router.put("/admin/awards/{award_id}")
    async def update_award(award_id: str, data: AwardUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_data:
            await db.awards.update_one({"id": award_id}, {"$set": update_data})
        return {"message": "Award updated"}


    @router.delete("/admin/awards/{award_id}")
    async def delete_award(award_id: str):
        result = await db.awards.delete_one({"id": award_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Award not found")
        return {"message": "Award deleted"}


    # ============== Advertisements ==============
    @router.get("/advertisements")
    async def get_advertisements():
        ads = await db.advertisements.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(20)
        return ads


    @router.post("/admin/advertisements")
    async def create_advertisement(data: AdvertisementCreate):
        ad_id = str(uuid.uuid4())
        doc = {
            "id": ad_id,
            "image_data": data.image_data,
            "title": data.title,
            "link": data.link,
            "order": data.order,
            "is_active": data.is_active,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.advertisements.insert_one(doc)
        return {"message": "Advertisement created", "id": ad_id}


    @router.put("/admin/advertisements/{ad_id}")
    async def update_advertisement(ad_id: str, data: AdvertisementUpdate):
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if update_data:
            await db.advertisements.update_one({"id": ad_id}, {"$set": update_data})
        return {"message": "Advertisement updated"}


    @router.delete("/admin/advertisements/{ad_id}")
    async def delete_advertisement(ad_id: str):
        result = await db.advertisements.delete_one({"id": ad_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Advertisement not found")
        return {"message": "Advertisement deleted"}


    # ============== Voting ==============
    @router.post("/vote")
    async def vote_for_talent(vote: VoteCreate):
        talent = await db.talents.find_one({"id": vote.talent_id})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")
        
        if not talent.get("is_approved"):
            raise HTTPException(status_code=400, detail="Cannot vote for unapproved talent")
        
        await db.votes.insert_one({
            "id": str(uuid.uuid4()),
            "talent_id": vote.talent_id,
            "voter_email": vote.voter_email,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        await db.talents.update_one({"id": vote.talent_id}, {"$inc": {"votes": 1}})
        
        updated = await db.talents.find_one({"id": vote.talent_id}, {"_id": 0})
        return {"message": "Vote recorded", "votes": updated.get("votes", 0)}


    @router.get("/votes/{talent_id}")
    async def get_talent_votes(talent_id: str):
        talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {"talent_id": talent_id, "votes": talent.get("votes", 0)}


    # ============== Magazine ==============
    @router.get("/magazine")
    async def get_magazine():
        magazine = await db.magazine.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
        return magazine or {}


    @router.post("/admin/magazine")
    async def upload_magazine(data: dict):
        await db.magazine.delete_many({})
        doc = {
            "id": str(uuid.uuid4()),
            "title": data.get("title", "Monthly Magazine"),
            "file_data": data.get("file_data"),
            "file_name": data.get("file_name", "magazine.pdf"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.magazine.insert_one(doc)
        logger.info(f"Magazine uploaded: {doc['title']}")
        return {"message": "Magazine uploaded successfully", "id": doc["id"]}


    @router.delete("/admin/magazine")
    async def delete_magazine():
        await db.magazine.delete_many({})
        return {"message": "Magazine deleted"}


    # ============== Background Music ==============
    @router.get("/music")
    async def get_music():
        music = await db.music.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
        return music or {}


    @router.post("/admin/music")
    async def upload_music(data: dict):
        await db.music.delete_many({})
        doc = {
            "id": str(uuid.uuid4()),
            "title": data.get("title", "Background Music"),
            "file_data": data.get("file_data"),
            "file_name": data.get("file_name", "music.mp3"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.music.insert_one(doc)
        logger.info(f"Music uploaded: {doc['title']}")
        return {"message": "Music uploaded successfully", "id": doc["id"]}


    @router.delete("/admin/music")
    async def delete_music():
        await db.music.delete_many({})
        return {"message": "Music deleted"}


    # ============== Homepage Video ==============
    @router.get("/video")
    async def get_video():
        video = await db.homepage_video.find_one({}, {"_id": 0}, sort=[("created_at", -1)])
        return video or {}


    @router.post("/admin/video")
    async def upload_video(data: dict):
        await db.homepage_video.delete_many({})
        doc = {
            "id": str(uuid.uuid4()),
            "title": data.get("title", "Featured Video"),
            "video_url": data.get("video_url", ""),
            "video_type": data.get("video_type", "youtube"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.homepage_video.insert_one(doc)
        logger.info(f"Video uploaded: {doc['title']}")
        return {"message": "Video uploaded successfully", "id": doc["id"]}


    @router.delete("/admin/video")
    async def delete_video():
        await db.homepage_video.delete_many({})
        return {"message": "Video deleted"}
    
    return router
