# BFM Magazine - Product Requirements Document

## Original Problem Statement
Build a comprehensive fashion talent platform for Bangalore Fashion Magazine (BFM) with:
1. **BFM Magazine Builder** - A Canva-like visual editor for creating digital fashion magazines
2. **Admin Dashboard** - Complete talent management, analytics, and content administration
3. **Talent Portal** - Registration, profile management, and portfolio features
4. **Public Website** - Showcasing talents across categories (Models, Designers, Photographers, etc.)

## User Personas
1. **Admin** - Magazine editors who create/edit magazines, manage talents, view analytics
2. **Talent** - Fashion professionals who create profiles, upload portfolios, get featured
3. **Public Users** - Visitors browsing talent profiles and magazine content

## Core Requirements

### Magazine Builder (COMPLETED)
- [x] Canva-like drag-and-drop visual editor
- [x] 21 categorized templates (Luxury, Editorial, Minimalist, etc.)
- [x] Layer management with z-index controls
- [x] Text editing with fonts, colors, sizes
- [x] Image uploads (cover, profile, portfolio) - **BUG FIXED: base64 conversion**
- [x] Auto-save every 30 seconds
- [x] Master pages with BFM logo and footer
- [x] Media library for asset management
- [x] PDF and Instagram export
- [x] Delete magazine functionality

### Admin Dashboard (COMPLETED)
- [x] Talent approval workflow
- [x] Analytics tab with real tracking metrics
- [x] Hero images management
- [x] Contest & Winners management
- [x] Advertisements management
- [x] Background music settings
- [x] Party updates
- [x] Featured video
- [x] Designer store management

### Authentication (COMPLETED)
- [x] Admin login with JWT
- [x] Talent login
- [x] Password reset via email
- [x] Brute force protection

## Technical Stack
- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: Python FastAPI
- **Database**: MongoDB
- **Image Processing**: html2canvas, FileReader API for base64 conversion

## What's Been Implemented

### December 2025
- Full Magazine Builder with Canva-like features
- 21 templates across 6 categories
- Media Library and Master Pages
- Auto-save functionality
- Analytics dashboard overhaul with real metrics
- Delete magazine feature
- **CRITICAL FIX**: Image upload bug resolved (File to base64 conversion)
- E2E tested and verified working
- **Enhanced Back Cover page** with larger logo (50% width), bigger text (38px), tagline, and clearer contact details
- **New "Featured Partner" page** (Page 6) for cafe/sponsor advertisements with customizable image, name, description, and contact sections
- **Duplicate Magazine feature** - One-click copy of any magazine with "(Copy)" suffix
- **Insert Ad Page button** - @ icon in Pages sidebar to add ad pages at any position
- **Page Reordering** - Up/down arrows on page thumbnails for easy reorganization
- **AD badge** on page thumbnails to identify advertisement pages
- **Quick Page Templates** - 📖 Book icon dropdown with Photo Gallery, Quote Page, Contact Page, Achievements templates
- **Bulk Ad Insert** - Add 2 or 3 ad pages at once for multiple sponsors
- **Magazine Analytics** - Dashboard now shows total magazines and total pages count

## API Endpoints
- `POST /api/magazine-builder/save` - Save magazine state
- `GET /api/magazine-builder/list` - List all magazines
- `DELETE /api/magazine-builder/{id}` - Delete magazine
- `POST /api/analytics/track` - Track views/clicks
- `POST /api/auth/login` - Admin authentication

## Known Issues
1. **520 Error on Production** - Platform infrastructure issue, not code-related
2. **Monolithic files** - MagazineBuilder.jsx (~2481 lines) and AdminDashboard.jsx (~2257 lines) need refactoring

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Refactor MagazineBuilder.jsx into modular components
- Refactor AdminDashboard.jsx into separate tab components

### P2 (Medium Priority)
- Add real payment gateways (Stripe/Razorpay) for Designer Store
- Cafe/Sponsor ad page templates
- Multi-talent magazine support

### P3 (Future Enhancements)
- Template preview thumbnails
- Magazine duplication feature
- Real-time collaboration

## Test Credentials
See `/app/memory/test_credentials.md`
