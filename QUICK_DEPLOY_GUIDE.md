# Bangalore Fashion Magazine - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=bfm_database" >> .env
echo "CORS_ORIGINS=*" >> .env

# Run
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Development
yarn start

# Production build
yarn build
```

## Deployment Options

### 1. Vercel (Frontend) + Render (Backend)

**Frontend (Vercel):**
1. Push frontend folder to GitHub
2. Connect to Vercel
3. Set env: `REACT_APP_BACKEND_URL=https://your-render-app.onrender.com`

**Backend (Render):**
1. Push backend folder to GitHub
2. Create Web Service on Render
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`

### 2. Railway (Full Stack)
1. Push both folders to GitHub
2. Create project on Railway
3. Add MongoDB service
4. Deploy backend and frontend as separate services

### 3. DigitalOcean/AWS
- Use Docker or PM2 for process management
- Configure Nginx as reverse proxy

## MongoDB Atlas Setup
1. Create free cluster at mongodb.com/atlas
2. Get connection string
3. Update `MONGO_URL` in backend .env

## Admin Credentials
- Email: admin@bangalorefashionmag.com
- Password: Admin@123BFM

## Features Included
- Talent registration & management
- Designer Store with 4 categories
- Product management (10 products/designer, 5 images, 1 video)
- Discount system
- Order management (offline payment)
- Analytics dashboard
- CSV exports
- Image optimization
