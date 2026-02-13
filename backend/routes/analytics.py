from fastapi import APIRouter
from datetime import datetime, timezone, timedelta
import uuid

import logging
logger = logging.getLogger(__name__)


def create_analytics_routes(db):
    router = APIRouter()
    
    # ============== Track Page Views ==============
    @router.post("/analytics/track")
    async def track_page_view(data: dict):
        """Track a page view or event"""
        doc = {
            "id": str(uuid.uuid4()),
            "event_type": data.get("event_type", "page_view"),  # page_view, talent_view, party_view, ad_click
            "page": data.get("page", ""),
            "talent_id": data.get("talent_id"),
            "party_id": data.get("party_id"),
            "ad_id": data.get("ad_id"),
            "session_id": data.get("session_id", ""),
            "user_agent": data.get("user_agent", ""),
            "referrer": data.get("referrer", ""),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.analytics.insert_one(doc)
        return {"message": "Tracked"}
    
    
    # ============== Get Analytics Summary ==============
    @router.get("/admin/analytics/summary")
    async def get_analytics_summary():
        """Get overall analytics summary for admin dashboard"""
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Total page views
        total_views = await db.analytics.count_documents({})
        
        # Today's views
        today_views = await db.analytics.count_documents({
            "created_at": {"$gte": today_start.isoformat()}
        })
        
        # This week's views
        week_views = await db.analytics.count_documents({
            "created_at": {"$gte": week_ago.isoformat()}
        })
        
        # This month's views
        month_views = await db.analytics.count_documents({
            "created_at": {"$gte": month_ago.isoformat()}
        })
        
        # Unique sessions (approximate unique visitors)
        unique_sessions_pipeline = [
            {"$group": {"_id": "$session_id"}},
            {"$count": "total"}
        ]
        unique_result = await db.analytics.aggregate(unique_sessions_pipeline).to_list(1)
        unique_visitors = unique_result[0]["total"] if unique_result else 0
        
        # Unique visitors this week
        unique_week_pipeline = [
            {"$match": {"created_at": {"$gte": week_ago.isoformat()}}},
            {"$group": {"_id": "$session_id"}},
            {"$count": "total"}
        ]
        unique_week_result = await db.analytics.aggregate(unique_week_pipeline).to_list(1)
        unique_visitors_week = unique_week_result[0]["total"] if unique_week_result else 0
        
        # Total registered talents
        total_talents = await db.talents.count_documents({})
        approved_talents = await db.talents.count_documents({"is_approved": True})
        pending_talents = await db.talents.count_documents({"is_approved": False})
        
        # Total votes
        total_votes = await db.votes.count_documents({})
        
        # Party events count
        total_parties = await db.party_events.count_documents({})
        active_parties = await db.party_events.count_documents({"is_active": True})
        
        # Ads count
        total_ads = await db.advertisements.count_documents({})
        
        return {
            "traffic": {
                "total_page_views": total_views,
                "today_views": today_views,
                "week_views": week_views,
                "month_views": month_views,
                "unique_visitors": unique_visitors,
                "unique_visitors_week": unique_visitors_week
            },
            "talents": {
                "total": total_talents,
                "approved": approved_talents,
                "pending": pending_talents,
                "total_votes": total_votes
            },
            "content": {
                "total_parties": total_parties,
                "active_parties": active_parties,
                "total_ads": total_ads
            }
        }
    
    
    # ============== Get Popular Talents ==============
    @router.get("/admin/analytics/popular-talents")
    async def get_popular_talents():
        """Get most viewed talents"""
        pipeline = [
            {"$match": {"event_type": "talent_view", "talent_id": {"$ne": None}}},
            {"$group": {"_id": "$talent_id", "views": {"$sum": 1}}},
            {"$sort": {"views": -1}},
            {"$limit": 20}
        ]
        results = await db.analytics.aggregate(pipeline).to_list(20)
        
        # Get talent names
        popular = []
        for r in results:
            talent = await db.talents.find_one({"id": r["_id"]}, {"_id": 0, "name": 1, "category": 1, "profile_image": 1})
            if talent:
                popular.append({
                    "talent_id": r["_id"],
                    "name": talent.get("name", "Unknown"),
                    "category": talent.get("category", ""),
                    "profile_image": talent.get("profile_image", ""),
                    "views": r["views"]
                })
        
        return popular
    
    
    # ============== Get Party Event Stats ==============
    @router.get("/admin/analytics/party-stats")
    async def get_party_stats():
        """Get party event view statistics"""
        pipeline = [
            {"$match": {"event_type": "party_view", "party_id": {"$ne": None}}},
            {"$group": {"_id": "$party_id", "views": {"$sum": 1}}},
            {"$sort": {"views": -1}},
            {"$limit": 20}
        ]
        results = await db.analytics.aggregate(pipeline).to_list(20)
        
        # Get party details
        stats = []
        for r in results:
            party = await db.party_events.find_one({"id": r["_id"]}, {"_id": 0, "title": 1, "venue": 1, "event_date": 1})
            if party:
                stats.append({
                    "party_id": r["_id"],
                    "title": party.get("title", "Unknown"),
                    "venue": party.get("venue", ""),
                    "event_date": party.get("event_date", ""),
                    "views": r["views"]
                })
        
        return stats
    
    
    # ============== Get Ad Performance ==============
    @router.get("/admin/analytics/ad-stats")
    async def get_ad_stats():
        """Get advertisement click statistics"""
        pipeline = [
            {"$match": {"event_type": "ad_click", "ad_id": {"$ne": None}}},
            {"$group": {"_id": "$ad_id", "clicks": {"$sum": 1}}},
            {"$sort": {"clicks": -1}},
            {"$limit": 20}
        ]
        results = await db.analytics.aggregate(pipeline).to_list(20)
        
        # Get ad details
        stats = []
        for r in results:
            ad = await db.advertisements.find_one({"id": r["_id"]}, {"_id": 0, "title": 1, "link": 1})
            if ad:
                stats.append({
                    "ad_id": r["_id"],
                    "title": ad.get("title", "Unknown"),
                    "link": ad.get("link", ""),
                    "clicks": r["clicks"]
                })
        
        return stats
    
    
    # ============== Get Recent Activity ==============
    @router.get("/admin/analytics/recent-activity")
    async def get_recent_activity():
        """Get recent site activity"""
        activities = await db.analytics.find(
            {}, 
            {"_id": 0}
        ).sort("created_at", -1).limit(50).to_list(50)
        
        # Enrich with names
        enriched = []
        for a in activities:
            item = {
                "event_type": a.get("event_type"),
                "page": a.get("page"),
                "created_at": a.get("created_at")
            }
            
            if a.get("talent_id"):
                talent = await db.talents.find_one({"id": a["talent_id"]}, {"_id": 0, "name": 1})
                item["talent_name"] = talent.get("name") if talent else "Unknown"
            
            if a.get("party_id"):
                party = await db.party_events.find_one({"id": a["party_id"]}, {"_id": 0, "title": 1})
                item["party_title"] = party.get("title") if party else "Unknown"
            
            if a.get("ad_id"):
                ad = await db.advertisements.find_one({"id": a["ad_id"]}, {"_id": 0, "title": 1})
                item["ad_title"] = ad.get("title") if ad else "Unknown"
            
            enriched.append(item)
        
        return enriched
    
    
    # ============== Get Daily Views (for chart) ==============
    @router.get("/admin/analytics/daily-views")
    async def get_daily_views():
        """Get page views per day for the last 30 days"""
        now = datetime.now(timezone.utc)
        thirty_days_ago = now - timedelta(days=30)
        
        # Get all analytics from last 30 days
        docs = await db.analytics.find(
            {"created_at": {"$gte": thirty_days_ago.isoformat()}},
            {"_id": 0, "created_at": 1}
        ).to_list(10000)
        
        # Group by date
        daily_counts = {}
        for doc in docs:
            date_str = doc["created_at"][:10]  # Get YYYY-MM-DD
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        
        # Fill in missing days with 0
        result = []
        for i in range(30):
            date = (now - timedelta(days=29-i)).strftime("%Y-%m-%d")
            result.append({
                "date": date,
                "views": daily_counts.get(date, 0)
            })
        
        return result
    
    
    return router
