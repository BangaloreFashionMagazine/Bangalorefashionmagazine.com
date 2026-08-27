"""
Talent category management.

The built-in categories (backend/services/__init__.py TALENT_CATEGORIES /
NEW_TALENT_CATEGORIES / CATEGORY_TO_DB) remain the permanent, hardcoded
defaults - this module only lets an admin ADD further categories on top,
stored in db.custom_categories. Custom categories use the same string for
both their display and storage form (there's no legacy dual-naming for
something created fresh), so they slot straight into the existing
normalize_category()/getCategoryDisplay() machinery without needing any
changes there - an unknown string just passes through unchanged.
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from dependencies.auth import get_current_admin
from services import NEW_TALENT_CATEGORIES

import logging
logger = logging.getLogger(__name__)

# Placeholder/filter markers in NEW_TALENT_CATEGORIES that aren't real,
# assignable talent categories.
_NON_ASSIGNABLE = {"All Talents", "Featured Talents"}


def create_category_routes(db):
    router = APIRouter()
    admin_router = APIRouter()

    @router.get("/categories/all")
    async def get_all_categories():
        """Public: the full assignable category list (built-in + admin-added custom ones)."""
        custom = await db.custom_categories.find({}, {"_id": 0}).sort("display_name", 1).to_list(200)
        built_in = [
            {"id": None, "display_name": c, "is_custom": False}
            for c in NEW_TALENT_CATEGORIES if c not in _NON_ASSIGNABLE
        ]
        custom_formatted = [
            {"id": c["id"], "display_name": c["display_name"], "is_custom": True}
            for c in custom
        ]
        return {"categories": built_in + custom_formatted}

    @admin_router.get("/admin/categories/custom")
    async def list_custom_categories():
        custom = await db.custom_categories.find({}, {"_id": 0}).sort("display_name", 1).to_list(200)
        return {"categories": custom}

    @admin_router.post("/admin/categories")
    async def create_category(data: dict):
        display_name = (data.get("display_name") or "").strip()
        if not display_name:
            raise HTTPException(status_code=400, detail="display_name is required")
        if display_name in NEW_TALENT_CATEGORIES:
            raise HTTPException(status_code=400, detail="A built-in category with this name already exists")
        existing = await db.custom_categories.find_one({"display_name": display_name})
        if existing:
            raise HTTPException(status_code=400, detail="This category already exists")

        doc = {
            "id": str(uuid.uuid4()),
            "display_name": display_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.custom_categories.insert_one(doc)
        logger.info(f"Custom category created: {display_name}")
        return {"message": "Category created", "category": {"id": doc["id"], "display_name": display_name}}

    @admin_router.put("/admin/categories/{category_id}")
    async def rename_category(category_id: str, data: dict):
        new_name = (data.get("display_name") or "").strip()
        if not new_name:
            raise HTTPException(status_code=400, detail="display_name is required")

        existing = await db.custom_categories.find_one({"id": category_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Category not found")

        old_name = existing["display_name"]
        if new_name != old_name:
            clash = await db.custom_categories.find_one({"display_name": new_name, "id": {"$ne": category_id}})
            if clash or new_name in NEW_TALENT_CATEGORIES:
                raise HTTPException(status_code=400, detail="A category with this name already exists")

        await db.custom_categories.update_one({"id": category_id}, {"$set": {"display_name": new_name}})
        # Cascade: any talent already assigned to the old name should follow the rename.
        result = await db.talents.update_many({"category": old_name}, {"$set": {"category": new_name}})
        logger.info(f"Category renamed: {old_name} -> {new_name} ({result.modified_count} talents updated)")
        return {"message": "Category renamed", "talents_updated": result.modified_count}

    @admin_router.delete("/admin/categories/{category_id}")
    async def delete_category(category_id: str):
        existing = await db.custom_categories.find_one({"id": category_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Category not found")

        in_use = await db.talents.count_documents({"category": existing["display_name"]})
        if in_use > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete - {in_use} talent(s) are currently assigned to this category"
            )

        await db.custom_categories.delete_one({"id": category_id})
        return {"message": "Category deleted"}

    router.include_router(admin_router, dependencies=[Depends(get_current_admin)])
    return router
