from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

def create_magazine_builder_router(db):
    router = APIRouter(prefix="/magazine-builder", tags=["magazine-builder"])
    
    class TalentDetails(BaseModel):
        name: str
        category: str
        headline: Optional[str] = ""
        introduction: Optional[str] = ""
        biography: Optional[str] = ""
        career_journey: Optional[str] = ""
        achievements: Optional[str] = ""
        specialization: Optional[str] = ""
        location: Optional[str] = ""
        instagram: Optional[str] = ""
        website: Optional[str] = ""
        contact_links: Optional[str] = ""
        interview_qa: Optional[List[Dict[str, str]]] = []
        additional_info: Optional[str] = ""
    
    class MagazineImages(BaseModel):
        cover_image: Optional[str] = ""
        profile_image: Optional[str] = ""
        portfolio_images: Optional[List[str]] = []
        behind_scenes: Optional[List[str]] = []
        background_image: Optional[str] = ""
        logo: Optional[str] = ""
    
    class PageElement(BaseModel):
        id: str
        type: str  # text, image, shape, logo
        content: Any
        style: Dict[str, Any]
        position: Dict[str, float]  # x, y, width, height
        layer: int
        locked: bool = False
        visible: bool = True
    
    class MagazinePage(BaseModel):
        id: str
        name: str
        page_type: str  # cover, profile, journey, portfolio, interview, spotlight, ad, back_cover
        elements: List[PageElement]
        background: Dict[str, Any]
    
    class CreateMagazineRequest(BaseModel):
        talent: TalentDetails
        images: MagazineImages
        template: str = "black_gold"
    
    class SaveMagazineRequest(BaseModel):
        id: Optional[str] = None
        title: str
        talent: TalentDetails
        images: MagazineImages
        pages: List[Dict[str, Any]]
        template: str
        media_library: Optional[List[Dict[str, Any]]] = []
        master_elements: Optional[Dict[str, List[Dict[str, Any]]]] = {"header": [], "footer": []}
        master_settings: Optional[Dict[str, Any]] = {"applyTo": "all", "excludedPages": []}
    
    @router.get("/templates")
    async def get_templates():
        """Get available magazine templates"""
        templates = [
            {
                "id": "black_gold",
                "name": "BFM Black & Gold",
                "description": "Luxury fashion magazine with black background and gold accents",
                "preview": "/magazine-templates/black-gold-preview.jpg",
                "colors": {"primary": "#000000", "secondary": "#D4AF37", "text": "#FFFFFF"}
            },
            {
                "id": "editorial",
                "name": "BFM Editorial",
                "description": "Clean white and black editorial style with gold highlights",
                "preview": "/magazine-templates/editorial-preview.jpg",
                "colors": {"primary": "#FFFFFF", "secondary": "#000000", "accent": "#D4AF37"}
            },
            {
                "id": "dark_luxury",
                "name": "BFM Dark Luxury",
                "description": "Dramatic dark backgrounds with spotlight photography",
                "preview": "/magazine-templates/dark-luxury-preview.jpg",
                "colors": {"primary": "#0A0A0A", "secondary": "#1A1A2E", "accent": "#D4AF37"}
            }
        ]
        return templates
    
    @router.post("/generate")
    async def generate_magazine(request: CreateMagazineRequest):
        """Generate magazine pages based on talent info and template"""
        talent = request.talent
        images = request.images
        template = request.template
        
        # Define template colors
        template_colors = {
            "black_gold": {"bg": "#000000", "accent": "#D4AF37", "text": "#FFFFFF", "secondary": "#1A1A1A"},
            "editorial": {"bg": "#FFFFFF", "accent": "#D4AF37", "text": "#000000", "secondary": "#F5F5F5"},
            "dark_luxury": {"bg": "#0A0A0A", "accent": "#D4AF37", "text": "#FFFFFF", "secondary": "#1A1A2E"}
        }
        colors = template_colors.get(template, template_colors["black_gold"])
        
        # Generate pages
        pages = []
        
        # Page 1: Cover
        cover_page = {
            "id": str(uuid.uuid4()),
            "name": "Cover",
            "page_type": "cover",
            "background": {"type": "solid", "color": colors["bg"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "image",
                    "content": images.cover_image or images.profile_image or "",
                    "style": {"objectFit": "cover", "opacity": 1},
                    "position": {"x": 0, "y": 0, "width": 100, "height": 100},
                    "layer": 0,
                    "locked": False,
                    "visible": True,
                    "name": "Cover Image"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "shape",
                    "content": "rectangle",
                    "style": {"backgroundColor": "rgba(0,0,0,0.5)"},
                    "position": {"x": 0, "y": 60, "width": 100, "height": 40},
                    "layer": 1,
                    "locked": False,
                    "visible": True,
                    "name": "Overlay"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "logo",
                    "content": "/bfm-logo.jpeg",
                    "style": {"borderRadius": "50%", "border": f"2px solid {colors['accent']}"},
                    "position": {"x": 5, "y": 5, "width": 12, "height": 10},
                    "layer": 5,
                    "locked": False,
                    "visible": True,
                    "name": "BFM Logo"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "BANGALORE FASHION MAGAZINE",
                    "style": {
                        "fontSize": "12px",
                        "fontWeight": "400",
                        "color": colors["accent"],
                        "letterSpacing": "3px",
                        "textAlign": "center"
                    },
                    "position": {"x": 18, "y": 6, "width": 75, "height": 6},
                    "layer": 4,
                    "locked": False,
                    "visible": True,
                    "name": "Magazine Title"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.name.upper(),
                    "style": {
                        "fontSize": "48px",
                        "fontWeight": "700",
                        "color": "#FFFFFF",
                        "textAlign": "center",
                        "textShadow": "2px 2px 4px rgba(0,0,0,0.5)"
                    },
                    "position": {"x": 5, "y": 70, "width": 90, "height": 12},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Talent Name"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.category,
                    "style": {
                        "fontSize": "18px",
                        "fontWeight": "400",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "3px"
                    },
                    "position": {"x": 5, "y": 82, "width": 90, "height": 5},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Category"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.headline or "EXCLUSIVE FEATURE",
                    "style": {
                        "fontSize": "16px",
                        "fontWeight": "300",
                        "color": "#FFFFFF",
                        "textAlign": "center",
                        "fontStyle": "italic"
                    },
                    "position": {"x": 5, "y": 88, "width": 90, "height": 5},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Headline"
                }
            ]
        }
        pages.append(cover_page)
        
        # Page 2: Meet The Talent / Profile
        profile_page = {
            "id": str(uuid.uuid4()),
            "name": "Meet The Talent",
            "page_type": "profile",
            "background": {"type": "solid", "color": colors["bg"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "MEET THE TALENT",
                    "style": {
                        "fontSize": "28px",
                        "fontWeight": "700",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "5px"
                    },
                    "position": {"x": 5, "y": 5, "width": 90, "height": 8},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Section Title"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "image",
                    "content": images.profile_image or images.cover_image or "",
                    "style": {"objectFit": "cover", "borderRadius": "0"},
                    "position": {"x": 5, "y": 15, "width": 40, "height": 60},
                    "layer": 1,
                    "locked": False,
                    "visible": True,
                    "name": "Profile Image"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.name,
                    "style": {
                        "fontSize": "32px",
                        "fontWeight": "700",
                        "color": "#FFFFFF" if template != "editorial" else "#000000"
                    },
                    "position": {"x": 50, "y": 15, "width": 45, "height": 8},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "Name"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.introduction if talent.introduction else (talent.biography[:300] + "..." if talent.biography and len(talent.biography) > 300 else (talent.biography or "A talented professional making waves in the fashion industry.")),
                    "style": {
                        "fontSize": "14px",
                        "fontWeight": "400",
                        "color": "#CCCCCC" if template != "editorial" else "#333333",
                        "lineHeight": "1.8",
                        "textAlign": "justify"
                    },
                    "position": {"x": 50, "y": 25, "width": 45, "height": 50},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "Biography"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": f"📍 {talent.location}" if talent.location else "",
                    "style": {
                        "fontSize": "12px",
                        "color": colors["accent"]
                    },
                    "position": {"x": 50, "y": 78, "width": 45, "height": 5},
                    "layer": 2,
                    "locked": False,
                    "visible": bool(talent.location),
                    "name": "Location"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": f"@{talent.instagram}" if talent.instagram else "",
                    "style": {
                        "fontSize": "12px",
                        "color": colors["accent"]
                    },
                    "position": {"x": 50, "y": 83, "width": 45, "height": 5},
                    "layer": 2,
                    "locked": False,
                    "visible": bool(talent.instagram),
                    "name": "Instagram"
                }
            ]
        }
        pages.append(profile_page)
        
        # Page 3: The Journey
        journey_page = {
            "id": str(uuid.uuid4()),
            "name": "The Journey",
            "page_type": "journey",
            "background": {"type": "solid", "color": colors["secondary"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "THE JOURNEY",
                    "style": {
                        "fontSize": "28px",
                        "fontWeight": "700",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "5px"
                    },
                    "position": {"x": 5, "y": 5, "width": 90, "height": 8},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Section Title"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.career_journey or "Every journey begins with a single step. This is the story of passion, dedication, and the relentless pursuit of excellence in the world of fashion.",
                    "style": {
                        "fontSize": "16px",
                        "fontWeight": "400",
                        "color": "#FFFFFF" if template != "editorial" else "#333333",
                        "lineHeight": "2",
                        "textAlign": "justify"
                    },
                    "position": {"x": 5, "y": 15, "width": 55, "height": 75},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "Journey Text"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "image",
                    "content": images.portfolio_images[0] if images.portfolio_images else images.cover_image or "",
                    "style": {"objectFit": "cover"},
                    "position": {"x": 62, "y": 15, "width": 35, "height": 75},
                    "layer": 1,
                    "locked": False,
                    "visible": True,
                    "name": "Journey Image"
                }
            ]
        }
        pages.append(journey_page)
        
        # Page 4: Portfolio
        portfolio_images_list = images.portfolio_images or []
        portfolio_page = {
            "id": str(uuid.uuid4()),
            "name": "Portfolio",
            "page_type": "portfolio",
            "background": {"type": "solid", "color": colors["bg"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "PORTFOLIO",
                    "style": {
                        "fontSize": "28px",
                        "fontWeight": "700",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "5px"
                    },
                    "position": {"x": 5, "y": 3, "width": 90, "height": 7},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Section Title"
                }
            ]
        }
        # Add portfolio images in a grid
        for i, img in enumerate(portfolio_images_list[:6]):
            row = i // 3
            col = i % 3
            portfolio_page["elements"].append({
                "id": str(uuid.uuid4()),
                "type": "image",
                "content": img,
                "style": {"objectFit": "cover"},
                "position": {"x": 5 + col * 31, "y": 12 + row * 44, "width": 29, "height": 42},
                "layer": 1,
                "locked": False,
                "visible": True,
                "name": f"Portfolio Image {i+1}"
            })
        pages.append(portfolio_page)
        
        # Page 5: Interview / 10 Questions
        interview_page = {
            "id": str(uuid.uuid4()),
            "name": "10 Questions",
            "page_type": "interview",
            "background": {"type": "solid", "color": colors["secondary"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "10 QUESTIONS",
                    "style": {
                        "fontSize": "28px",
                        "fontWeight": "700",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "5px"
                    },
                    "position": {"x": 5, "y": 3, "width": 90, "height": 7},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Section Title"
                }
            ]
        }
        # Add Q&A elements
        qa_list = talent.interview_qa or [
            {"question": "What inspired you to pursue fashion?", "answer": "Fashion has always been my passion..."},
            {"question": "Describe your creative process.", "answer": "I believe in authentic expression..."},
            {"question": "What's your biggest achievement?", "answer": "Every project completed is an achievement..."}
        ]
        for i, qa in enumerate(qa_list[:5]):
            interview_page["elements"].append({
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": f"Q: {qa.get('question', '')}",
                "style": {
                    "fontSize": "14px",
                    "fontWeight": "700",
                    "color": colors["accent"]
                },
                "position": {"x": 5, "y": 12 + i * 17, "width": 90, "height": 5},
                "layer": 2,
                "locked": False,
                "visible": True,
                "name": f"Question {i+1}"
            })
            interview_page["elements"].append({
                "id": str(uuid.uuid4()),
                "type": "text",
                "content": qa.get('answer', ''),
                "style": {
                    "fontSize": "12px",
                    "fontWeight": "400",
                    "color": "#CCCCCC" if template != "editorial" else "#333333",
                    "lineHeight": "1.6"
                },
                "position": {"x": 5, "y": 17 + i * 17, "width": 90, "height": 10},
                "layer": 2,
                "locked": False,
                "visible": True,
                "name": f"Answer {i+1}"
            })
        pages.append(interview_page)
        
        # Page 6: Spotlight
        spotlight_page = {
            "id": str(uuid.uuid4()),
            "name": "BFM Spotlight",
            "page_type": "spotlight",
            "background": {"type": "solid", "color": colors["bg"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "image",
                    "content": portfolio_images_list[1] if len(portfolio_images_list) > 1 else images.cover_image or "",
                    "style": {"objectFit": "cover", "opacity": 0.8},
                    "position": {"x": 0, "y": 0, "width": 100, "height": 100},
                    "layer": 0,
                    "locked": False,
                    "visible": True,
                    "name": "Background Image"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "shape",
                    "content": "rectangle",
                    "style": {"backgroundColor": "rgba(0,0,0,0.6)"},
                    "position": {"x": 0, "y": 0, "width": 100, "height": 100},
                    "layer": 1,
                    "locked": False,
                    "visible": True,
                    "name": "Overlay"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "BFM TALENT SPOTLIGHT",
                    "style": {
                        "fontSize": "24px",
                        "fontWeight": "700",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "5px"
                    },
                    "position": {"x": 5, "y": 10, "width": 90, "height": 8},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Section Title"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.name,
                    "style": {
                        "fontSize": "42px",
                        "fontWeight": "700",
                        "color": "#FFFFFF",
                        "textAlign": "center"
                    },
                    "position": {"x": 5, "y": 35, "width": 90, "height": 12},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Name"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": talent.achievements or talent.specialization or "Making waves in the fashion industry",
                    "style": {
                        "fontSize": "16px",
                        "fontWeight": "400",
                        "color": "#FFFFFF",
                        "textAlign": "center",
                        "fontStyle": "italic"
                    },
                    "position": {"x": 10, "y": 50, "width": 80, "height": 15},
                    "layer": 3,
                    "locked": False,
                    "visible": True,
                    "name": "Achievement"
                }
            ]
        }
        pages.append(spotlight_page)
        
        # Page 7: Back Cover
        back_cover = {
            "id": str(uuid.uuid4()),
            "name": "Back Cover",
            "page_type": "back_cover",
            "background": {"type": "solid", "color": colors["bg"]},
            "elements": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "logo",
                    "content": "/bfm-logo.jpeg",
                    "style": {"borderRadius": "50%", "border": f"3px solid {colors['accent']}"},
                    "position": {"x": 35, "y": 25, "width": 30, "height": 25},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "BFM Logo"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "BANGALORE\nFASHION\nMAGAZINE",
                    "style": {
                        "fontSize": "32px",
                        "fontWeight": "700",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "3px",
                        "lineHeight": "1.4"
                    },
                    "position": {"x": 10, "y": 55, "width": 80, "height": 20},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "Magazine Name"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "www.bangalorefashionmagazine.com",
                    "style": {
                        "fontSize": "14px",
                        "fontWeight": "400",
                        "color": "#FFFFFF" if template != "editorial" else "#333333",
                        "textAlign": "center"
                    },
                    "position": {"x": 10, "y": 78, "width": 80, "height": 5},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "Website"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "@banglorefashionmag",
                    "style": {
                        "fontSize": "12px",
                        "fontWeight": "400",
                        "color": colors["accent"],
                        "textAlign": "center"
                    },
                    "position": {"x": 10, "y": 84, "width": 80, "height": 5},
                    "layer": 2,
                    "locked": False,
                    "visible": True,
                    "name": "Social Media"
                }
            ]
        }
        pages.append(back_cover)
        
        # Create magazine document
        magazine_id = str(uuid.uuid4())
        
        # Add BFM Logo to all pages (except cover which already has it)
        logo_element = {
            "type": "logo",
            "content": "/bfm-logo.jpeg",
            "style": {"borderRadius": "50%", "border": f"2px solid {colors['accent']}", "opacity": 0.9},
            "position": {"x": 3, "y": 3, "width": 8, "height": 7},
            "locked": False,
            "visible": True,
            "name": "BFM Logo"
        }
        
        # Add logo to pages 2-6 (skip cover page 0 which has logo, and back cover which has big logo)
        for i, page in enumerate(pages):
            if i > 0 and i < len(pages) - 1:  # Skip first (cover) and last (back cover)
                # Check if page already has a logo
                has_logo = any(el.get("type") == "logo" or el.get("name") == "BFM Logo" for el in page.get("elements", []))
                if not has_logo:
                    logo_copy = logo_element.copy()
                    logo_copy["id"] = str(uuid.uuid4())
                    logo_copy["layer"] = max([el.get("layer", 0) for el in page["elements"]] + [0]) + 1
                    page["elements"].append(logo_copy)
        
        # Default master elements (header with page number, footer with branding)
        default_master_elements = {
            "header": [],
            "footer": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "text",
                    "content": "BANGALORE FASHION MAGAZINE  •  {{page}}",
                    "style": {
                        "fontSize": "8px",
                        "fontWeight": "400",
                        "color": colors["accent"],
                        "textAlign": "center",
                        "letterSpacing": "2px"
                    },
                    "position": {"x": 10, "y": 96, "width": 80, "height": 3},
                    "layer": 100,
                    "locked": False,
                    "visible": True,
                    "name": "Page Footer"
                }
            ]
        }
        
        magazine = {
            "id": magazine_id,
            "title": f"{talent.name} - BFM Feature",
            "talent": talent.dict(),
            "images": images.dict(),
            "pages": pages,
            "template": template,
            "media_library": [],
            "master_elements": default_master_elements,
            "master_settings": {"applyTo": "except_cover", "excludedPages": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "status": "draft"
        }
        
        # Save to database
        await db.magazines.insert_one(magazine)
        
        return {"id": magazine_id, "pages": pages, "template": template}
    
    @router.get("/list")
    async def list_magazines():
        """Get all magazines"""
        magazines = await db.magazines.find({}, {"_id": 0}).to_list(100)
        return magazines
    
    @router.get("/{magazine_id}")
    async def get_magazine(magazine_id: str):
        """Get a specific magazine"""
        magazine = await db.magazines.find_one({"id": magazine_id}, {"_id": 0})
        if not magazine:
            raise HTTPException(status_code=404, detail="Magazine not found")
        return magazine
    
    @router.put("/{magazine_id}")
    async def update_magazine(magazine_id: str, request: SaveMagazineRequest):
        """Update a magazine"""
        update_data = {
            "title": request.title,
            "talent": request.talent.dict(),
            "images": request.images.dict(),
            "pages": request.pages,
            "template": request.template,
            "media_library": request.media_library or [],
            "master_elements": request.master_elements or {"header": [], "footer": []},
            "master_settings": request.master_settings or {"applyTo": "all", "excludedPages": []},
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.magazines.update_one(
            {"id": magazine_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Magazine not found")
        
        return {"success": True, "message": "Magazine updated"}
    
    @router.delete("/{magazine_id}")
    async def delete_magazine(magazine_id: str):
        """Delete a magazine"""
        result = await db.magazines.delete_one({"id": magazine_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Magazine not found")
        return {"success": True, "message": "Magazine deleted"}
    
    @router.post("/{magazine_id}/duplicate")
    async def duplicate_magazine(magazine_id: str):
        """Duplicate a magazine"""
        magazine = await db.magazines.find_one({"id": magazine_id}, {"_id": 0})
        if not magazine:
            raise HTTPException(status_code=404, detail="Magazine not found")
        
        new_id = str(uuid.uuid4())
        magazine["id"] = new_id
        magazine["title"] = f"{magazine['title']} (Copy)"
        magazine["created_at"] = datetime.now(timezone.utc).isoformat()
        magazine["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Generate new IDs for pages and elements
        for page in magazine["pages"]:
            page["id"] = str(uuid.uuid4())
            for element in page.get("elements", []):
                element["id"] = str(uuid.uuid4())
        
        await db.magazines.insert_one(magazine)
        return {"id": new_id, "message": "Magazine duplicated"}
    
    return router
