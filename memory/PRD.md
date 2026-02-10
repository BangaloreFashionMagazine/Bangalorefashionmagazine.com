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

## Core Features

### Public Features
1. **Homepage**
   - Hero image slider
   - Model of the Week showcase
   - Party Updates section
   - Contest Winners display
   - Featured video section

2. **Talent Profiles**
   - Browse by category (Model - Female, Model - Male, Designers, Makeup & Hair, Photography, Event Management, Other)
   - Voting system
   - Portfolio gallery with images and video

3. **Talent Registration**
   - Self-registration with terms agreement
   - Profile image upload with cropping
   - Portfolio images (up to 7)
   - Portfolio video (max 45 seconds)

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

## Key API Endpoints
- `POST /api/talent/login` - Talent authentication
- `POST /api/auth/login` - Admin authentication
- `GET /api/talents` - List talents
- `GET /api/admin/party-events` - List party events
- `DELETE /api/admin/party-events/{id}` - Delete party event
- `GET /api/awards` - Get contest winners
- `POST /api/admin/awards` - Create contest winner (with talent_id for linking)

## Recent Fixes (Feb 2026)
- Fixed deployment issue: `.gitignore` was blocking `.env` files
- Site restored from 520 error
- Verified admin panel functionality
- Confirmed party updates delete button working

## Pending User Actions
- Link contest winners to talent profiles using Admin → Contest & Winners → "Link to Talent Profile" dropdown
- Test talent login functionality on live site

## Admin Credentials
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM
