# Bangalore Fashion Magazine - PRD

## Original Problem Statement
Build a fashion magazine website for Bangalore with talent management, admin panel, and voting system.

## User Personas
- **Admin**: Manages talents, approves registrations, controls content (hero images, awards, ads, magazine, video, music)
- **Talent**: Models, designers, makeup artists, photographers who register and showcase portfolios
- **Visitors**: Browse talents, vote for favorites

## Code Architecture (Refactored December 2025)

### Backend Structure (FastAPI - Modular)
```
/app/backend/
├── server.py           # 88 lines - Main app, routes registration
├── models/__init__.py  # 163 lines - All Pydantic models (includes multi-image support)
├── services/__init__.py # 37 lines - Helper functions, constants
├── routes/
│   ├── auth.py         # 58 lines - User authentication
│   ├── talents.py      # 200 lines - Talent CRUD & auth
│   ├── admin.py        # 129 lines - Admin operations
│   └── content.py      # 260 lines - Hero images, ads, awards (with multi-image), media
└── requirements.txt
```

### Frontend Structure (React - Partial Refactor)
```
/app/frontend/src/
├── App.js              # ~1970 lines - Main app (remaining pages)
├── components/
│   ├── Navbar.jsx      # 102 lines
│   ├── HeroSlider.jsx  # 53 lines
│   ├── ContestWinnersSection.jsx # 36 lines
│   ├── TalentCard.jsx  # 37 lines
│   ├── TalentDetailModal.jsx # 82 lines
│   ├── ImageUploadWithCrop.jsx # 181 lines - Image cropping component
│   ├── ImageCropper.jsx # Image cropping utility
│   ├── ImageGallery.jsx # Swipeable image gallery
│   └── index.js        # Component exports
├── pages/
│   └── HomePage.jsx    # 95 lines
└── lib/
    └── constants.js    # 19 lines - API URL, categories
```

## Core Requirements

### Talent Categories
- Model - Female
- Model - Male
- Designers
- Makeup & Hair
- Photography
- Event Management
- Other (custom)

### Homepage Features
- Hero slider with up to 10 admin-managed images
- Featured Video section (YouTube/Vimeo embeds, admin-managed)
- Contact section with Instagram & email links
- Magazine download section (PDF, admin-managed)
- Contest & Winners section (up to 5 images per winner, with navigation)
- Advertisement sidebar (admin-managed, visible on all screen sizes)
- Background music player with mute/unmute button

### Navigation
- Home
- Talents (dropdown with categories)
- About Us
- Admin Login
- Talent Login
- Join Us

### Registration (Join Us)
- Fields: Name, Email, Password, Phone, Category (optional), Profile Image (optional), Portfolio (up to 7 images)
- Declaration/Terms checkbox (mandatory)
- New registrations require admin approval
- Talents can upload images later after registration

### Admin Panel (Lazy Loading for Performance)
- **Pending Tab:** Enhanced cards showing talent details, terms agreement status, portfolio count, with View Full Details / Approve / Reject buttons
- **All Talents Tab:** View, edit, rank, delete talents; view/set passwords; **Category filter dropdown** to filter by talent type; **Terms column** showing agreement status
- **Hero Images Tab:** Manage up to 10 homepage slider images with cropping and ordering
- **Featured Video Tab:** Add YouTube/Vimeo video URL for homepage
- **Contest & Winners Tab:** Manage contest winners with up to 5 images each
- **Advertisements Tab:** Manage sidebar ads with cropping
- **Magazine Tab:** Upload monthly PDF magazine
- **Background Music Tab:** Upload audio file for site-wide background music
- **Export Tab:** Download talent data as CSV

### Talent Dashboard
- Edit profile
- Update portfolio images

### Forgot Password
- Removed from public view
- Admin resets passwords via admin panel

### Voting System
- Vote for talents (IP-based restriction)

## Tech Stack
- Frontend: React.js + Tailwind CSS + react-image-crop
- Backend: FastAPI (Python)
- Database: MongoDB

## What's Been Implemented ✅

### February 2026 Updates
1. ✅ Multi-Image Upload for Contest Winners: Up to 5 images per winner with navigation arrows/dots
2. ✅ Hero Images Limit: Increased to 10 images with clear UI indicator (0/10)
3. ✅ Image Cropping: ImageUploadWithCrop component for Hero Images, Ads, Contest Winners
4. ✅ Admin Panel - Category Filter: All Talents tab now has category filter dropdown
5. ✅ Admin Panel - Pending Tab Redesign: Shows detailed cards with terms agreement status, portfolio count
6. ✅ Terms Agreement Fix: API now returns agreed_to_terms and agreed_at fields for all talents

### December 2025 Updates
1. ✅ Homepage Video Feature: Admin can upload YouTube/Vimeo URLs, displayed below hero slider
2. ✅ Admin Panel Performance: Lazy loading - only fetches data for active tab
3. ✅ Magazine PDF download feature
4. ✅ Background music with mute/unmute
5. ✅ Declaration checkbox for talent registration
6. ✅ Admin can view/set talent passwords (plaintext storage per user request)
7. ✅ Admin talent detail modal with full editing capabilities
8. ✅ "Other" category for custom talent categories

### Bug Fixes Applied
1. ✅ Mobile navigation - Working (hamburger menu)
2. ✅ Talent profile click - Modal opens with photo gallery
3. ✅ Privacy: Contact info hidden from public view
4. ✅ Case-insensitive email handling
5. ✅ Navbar on all pages including auth pages
6. ✅ Talent image upload fix for existing profiles

## Privacy Rules
- **Public View:** Name, category, bio, photos, vote count only
- **Admin Panel:** Full access including passwords

## API Endpoints
- `/api/video` - GET video data (public)
- `/api/admin/video` - POST/DELETE video (admin only)
- `/api/magazine` - GET magazine data (public)
- `/api/admin/magazine` - POST/DELETE magazine (admin only)
- `/api/music` - GET music data (public)
- `/api/admin/music` - POST/DELETE music (admin only)
- `/api/admin/talent/{id}/full` - GET talent with password (admin only)
- `/api/admin/talent/{id}/password` - PUT reset password (admin only)
- `/api/awards` - GET awards with winner_images array (public)
- `/api/admin/awards` - POST/PUT/DELETE awards with multi-image support (admin only)
- `/api/hero-images` - GET up to 10 hero images (public)
- `/api/admin/hero-images` - POST/PUT/DELETE hero images (admin only)

## Database Collections
- users, talents, hero_images, awards, advertisements
- magazines: {id, title, file_data, file_name, created_at}
- music: {id, title, file_data, file_name, created_at}
- videos: {id, title, video_url, video_type, created_at}
- awards: {id, title, winner_name, winner_image, winner_images[], description, category, is_active, created_at}

## Future Tasks (Backlog)
- **P1: Frontend Refactoring** - Complete modularization of App.js (~1970 lines) using extracted components
- **P1: Image Gallery Swipe** - Test swipeable navigation in talent portfolio lightbox
- P2: SEO Enhancements (dynamic meta tags, Google Search Console)

## Admin Credentials
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM

## Security Notes
- Passwords stored in plaintext (`password_plain` field) per user request
- Admin-only endpoint exposes passwords
- Live site uses separate MongoDB from preview
