"""
Open Graph Meta Tags - Server-Side Rendering for Social Media Crawlers

This module serves pre-rendered HTML with OG tags for social media crawlers
(WhatsApp, Facebook, Twitter, LinkedIn) since they don't execute JavaScript.
"""
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
import re
import logging

logger = logging.getLogger(__name__)

# User agents that identify social media crawlers
CRAWLER_USER_AGENTS = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'LinkedInBot',
    'Pinterest',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Applebot',
    'Googlebot',
    'bingbot',
]

def is_crawler(user_agent: str) -> bool:
    """Check if the request is from a social media crawler"""
    if not user_agent:
        return False
    ua_lower = user_agent.lower()
    return any(crawler.lower() in ua_lower for crawler in CRAWLER_USER_AGENTS)


def create_og_routes(db):
    router = APIRouter()
    
    BASE_URL = "https://bangalorefashionmagazine.com"
    DEFAULT_IMAGE = f"{BASE_URL}/bfm-og-image.jpg"
    SITE_NAME = "Bangalore Fashion Magazine"
    
    def generate_og_html(
        title: str,
        description: str,
        image: str,
        url: str,
        og_type: str = "website"
    ) -> str:
        """Generate HTML page with OG meta tags for crawlers"""
        # Escape HTML entities
        title = title.replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
        description = description.replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <!-- Primary Meta Tags -->
    <title>{title}</title>
    <meta name="title" content="{title}">
    <meta name="description" content="{description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="{og_type}">
    <meta property="og:url" content="{url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="{image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="{SITE_NAME}">
    <meta property="og:locale" content="en_IN">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{url}">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">
    
    <!-- Redirect non-crawlers to React app -->
    <script>
        // If JavaScript runs, it's not a crawler - redirect to actual page
        window.location.href = "{url}";
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0;url={url}">
    </noscript>
</head>
<body>
    <h1>{title}</h1>
    <p>{description}</p>
    <img src="{image}" alt="{title}">
    <a href="{url}">View on {SITE_NAME}</a>
</body>
</html>"""

    @router.get("/og/talent/{talent_id_or_slug}", response_class=HTMLResponse)
    async def get_talent_og(talent_id_or_slug: str, request: Request):
        """
        Serve OG meta tags for talent profile pages.
        Crawlers get HTML with meta tags, browsers get redirected to React app.
        """
        user_agent = request.headers.get("user-agent", "")
        
        # Find talent by ID or slug
        talent = await db.talents.find_one(
            {"$or": [{"id": talent_id_or_slug}, {"slug": talent_id_or_slug}]},
            {"_id": 0, "id": 1, "name": 1, "category": 1, "bio": 1, "profile_image": 1, "slug": 1}
        )
        
        if not talent:
            # Return default BFM OG tags for non-existent talents
            return HTMLResponse(content=generate_og_html(
                title="Talent Not Found | Bangalore Fashion Magazine",
                description="Discover India's premier fashion talent platform.",
                image=DEFAULT_IMAGE,
                url=BASE_URL
            ))
        
        # Build talent-specific OG data
        name = talent.get("name", "Fashion Talent")
        category = talent.get("category", "Model")
        bio = talent.get("bio", "")
        slug = talent.get("slug") or talent.get("id")
        
        # Use profile image if available and it's a URL (not base64 for crawlers)
        profile_img = talent.get("profile_image", "")
        if profile_img and profile_img.startswith("http"):
            og_image = profile_img
        else:
            # Use default BFM image for base64 images (can't use data URLs in OG)
            og_image = DEFAULT_IMAGE
        
        title = f"{name} | {category} | Bangalore Fashion Magazine"
        description = bio[:200] if bio else f"View {name}'s profile on Bangalore Fashion Magazine - India's premier fashion talent platform."
        url = f"{BASE_URL}/talent/{slug}"
        
        return HTMLResponse(content=generate_og_html(
            title=title,
            description=description,
            image=og_image,
            url=url,
            og_type="profile"
        ))

    @router.get("/og/contest/{contest_slug}", response_class=HTMLResponse)
    async def get_contest_og(contest_slug: str, request: Request):
        """Serve OG meta tags for contest pages"""
        
        contest = await db.contests.find_one(
            {"slug": contest_slug},
            {"_id": 0, "id": 1, "name": 1, "description": 1, "banner_image": 1, "slug": 1}
        )
        
        if not contest:
            return HTMLResponse(content=generate_og_html(
                title="Contest Not Found | Bangalore Fashion Magazine",
                description="Vote for your favorite talents in BFM contests!",
                image=DEFAULT_IMAGE,
                url=BASE_URL
            ))
        
        name = contest.get("name", "Fashion Contest")
        description = contest.get("description", "")
        banner = contest.get("banner_image", "")
        slug = contest.get("slug") or contest.get("id")
        
        # Use banner if it's a URL
        if banner and banner.startswith("http"):
            og_image = banner
        else:
            og_image = DEFAULT_IMAGE
        
        title = f"{name} | Vote Now | Bangalore Fashion Magazine"
        desc = description[:200] if description else f"Vote for your favorite talents in {name}!"
        url = f"{BASE_URL}/contest/{slug}"
        
        return HTMLResponse(content=generate_og_html(
            title=title,
            description=desc,
            image=og_image,
            url=url,
            og_type="article"
        ))

    @router.get("/og/category/{category}", response_class=HTMLResponse)
    async def get_category_og(category: str, request: Request):
        """Serve OG meta tags for category pages"""
        
        # Format category name
        category_display = category.replace("-", " ").title()
        
        title = f"{category_display} | Bangalore Fashion Magazine"
        description = f"Discover top {category_display.lower()} in Bangalore. View portfolios, book talent for fashion shows, brand campaigns & editorial shoots."
        url = f"{BASE_URL}/category/{category}"
        
        return HTMLResponse(content=generate_og_html(
            title=title,
            description=description,
            image=DEFAULT_IMAGE,
            url=url
        ))

    return router
