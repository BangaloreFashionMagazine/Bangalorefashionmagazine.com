# Bangalore Fashion Magazine - PRD

## Original Problem Statement
Build a fashion magazine website for Bangalore with talent management, admin panel, and voting system.

## User Personas
- **Admin**: Manages talents, approves registrations, controls content (hero images, awards, ads)
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

### Homepage Features
- Hero slider with 4 admin-managed images
- Awards section (admin-managed, linked to voting)
- Advertisement sidebar (admin-managed)

### Navigation
- Home
- Talents (dropdown with 6 categories)
- About Us
- Admin Login
- Talent Login
- Join Us

### Registration (Join Us)
- Fields: Name, Email, Password, Phone, Category, Profile Image (required), Portfolio (up to 7 images)
- New registrations require admin approval

### Admin Panel
- Approve/reject talents
- Manage hero images, awards, ads
- Rank talents
- Export talent data to CSV

### Talent Dashboard
- Edit profile
- Update portfolio images

### Forgot Password
- OTP displayed on screen (no email integration)

### Voting System
- Vote for talents (IP-based restriction)

## Tech Stack
- Frontend: React.js + Tailwind CSS
- Backend: FastAPI (Python)
- Database: MongoDB

## What's Been Implemented ✅

### Backend (server.py)
- Full authentication (users and talents)
- Admin APIs (talent management, content management)
- Talent portfolio management
- Voting system
- CSV export
- Password reset with OTP

### Frontend (App.js)
- All pages and components
- Mobile hamburger menu navigation
- Talent detail modal on click
- Forgot password with OTP display
- Admin dashboard
- Talent dashboard

## Bug Fixes Applied (February 2, 2026)
1. ✅ Mobile navigation - Working (hamburger menu with all tabs)
2. ✅ Talent profile click - Modal opens with photo gallery (no contact info)
3. ✅ Forgot password OTP - Displayed on screen
4. ⚠️ "Made with Emergent" branding - Platform-injected, cannot remove
5. ✅ Privacy: Talent cards and modal hide contact info (phone, email, Instagram) from public view
6. ✅ Renamed "Awards" to "Contest & Winners" in admin panel
7. ✅ Advertisements visible on both desktop and mobile
8. ✅ Contest winners auto-hide from homepage when deleted by admin

## Privacy Rules
- **Public View (Visitors):** Can only see talent name, category, bio, photos, and vote count
- **Talent Dashboard:** Talents can only see and edit their OWN profile
- **Admin Panel:** Admin can see ALL talent details including phone, email, Instagram

## Admin Features
- **Contest & Winners:** Add/delete contest winners - automatically shows/hides on homepage
- **Advertisements:** Add/delete ads - displays on homepage sidebar (desktop & mobile)
- **Hero Images:** Manage homepage slider images
- **Talent Management:** Approve, reject, rank talents
- **Export:** Download talent data as CSV

## API Endpoints
- `/health` - Health check
- `/api/auth/{login,register}` - User auth
- `/api/talent/{register,login,forgot-password,reset-password}` - Talent auth
- `/api/talents` - List talents
- `/api/vote` - Cast vote
- `/api/admin/*` - Admin operations

## Database Collections
- users: {id, name, email, password_hash, is_admin}
- talents: {id, name, email, password_hash, phone, instagram_id, category, bio, profile_image, portfolio_images, is_approved, rank, votes}
- hero_images: {id, image_data, category, title, subtitle}
- awards: {id, image_data, title, description, talent_id}
- advertisements: {id, image_data, link, is_active}

## Future Tasks (Backlog)
- P1: SEO Meta Tags (titles, descriptions, Open Graph)
- P2: Code refactoring (split monolithic files)
- P2: Portfolio image gallery in talent modal

## Admin Credentials
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM

## Notes
- Live site uses separate Atlas MongoDB from preview
- "Made with Emergent" branding is platform-injected
