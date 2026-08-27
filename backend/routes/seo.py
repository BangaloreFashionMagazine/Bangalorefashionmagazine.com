"""
SEO Management Routes
Handles sitemap generation, robots.txt, and SEO metadata
"""
from fastapi import APIRouter, Response, Depends
from fastapi.responses import PlainTextResponse
from datetime import datetime, timezone
from typing import Optional
import logging

from dependencies.auth import get_current_admin

logger = logging.getLogger(__name__)


def create_seo_routes(db, app_url: str = "https://bangalorefashionmagazine.com"):
    router = APIRouter()
    admin_router = APIRouter()

    # ============== XML Sitemap ==============

    @router.get("/sitemap.xml", response_class=PlainTextResponse)
    async def get_sitemap():
        """Generate XML sitemap dynamically from approved talents and content"""
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        # Start XML
        xml_parts = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ]

        # Homepage
        xml_parts.append(f'''
  <url>
    <loc>{app_url}/</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>''')

        # Static pages
        static_pages = [
            ("/about", "weekly", "0.8"),
            ("/join", "monthly", "0.7"),
            ("/designer-store", "weekly", "0.7"),
            ("/talents/All%20Talents", "daily", "0.9"),
            ("/talents/Models%20%E2%80%93%20Male", "daily", "0.8"),
            ("/talents/Models%20%E2%80%93%20Female", "daily", "0.8"),
            ("/talents/Designers", "daily", "0.8"),
            ("/talents/Photographers", "daily", "0.8"),
            ("/talents/Makeup%20Artists", "daily", "0.8"),
            ("/talents/Hair%20Stylists", "daily", "0.8"),
            ("/talents/Stylists", "daily", "0.8"),
            ("/talents/DJs", "daily", "0.8"),
            ("/talents/Choreographers", "daily", "0.8"),
            ("/talents/Casting%20Coordinators", "daily", "0.8"),
            ("/talents/Featured%20Talents", "daily", "0.9"),
            ("/magazine/latest-issues", "weekly", "0.8"),
            ("/magazine/talent-spotlight", "weekly", "0.8"),
            ("/magazine/editorials", "weekly", "0.7"),
        ]

        for path, freq, priority in static_pages:
            xml_parts.append(f'''
  <url>
    <loc>{app_url}{path}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>''')

        # Approved talent profiles
        talents = await db.talents.find(
            {"is_approved": True},
            {"_id": 0, "id": 1, "name": 1, "created_at": 1}
        ).to_list(1000)

        for talent in talents:
            talent_date = talent.get("created_at", now)[:10] if talent.get("created_at") else now
            xml_parts.append(f'''
  <url>
    <loc>{app_url}/talent/{talent["id"]}</loc>
    <lastmod>{talent_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>''')

        xml_parts.append('</urlset>')

        return "\n".join(xml_parts)

    # ============== Robots.txt ==============

    @router.get("/robots.txt", response_class=PlainTextResponse)
    async def get_robots():
        """Generate robots.txt"""
        return f"""# Bangalore Fashion Magazine Robots.txt
User-agent: *
Allow: /
Allow: /talents/
Allow: /talent/
Allow: /magazine/
Allow: /about
Allow: /designer-store

# Block admin and private pages
Disallow: /admin
Disallow: /admin/
Disallow: /login
Disallow: /talent-login
Disallow: /dashboard
Disallow: /api/
Disallow: /forgot-password
Disallow: /reset-password

# Sitemap
Sitemap: {app_url}/api/sitemap.xml
"""

    # ============== SEO Metadata Endpoints ==============

    @router.get("/seo/page/{path:path}")
    async def get_page_seo(path: str):
        """Get SEO metadata for a specific page"""
        # Default metadata
        default_meta = {
            "title": "Bangalore Fashion Magazine | BFM",
            "description": "Discover professional fashion talent in Bangalore. Models, designers, photographers, makeup artists and more. Join BFM today.",
            "keywords": "bangalore fashion, fashion magazine, bangalore models, fashion photographers, designers bangalore, bfm",
            "og_title": "Bangalore Fashion Magazine",
            "og_description": "Discover and connect with professional fashion talent in Bangalore",
            "og_image": f"{app_url}/bfm-og-image.jpg",
            "twitter_card": "summary_large_image"
        }

        # Check for custom SEO settings
        seo_settings = await db.seo_settings.find_one({"path": path}, {"_id": 0})
        if seo_settings:
            return {**default_meta, **seo_settings}

        # Auto-generate for talent profiles
        if path.startswith("talent/"):
            talent_id = path.replace("talent/", "")
            talent = await db.talents.find_one({"id": talent_id}, {"_id": 0, "name": 1, "category": 1, "bio": 1})
            if talent:
                return {
                    "title": f"{talent['name']} | {talent.get('category', 'Talent')} in Bangalore | BFM",
                    "description": f"{talent['name']} - Professional {talent.get('category', 'fashion talent')} featured on Bangalore Fashion Magazine. {(talent.get('bio', '')[:150] + '...') if talent.get('bio') else 'View portfolio and connect.'}",
                    "keywords": f"{talent['name']}, {talent.get('category', '')}, bangalore, fashion, bfm, model portfolio",
                    "og_title": f"{talent['name']} | Bangalore Fashion Magazine",
                    "og_description": f"Discover {talent['name']}, {talent.get('category', 'talent')} on BFM",
                    "og_image": f"{app_url}/api/talent/{talent_id}/thumb",
                    "twitter_card": "summary_large_image"
                }

        # Auto-generate for category pages
        category_seo = {
            "talents/Models – Male": {
                "title": "Male Models in Bangalore | Bangalore Fashion Magazine",
                "description": "Discover professional male models in Bangalore. Browse portfolios, view profiles, and connect with talented male models featured by BFM.",
                "keywords": "male models bangalore, men models india, fashion models bangalore, bfm male models"
            },
            "talents/Models – Female": {
                "title": "Female Models in Bangalore | Bangalore Fashion Magazine",
                "description": "Discover professional female models in Bangalore. Browse portfolios, view profiles, and connect with talented female models featured by BFM.",
                "keywords": "female models bangalore, women models india, fashion models bangalore, bfm female models"
            },
            "talents/Designers": {
                "title": "Fashion Designers in Bangalore | Bangalore Fashion Magazine",
                "description": "Discover talented fashion designers in Bangalore. View collections, portfolios, and connect with creative designers featured by BFM.",
                "keywords": "fashion designers bangalore, clothing designers india, bangalore designers, bfm designers"
            },
            "talents/Photographers": {
                "title": "Fashion Photographers in Bangalore | Bangalore Fashion Magazine",
                "description": "Discover professional fashion photographers in Bangalore. View portfolios, style guides, and connect with photographers featured by BFM.",
                "keywords": "fashion photographers bangalore, photography bangalore, professional photographers india, bfm photographers"
            },
            "talents/Makeup Artists": {
                "title": "Makeup Artists in Bangalore | Bangalore Fashion Magazine",
                "description": "Discover professional makeup artists in Bangalore. View portfolios, specializations, and connect with talented MUAs featured by BFM.",
                "keywords": "makeup artists bangalore, mua bangalore, bridal makeup india, fashion makeup, bfm makeup artists"
            }
        }

        if path in category_seo:
            return {**default_meta, **category_seo[path]}

        return default_meta

    @admin_router.put("/admin/seo/page")
    async def update_page_seo(seo_data: dict):
        """Update SEO metadata for a specific page"""
        path = seo_data.get("path")
        if not path:
            return {"error": "Path is required"}

        seo_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        await db.seo_settings.update_one(
            {"path": path},
            {"$set": seo_data},
            upsert=True
        )

        return {"message": "SEO settings updated"}

    @admin_router.get("/admin/seo/settings")
    async def get_all_seo_settings():
        """Get all custom SEO settings"""
        settings = await db.seo_settings.find({}, {"_id": 0}).to_list(500)
        return settings

    # ============== Structured Data ==============

    @router.get("/seo/schema/organization")
    async def get_organization_schema():
        """Get Organization structured data"""
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Bangalore Fashion Magazine",
            "alternateName": "BFM",
            "url": app_url,
            "logo": f"{app_url}/bfm-logo.jpeg",
            "description": "Bangalore Fashion Magazine is a premier fashion platform showcasing talented models, designers, photographers, and fashion professionals in Bangalore, India.",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bangalore",
                "addressRegion": "Karnataka",
                "addressCountry": "India"
            },
            "sameAs": [
                "https://instagram.com/bangalorefashionmagazine"
            ]
        }

    @router.get("/seo/schema/talent/{talent_id}")
    async def get_talent_schema(talent_id: str):
        """Get Person structured data for a talent"""
        talent = await db.talents.find_one(
            {"id": talent_id, "is_approved": True},
            {"_id": 0}
        )

        if not talent:
            return {"error": "Talent not found"}

        return {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": talent.get("name", ""),
            "jobTitle": talent.get("category", "Fashion Professional"),
            "description": talent.get("bio", ""),
            "url": f"{app_url}/talent/{talent_id}",
            "image": f"{app_url}/api/talent/{talent_id}/thumb",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": talent.get("location", "Bangalore"),
                "addressCountry": "India"
            },
            "memberOf": {
                "@type": "Organization",
                "name": "Bangalore Fashion Magazine"
            }
        }

    @router.get("/seo/schema/breadcrumb/{path:path}")
    async def get_breadcrumb_schema(path: str):
        """Get BreadcrumbList structured data"""
        items = [{"name": "Home", "url": app_url}]

        path_parts = path.strip("/").split("/")
        current_url = app_url

        for part in path_parts:
            if part:
                current_url += f"/{part}"
                # Decode URL-encoded parts for display
                display_name = part.replace("%20", " ").replace("-", " ").title()
                items.append({"name": display_name, "url": current_url})

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "name": item["name"],
                    "item": item["url"]
                }
                for i, item in enumerate(items)
            ]
        }

    router.include_router(admin_router, dependencies=[Depends(get_current_admin)])
    return router
