"""
Contest Management Routes - Admin contest creation and public voting
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import logging

from dependencies.auth import get_current_admin as require_admin

logger = logging.getLogger(__name__)


class ShareTemplateSettings(BaseModel):
    logo_position: str = "bottom"  # top, bottom, top-left, top-right, bottom-left, bottom-right
    logo_size: int = 120  # pixels
    text_color: str = "#FFFFFF"
    overlay_color: str = "rgba(0,0,0,0.5)"
    overlay_position: str = "bottom"  # top, bottom, full
    custom_text: str = ""  # Empty means use default "Vote Now!"
    show_contest_name: bool = True
    show_vote_count: bool = False
    font_size: int = 32


class ContestCreate(BaseModel):
    name: str
    description: str = ""
    banner_image: str = ""
    start_date: str
    start_time: str = "00:00"
    end_date: str
    end_time: str = "23:59"
    rules: str = ""
    voting_instructions: str = ""
    status: str = "draft"  # draft, upcoming, live, closed, winner_announced
    is_featured: bool = False
    is_visible: bool = True  # Controls public visibility
    participant_ids: List[str] = []
    share_template_story: Optional[dict] = None
    share_template_feed: Optional[dict] = None


class ContestUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    banner_image: Optional[str] = None
    start_date: Optional[str] = None
    start_time: Optional[str] = None
    end_date: Optional[str] = None
    end_time: Optional[str] = None
    rules: Optional[str] = None
    voting_instructions: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    is_visible: Optional[bool] = None  # Controls public visibility
    participant_ids: Optional[List[str]] = None
    winner_id: Optional[str] = None
    share_template_story: Optional[dict] = None
    share_template_feed: Optional[dict] = None


class ContestVote(BaseModel):
    contest_id: str
    talent_id: str


def create_contest_routes(db):
    router = APIRouter()
    
    # ============== ADMIN ROUTES ==============
    
    @router.post("/admin/contests")
    async def create_contest(contest: ContestCreate, admin: dict = Depends(require_admin)):
        """Create a new contest - ADMIN ONLY"""
        contest_id = str(uuid.uuid4())
        slug = contest.name.lower().replace(" ", "-").replace("'", "")[:50]
        
        # Check slug uniqueness
        existing = await db.contests.find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{contest_id[:8]}"
        
        contest_doc = {
            "id": contest_id,
            "slug": slug,
            "name": contest.name,
            "description": contest.description,
            "banner_image": contest.banner_image,
            "start_date": contest.start_date,
            "start_time": contest.start_time,
            "end_date": contest.end_date,
            "end_time": contest.end_time,
            "rules": contest.rules,
            "voting_instructions": contest.voting_instructions,
            "status": contest.status,
            "is_featured": contest.is_featured,
            "is_visible": contest.is_visible,
            "participant_ids": contest.participant_ids,
            "winner_id": None,
            "winner_announced_at": None,
            "total_votes": 0,
            "share_template_story": contest.share_template_story or {
                "logo_position": "bottom",
                "logo_size": 120,
                "text_color": "#FFFFFF",
                "overlay_color": "rgba(0,0,0,0.5)",
                "overlay_position": "bottom",
                "custom_text": "Vote Now!",
                "show_contest_name": True,
                "show_vote_count": False,
                "font_size": 32
            },
            "share_template_feed": contest.share_template_feed or {
                "logo_position": "bottom",
                "logo_size": 100,
                "text_color": "#FFFFFF",
                "overlay_color": "rgba(0,0,0,0.5)",
                "overlay_position": "bottom",
                "custom_text": "Vote Now!",
                "show_contest_name": True,
                "show_vote_count": False,
                "font_size": 28
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.contests.insert_one(contest_doc)
        contest_doc.pop("_id", None)
        logger.info(f"Contest created: {contest.name}")
        return {"message": "Contest created", "contest": contest_doc}
    
    
    @router.get("/admin/contests")
    async def get_all_contests(admin: dict = Depends(require_admin)):
        """Get all contests with vote counts - ADMIN ONLY"""
        contests = await db.contests.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        # Enrich with vote counts per participant
        for contest in contests:
            participant_votes = []
            for pid in contest.get("participant_ids", []):
                vote_count = await db.contest_votes.count_documents({
                    "contest_id": contest["id"],
                    "talent_id": pid
                })
                # Get talent info
                talent = await db.talents.find_one({"id": pid}, {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1})
                if talent:
                    talent["votes"] = vote_count
                    participant_votes.append(talent)
            
            # Sort by votes descending
            participant_votes.sort(key=lambda x: x.get("votes", 0), reverse=True)
            contest["participants"] = participant_votes
            contest["total_votes"] = sum(p.get("votes", 0) for p in participant_votes)
        
        return contests
    
    
    @router.get("/admin/contests/{contest_id}")
    async def get_contest_admin(contest_id: str, admin: dict = Depends(require_admin)):
        """Get single contest with full details - ADMIN ONLY"""
        contest = await db.contests.find_one({"id": contest_id}, {"_id": 0})
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        # Get participant details with votes
        participants = []
        for pid in contest.get("participant_ids", []):
            vote_count = await db.contest_votes.count_documents({
                "contest_id": contest_id,
                "talent_id": pid
            })
            talent = await db.talents.find_one({"id": pid}, {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1})
            if talent:
                talent["votes"] = vote_count
                participants.append(talent)
        
        participants.sort(key=lambda x: x.get("votes", 0), reverse=True)
        
        # Add rank
        for i, p in enumerate(participants):
            p["rank"] = i + 1
            p["status"] = "Leading" if i == 0 and p.get("votes", 0) > 0 else ""
        
        contest["participants"] = participants
        contest["total_votes"] = sum(p.get("votes", 0) for p in participants)
        
        return contest
    
    
    @router.put("/admin/contests/{contest_id}")
    async def update_contest(contest_id: str, update: ContestUpdate, admin: dict = Depends(require_admin)):
        """Update contest - ADMIN ONLY"""
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # If announcing winner, set timestamp
        if update.status == "winner_announced" and update.winner_id:
            update_data["winner_announced_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.contests.update_one(
            {"id": contest_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        return {"message": "Contest updated"}
    
    
    @router.delete("/admin/contests/{contest_id}")
    async def delete_contest(contest_id: str, admin: dict = Depends(require_admin)):
        """Delete contest - ADMIN ONLY"""
        result = await db.contests.delete_one({"id": contest_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        # Also delete associated votes
        await db.contest_votes.delete_many({"contest_id": contest_id})
        
        return {"message": "Contest deleted"}
    
    
    @router.get("/admin/contests/{contest_id}/analytics")
    async def get_contest_analytics(contest_id: str, admin: dict = Depends(require_admin)):
        """Get vote analytics for a contest - ADMIN ONLY"""
        contest = await db.contests.find_one({"id": contest_id}, {"_id": 0})
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        # Get all votes for this contest
        votes = await db.contest_votes.find(
            {"contest_id": contest_id},
            {"_id": 0, "talent_id": 1, "created_at": 1}
        ).to_list(10000)
        
        # Group votes by day
        daily_votes = {}
        for vote in votes:
            date = vote.get("created_at", "")[:10]  # Get YYYY-MM-DD
            if date:
                daily_votes[date] = daily_votes.get(date, 0) + 1
        
        # Sort by date
        sorted_daily = sorted(daily_votes.items())
        
        # Get votes per talent
        talent_votes = {}
        for vote in votes:
            tid = vote.get("talent_id")
            talent_votes[tid] = talent_votes.get(tid, 0) + 1
        
        # Get talent names
        talent_data = []
        for tid, count in sorted(talent_votes.items(), key=lambda x: x[1], reverse=True):
            talent = await db.talents.find_one({"id": tid}, {"_id": 0, "id": 1, "name": 1, "profile_image": 1})
            if talent:
                talent["votes"] = count
                talent_data.append(talent)
        
        return {
            "total_votes": len(votes),
            "daily_votes": [{"date": d, "votes": v} for d, v in sorted_daily],
            "talent_votes": talent_data,
            "contest_name": contest.get("name"),
            "status": contest.get("status")
        }
    
    
    @router.post("/admin/contests/{contest_id}/announce-winner")
    async def announce_winner(contest_id: str, admin: dict = Depends(require_admin)):
        """Calculate and announce winner - ADMIN ONLY"""
        contest = await db.contests.find_one({"id": contest_id}, {"_id": 0})
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        # Calculate winner based on votes
        max_votes = 0
        winner_id = None
        
        for pid in contest.get("participant_ids", []):
            vote_count = await db.contest_votes.count_documents({
                "contest_id": contest_id,
                "talent_id": pid
            })
            if vote_count > max_votes:
                max_votes = vote_count
                winner_id = pid
        
        if not winner_id:
            raise HTTPException(status_code=400, detail="No votes recorded, cannot determine winner")
        
        # Update contest
        await db.contests.update_one(
            {"id": contest_id},
            {"$set": {
                "winner_id": winner_id,
                "status": "winner_announced",
                "winner_announced_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Get winner info
        winner = await db.talents.find_one({"id": winner_id}, {"_id": 0, "id": 1, "name": 1, "profile_image": 1})
        
        return {
            "message": "Winner announced",
            "winner": winner,
            "votes": max_votes
        }
    
    
    @router.get("/admin/talents/search")
    async def search_talents_for_contest(q: str = "", category: str = "", admin: dict = Depends(require_admin)):
        """Search talents to add to contest - ADMIN ONLY"""
        query = {"is_approved": True}
        
        if q:
            query["name"] = {"$regex": q, "$options": "i"}
        if category and category != "all":
            query["category"] = category
        
        talents = await db.talents.find(
            query,
            {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1}
        ).limit(50).to_list(50)
        
        return talents
    
    
    # ============== PUBLIC ROUTES ==============
    
    @router.get("/contests")
    async def get_public_contests():
        """Get public contests (live and upcoming) - only visible ones"""
        contests = await db.contests.find(
            {"status": {"$in": ["live", "upcoming", "winner_announced"]}, "is_visible": {"$ne": False}},
            {"_id": 0}
        ).sort("created_at", -1).to_list(50)
        
        # Enrich with participant info
        for contest in contests:
            participants = []
            for pid in contest.get("participant_ids", []):
                vote_count = await db.contest_votes.count_documents({
                    "contest_id": contest["id"],
                    "talent_id": pid
                })
                talent = await db.talents.find_one(
                    {"id": pid},
                    {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1}
                )
                if talent:
                    talent["votes"] = vote_count
                    participants.append(talent)
            
            participants.sort(key=lambda x: x.get("votes", 0), reverse=True)
            contest["participants"] = participants
            contest["total_votes"] = sum(p.get("votes", 0) for p in participants)
        
        return contests
    
    
    @router.get("/contests/featured")
    async def get_featured_contest():
        """Get featured contest for homepage - only if visible"""
        contest = await db.contests.find_one(
            {"is_featured": True, "is_visible": {"$ne": False}, "status": {"$in": ["live", "upcoming"]}},
            {"_id": 0}
        )
        
        if not contest:
            return None
        
        # Get participant info with votes
        participants = []
        for pid in contest.get("participant_ids", []):
            vote_count = await db.contest_votes.count_documents({
                "contest_id": contest["id"],
                "talent_id": pid
            })
            talent = await db.talents.find_one(
                {"id": pid},
                {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1}
            )
            if talent:
                talent["votes"] = vote_count
                participants.append(talent)
        
        participants.sort(key=lambda x: x.get("votes", 0), reverse=True)
        contest["participants"] = participants
        contest["total_votes"] = sum(p.get("votes", 0) for p in participants)
        
        return contest
    
    
    @router.get("/contests/{slug_or_id}")
    async def get_public_contest(slug_or_id: str):
        """Get single contest by slug or ID"""
        contest = await db.contests.find_one(
            {"$or": [{"slug": slug_or_id}, {"id": slug_or_id}]},
            {"_id": 0}
        )
        
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        # Get participant info with votes
        participants = []
        for pid in contest.get("participant_ids", []):
            vote_count = await db.contest_votes.count_documents({
                "contest_id": contest["id"],
                "talent_id": pid
            })
            talent = await db.talents.find_one(
                {"id": pid},
                {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1}
            )
            if talent:
                talent["votes"] = vote_count
                participants.append(talent)
        
        participants.sort(key=lambda x: x.get("votes", 0), reverse=True)
        contest["participants"] = participants
        contest["total_votes"] = sum(p.get("votes", 0) for p in participants)
        
        return contest
    
    
    @router.post("/contests/{contest_id}/vote")
    async def vote_in_contest(contest_id: str, vote: ContestVote, request: Request):
        """Cast a vote in a contest - PUBLIC with rate limiting"""
        # Get client identifier for duplicate prevention
        client_ip = request.client.host if request.client else "unknown"
        session_id = request.headers.get("X-Session-ID", "")
        
        # Verify contest exists and is live
        contest = await db.contests.find_one({"id": contest_id}, {"_id": 0})
        if not contest:
            raise HTTPException(status_code=404, detail="Contest not found")
        
        if contest.get("status") != "live":
            raise HTTPException(status_code=400, detail="Voting is not open for this contest")
        
        # Verify talent is a participant
        if vote.talent_id not in contest.get("participant_ids", []):
            raise HTTPException(status_code=400, detail="Talent is not participating in this contest")
        
        # Check for duplicate vote (same IP + session in last 24 hours for this contest)
        one_day_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
        existing_vote = await db.contest_votes.find_one({
            "contest_id": contest_id,
            "client_ip": client_ip,
            "created_at": {"$gte": one_day_ago}
        })
        
        if existing_vote:
            raise HTTPException(status_code=429, detail="You have already voted in this contest today. Try again in 24 hours.")
        
        # Record vote
        vote_doc = {
            "id": str(uuid.uuid4()),
            "contest_id": contest_id,
            "talent_id": vote.talent_id,
            "client_ip": client_ip,
            "session_id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.contest_votes.insert_one(vote_doc)
        
        # Get updated vote count
        new_count = await db.contest_votes.count_documents({
            "contest_id": contest_id,
            "talent_id": vote.talent_id
        })
        
        logger.info(f"Contest vote recorded: {contest_id} -> {vote.talent_id}")
        
        return {
            "message": "Vote recorded",
            "talent_id": vote.talent_id,
            "votes": new_count
        }
    
    
    return router
