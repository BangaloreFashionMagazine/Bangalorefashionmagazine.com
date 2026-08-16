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
- **PDF Multi-Export** - Select multiple magazines with checkboxes and export them all as a combined PDF

### Phase 1 Visual Editor (December 2025)
- **Page Settings Panel**: Page size (BFM Standard, A4, A5, Instagram formats), background color picker, margins (T/R/B/L), page actions (copy/paste/reset)
- **Text Styles Panel**: 9 typography presets (Cover Title, Subtitle, Headline, Subheadline, Section Heading, Body, Quote, Caption, Credit)
- **Color Palettes Panel**: 4 preset palettes (BFM Gold & Black, Minimal White, Luxury Beige, Editorial Black)
- **Version History Panel**: Save/restore checkpoints with timestamps
- **Enhanced Toolbar**: Alignment tools (6 directions), transform tools (flip H/V, rotate 90°), style copy/paste
- **Page Control Functions**: renamePage, copyPage, pastePage, resetPage, togglePageVisibility, applyMarginsToPage, applyMarginsToAllPages
- **Style Functions**: applyTextStyle, copyStyle, pasteStyle, applyColorPalette
- **Alignment Functions**: alignElement (left/center/right/top/middle/bottom)
- **Transform Functions**: flipElement (horizontal/vertical), rotateElement
- **Decorative Elements**: addDecorativeElement (lines, dividers, circles, frames, quote marks)
- **Button/CTA Elements**: addButton (read_more, view_profile, book_now, contact, follow_instagram)
- **Social Icons**: addSocialIcon (instagram, facebook, twitter, youtube, linkedin, whatsapp, website)
- **Image Effects**: applyImageEffect (brightness, contrast, saturation, blur, grayscale, sepia)

## API Endpoints
- `POST /api/magazine-builder/save` - Save magazine state
- `GET /api/magazine-builder/list` - List all magazines
- `DELETE /api/magazine-builder/{id}` - Delete magazine
- `POST /api/analytics/track` - Track views/clicks
- `POST /api/auth/login` - Admin authentication

## Known Issues
1. **520 Error on Production** - Platform infrastructure issue, not code-related
2. **Monolithic files** - MagazineBuilder.jsx (~2481 lines) and AdminDashboard.jsx (~2257 lines) need refactoring

### August 2026 - Performance Optimization
- **CRITICAL FIX**: `/api/talents` payload optimization
  - Added `lightweight=true` parameter to exclude `profile_image`, `email`, `phone`
  - Reduces payload from ~51.8 MB (with base64 images) to ~1-2 KB
  - New `/api/talent/{id}/thumb` endpoint returns JPEG thumbnails (150x200px)
  - Pillow-based thumbnail generation with 24-hour caching
  - Frontend TalentCard components now use thumb endpoint with fallback
  - **Data Privacy**: Public API no longer exposes talent email/phone

### August 2026 - Magazine Builder UX Enhancements
- **Quick Add Panel**: One-click preset text/image boxes
  - Text presets: Heading, Subheading, Body Text, Quote, Caption
  - Image presets: Full Page, Half Top, Half Bottom, Square, Portrait, Sidebar
- **Save as Template**: Save any magazine layout as reusable template (localStorage)
- **Mobile Preview**: Phone-frame preview (iPhone/Android/Tablet) with page navigation
- **Keyboard Shortcuts**: Ctrl+Z/Y (undo/redo), Ctrl+C/V (copy/paste), Ctrl+D (duplicate), Ctrl+S (save), T (add text), Delete (remove)
- **Clean PDF Export**: Preview mode during export for clean rendering

## API Endpoints
- `POST /api/magazine-builder/save` - Save magazine state
- `GET /api/magazine-builder/list` - List all magazines
- `DELETE /api/magazine-builder/{id}` - Delete magazine
- `GET /api/talents?lightweight=true` - Lightweight talent list (no images/email/phone)
- `GET /api/talent/{id}/thumb` - Talent profile thumbnail (150x200 JPEG)
- `POST /api/analytics/track` - Track views/clicks
- `POST /api/auth/login` - Admin authentication

## Prioritized Backlog

### P0 (Critical)
- ✅ COMPLETED: /api/talents payload optimization (51.8MB → ~1KB)

### P1 (High Priority)
- ✅ COMPLETED: Quick Add Panel (text/image presets in toolbar)
- ✅ COMPLETED: Save as Template feature
- ✅ COMPLETED: Mobile Preview (iPhone/Android/Tablet)
- Refactor MagazineBuilder.jsx into smaller modular components (4400+ lines)

### P2 (Medium Priority)
- Add real payment gateways (Stripe/Razorpay) for Designer Store
- Cafe/Sponsor ad page templates
- Multi-talent magazine support
- 520 Production Error - Platform infrastructure issue

### P3 (Future Enhancements)
- Template preview thumbnails
- Real-time collaboration

## Test Credentials
See `/app/memory/test_credentials.md`
