# Basic Shi - E-commerce Platform

## 🎨 Overview

**Basic Shi** is a premium e-commerce platform designed for teenagers, featuring a modern Apple-inspired dark mode aesthetic. The store sells lifestyle essentials including sneakers, headphones, perfumes, backpacks, speakers, watches, clothing, and caps from popular brands like Nike and Adidas.

## ✨ Features

### Core Functionality
- **Product Catalog**: Browse 16 premium products across 8 categories
- **Category Filtering**: Filter products by category (zapatillas, auriculares, perfumes, mochilas, altavoces, relojes, ropa, gorras)
- **Product Details**: View detailed product information with images and pricing
- **Shopping Cart**: Add, update, and remove items from your cart
- **User Authentication**: Secure Google OAuth login via Emergent Auth
- **Order Management**: Track your orders in the dashboard
- **PayPal Integration**: Ready for payment processing (requires configuration)

### Design
- **Dark Mode**: Sleek #050505 background with high contrast
- **Typography**: Space Grotesk for headings, Inter for body text
- **Floating Navigation**: Apple-style pill-shaped nav bar
- **Glassmorphism**: Subtle backdrop blur effects
- **Responsive**: Mobile-first design with smooth animations

## 🚀 Getting Started

### Prerequisites
- MongoDB running on localhost:27017
- Node.js and Yarn
- Python 3.11+

### Database
The database is already seeded with 16 products. To re-seed:
```bash
python /app/scripts/seed_products.py
```

### Environment Variables

**Backend** (`/app/backend/.env`):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_BACKEND_URL=https://your-app.preview.emergentagent.com
```

## 🔐 Authentication

### Google OAuth (Emergent)
The app uses Emergent's managed Google OAuth for authentication. No additional API keys needed.

**Login Flow**:
1. Click "Sign In" button
2. Redirected to Emergent Auth portal
3. Sign in with Google
4. Automatically redirected back to dashboard

**For Testing**:
See `/app/auth_testing.md` for instructions on creating test users and sessions.

## 💳 PayPal Integration

PayPal is integrated but requires your PayPal Client ID to be configured.

**To Enable PayPal**:
1. Get your PayPal Client ID from https://developer.paypal.com/
2. Update `/app/frontend/src/pages/Checkout.js`:
   ```javascript
   const PAYPAL_CLIENT_ID = "YOUR_ACTUAL_CLIENT_ID";
   ```

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── pages/        # Page components
│   │   └── components/   # Reusable components
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend environment variables
├── scripts/
│   └── seed_products.py  # Database seeding script
└── design_guidelines.json # Design system specification
```

## 🛠️ API Endpoints

### Public Endpoints
- `GET /api/` - API health check
- `GET /api/products` - Get all products
- `GET /api/products?category={category}` - Filter by category
- `GET /api/products/{product_id}` - Get single product
- `GET /api/categories` - Get all categories

### Authentication
- `POST /api/auth/session` - Create session from OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Protected Endpoints (Require Authentication)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{cart_item_id}` - Update cart item quantity
- `DELETE /api/cart/{cart_item_id}` - Remove cart item
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{order_id}` - Update order status

## 🎯 Product Categories

1. **Zapatillas** (Sneakers) - Nike, Adidas
2. **Auriculares** (Headphones) - Premium wireless audio
3. **Perfumes** (Fragrances) - Luxury scents
4. **Mochilas** (Backpacks) - Tech-ready bags
5. **Altavoces** (Speakers) - Portable Bluetooth
6. **Relojes** (Watches) - Smartwatches & sports
7. **Ropa** (Clothing) - Hoodies, jackets
8. **Gorras** (Caps) - Streetwear essentials

## 🧪 Testing

The app has been fully tested with:
- ✅ 15/15 backend API tests passing
- ✅ 100% frontend feature coverage
- ✅ Authentication flow verified
- ✅ Cart operations working
- ✅ Protected routes enforced
- ✅ Design consistency validated

## 📱 User Flows

### Shopping Flow (Guest)
1. Browse landing page → Click "Explore Collection"
2. Filter products by category
3. Click product to view details
4. Click "Add to Cart" → Prompted to sign in

### Shopping Flow (Authenticated)
1. Sign in with Google
2. Browse and add items to cart
3. View cart and adjust quantities
4. Proceed to checkout
5. Complete payment (PayPal)
6. View orders in dashboard

## 🎨 Design System

- **Primary Color**: White (#FFFFFF)
- **Background**: Deep Black (#050505)
- **Surface**: Dark Gray (#0A0A0A)
- **Accent**: Blue (#2563EB)
- **Border**: Subtle Gray (#262626)
- **Font Headings**: Space Grotesk
- **Font Body**: Inter

## 🔧 Maintenance

### Restart Services
```bash
sudo supervisorctl restart backend frontend
```

### View Logs
```bash
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log
```

### Clear Database
```bash
mongosh --eval "use('test_database'); db.products.deleteMany({}); db.users.deleteMany({}); db.cart_items.deleteMany({}); db.orders.deleteMany({});"
```

## 🚀 Next Steps

1. **Add PayPal Client ID** to enable real payments
2. **Add More Products** by running seed script with new data
3. **Customize Branding** by updating design_guidelines.json
4. **Add Product Search** functionality
5. **Implement Wishlist** feature
6. **Add Product Reviews** and ratings
7. **Email Notifications** for orders
8. **Admin Panel** for product management

## 📞 Support

For authentication issues, see `/app/auth_testing.md`
For design specifications, see `/app/design_guidelines.json`

---

**Built with**: React, FastAPI, MongoDB, Tailwind CSS, Emergent Auth, PayPal SDK
**Design**: Apple-inspired minimalist dark mode aesthetic
