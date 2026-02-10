from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from typing import List
import uuid
import io
import csv

from models import TalentResponse
from services import hash_password

import logging
logger = logging.getLogger(__name__)


def create_admin_routes(db):
    router = APIRouter()
    
    @router.get("/admin/talents/pending", response_model=List[TalentResponse])
    async def get_pending_talents():
        talents = await db.talents.find({"is_approved": False}, {"_id": 0}).to_list(1000)
        return [
            TalentResponse(
                id=t["id"], name=t["name"], email=t["email"], phone=t["phone"],
                instagram_id=t.get("instagram_id", ""), category=t["category"],
                bio=t.get("bio", ""), profile_image=t.get("profile_image", ""),
                portfolio_images=t.get("portfolio_images", []), is_approved=False,
                rank=t.get("rank", 999), votes=t.get("votes", 0), created_at=t.get("created_at", "")
            ) for t in talents
        ]


    @router.get("/admin/talent/{talent_id}/full")
    async def get_talent_full_details(talent_id: str):
        talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {
            "id": talent["id"],
            "name": talent["name"],
            "email": talent["email"],
            "password": talent.get("password_plain", "Not available"),
            "phone": talent["phone"],
            "instagram_id": talent.get("instagram_id", ""),
            "category": talent["category"],
            "bio": talent.get("bio", ""),
            "profile_image": talent.get("profile_image", ""),
            "portfolio_images": talent.get("portfolio_images", []),
            "portfolio_video": talent.get("portfolio_video", ""),
            "is_approved": talent.get("is_approved", False),
            "rank": talent.get("rank", 999),
            "votes": talent.get("votes", 0),
            "created_at": talent.get("created_at", ""),
            "agreed_to_terms": talent.get("agreed_to_terms", False),
            "agreed_at": talent.get("agreed_at", "")
        }


    @router.put("/admin/talent/{talent_id}/approve")
    async def approve_talent(talent_id: str):
        result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_approved": True}})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {"message": "Talent approved"}


    @router.put("/admin/talent/{talent_id}/reject")
    async def reject_talent(talent_id: str):
        result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_approved": False}})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {"message": "Talent rejected"}


    @router.put("/admin/talent/{talent_id}/rank")
    async def update_talent_rank(talent_id: str, rank: int):
        result = await db.talents.update_one({"id": talent_id}, {"$set": {"rank": rank}})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {"message": f"Rank updated to {rank}"}


    @router.put("/admin/talent/{talent_id}/password")
    async def admin_reset_talent_password(talent_id: str, data: dict):
        password = data.get("password")
        if not password or len(password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        result = await db.talents.update_one(
            {"id": talent_id}, 
            {"$set": {"password_hash": hash_password(password), "password_plain": password}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")
        logger.info(f"Admin reset password for talent {talent_id}")
        return {"message": "Password updated"}


    @router.delete("/admin/talent/{talent_id}")
    async def delete_talent(talent_id: str):
        result = await db.talents.delete_one({"id": talent_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {"message": "Talent deleted"}


    @router.get("/admin/talents/export")
    async def export_talents():
        talents = await db.talents.find({}, {"_id": 0}).to_list(1000)
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Phone", "Instagram", "Category", "Status", "Rank", "Votes"])
        
        for t in talents:
            writer.writerow([
                t.get("name", ""), t.get("email", ""), t.get("phone", ""),
                t.get("instagram_id", ""), t.get("category", ""),
                "Approved" if t.get("is_approved") else "Pending",
                t.get("rank", 999), t.get("votes", 0)
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=talents_export.csv"}
        )
    
    return router
