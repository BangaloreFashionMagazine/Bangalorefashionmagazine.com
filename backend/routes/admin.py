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


    @router.put("/admin/talent/{talent_id}/featured")
    async def toggle_talent_featured(talent_id: str, featured: bool):
        """Toggle talent's featured status for Magazine Talent Spotlight section"""
        result = await db.talents.update_one({"id": talent_id}, {"$set": {"is_featured": featured}})
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Talent not found")
        return {"message": f"Featured status set to {featured}", "is_featured": featured}


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
        writer.writerow(["Name", "Email", "Phone", "Instagram", "Category", "Status", "Rank", "Votes", "Registered Date"])
        
        for t in talents:
            writer.writerow([
                t.get("name", ""), t.get("email", ""), t.get("phone", ""),
                t.get("instagram_id", ""), t.get("category", ""),
                "Approved" if t.get("is_approved") else "Pending",
                t.get("rank", 999), t.get("votes", 0),
                t.get("created_at", "")[:10] if t.get("created_at") else ""
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=talents_export.csv"}
        )
    
    # Track talent share
    @router.post("/track-share")
    async def track_share(data: dict):
        """Track when a talent profile/image is shared"""
        talent_id = data.get("talent_id")
        talent_name = data.get("talent_name", "Unknown")
        share_type = data.get("share_type", "whatsapp")  # whatsapp, story, feed
        
        if not talent_id:
            raise HTTPException(status_code=400, detail="talent_id required")
        
        share_record = {
            "id": str(uuid.uuid4()),
            "talent_id": talent_id,
            "talent_name": talent_name,
            "share_type": share_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.shares.insert_one(share_record)
        
        # Also update talent's share count
        await db.talents.update_one(
            {"id": talent_id},
            {"$inc": {f"share_count_{share_type}": 1, "total_shares": 1}}
        )
        
        return {"success": True}
    
    # Get share analytics
    @router.get("/admin/share-analytics")
    async def get_share_analytics():
        """Get share analytics for admin dashboard"""
        # Get all shares
        shares = await db.shares.find({}, {"_id": 0}).sort("timestamp", -1).to_list(500)
        
        # Get share counts by type
        pipeline = [
            {"$group": {
                "_id": "$share_type",
                "count": {"$sum": 1}
            }}
        ]
        type_counts = await db.shares.aggregate(pipeline).to_list(10)
        
        # Get top shared talents
        talent_pipeline = [
            {"$group": {
                "_id": {"talent_id": "$talent_id", "talent_name": "$talent_name"},
                "total": {"$sum": 1},
                "whatsapp": {"$sum": {"$cond": [{"$eq": ["$share_type", "whatsapp"]}, 1, 0]}},
                "story": {"$sum": {"$cond": [{"$eq": ["$share_type", "story"]}, 1, 0]}},
                "feed": {"$sum": {"$cond": [{"$eq": ["$share_type", "feed"]}, 1, 0]}}
            }},
            {"$sort": {"total": -1}},
            {"$limit": 20}
        ]
        top_talents = await db.shares.aggregate(talent_pipeline).to_list(20)
        
        return {
            "total_shares": len(shares),
            "by_type": {item["_id"]: item["count"] for item in type_counts},
            "top_talents": [
                {
                    "talent_id": t["_id"]["talent_id"],
                    "talent_name": t["_id"]["talent_name"],
                    "total": t["total"],
                    "whatsapp": t["whatsapp"],
                    "story": t["story"],
                    "feed": t["feed"]
                } for t in top_talents
            ],
            "recent_shares": shares[:50]  # Last 50 shares
        }
    
    # Get paid talents with payment details
    @router.get("/admin/paid-talents")
    async def get_paid_talents():
        """Get all talents who have completed payment with their payment details"""
        # Get all paid payment orders
        paid_orders = await db.payment_orders.find(
            {"status": "paid"},
            {"_id": 0}
        ).sort("paid_at", -1).to_list(500)
        
        # Get talent details for each paid order
        paid_talents = []
        seen_talent_ids = set()
        
        for order in paid_orders:
            talent_id = order.get("talent_id")
            if talent_id and talent_id not in seen_talent_ids:
                seen_talent_ids.add(talent_id)
                
                # Get talent info
                talent = await db.talents.find_one({"id": talent_id}, {"_id": 0})
                if talent:
                    paid_talents.append({
                        "talent_id": talent_id,
                        "name": talent.get("name", "Unknown"),
                        "email": talent.get("email", ""),
                        "phone": talent.get("phone", ""),
                        "category": talent.get("category", ""),
                        "profile_image": talent.get("profile_image", ""),
                        "is_approved": talent.get("is_approved", False),
                        "payment_id": order.get("razorpay_payment_id", ""),
                        "payment_amount": order.get("amount", 0),
                        "paid_at": order.get("paid_at", ""),
                        "order_id": order.get("razorpay_order_id", "")
                    })
        
        return {
            "total_paid": len(paid_talents),
            "talents": paid_talents
        }
    
    return router
