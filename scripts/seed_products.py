import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

products = [
    # Zapatillas
    {
        "product_id": "prod_001",
        "name": "Air Max Elite",
        "description": "Premium running shoes with advanced cushioning technology. Designed for maximum comfort and style.",
        "price": 149.99,
        "category": "zapatillas",
        "brand": "Nike",
        "image_url": "https://images.unsplash.com/photo-1770795945641-b05670167c8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 50,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_002",
        "name": "Ultraboost 2026",
        "description": "Energy-returning sneakers perfect for urban lifestyle. Lightweight and responsive.",
        "price": 179.99,
        "category": "zapatillas",
        "brand": "Adidas",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 45,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Auriculares
    {
        "product_id": "prod_003",
        "name": "Studio Pro Wireless",
        "description": "Premium wireless headphones with active noise cancellation and 40-hour battery life.",
        "price": 299.99,
        "category": "auriculares",
        "brand": "Sony",
        "image_url": "https://images.unsplash.com/photo-1744591433649-28069739f80b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 30,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_004",
        "name": "TrueSound Buds",
        "description": "True wireless earbuds with crystal-clear audio and seamless connectivity.",
        "price": 159.99,
        "category": "auriculares",
        "brand": "Samsung",
        "image_url": "https://images.unsplash.com/photo-1664470740442-f5de3e512e8b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 60,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Perfumes
    {
        "product_id": "prod_005",
        "name": "Midnight Essence",
        "description": "Luxurious fragrance with notes of sandalwood and bergamot. Perfect for evening wear.",
        "price": 89.99,
        "category": "perfumes",
        "brand": "Dior",
        "image_url": "https://images.unsplash.com/photo-1561997837-ad5a1641dbd7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 40,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_006",
        "name": "Urban Spirit",
        "description": "Fresh and energetic scent for the modern youth. Notes of citrus and mint.",
        "price": 79.99,
        "category": "perfumes",
        "brand": "Calvin Klein",
        "image_url": "https://images.unsplash.com/photo-1630512873749-85ccf5bb1678?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 55,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Mochilas
    {
        "product_id": "prod_007",
        "name": "Tech Pack Pro",
        "description": "Modern backpack with laptop compartment and water-resistant material. Perfect for daily commute.",
        "price": 79.99,
        "category": "mochilas",
        "brand": "Herschel",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 35,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_008",
        "name": "Urban Explorer",
        "description": "Versatile backpack with multiple compartments and ergonomic design.",
        "price": 69.99,
        "category": "mochilas",
        "brand": "Nike",
        "image_url": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 42,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Altavoces
    {
        "product_id": "prod_009",
        "name": "BoomBox Ultra",
        "description": "Portable Bluetooth speaker with 360-degree sound and 24-hour battery life.",
        "price": 129.99,
        "category": "altavoces",
        "brand": "JBL",
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 28,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_010",
        "name": "Smart Sound",
        "description": "Wireless speaker with voice assistant integration and premium audio quality.",
        "price": 199.99,
        "category": "altavoces",
        "brand": "Bose",
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 22,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Relojes
    {
        "product_id": "prod_011",
        "name": "Chronos Elite",
        "description": "Smartwatch with fitness tracking, heart rate monitor, and GPS. 7-day battery life.",
        "price": 249.99,
        "category": "relojes",
        "brand": "Apple",
        "image_url": "https://images.unsplash.com/photo-1623672482674-a525831dc7a8?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 38,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_012",
        "name": "Sport Watch Pro",
        "description": "Durable sports watch with multiple activity modes and water resistance.",
        "price": 189.99,
        "category": "relojes",
        "brand": "Garmin",
        "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 31,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Ropa
    {
        "product_id": "prod_013",
        "name": "Classic Hoodie",
        "description": "Premium cotton hoodie with modern fit. Perfect for casual wear.",
        "price": 69.99,
        "category": "ropa",
        "brand": "Nike",
        "image_url": "https://images.unsplash.com/photo-1644483878398-b57d19f84ff8?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 65,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_014",
        "name": "Track Jacket",
        "description": "Retro-inspired track jacket with signature stripes. Comfortable and stylish.",
        "price": 89.99,
        "category": "ropa",
        "brand": "Adidas",
        "image_url": "https://images.unsplash.com/photo-1590759483822-b2fee5aa6bd3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 48,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # Gorras
    {
        "product_id": "prod_015",
        "name": "Street Cap",
        "description": "Classic snapback cap with embroidered logo. Adjustable fit.",
        "price": 29.99,
        "category": "gorras",
        "brand": "Nike",
        "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 75,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "prod_016",
        "name": "Urban Beanie",
        "description": "Soft knit beanie perfect for winter. Classic design with modern appeal.",
        "price": 24.99,
        "category": "gorras",
        "brand": "Adidas",
        "image_url": "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
        "stock": 80,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_products():
    print("Seeding products...")
    
    # Clear existing products
    await db.products.delete_many({})
    
    # Insert products
    result = await db.products.insert_many(products)
    print(f"Inserted {len(result.inserted_ids)} products")
    
    # Verify
    count = await db.products.count_documents({})
    print(f"Total products in database: {count}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_products())
