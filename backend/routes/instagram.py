"""
Instagram Promotion Routes - Generate professional Instagram posts for approved talents
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
import json
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

class ImageAnalysis(BaseModel):
    image_index: int
    quality_score: int  # 1-100
    lighting: str
    sharpness: str
    facial_visibility: str
    pose: str
    recommendation: str
    is_recommended: bool

class AnalyzeImagesRequest(BaseModel):
    talent_id: str
    images: List[str]  # base64 images

class AnalyzeImagesResponse(BaseModel):
    analyses: List[ImageAnalysis]
    best_image_index: int
    second_best_index: int

class GenerateDesignRequest(BaseModel):
    talent_id: str
    image1_index: int
    image2_index: int

class InstagramDesign(BaseModel):
    id: str
    talent_id: str
    talent_name: str
    design_type: str  # "feed1", "feed2", "story1", "story2"
    image_index: int
    created_at: str
    caption: str
    hashtags: str

class SavedDesignsResponse(BaseModel):
    designs: List[InstagramDesign]
    caption: str
    hashtags: str

def create_instagram_routes(db):
    router = APIRouter()
    
    @router.post("/instagram/analyze-images")
    async def analyze_images(request: AnalyzeImagesRequest):
        """Analyze portfolio images using AI to find the best ones for Instagram"""
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="AI integration not configured")
        
        if len(request.images) == 0:
            raise HTTPException(status_code=400, detail="No images to analyze")
        
        analyses = []
        
        for i, image_base64 in enumerate(request.images[:7]):  # Max 7 images
            try:
                # Clean base64 string
                if "base64," in image_base64:
                    image_base64 = image_base64.split("base64,")[1]
                
                chat = LlmChat(
                    api_key=EMERGENT_LLM_KEY,
                    session_id=f"analyze-{request.talent_id}-{i}",
                    system_message="""You are an expert fashion photography analyst. Analyze the given image and provide a JSON response with these fields:
- quality_score: integer 1-100 (overall quality for Instagram)
- lighting: "excellent", "good", "fair", or "poor"
- sharpness: "excellent", "good", "fair", or "poor"
- facial_visibility: "clear", "partial", or "obscured"
- pose: "professional", "good", "casual", or "awkward"
- recommendation: brief 10-word max recommendation

Respond ONLY with valid JSON, no other text."""
                ).with_model("openai", "gpt-4o-mini")
                
                image_content = ImageContent(image_base64=image_base64)
                
                response = await chat.send_message(UserMessage(
                    text="Analyze this fashion/model photo for Instagram suitability. Return JSON only.",
                    file_contents=[image_content]
                ))
                
                # Parse JSON response
                try:
                    # Extract JSON from response
                    response_text = response.text.strip()
                    if response_text.startswith("```"):
                        response_text = response_text.split("```")[1]
                        if response_text.startswith("json"):
                            response_text = response_text[4:]
                    
                    data = json.loads(response_text)
                    analyses.append(ImageAnalysis(
                        image_index=i,
                        quality_score=min(100, max(1, int(data.get("quality_score", 50)))),
                        lighting=data.get("lighting", "good"),
                        sharpness=data.get("sharpness", "good"),
                        facial_visibility=data.get("facial_visibility", "clear"),
                        pose=data.get("pose", "good"),
                        recommendation=data.get("recommendation", "Good photo")[:100],
                        is_recommended=False
                    ))
                except Exception:
                    # Default analysis if AI fails
                    analyses.append(ImageAnalysis(
                        image_index=i,
                        quality_score=70,
                        lighting="good",
                        sharpness="good",
                        facial_visibility="clear",
                        pose="good",
                        recommendation="Unable to analyze, manual review recommended",
                        is_recommended=False
                    ))
            except Exception as e:
                print(f"Error analyzing image {i}: {e}")
                analyses.append(ImageAnalysis(
                    image_index=i,
                    quality_score=50,
                    lighting="unknown",
                    sharpness="unknown",
                    facial_visibility="unknown",
                    pose="unknown",
                    recommendation="Analysis failed",
                    is_recommended=False
                ))
        
        # Sort by quality score and mark top 2
        sorted_analyses = sorted(analyses, key=lambda x: x.quality_score, reverse=True)
        best_index = sorted_analyses[0].image_index if sorted_analyses else 0
        second_best = sorted_analyses[1].image_index if len(sorted_analyses) > 1 else best_index
        
        # Mark recommended images
        for a in analyses:
            if a.image_index == best_index:
                a.is_recommended = True
        
        return AnalyzeImagesResponse(
            analyses=analyses,
            best_image_index=best_index,
            second_best_index=second_best
        )
    
    @router.post("/instagram/generate-designs")
    async def generate_designs(request: GenerateDesignRequest):
        """Generate Instagram designs for a talent"""
        # Get talent data
        talent = await db.talents.find_one({"id": request.talent_id}, {"_id": 0})
        if not talent:
            raise HTTPException(status_code=404, detail="Talent not found")
        
        if not talent.get("is_approved"):
            raise HTTPException(status_code=400, detail="Talent must be approved for Instagram promotion")
        
        # Generate caption and hashtags
        category = talent.get("category", "Model")
        name = talent.get("name", "Talent")
        instagram = talent.get("instagram_id", "")
        bio = talent.get("bio", "")[:100] if talent.get("bio") else ""
        
        caption = f"""✨ Introducing {name} ✨

{bio if bio else 'A rising star in the fashion industry.'}

📍 Bangalore, India
📸 Featured in @banglorefashionmag

Follow @{instagram} for more stunning looks!

#BangaloreFashionMagazine #BFMTalent #VerifiedTalent"""

        hashtags = f"#BangaloreFashionMagazine #BFM #FashionModel #BangaloreModel #IndianModel #{category.replace(' ', '').replace('|', '')} #ModelLife #FashionPhotography #PortfolioShoot #TalentManagement #BangaloreFashion #IndianFashion #ModelAgency #FashionIndustry #RisingStars"
        
        # Create design records
        design_id = str(uuid.uuid4())[:8]
        now = datetime.now(timezone.utc).isoformat()
        
        # Create design data (don't mutate these after insert)
        design_data = [
            {
                "id": f"{design_id}-feed1",
                "talent_id": request.talent_id,
                "talent_name": name,
                "design_type": "feed1",
                "image_index": request.image1_index,
                "created_at": now,
                "caption": caption,
                "hashtags": hashtags
            },
            {
                "id": f"{design_id}-feed2",
                "talent_id": request.talent_id,
                "talent_name": name,
                "design_type": "feed2",
                "image_index": request.image2_index,
                "created_at": now,
                "caption": caption,
                "hashtags": hashtags
            },
            {
                "id": f"{design_id}-story1",
                "talent_id": request.talent_id,
                "talent_name": name,
                "design_type": "story1",
                "image_index": request.image1_index,
                "created_at": now,
                "caption": caption,
                "hashtags": hashtags
            },
            {
                "id": f"{design_id}-story2",
                "talent_id": request.talent_id,
                "talent_name": name,
                "design_type": "story2",
                "image_index": request.image2_index,
                "created_at": now,
                "caption": caption,
                "hashtags": hashtags
            }
        ]
        
        # Delete old designs for this talent and save new ones
        await db.instagram_designs.delete_many({"talent_id": request.talent_id})
        await db.instagram_designs.insert_many(design_data)
        
        # Return clean data (without MongoDB _id)
        return_designs = [
            {"id": d["id"], "talent_id": d["talent_id"], "talent_name": d["talent_name"], 
             "design_type": d["design_type"], "image_index": d["image_index"], 
             "created_at": d["created_at"], "caption": d["caption"], "hashtags": d["hashtags"]}
            for d in design_data
        ]
        
        return {
            "success": True,
            "designs": return_designs,
            "caption": caption,
            "hashtags": hashtags
        }
    
    @router.get("/instagram/designs/{talent_id}")
    async def get_designs(talent_id: str):
        """Get saved Instagram designs for a talent"""
        designs = await db.instagram_designs.find({"talent_id": talent_id}, {"_id": 0}).to_list(10)
        
        if not designs:
            return {"designs": [], "caption": "", "hashtags": ""}
        
        return {
            "designs": designs,
            "caption": designs[0].get("caption", "") if designs else "",
            "hashtags": designs[0].get("hashtags", "") if designs else ""
        }
    
    @router.delete("/instagram/designs/{talent_id}")
    async def delete_designs(talent_id: str):
        """Delete all Instagram designs for a talent"""
        await db.instagram_designs.delete_many({"talent_id": talent_id})
        return {"success": True}
    
    return router
