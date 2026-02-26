from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from typing import List
import uuid

from models import (
    ProductCreate, ProductUpdate, ProductResponse,
    OrderCreate, OrderResponse,
    ProductReviewCreate, ProductReviewResponse,
    DesignerStoreSettingsCreate
)

import logging
logger = logging.getLogger(__name__)


def create_store_routes(db):
    router = APIRouter()
    
    # ============== Products ==============
    @router.post("/store/products", response_model=ProductResponse)
    async def create_product(product: ProductCreate):
        # Validate designer exists
        designer = await db.talents.find_one({"id": product.designer_id})
        if not designer:
            raise HTTPException(status_code=404, detail="Designer not found")
        
        # Check product limit (max 10 per designer)
        product_count = await db.products.count_documents({"designer_id": product.designer_id})
        if product_count >= 10:
            raise HTTPException(status_code=400, detail="Designer already has 10 products (maximum limit)")
        
        # Limit images to 5
        images = (product.images or [])[:5]
        
        product_id = str(uuid.uuid4())
        product_doc = {
            "id": product_id,
            "name": product.name,
            "description": product.description,
            "size": product.size,
            "material": product.material,
            "price": product.price,
            "shipping_info": product.shipping_info,
            "images": images,
            "designer_id": product.designer_id,
            "designer_name": designer.get("name", ""),
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.products.insert_one(product_doc)
        logger.info(f"Product created: {product.name} by designer {designer.get('name')}")
        
        return ProductResponse(**{k: v for k, v in product_doc.items() if k != "_id"})
    
    @router.get("/store/products", response_model=List[ProductResponse])
    async def get_products(designer_id: str = None, active_only: bool = True):
        query = {}
        if designer_id:
            query["designer_id"] = designer_id
        if active_only:
            query["is_active"] = True
        
        products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        return [ProductResponse(**p) for p in products]
    
    @router.get("/store/products/{product_id}", response_model=ProductResponse)
    async def get_product(product_id: str):
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductResponse(**product)
    
    @router.put("/store/products/{product_id}", response_model=ProductResponse)
    async def update_product(product_id: str, update: ProductUpdate):
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        
        # Limit images to 5
        if "images" in update_data:
            update_data["images"] = update_data["images"][:5]
        
        if update_data:
            await db.products.update_one({"id": product_id}, {"$set": update_data})
        
        updated = await db.products.find_one({"id": product_id}, {"_id": 0})
        return ProductResponse(**updated)
    
    @router.delete("/store/products/{product_id}")
    async def delete_product(product_id: str):
        result = await db.products.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted"}
    
    # ============== Orders ==============
    @router.post("/store/orders", response_model=OrderResponse)
    async def create_order(order: OrderCreate):
        # Get product details
        product = await db.products.find_one({"id": order.product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        order_id = str(uuid.uuid4())
        order_doc = {
            "id": order_id,
            "product_id": order.product_id,
            "product_name": product.get("name", ""),
            "product_price": product.get("price", 0),
            "designer_id": product.get("designer_id", ""),
            "designer_name": product.get("designer_name", ""),
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone,
            "customer_address": order.customer_address,
            "notes": order.notes or "",
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.orders.insert_one(order_doc)
        logger.info(f"Order created: {order_id} for product {product.get('name')}")
        
        return OrderResponse(**{k: v for k, v in order_doc.items() if k != "_id"})
    
    @router.get("/store/orders", response_model=List[OrderResponse])
    async def get_orders(designer_id: str = None, status: str = None):
        query = {}
        if designer_id:
            query["designer_id"] = designer_id
        if status:
            query["status"] = status
        
        orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return [OrderResponse(**o) for o in orders]
    
    @router.put("/store/orders/{order_id}/status")
    async def update_order_status(order_id: str, status: str):
        valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": f"Order status updated to {status}"}
    
    # ============== Reviews ==============
    @router.post("/store/reviews", response_model=ProductReviewResponse)
    async def create_review(review: ProductReviewCreate):
        # Validate product exists
        product = await db.products.find_one({"id": review.product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Validate rating
        if review.rating < 1 or review.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        review_id = str(uuid.uuid4())
        review_doc = {
            "id": review_id,
            "product_id": review.product_id,
            "reviewer_name": review.reviewer_name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.product_reviews.insert_one(review_doc)
        logger.info(f"Review created for product {review.product_id}")
        
        return ProductReviewResponse(**{k: v for k, v in review_doc.items() if k != "_id"})
    
    @router.get("/store/reviews/{product_id}", response_model=List[ProductReviewResponse])
    async def get_product_reviews(product_id: str):
        reviews = await db.product_reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
        return [ProductReviewResponse(**r) for r in reviews]
    
    # ============== Store Settings ==============
    @router.get("/store/settings")
    async def get_store_settings():
        settings = await db.store_settings.find_one({}, {"_id": 0})
        return settings or {"hero_images": [], "contact_email": "", "contact_phone": "", "contact_instagram": ""}
    
    @router.put("/store/settings")
    async def update_store_settings(settings: DesignerStoreSettingsCreate):
        # Limit hero images to 5
        settings_dict = settings.dict()
        settings_dict["hero_images"] = (settings_dict.get("hero_images") or [])[:5]
        await db.store_settings.update_one({}, {"$set": settings_dict}, upsert=True)
        return {"message": "Store settings updated"}
    
    # ============== Designers for Store ==============
    @router.get("/store/designers")
    async def get_store_designers():
        # Get only talents with "Designer Store" category who have products
        designers_with_products = await db.products.distinct("designer_id")
        
        designers = []
        for designer_id in designers_with_products:
            # Only include talents with "Designer Store" category
            designer = await db.talents.find_one({
                "id": designer_id, 
                "category": "Designer Store"
            }, {"_id": 0})
            if designer:
                product_count = await db.products.count_documents({"designer_id": designer_id, "is_active": True})
                designers.append({
                    "id": designer.get("id"),
                    "name": designer.get("name"),
                    "profile_image": designer.get("profile_image"),
                    "category": designer.get("category"),
                    "product_count": product_count
                })
        
        return designers
    
    return router
