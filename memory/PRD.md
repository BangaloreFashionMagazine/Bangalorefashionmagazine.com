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
- Preview: https://fashion-mag-v2.preview.emergentagent.com

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

## Known Issues
- **CRITICAL**: Live site deployment (520 error) - Infrastructure issue requiring Emergent Support
- Admin login on live site may require password reset on production database

## Admin Credentials (Preview Environment)
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM

## Pending Tasks
1. Contact Emergent Support about 520 deployment error
2. User verification of all features once live site is restored
3. Admin panel refactoring (break down 2000+ line Admin.jsx)

## Files Modified (UI Redesign)
- `/app/frontend/src/index.css` - Google Fonts import (Playfair Display, Lato)
- `/app/frontend/src/lib/constants.js` - New category names, mapping functions
- `/app/frontend/src/components/TalentCard.jsx` - Redesigned card styling
- `/app/frontend/src/App.js` - Category mapping, TalentCard, TalentDetailModal updates
