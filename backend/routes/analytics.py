from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone, timedelta
import uuid
import csv
import io

from dependencies.auth import get_current_admin

import logging
logger = logging.getLogger(__name__)


def create_analytics_routes(db):
    router = APIRouter()
    admin_router = APIRouter()

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


    # ============== Track Profile View ==============
    
    def categorize_source(referrer: str, user_agent: str = "") -> str:
        """Categorize traffic source from referrer URL and user agent"""
        referrer = (referrer or "").lower()
        user_agent = (user_agent or "").lower()
        
        # Check referrer URL patterns
        if "instagram" in referrer or "instagram" in user_agent:
            return "Instagram"
        elif "facebook" in referrer or "fb.com" in referrer or "facebook" in user_agent:
            return "Facebook"
        elif "whatsapp" in referrer or "whatsapp" in user_agent:
            return "WhatsApp"
        elif "google" in referrer:
            return "Google"
        elif "twitter" in referrer or "t.co" in referrer or "x.com" in referrer:
            return "Twitter/X"
        elif "linkedin" in referrer:
            return "LinkedIn"
        elif "youtube" in referrer:
            return "YouTube"
        elif "telegram" in referrer or "telegram" in user_agent:
            return "Telegram"
        elif referrer and "bangalorefashionmagazine" not in referrer:
            return "Other"
        else:
            return "Direct"
    
    @router.post("/analytics/profile-view")
    async def track_profile_view(data: dict):
        """Track a talent profile view - prevents duplicate counting from same session"""
        talent_id = data.get("talent_id")
        session_id = data.get("session_id", "")
        referrer = data.get("referrer", "")
        user_agent = data.get("user_agent", "")
        
        if not talent_id:
            return {"message": "No talent_id provided"}
        
        # Check if this session already viewed this profile in the last hour (prevent refresh spam)
        one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        existing = await db.profile_views.find_one({
            "talent_id": talent_id,
            "session_id": session_id,
            "created_at": {"$gte": one_hour_ago}
        })
        
        if existing:
            return {"message": "Already counted", "counted": False}
        
        # Categorize the traffic source
        source = categorize_source(referrer, user_agent)
        
        doc = {
            "id": str(uuid.uuid4()),
            "talent_id": talent_id,
            "session_id": session_id,
            "user_agent": user_agent,
            "referrer": referrer,
            "source": source,  # Categorized source
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.profile_views.insert_one(doc)
        return {"message": "Profile view tracked", "counted": True, "source": source}


    # ============== Get Weekly Profile Views (Monday-Sunday) ==============
    @router.get("/analytics/weekly-profile-views")
    async def get_weekly_profile_views():
        """Get total profile views for current week (Monday 00:00 to Sunday 23:59)"""
        now = datetime.now(timezone.utc)
        
        # Calculate Monday 00:00:00 of current week
        days_since_monday = now.weekday()  # Monday = 0, Sunday = 6
        monday_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days_since_monday)
        
        # Calculate Sunday 23:59:59 of current week
        sunday_end = monday_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        # Count profile views within the week
        weekly_views = await db.profile_views.count_documents({
            "created_at": {
                "$gte": monday_start.isoformat(),
                "$lte": sunday_end.isoformat()
            }
        })
        
        return {
            "weekly_profile_views": weekly_views,
            "week_start": monday_start.isoformat(),
            "week_end": sunday_end.isoformat()
        }


    @router.get("/analytics/top-viewed-talents")
    async def get_top_viewed_talents():
        """Get top 3 most viewed talents for current week (public - no view counts shown)"""
        now = datetime.now(timezone.utc)
        
        # Calculate Monday 00:00:00 of current week
        days_since_monday = now.weekday()
        monday_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days_since_monday)
        sunday_end = monday_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        # Aggregate profile views by talent_id for this week
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": monday_start.isoformat(),
                        "$lte": sunday_end.isoformat()
                    }
                }
            },
            {
                "$group": {
                    "_id": "$talent_id",
                    "view_count": {"$sum": 1}
                }
            },
            {"$sort": {"view_count": -1}},
            {"$limit": 3}
        ]
        
        top_talent_ids = await db.profile_views.aggregate(pipeline).to_list(3)
        
        if not top_talent_ids:
            return {"top_talents": []}
        
        # Fetch talent details (only public info - no view counts)
        talents = []
        for item in top_talent_ids:
            talent = await db.talents.find_one(
                {"id": item["_id"]},
                {"_id": 0, "id": 1, "name": 1, "profile_image": 1, "category": 1, "slug": 1}
            )
            if talent:
                talents.append(talent)
        
        return {"top_talents": talents}


    # ============== Get Analytics Summary ==============
    @admin_router.get("/admin/analytics/summary")
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

        # Magazine stats
        total_magazines = await db.magazine_builder.count_documents({})
        magazine_pages_pipeline = [
            {"$project": {"page_count": {"$size": {"$ifNull": ["$pages", []]}}}},
            {"$group": {"_id": None, "total_pages": {"$sum": "$page_count"}}}
        ]
        pages_result = await db.magazine_builder.aggregate(magazine_pages_pipeline).to_list(1)
        total_magazine_pages = pages_result[0]["total_pages"] if pages_result else 0

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
                "total_ads": total_ads,
                "total_magazines": total_magazines,
                "total_magazine_pages": total_magazine_pages
            }
        }


    # ============== Get Popular Talents ==============
    @admin_router.get("/admin/analytics/popular-talents")
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
    @admin_router.get("/admin/analytics/party-stats")
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
    @admin_router.get("/admin/analytics/ad-stats")
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
    @admin_router.get("/admin/analytics/recent-activity")
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
    @admin_router.get("/admin/analytics/daily-views")
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


    # ============== Export Analytics to CSV ==============
    @admin_router.get("/admin/analytics/export")
    async def export_analytics():
        """Export all analytics data to CSV"""
        # Get summary data
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        total_views = await db.analytics.count_documents({})
        week_views = await db.analytics.count_documents({"created_at": {"$gte": week_ago.isoformat()}})
        month_views = await db.analytics.count_documents({"created_at": {"$gte": month_ago.isoformat()}})

        # Unique visitors
        unique_pipeline = [{"$group": {"_id": "$session_id"}}, {"$count": "total"}]
        unique_result = await db.analytics.aggregate(unique_pipeline).to_list(1)
        unique_visitors = unique_result[0]["total"] if unique_result else 0

        # Popular talents
        talent_pipeline = [
            {"$match": {"event_type": "talent_view", "talent_id": {"$ne": None}}},
            {"$group": {"_id": "$talent_id", "views": {"$sum": 1}}},
            {"$sort": {"views": -1}},
            {"$limit": 50}
        ]
        popular_talents = await db.analytics.aggregate(talent_pipeline).to_list(50)

        # Party stats
        party_pipeline = [
            {"$match": {"event_type": "party_view", "party_id": {"$ne": None}}},
            {"$group": {"_id": "$party_id", "views": {"$sum": 1}}},
            {"$sort": {"views": -1}}
        ]
        party_stats = await db.analytics.aggregate(party_pipeline).to_list(50)

        # Ad stats
        ad_pipeline = [
            {"$match": {"event_type": "ad_click", "ad_id": {"$ne": None}}},
            {"$group": {"_id": "$ad_id", "clicks": {"$sum": 1}}},
            {"$sort": {"clicks": -1}}
        ]
        ad_stats = await db.analytics.aggregate(ad_pipeline).to_list(50)

        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)

        # Summary section
        writer.writerow(["=== TRAFFIC SUMMARY ==="])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Page Views", total_views])
        writer.writerow(["This Week Views", week_views])
        writer.writerow(["This Month Views", month_views])
        writer.writerow(["Unique Visitors", unique_visitors])
        writer.writerow([])

        # Popular talents section
        writer.writerow(["=== MOST VIEWED TALENTS ==="])
        writer.writerow(["Rank", "Talent Name", "Instagram", "Category", "Views"])
        for i, t in enumerate(popular_talents, 1):
            talent = await db.talents.find_one({"id": t["_id"]}, {"_id": 0, "name": 1, "instagram_id": 1, "category": 1})
            if talent:
                writer.writerow([i, talent.get("name", ""), talent.get("instagram_id", ""), talent.get("category", ""), t["views"]])
        writer.writerow([])

        # Party stats section
        writer.writerow(["=== PARTY EVENT VIEWS ==="])
        writer.writerow(["Party Title", "Venue", "Date", "Views"])
        for p in party_stats:
            party = await db.party_events.find_one({"id": p["_id"]}, {"_id": 0, "title": 1, "venue": 1, "event_date": 1})
            if party:
                writer.writerow([party.get("title", ""), party.get("venue", ""), party.get("event_date", ""), p["views"]])
        writer.writerow([])

        # Ad stats section
        writer.writerow(["=== ADVERTISEMENT CLICKS ==="])
        writer.writerow(["Ad Title", "Link", "Clicks"])
        for a in ad_stats:
            ad = await db.advertisements.find_one({"id": a["_id"]}, {"_id": 0, "title": 1, "link": 1})
            if ad:
                writer.writerow([ad.get("title", ""), ad.get("link", ""), a["clicks"]])

        output.seek(0)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=analytics_report_{timestamp}.csv"}
        )


    # ============== Get Talent Profile Views ==============
    @router.get("/analytics/talent/{talent_id}/views")
    async def get_talent_views(talent_id: str):
        """Get total and weekly profile views for a specific talent"""
        now = datetime.now(timezone.utc)
        
        # Calculate Monday 00:00:00 of current week
        days_since_monday = now.weekday()
        monday_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=days_since_monday)
        sunday_end = monday_start + timedelta(days=6, hours=23, minutes=59, seconds=59)
        
        # Total views
        total_views = await db.profile_views.count_documents({"talent_id": talent_id})
        
        # Weekly views
        weekly_views = await db.profile_views.count_documents({
            "talent_id": talent_id,
            "created_at": {
                "$gte": monday_start.isoformat(),
                "$lte": sunday_end.isoformat()
            }
        })
        
        return {
            "talent_id": talent_id,
            "total_views": total_views,
            "weekly_views": weekly_views
        }


    # ============== Admin: Traffic Source Analytics ==============
    @admin_router.get("/admin/analytics/traffic-sources")
    async def get_traffic_sources(days: int = 30):
        """Get traffic source breakdown for admin analytics"""
        now = datetime.now(timezone.utc)
        start_date = (now - timedelta(days=days)).isoformat()
        
        # Aggregate by source
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {"$ifNull": ["$source", "Direct"]},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}}
        ]
        
        results = await db.profile_views.aggregate(pipeline).to_list(20)
        
        # Calculate total
        total = sum(r["count"] for r in results)
        
        # Format response with percentages
        sources = []
        for r in results:
            source_name = r["_id"] or "Direct"
            count = r["count"]
            percentage = round((count / total * 100), 1) if total > 0 else 0
            sources.append({
                "source": source_name,
                "count": count,
                "percentage": percentage
            })
        
        # Get daily breakdown for chart
        daily_pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "date": {"$substr": ["$created_at", 0, 10]},
                        "source": {"$ifNull": ["$source", "Direct"]}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.date": 1}}
        ]
        
        daily_results = await db.profile_views.aggregate(daily_pipeline).to_list(500)
        
        # Organize daily data
        daily_data = {}
        for r in daily_results:
            date = r["_id"]["date"]
            source = r["_id"]["source"] or "Direct"
            if date not in daily_data:
                daily_data[date] = {}
            daily_data[date][source] = r["count"]
        
        return {
            "total_views": total,
            "period_days": days,
            "sources": sources,
            "daily_breakdown": daily_data
        }


    router.include_router(admin_router, dependencies=[Depends(get_current_admin)])
    return router
