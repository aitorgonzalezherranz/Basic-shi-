from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Admin emails - Users with these emails will have admin access
ADMIN_EMAILS = os.environ.get('ADMIN_EMAILS', '').split(',')

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str = Field(default_factory=lambda: f"prod_{uuid.uuid4().hex[:12]}")
    name: str
    description: str
    price: float
    category: str
    brand: Optional[str] = None
    image_url: str
    stock: int = 100
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    brand: Optional[str] = None
    image_url: str
    stock: int = 100

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cart_item_id: str = Field(default_factory=lambda: f"cart_{uuid.uuid4().hex[:12]}")
    user_id: str
    product_id: str
    quantity: int
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    order_id: str = Field(default_factory=lambda: f"order_{uuid.uuid4().hex[:12]}")
    user_id: str
    items: List[dict]
    total: float
    status: str = "pending"
    paypal_order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[dict]
    total: float

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    # Check cookie first, then Authorization header
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

async def get_admin_user(request: Request, session_token: Optional[str] = Cookie(None)) -> User:
    user = await get_current_user(request, session_token)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid session_id")
        
        auth_data = resp.json()
    
    # Create or update user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    # Check if this should be an admin user
    is_admin = auth_data["email"] in ADMIN_EMAILS if ADMIN_EMAILS else False
    # First user becomes admin if no admin emails configured
    if not ADMIN_EMAILS:
        user_count = await db.users.count_documents({})
        is_admin = user_count == 0
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data["picture"],
                "is_admin": is_admin
            }}
        )
    else:
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data["picture"],
            "is_admin": is_admin,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = auth_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {**user, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

# ==================== PRODUCT ROUTES ====================

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product_obj

# ==================== CART ROUTES ====================

@api_router.get("/cart")
async def get_cart(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    cart_items = await db.cart_items.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    # Enrich with product details
    enriched_items = []
    for item in cart_items:
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            enriched_items.append({
                **item,
                "product": product
            })
    
    return enriched_items

@api_router.post("/cart")
async def add_to_cart(cart_item: CartItemCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    
    # Check if already in cart
    existing = await db.cart_items.find_one(
        {"user_id": user.user_id, "product_id": cart_item.product_id},
        {"_id": 0}
    )
    
    if existing:
        # Update quantity
        new_quantity = existing["quantity"] + cart_item.quantity
        await db.cart_items.update_one(
            {"cart_item_id": existing["cart_item_id"]},
            {"$set": {"quantity": new_quantity}}
        )
        return {"message": "Cart updated", "cart_item_id": existing["cart_item_id"]}
    
    # Create new cart item
    cart_obj = CartItem(user_id=user.user_id, **cart_item.model_dump())
    doc = cart_obj.model_dump()
    doc["added_at"] = doc["added_at"].isoformat()
    await db.cart_items.insert_one(doc)
    return {"message": "Added to cart", "cart_item_id": cart_obj.cart_item_id}

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    result = await db.cart_items.delete_one({"cart_item_id": cart_item_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Removed from cart"}

@api_router.put("/cart/{cart_item_id}")
async def update_cart_item(cart_item_id: str, quantity: int, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    result = await db.cart_items.update_one(
        {"cart_item_id": cart_item_id, "user_id": user.user_id},
        {"$set": {"quantity": quantity}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Cart updated"}

# ==================== ORDER ROUTES ====================

@api_router.post("/orders")
async def create_order(order: OrderCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    
    order_obj = Order(user_id=user.user_id, **order.model_dump())
    doc = order_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.orders.insert_one(doc)
    
    # Clear cart
    await db.cart_items.delete_many({"user_id": user.user_id})
    
    return order_obj

@api_router.get("/orders")
async def get_orders(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    orders = await db.orders.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.patch("/orders/{order_id}")
async def update_order(order_id: str, status: str, paypal_order_id: Optional[str] = None, request: Request = None, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    update_data = {"status": status}
    if paypal_order_id:
        update_data["paypal_order_id"] = paypal_order_id
    
    result = await db.orders.update_one(
        {"order_id": order_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order updated"}

# ==================== GENERAL ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Basic Shi API"}

@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            "perfumes",
            "auriculares",
            "zapatillas",
            "mochilas",
            "altavoces",
            "relojes",
            "ropa",
            "gorras"
        ]
    }

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request, session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(request, session_token)
    
    # Get statistics
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    
    # Calculate total revenue
    orders = await db.orders.find({}, {"_id": 0, "total": 1, "status": 1}).to_list(10000)
    total_revenue = sum(order["total"] for order in orders if order.get("status") == "completed")
    pending_revenue = sum(order["total"] for order in orders if order.get("status") == "pending")
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": round(total_revenue, 2),
        "pending_revenue": round(pending_revenue, 2),
        "recent_orders": recent_orders
    }

@api_router.get("/admin/orders")
async def get_all_orders(request: Request, session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(request, session_token)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    
    # Enrich with user info
    enriched_orders = []
    for order in orders:
        user = await db.users.find_one({"user_id": order["user_id"]}, {"_id": 0, "name": 1, "email": 1})
        enriched_orders.append({
            **order,
            "user_info": user if user else {"name": "Unknown", "email": "unknown@example.com"}
        })
    
    return enriched_orders

@api_router.patch("/admin/orders/{order_id}/status")
async def update_order_status_admin(order_id: str, status: str, request: Request = None, session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(request, session_token)
    
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

@api_router.put("/admin/products/{product_id}")
async def update_product_admin(product_id: str, product: ProductCreate, request: Request = None, session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(request, session_token)
    
    update_data = product.model_dump()
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

@api_router.delete("/admin/products/{product_id}")
async def delete_product_admin(product_id: str, request: Request = None, session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(request, session_token)
    
    result = await db.products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@api_router.post("/admin/products")
async def create_product_admin(product: ProductCreate, request: Request = None, session_token: Optional[str] = Cookie(None)):
    admin = await get_admin_user(request, session_token)
    
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product_obj

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()