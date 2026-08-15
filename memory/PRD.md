# Bangalore Fashion Magazine - Product Requirements Document

## Overview
A full-stack web application for a fashion magazine featuring talent profiles, contest winners, party updates, comprehensive admin management, and a professional magazine publishing system.

## Tech Stack
- **Frontend:** React with Tailwind CSS
- **Backend:** Python FastAPI
- **Database:** MongoDB (Atlas in production)
- **Deployment:** Emergent Platform (Kubernetes)

## Live URL
- Production: https://bangalorefashionmagazine.com
- Preview: https://store-feature-test.preview.emergentagent.com

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
   - **4 Store Categories:**
     - Everyday Chic (Casuals)
     - After Dark (Party)
     - Heritage Luxe (Ethnic)
     - Accessories Room (Accessories)
   - Browse fashion products filtered by category
   - Filter by designer
   - Discount Feature with badges
   - Product detail modal with multiple images and video
   - Buy Now flow (offline payment)
   - Customer reviews with star ratings

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

3. **Analytics Tab**
   - Site traffic tracking
   - Popular profiles
   - Event views

4. **CSV Export**
   - Analytics reports
   - Talent lists with Instagram IDs

5. **Designer Store Management**
   - Store hero images (up to 5)
   - Contact info (email, phone, Instagram)
   - Add/edit/delete products
   - View all orders with customer details
   - Update order status

6. **Instagram Promo Tool**
   - BFM Logo on all generated images
   - Fetch all approved talents
   - Custom image upload support
   - Feed and Story format generation

7. **BFM Magazine Builder** (COMPLETED - Aug 2026 - Full Canva-like Editor)
   - **3-Step Creation Wizard:**
     - Step 1: Talent Details (name, category, headline, intro, bio, career journey, achievements, specialization, location, Instagram, website, interview Q&A)
     - Step 2: Image Upload (cover, profile, portfolio up to 10)
     - Step 3: Template Selection (3 templates: Black & Gold, Editorial, Dark Luxury)
   
   - **Visual Editor Features:**
     - Drag-and-drop elements on canvas
     - Resize handles (8-point: corners + edges)
     - Element selection with golden ring highlight
     - Undo/Redo with 50-state history
     - Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+C, Ctrl+V, Ctrl+D, Delete, Escape)
   
   - **Element Tools:**
     - Add Text (with 10 font families: Playfair Display, Lato, Montserrat, Cormorant, Oswald, Roboto, Open Sans, Poppins, Dancing Script, Great Vibes)
     - Add Image
     - Add Rectangle
     - Add Circle
     - Add Line/Divider
     - Copy/Paste/Duplicate elements
     - Bring to Front / Send to Back
     - Lock/Unlock elements
     - Show/Hide elements
     - Delete elements
   
   - **Properties Panel (Text):**
     - Font family dropdown
     - Font size
     - Color picker
     - Bold, Italic, Underline toggles
     - Text alignment (Left, Center, Right)
     - Line height
     - Letter spacing
     - Opacity slider
     - Position controls (X, Y, Width, Height)
   
   - **Properties Panel (Shape):**
     - Background color picker
     - Border radius
     - Opacity slider
     - Position controls
   
   - **Properties Panel (Image):**
     - Replace image upload
     - Object fit (Cover, Contain, Fill)
     - Border radius
     - Opacity slider
     - Position controls
   
   - **Page Management:**
     - 10 Page Templates:
       1. Blank Page
       2. Cover Page
       3. Profile Page
       4. Photo Grid (6 images)
       5. Two Column
       6. Interview
       7. Full Bleed Image
       8. Quote Page
       9. Full Page Ad
       10. Half Page Ad
     - Add/Delete/Duplicate pages
     - Reorder pages (Move Up/Down)
     - Page background color and image
   
   - **View Controls:**
     - Grid toggle with snap-to-grid (5% grid)
     - Layers panel with visibility/lock controls
     - Preview mode
     - Zoom controls (50% to 200%)
   
   - **Export Options:**
     - Save to database
     - Export to PDF (high quality A4)
     - Instagram Export (Portrait 1080x1350, Square 1080x1080, Story 1080x1920)
   
   - **Backend API:**
     - `POST /api/magazine-builder/generate` - Generate magazine pages
     - `GET /api/magazine-builder/list` - List all magazines
     - `GET /api/magazine-builder/{id}` - Get specific magazine
     - `PUT /api/magazine-builder/{id}` - Update magazine
     - `DELETE /api/magazine-builder/{id}` - Delete magazine
     - `POST /api/magazine-builder/{id}/duplicate` - Duplicate magazine

## UI/UX Design (Dec 2025 Update)

### Color Theme
- Background: Midnight blue (#050A14)
- Primary accent: Soft gold (#D4AF37)
- Secondary accent: Ivory (#F5F5F0)
- Card background: Dark blue (#0A1628)

### Typography
- Headings: Playfair Display (serif)
- Body text: Lato (sans-serif)

## Key API Endpoints
- `POST /api/talent/login` - Talent authentication
- `POST /api/auth/login` - Admin authentication
- `GET /api/talents` - List talents
- `GET /api/admin/party-events` - List party events
- `DELETE /api/admin/party-events/{id}` - Delete party event
- `GET /api/awards` - Get contest winners
- `POST /api/admin/awards` - Create contest winner
- `POST /api/track` - Log user interaction event
- `GET /api/analytics/stats` - Get aggregated analytics
- `GET /api/analytics/export` - Export analytics CSV
- `GET /api/admin/talents/export` - Export talents CSV

### Designer Store API Endpoints
- `GET /api/store/settings` - Get store settings
- `PUT /api/store/settings` - Update store settings
- `GET /api/store/products` - List products
- `POST /api/store/products` - Create product
- `PUT /api/store/products/{id}` - Update product
- `DELETE /api/store/products/{id}` - Delete product
- `GET /api/store/orders` - List orders
- `POST /api/store/orders` - Create order
- `PUT /api/store/orders/{id}/status` - Update order status

## Category Mapping (Backend Compatibility)
The database stores old category names. Frontend maps them:
- "Model - Female" → "Women | Models"
- "Model - Male" → "Men | Models"
- "Makeup & Hair" → "Beauty"
- "Photography" → "Visual Stories"
- "Event Management" → "Experiences"
- "Other" → "Creative Collective"

## Recent Updates

### August 2026 - BFM Magazine Builder Complete
- **Full Canva-like Visual Editor:**
  - Drag-and-drop element positioning
  - 8-point resize handles for all elements
  - 10 font families for text styling
  - Complete properties panel (font, size, color, alignment, opacity, position)
  - 10 pre-designed page templates
  - Grid toggle with snap-to-grid
  - Layers panel with visibility/lock
  - Preview mode
  - Zoom controls (50-200%)
  - Copy/Paste/Duplicate elements
  - Bring to Front/Send to Back layer ordering
  - Keyboard shortcuts support
  - PDF export (A4 high quality)
  - Instagram export (3 formats)
  - Save/Load magazines from database
  - Added data-testid attributes for testing

### July 2026 - Instagram Promo & Image Fixes
- Added BFM Logo to Instagram designs
- Talent dropdown shows all approved talents
- Custom image upload for Instagram promo
- Fixed sponsored image clicks (modal instead of refresh)
- Party/Ad images upload without cropping

### February 2026 - Code Refactoring
- Extracted AdminDashboard (~1650 lines)
- Extracted TalentDashboard (~470 lines)
- Added image optimization integration
- Fixed video duration validation

### December 2025 - Designer Store & UI Redesign
- Complete e-commerce functionality
- Full UI/UX redesign
- New typography and color theme
- Discount feature for products

## Known Issues
- **CRITICAL**: Live site deployment (520 error) - Infrastructure issue requiring Emergent Support
- Admin login on live site may require password reset on production database

## Admin Credentials (Preview Environment)
- Email: admin@bangalorefashionmag.com
- Password: Rilrocky@9295BFM

## Files Structure

### New Files (Magazine Builder)
- `/app/frontend/src/pages/Admin/MagazineBuilder.jsx` - Complete visual editor (~1870 lines)
- `/app/backend/routes/magazine_builder.py` - Backend CRUD and generation routes

### Modified Files
- `/app/frontend/src/pages/Admin/AdminDashboard.jsx` - Added Magazine Builder tab
- `/app/backend/server.py` - Added magazine_builder router

## Pending Tasks
1. Contact Emergent Support about 520 deployment error (live site)
2. Consider refactoring MagazineBuilder.jsx into smaller components (Toolbar, LayersPanel, PropertiesPanel, Canvas)
3. User verification of Magazine Builder features on live site

## Future Tasks
1. Add real online payment gateways (Stripe/Razorpay) for Store
2. Implement Media Library for Magazine Builder
3. Implement "Master Pages" and automatic page numbering
