"""
Hero Management Routes
Comprehensive hero slide management with talent integration
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from dependencies.auth import get_current_admin

import logging
logger = logging.getLogger(__name__)


# ============== Models ==============
class HeroSlideCreate(BaseModel):
    talent_id: str
    image_index: int  # Index of the portfolio image to use
    title: Optional[str] = ""
    subtitle: Optional[str] = ""
    focal_point_x: float = 50  # Percentage 0-100
    focal_point_y: float = 30  # Percentage 0-100 (default higher for faces)
    fit_mode: str = "smart"  # smart, contain, cover, original
    order: int = 1
    show_talent_name: bool = True
    show_talent_category: bool = True
    show_headline: bool = True
    show_description: bool = False
    show_cta_button: bool = True
    cta_text: str = "View Profile"
    cta_link: str = ""
    overlay_color: str = "rgba(0,0,0,0.3)"
    text_color: str = "#FFFFFF"
    is_active: bool = True

class HeroSlideUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    focal_point_x: Optional[float] = None
    focal_point_y: Optional[float] = None
    fit_mode: Optional[str] = None
    order: Optional[int] = None
    show_talent_name: Optional[bool] = None
    show_talent_category: Optional[bool] = None
    show_headline: Optional[bool] = None
    show_description: Optional[bool] = None
    show_cta_button: Optional[bool] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    overlay_color: Optional[str] = None
    text_color: Optional[str] = None
    is_active: Optional[bool] = None

class HeroSettingsUpdate(BaseModel):
    autoplay: bool = True
    slide_duration: int = 5  # seconds: 3, 5, 7, 10
    transition: str = "fade"  # fade, slide, zoom
    show_arrows: bool = True
    show_dots: bool = True
    hero_height: str = "70vh"
    default_headline: str = "BANGALORE FASHION MAGAZINE"
    default_description: str = "DISCOVER. CREATE. GET FEATURED."
    default_cta_text: str = "JOIN BFM"
    default_cta_link: str = "/join"
    default_bg_color: str = "#050A14"
    logo_position: str = "top-left"  # top-left, top-center, top-right, hidden

class TalentHeroUpdate(BaseModel):
    hero_enabled: bool = False
    hero_images: List[int] = []  # Indices of portfolio images allowed for hero


def create_hero_routes(db):
    router = APIRouter()
    admin_router = APIRouter()

    # ============== Hero Slides Management ==============

    @admin_router.get("/admin/hero-slides")
    async def get_hero_slides():
        """Get all hero slides with talent info"""
        slides = await db.hero_slides.find({}, {"_id": 0}).sort("order", 1).to_list(50)

        # Enrich with talent data
        enriched = []
        for slide in slides:
            talent = await db.talents.find_one(
                {"id": slide.get("talent_id")},
                {"_id": 0, "id": 1, "name": 1, "category": 1, "portfolio_images": 1, "profile_image": 1}
            )
            if talent:
                slide["talent_name"] = talent.get("name", "")
                slide["talent_category"] = talent.get("category", "")
                # Get the actual image
                portfolio = talent.get("portfolio_images", [])
                img_idx = slide.get("image_index", 0)
                if 0 <= img_idx < len(portfolio):
                    slide["image_data"] = portfolio[img_idx]
                elif talent.get("profile_image"):
                    slide["image_data"] = talent.get("profile_image")
                else:
                    slide["image_data"] = ""
            enriched.append(slide)

        return enriched

    @admin_router.post("/admin/hero-slides")
    async def create_hero_slide(slide: HeroSlideCreate):
        """Create a new hero slide from talent portfolio"""
        # Verify talent exists and is approved
        talent = await db.talents.find_one({"id": slide.talent_id, "is_approved": True})
        if not talent:
            raise HTTPException(status_code=404, detail="Approved talent not found")

        # Verify talent has hero enabled
        if not talent.get("hero_enabled", False):
            raise HTTPException(status_code=400, detail="This talent is not enabled for hero display")

        # Verify image index is in allowed hero_images
        hero_images = talent.get("hero_images", [])
        if slide.image_index not in hero_images:
            raise HTTPException(status_code=400, detail="This image is not approved for hero display")

        # Get max order
        max_order_slide = await db.hero_slides.find_one(sort=[("order", -1)])
        next_order = (max_order_slide.get("order", 0) + 1) if max_order_slide else 1

        slide_doc = {
            "id": str(uuid.uuid4()),
            "talent_id": slide.talent_id,
            "image_index": slide.image_index,
            "title": slide.title or talent.get("name", ""),
            "subtitle": slide.subtitle or talent.get("category", ""),
            "focal_point_x": slide.focal_point_x,
            "focal_point_y": slide.focal_point_y,
            "fit_mode": slide.fit_mode,
            "order": slide.order or next_order,
            "show_talent_name": slide.show_talent_name,
            "show_talent_category": slide.show_talent_category,
            "show_headline": slide.show_headline,
            "show_description": slide.show_description,
            "show_cta_button": slide.show_cta_button,
            "cta_text": slide.cta_text,
            "cta_link": slide.cta_link or f"/talent/{slide.talent_id}",
            "overlay_color": slide.overlay_color,
            "text_color": slide.text_color,
            "is_active": slide.is_active,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        await db.hero_slides.insert_one(slide_doc)
        logger.info(f"Hero slide created for talent {slide.talent_id}")
        return {"id": slide_doc["id"], "message": "Hero slide created"}

    @admin_router.put("/admin/hero-slides/reorder")
    async def reorder_hero_slides(slide_orders: List[dict]):
        """Reorder hero slides. Expects: [{"id": "...", "order": 1}, ...]"""
        for item in slide_orders:
            await db.hero_slides.update_one(
                {"id": item["id"]},
                {"$set": {"order": item["order"]}}
            )
        return {"message": "Slides reordered"}

    @admin_router.put("/admin/hero-slides/{slide_id}")
    async def update_hero_slide(slide_id: str, update: HeroSlideUpdate):
        """Update a hero slide"""
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")

        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        result = await db.hero_slides.update_one(
            {"id": slide_id},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Slide not found")

        return {"message": "Slide updated"}

    @admin_router.delete("/admin/hero-slides/{slide_id}")
    async def delete_hero_slide(slide_id: str):
        """Delete a hero slide"""
        result = await db.hero_slides.delete_one({"id": slide_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Slide not found")
        return {"message": "Slide deleted"}

    # ============== Hero Settings ==============

    @admin_router.get("/admin/hero-settings")
    async def get_hero_settings():
        """Get hero slider settings"""
        settings = await db.hero_settings.find_one({}, {"_id": 0})
        if not settings:
            # Return defaults
            return {
                "autoplay": True,
                "slide_duration": 5,
                "transition": "fade",
                "show_arrows": True,
                "show_dots": True,
                "hero_height": "70vh",
                "default_headline": "BANGALORE FASHION MAGAZINE",
                "default_description": "DISCOVER. CREATE. GET FEATURED.",
                "default_cta_text": "JOIN BFM",
                "default_cta_link": "/join",
                "default_bg_color": "#050A14",
                "logo_position": "top-left"
            }
        return settings

    @admin_router.put("/admin/hero-settings")
    async def update_hero_settings(settings: HeroSettingsUpdate):
        """Update hero slider settings"""
        settings_doc = settings.dict()
        settings_doc["updated_at"] = datetime.now(timezone.utc).isoformat()

        await db.hero_settings.update_one(
            {},
            {"$set": settings_doc},
            upsert=True
        )
        return {"message": "Hero settings updated"}

    # ============== Talent Hero Configuration ==============

    @admin_router.get("/admin/talents/hero-eligible")
    async def get_hero_eligible_talents():
        """Get all approved talents that can be added to hero"""
        talents = await db.talents.find(
            {"is_approved": True, "hero_enabled": True},
            {"_id": 0, "id": 1, "name": 1, "category": 1, "profile_image": 1, "portfolio_images": 1, "hero_images": 1}
        ).to_list(500)

        # Return with limited image data for performance
        result = []
        for t in talents:
            portfolio = t.get("portfolio_images", [])
            hero_indices = t.get("hero_images", [])
            result.append({
                "id": t["id"],
                "name": t["name"],
                "category": t.get("category", ""),
                "profile_image": t.get("profile_image", "")[:100] + "..." if t.get("profile_image") else "",  # Truncate for list
                "portfolio_count": len(portfolio),
                "hero_images": hero_indices  # Indices of allowed images
            })
        return result

    @admin_router.get("/admin/talent/{talent_id}/hero-images")
    async def get_talent_hero_images(talent_id: str):
        """Get a talent's portfolio images that are enabled for hero"""
        talent = await db.talents.find_one(
            {"id": talent_id},
            {"_id": 0, "portfolio_images": 1, "hero_images": 1, "hero_enabled": 1, "name": 1, "category": 1}
        )
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")

        portfolio = talent.get("portfolio_images", [])
        hero_indices = talent.get("hero_images", [])

        # Return images with their indices
        images = []
        for i, img in enumerate(portfolio):
            images.append({
                "index": i,
                "image_data": img,
                "is_hero_enabled": i in hero_indices
            })

        return {
            "talent_name": talent.get("name", ""),
            "talent_category": talent.get("category", ""),
            "hero_enabled": talent.get("hero_enabled", False),
            "images": images
        }

    @admin_router.put("/admin/talent/{talent_id}/hero-config")
    async def update_talent_hero_config(talent_id: str, config: TalentHeroUpdate):
        """Update a talent's hero configuration"""
        result = await db.talents.update_one(
            {"id": talent_id},
            {"$set": {
                "hero_enabled": config.hero_enabled,
                "hero_images": config.hero_images,
                "hero_updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")

        # If hero is disabled, remove any active slides for this talent
        if not config.hero_enabled:
            await db.hero_slides.delete_many({"talent_id": talent_id})
            logger.info(f"Removed hero slides for disabled talent {talent_id}")

        return {"message": "Hero configuration updated"}

    # ============== Public Hero Data ==============

    @router.get("/hero-data")
    async def get_public_hero_data():
        """Get hero data for public display (optimized)"""
        # Get active slides
        slides = await db.hero_slides.find(
            {"is_active": True},
            {"_id": 0}
        ).sort("order", 1).to_list(20)

        # Get settings
        settings = await db.hero_settings.find_one({}, {"_id": 0})
        if not settings:
            settings = {
                "autoplay": True,
                "slide_duration": 5,
                "transition": "fade",
                "show_arrows": True,
                "show_dots": True,
                "hero_height": "70vh",
                "default_headline": "BANGALORE FASHION MAGAZINE",
                "default_description": "DISCOVER. CREATE. GET FEATURED.",
                "default_cta_text": "JOIN BFM",
                "default_cta_link": "/join",
                "default_bg_color": "#050A14",
                "logo_position": "top-left"
            }

        # Enrich slides with talent and image data
        enriched_slides = []
        for slide in slides:
            talent = await db.talents.find_one(
                {"id": slide.get("talent_id"), "is_approved": True},
                {"_id": 0, "id": 1, "name": 1, "category": 1, "portfolio_images": 1}
            )
            if talent:
                portfolio = talent.get("portfolio_images", [])
                img_idx = slide.get("image_index", 0)
                if 0 <= img_idx < len(portfolio):
                    slide["image_data"] = portfolio[img_idx]
                    slide["talent_name"] = talent.get("name", "")
                    slide["talent_category"] = talent.get("category", "")
                    slide["talent_id"] = talent.get("id", "")
                    enriched_slides.append(slide)

        return {
            "slides": enriched_slides,
            "settings": settings,
            "has_slides": len(enriched_slides) > 0
        }

    router.include_router(admin_router, dependencies=[Depends(get_current_admin)])
    return router
