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

### Hero Management System (NEW - COMPLETED)
- [x] Hero slides connected to approved BFM Talent profiles
- [x] Admin can enable/disable talents for hero display
- [x] Admin selects specific portfolio images per talent for hero
- [x] Focal point system to preserve faces/important content
- [x] Smart responsive cropping on desktop and mobile
- [x] Premium animations: fade, slide, zoom (Ken Burns)
- [x] Configurable: autoplay, duration (3/5/7/10s), arrows, dots
- [x] Talent name and category display with each slide
- [x] CTA buttons: View Profile, Join BFM
- [x] Default BFM hero when no slides configured
- [x] Drag-and-drop slide reordering
- [x] Desktop and mobile preview in admin
- [x] No random images - only admin-approved images displayed

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
- [x] Hero Management - NEW talent-based hero system
- [x] Hero Images (Legacy) - original static uploads
- [x] Contest & Winners management
- [x] Advertisements management
- [x] **Modular Tab Components** - Extracted PendingTab, AllTalentsTab, PaidTalentsTab, AnalyticsTab to `/pages/Admin/tabs/`
- [x] Background music settings
- [x] Party updates
- [x] Featured video
- [x] Designer store management
- [x] Events & Custom Payments - Create events with custom fees
- [x] Payment QR & Links - UPI/PayPal QR codes to share with talents

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

### August 2026 - Navigation Restructure
- **New TALENTS Navigation** with expanded categories:
  - All Talents
  - Models – Male
  - Models – Female
  - Designers
  - Photographers
  - Makeup Artists
  - Hair Stylists
  - Stylists
  - DJs
  - Choreographers
  - Casting Coordinators
  - Featured Talents
- **New MAGAZINE Tab** with sections:
  - Latest Issues (downloadable PDFs)
  - Talent Spotlight (featured talents)
  - Editorials (hero image showcases)
- Both desktop hover dropdowns and mobile collapsible menus updated

### August 2026 - Bug Fixes
- **Ad/Party Click Expand**: Fixed click-to-expand functionality for ads and party images
  - Removed anchor tags causing page navigation
  - Now properly shows enlarged modal view
  - Works for both ads with and without links

### August 2026 - Admin Talents Search & Filter (COMPLETED)
- **Admin-Only Search**: Search/filter moved exclusively to Admin Dashboard "All Talents" tab
- **Search Box**: Real-time search by talent name
- **Category Filter**: Dropdown with all 12 categories
- **Clear Filters**: Button to reset search and category
- **Results Counter**: Shows filtered count vs total talents
- **Public Website**: Search removed from public-facing talent pages (per user request)

### August 2026 - Instagram Promotion Updates (NEW)
- **Talent Instagram Hidden by Default**: Promotes BFM website instead
- **Admin Settings Panel**:
  - Show Talent Instagram: ON/OFF (default OFF)
  - Show BFM Website: ON/OFF (default ON)
  - Show QR Code: ON/OFF (default ON)
- **Feed Format**: 1080×1350 px (4:5 ratio) - proper Instagram feed dimensions
- **Story Format**: 1080×1920 px (9:16 ratio) - proper Instagram story dimensions
- **Smart Cropping**: Object position set to preserve faces (center 20% for feed, 15% for story)
- **BFM Branding**: "Discover this talent on bangalorefashionmagazine.com"
- **QR Code**: Links to talent's BFM profile, not their personal Instagram

### August 2026 - SEO Foundation (NEW)
- **sitemap.xml**: Auto-generated with all public pages and approved talent profiles
- **robots.txt**: Properly configured (allow public, block admin/api)
- **SEO Metadata API**: `/api/seo/page/{path}` returns title, description, keywords, OG tags
- **Category SEO**: Unique metadata for each talent category page
- **Talent Profile SEO**: Auto-generated titles like "Alexandra Singh | Female Model in Bangalore | BFM"
- **Structured Data API**: Organization, Person (talent), BreadcrumbList schemas
- **SEO Components**: React components for dynamic meta tag updates
- **Image Alt Text**: Descriptive alt text generation for talent images

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
- ✅ COMPLETED: Component Refactor - Created modular components in `/MagazineBuilder/` folder:
  - `EditorToolbar.jsx` - Toolbar components (QuickAdd, AddElements, History, ViewControls, Export)
  - `EditorModals.jsx` - Modal components (SaveTemplate, MobilePreview)
  - `useEditorShortcuts.js` - Keyboard shortcuts hook
  - `useQuickAdd.js` - Quick add text/image boxes hook
  - `useTemplates.js` - Template management hook
  - `index.js` - Re-exports for easy importing

### August 2026 - Admin Magazine Tab Hint (COMPLETED)
- Added descriptive hint box in Admin "Magazine PDF" tab
- Explains: Upload Magazine PDFs, Replace Editions
- Tip: Links to Magazine Builder and Featured Video tabs

### August 2026 - Razorpay Payment Integration (COMPLETED)
- **Backend**: Full implementation in `/backend/routes/payments.py`
  - Create order endpoint
  - Verify payment endpoint  
  - Webhook handler
  - Payment settings (enable/disable, fee amount)
  - Payment history tracking
- **Frontend**: Razorpay checkout in JoinPage (`App.js`)
  - Script loading
  - Payment modal integration
  - Success/failure handling
- **Admin Settings**: Payment toggle, fee configuration, history view
- **Status**: REQUIRES USER API KEYS - Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`

### August 2026 - Privacy: Contact Info Hidden from Public (COMPLETED)
- **Backend Fix**: `/api/talent/{talent_id}` now accepts `include_contact=true` parameter
  - Public requests: Phone and email return as empty strings
  - Admin requests (with `include_contact=true`): Full contact info visible
- **Frontend**: Admin Dashboard uses `include_contact=true` for Instagram Promo generator
- **Result**: Talent phone/email no longer visible to public visitors (even in network requests)
- **Admin Visibility**: Phone and email still visible in Admin Dashboard lists

### August 2026 - Advanced Share System with Analytics (COMPLETED)
- **3 Share Options**: WhatsApp, Instagram Story (9:16), Instagram Feed (4:5)
- **Formatted Images**: Each format creates properly sized image with:
  - Dark gradient background
  - Gold border around photo
  - Talent name and category
  - BFM Magazine branding
- **Share Analytics Dashboard**: New section in Admin Analytics tab showing:
  - Total shares broken down by platform (W/S/F)
  - Top shared talents with per-platform counts
  - Recent share activity log
- **Backend Tracking**: New `/api/track-share` endpoint and `/api/admin/share-analytics` endpoint
- **Gallery Share**: Share any photo from the full-screen gallery, not just profile image

### August 2026 - Dynamic SEO Tags (COMPLETED)
- Added react-helmet-async for dynamic meta tags
- Each talent profile has unique:
  - Title: "Talent Name | Category | BFM Magazine"
  - Open Graph tags (og:title, og:description, og:image)
  - Twitter Card tags
- Category pages also have optimized SEO meta tags

### August 2026 - Share Leaderboard (COMPLETED - VERIFIED)
- **ShareLeaderboard Component**: Displays top shared talents on homepage
- **API Endpoint**: `GET /api/share-leaderboard` returns top 10 shared talents
- **Rank Badges**: 🥇🥈🥉 for top 3, numeric badges for others
- **Talent Cards**: Profile image, name, share count, vote count
- **Styling**: Matches BFM dark theme with gold accents
- **Auto-hide**: Component hidden when no shares exist

### P2 (Medium Priority)
- **Advanced SEO Routing**: Dynamic Helmet/SSR meta tags for individual talent profiles
- Cafe/Sponsor ad page templates
- Multi-talent magazine support
- 520 Production Error - Platform infrastructure issue
- Payment Receipts & CSV Export (Paused by user)

### P3 (Future Enhancements)
- Template preview thumbnails
- Real-time collaboration
- Further code refactoring (AdminDashboard.jsx still needs modularization)

## Test Credentials
See `/app/memory/test_credentials.md`

---

## August 2026 - Share Incentive Badges (NEW - COMPLETED)
- **Badge Tiers**:
  - 🔥 Top Sharer (Rank #1) - Orange badge
  - ⭐ Rising Star (Rank #2-3) - Yellow badge  
  - ✨ Active Promoter (5+ shares) - Purple badge
- **Display Locations**:
  - Small badge on talent cards (top-right corner)
  - Large badge under name in talent detail modal
- **Components Created**: `/components/share/ShareBadge.jsx`

## August 2026 - Talent Gallery Filters (NEW - COMPLETED)
- **Filter Bar** with toggle button (funnel icon)
- **Sort Options**: Recent, Most Voted, Most Shared, Name A-Z
- **Category Filter**: All Categories + dynamic list from database
- **Clear Filters** button when filters are active
- **Results Count**: Shows filtered count when filters applied

## August 2026 - Code Refactoring Phase 1 (NEW - COMPLETED)
- **Extracted Components** from App.js:
  - `/components/share/ShareLeaderboard.jsx` - Homepage leaderboard section
  - `/components/share/ShareBadge.jsx` - Badge components with tiers
  - `/components/share/index.js` - Re-exports for easy imports
- **App.js** reduced by ~100 lines, improved maintainability
- **Remaining**: AdminDashboard.jsx (3,300+ lines) still needs modularization

## August 2026 - Contest Management System (NEW - COMPLETED)
- **Admin Contest Management Tab** (`/pages/Admin/tabs/ContestManagementTab.jsx`):
  - Create/Edit/Delete contests
  - Add existing talents as participants
  - Set start/end dates with times
  - Set contest status: Draft, Upcoming, Live, Closed, Winner Announced
  - **Visibility Toggle**: Eye icon to show/hide contest from public (NEW)
  - **Featured Toggle**: Feature contest on homepage
  - **Banner Image Upload**: Upload and compress banner images
  - Announce winner with one click
  - **Vote Analytics Modal**: View daily voting trends and participant breakdown
  - Vote table showing participants ranked by votes

- **Public Contest System**:
  - **Featured Contest Component** on Homepage (`FeaturedContest` in App.js)
  - Shows top 3 participants with medals (🥇🥈🥉)
  - "Vote Now" button links to public contest page
  - Public Contest Page (`/contest/:slug`) with voting functionality
  - Duplicate vote prevention (IP-based, 24-hour cooldown)

- **Backend Routes** (`/backend/routes/contests.py`):
  - `POST /api/admin/contests` - Create contest
  - `GET /api/admin/contests` - List all contests (admin)
  - `PUT /api/admin/contests/{id}` - Update contest
  - `DELETE /api/admin/contests/{id}` - Delete contest
  - `GET /api/admin/contests/{id}/analytics` - Vote analytics (NEW)
  - `POST /api/admin/contests/{id}/announce-winner` - Announce winner
  - `GET /api/contests` - Public contests list (filters by `is_visible`)
  - `GET /api/contests/featured` - Featured contest for homepage
  - `POST /api/contests/{id}/vote` - Cast vote with rate limiting

- **Database Collections**:
  - `contests`: {id, slug, name, description, banner_image, dates, status, is_featured, is_visible, participant_ids, winner_id}
  - `contest_votes`: {id, contest_id, talent_id, client_ip, session_id, created_at}

## August 2026 - Weekly Profile Views (COMPLETED)
- Replaced "Shares" counter on homepage with "Weekly Profile Views"
- Monday-Sunday tracking period
- Backend calculates views from `profile_views` collection
- Eye icon displayed with animated counter

## August 2026 - Instagram Vote Share Feature (NEW - COMPLETED)
- **After voting**, users see a share modal with Instagram options
- **Download for Story (9:16)**: Generates a 1080x1920 image with:
  - Dark gradient background with gold border
  - Talent's circular profile photo
  - "I VOTED FOR" heading with talent name and category
  - Contest name and vote count
  - "VOTE NOW!" call-to-action
  - BFM Magazine branding
- **Download for Feed (4:5)**: Generates a 1080x1350 image (same styling)
- Canvas-based image generation using HTML5 Canvas API
- Images download automatically for sharing on Instagram
- "Share on Instagram" button persists after page reload (stores voted talent in localStorage)
- "Copy contest link" option included
