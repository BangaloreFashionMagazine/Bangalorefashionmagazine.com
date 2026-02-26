# Bangalore Fashion Magazine - Product Requirements Document

## Overview
A full-stack web application for a fashion magazine featuring talent profiles, contest winners, party updates, and comprehensive admin management.

## Tech Stack
- **Frontend:** React with Tailwind CSS
- **Backend:** Python FastAPI
- **Database:** MongoDB (Atlas in production)
- **Deployment:** Emergent Platform (Kubernetes)

## Live URL
- Production: https://bangalorefashionmagazine.com
- Preview: https://store-preview-12.preview.emergentagent.com

## Core Features

### Public Features
1. **Homepage**
   - Hero image slider with Playfair Display serif headings
   - Model of the Week showcase
   - Party Updates section
   - Contest Winners display
   - Featured video section

2. **Talent Profiles**
   - Browse by category (NEW NAMES - Dec 2025):
     - Women | Models (formerly Model - Female)
     - Men | Models (formerly Model - Male)
     - Designers
     - Designer Store (NEW - Dec 2025)
     - Beauty (formerly Makeup & Hair)
     - Visual Stories (formerly Photography)
     - Experiences (formerly Event Management)
     - Creative Collective (formerly Other)
   - Voting system
   - Portfolio gallery with images and video

3. **Talent Registration**
   - Self-registration with terms agreement
   - Profile image upload with cropping
   - Portfolio images (up to 7)
   - Portfolio video (max 45 seconds)
   - Required category selection with new category names

4. **Designer Store** (NEW - Dec 2025)
   - Browse fashion products from designers
   - Filter by designer
   - **Discount Feature:**
     - Discount badge on top-right corner of product images (e.g., "20% OFF")
     - Discounted price shown with original price strikethrough
     - Both Admin and Designers can set discounts (0-100%)
   - Product detail modal with:
     - Multiple images (up to 5)
     - Size, material, shipping info
     - Customer reviews with star ratings
   - Buy Now flow (offline payment):
     - Customer name, email, phone, address
     - Order submission with confirmation
   - Write product reviews (anyone can review)

### Admin Features
1. **Talent Management**
   - Approve/reject pending registrations
   - View all talents
   - Edit talent details and portfolio
   - Delete talents
   - Reset passwords
   - Export to CSV

2. **Content Management**
   - Hero Images
   - Party Updates (with delete functionality)
   - Contest & Winners (with talent linking)
   - Advertisements
   - Magazine upload
   - Background music
   - Featured video

3. **Analytics Tab** (New)
   - Site traffic tracking
   - Popular profiles
   - Event views

4. **CSV Export** (New)
   - Analytics reports
   - Talent lists with Instagram IDs

5. **Designer Store Management** (NEW - Dec 2025)
   - Store hero images (up to 5)
   - Contact info (email, phone, Instagram)
   - Add/edit/delete products
   - View all orders with customer details
   - Update order status (pending → confirmed → shipped → delivered → cancelled)

### Talent Dashboard Features (Designer Store category only)
- My Products section (up to 10 products per designer)
- Add/delete products with multiple images (up to 5)

## UI/UX Design (Dec 2025 Update)

### Color Theme
- Background: Midnight blue (#050A14)
- Primary accent: Soft gold (#D4AF37)
- Secondary accent: Ivory (#F5F5F0)
- Card background: Dark blue (#0A1628)

### Typography
- Headings: Playfair Display (serif)
- Body text: Lato (sans-serif)

### Talent Cards
- Reduced overlay darkness (70% opacity gradient)
- Increased name font weight with tracking
- Gold divider line under name
- Smaller, more subtle votes and Vote button

## Key API Endpoints
- `POST /api/talent/login` - Talent authentication
- `POST /api/auth/login` - Admin authentication
- `GET /api/talents` - List talents
- `GET /api/admin/party-events` - List party events
- `DELETE /api/admin/party-events/{id}` - Delete party event
- `GET /api/awards` - Get contest winners
- `POST /api/admin/awards` - Create contest winner (with talent_id for linking)
- `POST /api/track` - Log user interaction event
- `GET /api/analytics/stats` - Get aggregated analytics
- `GET /api/analytics/export` - Export analytics CSV
- `GET /api/admin/talents/export` - Export talents CSV

### Designer Store API Endpoints (NEW - Dec 2025)
- `GET /api/store/settings` - Get store settings
- `PUT /api/store/settings` - Update store settings (hero images, contact info)
- `GET /api/store/products` - List products
- `POST /api/store/products` - Create product (requires designer_id)
- `PUT /api/store/products/{id}` - Update product
- `DELETE /api/store/products/{id}` - Delete product
- `GET /api/store/orders` - List orders
- `POST /api/store/orders` - Create order (customer details)
- `PUT /api/store/orders/{id}/status` - Update order status
- `GET /api/store/designers` - List designers with products
- `POST /api/store/reviews` - Create product review
- `GET /api/store/reviews/{product_id}` - Get product reviews

## Category Mapping (Backend Compatibility)
The database stores old category names. Frontend maps them:
- "Model - Female" → "Women | Models"
- "Model - Male" → "Men | Models"
- "Makeup & Hair" → "Beauty"
- "Photography" → "Visual Stories"
- "Event Management" → "Experiences"
- "Other" → "Creative Collective"

## Recent Updates (Dec 2025)
- Complete UI/UX redesign with new color theme
- New typography (Playfair Display + Lato)
- Redesigned talent cards with gold dividers
- Renamed all talent categories across the app
- Added category mapping for backward compatibility
- **Designer Store Feature** (COMPLETED - Dec 26, 2025):
  - Full e-commerce functionality with offline payment
  - Backend: Products, Orders, Reviews, Settings APIs
  - Frontend: Designer Store page, Product detail modal, Order form, Reviews
  - Admin: Complete store management with hero images, products, orders
  - Talent Dashboard: "My Products" section for Designer Store category designers
  - Tested: 100% backend (15/15 tests), 100% frontend verification
- **Discount Feature** (Dec 26, 2025):
  - Discount badge on top-right corner (red "X% OFF")
  - Price display: Discounted + Original with strikethrough
  - Both Admin & Designers can set discounts (0-100%)
- **Code Refactoring** (Dec 26, 2025):
  - Extracted DesignerStorePage to `/app/frontend/src/pages/DesignerStorePage.jsx`
  - Created shared config at `/app/frontend/src/lib/config.js`
  - App.js reduced from ~4100 to ~3600 lines
- **Image Optimization** (Dec 26, 2025):
  - Created `/app/frontend/src/lib/imageOptimization.js` utility
  - Auto-compress images on upload (max 500KB)
  - Resize to max 1200x1200 pixels
  - Updated ImageUploadWithCrop component with optimization

## Known Issues
- **CRITICAL**: Live site deployment (520 error) - Infrastructure issue requiring Emergent Support
- Admin login on live site may require password reset on production database

## Admin Credentials (Preview Environment)
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM

## Pending Tasks
1. Contact Emergent Support about 520 deployment error (live site)
2. User verification of all features once live site is restored
3. Further code refactoring (optional):
   - Admin.jsx (2000+ lines) → Split into tab components

## New Files Created (Refactoring - Dec 2025)
- `/app/frontend/src/lib/config.js` - Shared constants (categories, API URL, etc.)
- `/app/frontend/src/lib/imageOptimization.js` - Image compression utilities
- `/app/frontend/src/pages/DesignerStorePage.jsx` - Extracted Designer Store page component

## Files Modified (Designer Store Feature - Dec 2025)
- `/app/backend/services/__init__.py` - Added "Designer Store" to TALENT_CATEGORIES
- `/app/backend/routes/store.py` - All store API routes
- `/app/backend/models/__init__.py` - Product, Order, Review, StoreSettings Pydantic models
- `/app/backend/server.py` - Added store router
- `/app/frontend/src/App.js` - Designer Store page, Product components, Admin tab, Talent dashboard section

## Files Modified (UI Redesign)
- `/app/frontend/src/index.css` - Google Fonts import (Playfair Display, Lato)
- `/app/frontend/src/lib/constants.js` - New category names, mapping functions
- `/app/frontend/src/components/TalentCard.jsx` - Redesigned card styling
- `/app/frontend/src/App.js` - Category mapping, TalentCard, TalentDetailModal updates
