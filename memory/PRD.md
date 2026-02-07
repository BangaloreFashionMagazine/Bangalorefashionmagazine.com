# Bangalore Fashion Magazine - PRD

## Original Problem Statement
Build a fashion magazine website for Bangalore with talent management, admin panel, and voting system.

## User Personas
- **Admin**: Manages talents, approves registrations, controls content (hero images, awards, ads, magazine, video, music)
- **Talent**: Models, designers, makeup artists, photographers who register and showcase portfolios
- **Visitors**: Browse talents, vote for favorites

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
- Hero slider with 4 admin-managed images
- Featured Video section (YouTube/Vimeo embeds, admin-managed)
- Contact section with Instagram & email links
- Magazine download section (PDF, admin-managed)
- Contest & Winners section (admin-managed)
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
- **Pending Tab:** Approve/reject talents
- **All Talents Tab:** View, edit, rank, delete talents; view/set passwords
- **Hero Images Tab:** Manage homepage slider images with ordering
- **Featured Video Tab:** Add YouTube/Vimeo video URL for homepage
- **Contest & Winners Tab:** Manage contest winners
- **Advertisements Tab:** Manage sidebar ads
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
- Frontend: React.js + Tailwind CSS
- Backend: FastAPI (Python)
- Database: MongoDB

## What's Been Implemented ✅

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

## Database Collections
- users, talents, hero_images, awards, advertisements
- magazines: {id, title, file_data, file_name, created_at}
- music: {id, title, file_data, file_name, created_at}
- videos: {id, title, video_url, video_type, created_at}

## Future Tasks (Backlog)
- **P0: Code Refactoring** - Split monolithic App.js (~1900 lines) and server.py (~850 lines)
- P1: SEO Enhancements (dynamic meta tags, Google Search Console)
- P2: Portfolio image gallery improvements

## Admin Credentials
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM

## Security Notes
- Passwords stored in plaintext (`password_plain` field) per user request
- Admin-only endpoint exposes passwords
- Live site uses separate MongoDB from preview
