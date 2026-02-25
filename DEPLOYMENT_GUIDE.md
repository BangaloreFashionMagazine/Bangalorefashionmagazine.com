# Complete Deployment Guide - Bangalore Fashion Magazine
## For Absolute Beginners (Zero Knowledge Required)

This guide will help you deploy your website on FREE platforms:
- **MongoDB Atlas** - Database (FREE)
- **Render** - Backend/API (FREE)
- **Vercel** - Frontend/Website (FREE)

**Time Required:** 30-45 minutes

---

## STEP 1: Download Your Backup

1. Open this link in your browser:
   ```
   https://fashion-mag-v2.preview.emergentagent.com/bfm_complete_backup.zip
   ```

2. The file will download automatically

3. **Extract/Unzip** the file:
   - Windows: Right-click → "Extract All"
   - Mac: Double-click the zip file

4. You'll see a folder called `bfm_backup` containing:
   - `backend/` - Your API code
   - `frontend/` - Your website code
   - `database_dump/` - Your data

---

## STEP 2: Create GitHub Account (If you don't have one)

1. Go to: https://github.com/signup
2. Enter your email, create password, choose username
3. Verify your email
4. Done!

---

## STEP 3: Upload Code to GitHub

### 3.1 Create Backend Repository

1. Go to: https://github.com/new

2. Fill in:
   - Repository name: `bfm-backend`
   - Description: `Bangalore Fashion Magazine Backend`
   - Select: **Public**
   - Click: **Create repository**

3. You'll see instructions - IGNORE them for now

4. **Upload files:**
   - Click "uploading an existing file" link
   - Drag the entire `backend` folder contents (NOT the folder itself, the files INSIDE it)
   - Scroll down, click "Commit changes"

### 3.2 Create Frontend Repository

1. Go to: https://github.com/new

2. Fill in:
   - Repository name: `bfm-frontend`
   - Description: `Bangalore Fashion Magazine Frontend`
   - Select: **Public**
   - Click: **Create repository**

3. **Upload files:**
   - Click "uploading an existing file" link
   - Drag the entire `frontend` folder contents (NOT the folder itself, the files INSIDE it)
   - Scroll down, click "Commit changes"

---

## STEP 4: Setup MongoDB Atlas (FREE Database)

### 4.1 Create Account

1. Go to: https://www.mongodb.com/cloud/atlas/register

2. Sign up with Google or create account with email

3. Answer the questions (select "FREE" option when asked)

### 4.2 Create Database Cluster

1. Click **"Build a Database"**

2. Select **"M0 FREE"** option (it's free forever!)

3. Select any cloud provider (AWS is fine)

4. Select region closest to you (Mumbai for India)

5. Cluster name: `bfm-cluster`

6. Click **"Create"**

7. **Create Database User:**
   - Username: `bfmadmin`
   - Password: Click "Autogenerate Secure Password"
   - **COPY THIS PASSWORD AND SAVE IT SOMEWHERE SAFE!**
   - Click "Create User"

8. **Setup Network Access:**
   - Where it says "Add IP Address"
   - Click **"Allow Access from Anywhere"** (or "0.0.0.0/0")
   - Click "Add Entry"

9. Click **"Finish and Close"**

### 4.3 Get Your Connection String

1. Click **"Connect"** button on your cluster

2. Select **"Connect your application"**

3. Copy the connection string. It looks like:
   ```
   mongodb+srv://bfmadmin:<password>@bfm-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **IMPORTANT:** Replace `<password>` with the password you saved earlier

5. Add database name at the end:
   ```
   mongodb+srv://bfmadmin:YOUR_PASSWORD@bfm-cluster.xxxxx.mongodb.net/bfm_database?retryWrites=true&w=majority
   ```

6. **Save this full URL - you'll need it!**

---

## STEP 5: Import Your Data to MongoDB Atlas

### 5.1 Install MongoDB Tools (One-time setup)

**For Windows:**
1. Go to: https://www.mongodb.com/try/download/database-tools
2. Download and install

**For Mac:**
1. Open Terminal
2. Run: `brew install mongodb-database-tools`

### 5.2 Import Data

1. Open Command Prompt (Windows) or Terminal (Mac)

2. Navigate to your backup folder:
   ```
   cd path/to/bfm_backup
   ```

3. Run this command (replace YOUR_CONNECTION_STRING):
   ```
   mongorestore --uri="YOUR_CONNECTION_STRING" ./database_dump
   ```

4. Wait for it to complete

---

## STEP 6: Deploy Backend on Render (FREE)

### 6.1 Create Render Account

1. Go to: https://render.com

2. Click **"Get Started for Free"**

3. Sign up with GitHub (easiest option)

### 6.2 Create Web Service

1. Click **"New +"** → **"Web Service"**

2. Connect your GitHub account if not already connected

3. Find and select your `bfm-backend` repository

4. Fill in the settings:
   - **Name:** `bfm-backend`
   - **Region:** Singapore (or closest to you)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

5. Select **"Free"** plan

6. Click **"Advanced"** to add Environment Variables:

   Click "Add Environment Variable" for each:
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | Your MongoDB connection string from Step 4 |
   | `DB_NAME` | `bfm_database` |
   | `CORS_ORIGINS` | `*` |

7. Click **"Create Web Service"**

8. Wait 5-10 minutes for deployment

9. Once done, you'll get a URL like:
   ```
   https://bfm-backend.onrender.com
   ```
   **SAVE THIS URL!**

---

## STEP 7: Deploy Frontend on Vercel (FREE)

### 7.1 Create Vercel Account

1. Go to: https://vercel.com

2. Click **"Sign Up"**

3. Sign up with GitHub (easiest option)

### 7.2 Import Project

1. Click **"Add New..."** → **"Project"**

2. Find and select your `bfm-frontend` repository

3. Click **"Import"**

4. **Configure Project:**
   - Framework Preset: `Create React App`
   - Root Directory: `./` (leave as is)

5. Click **"Environment Variables"** and add:

   | Name | Value |
   |------|-------|
   | `REACT_APP_BACKEND_URL` | Your Render URL from Step 6 (e.g., `https://bfm-backend.onrender.com`) |

6. Click **"Deploy"**

7. Wait 2-3 minutes

8. Once done, you'll get a URL like:
   ```
   https://bfm-frontend.vercel.app
   ```

---

## STEP 8: Update Backend CORS (Important!)

1. Go back to Render Dashboard: https://dashboard.render.com

2. Click on your `bfm-backend` service

3. Go to **"Environment"** tab

4. Find `CORS_ORIGINS` and update it to your Vercel URL:
   ```
   https://bfm-frontend.vercel.app
   ```

5. Click **"Save Changes"**

6. The backend will auto-redeploy

---

## STEP 9: Connect Your Domain (Optional)

### On Vercel (for frontend):

1. Go to your project on Vercel

2. Click **"Settings"** → **"Domains"**

3. Add your domain: `bangalorefashionmagazine.com`

4. Follow the DNS instructions provided

### On Render (for backend):

1. Go to your service on Render

2. Click **"Settings"** → **"Custom Domains"**

3. Add: `api.bangalorefashionmagazine.com`

4. Follow DNS instructions

---

## STEP 10: Test Your Deployment

1. Open your Vercel URL (e.g., `https://bfm-frontend.vercel.app`)

2. Test these features:
   - [ ] Homepage loads
   - [ ] Can browse talents
   - [ ] Can register new talent
   - [ ] Can login as talent
   - [ ] Can login as admin (admin@bangalorefashionmag.com / Admin@123BFM)
   - [ ] Admin panel works

---

## Troubleshooting

### "Cannot connect to database"
- Check your MongoDB connection string is correct
- Make sure you replaced `<password>` with actual password
- Check IP whitelist allows "0.0.0.0/0"

### "CORS error"
- Update CORS_ORIGINS on Render to match your Vercel URL
- Make sure there's no trailing slash

### "Backend not responding"
- Check Render logs for errors
- Make sure all environment variables are set

### "Frontend shows blank page"
- Check REACT_APP_BACKEND_URL is correct
- Check browser console for errors (F12)

---

## Cost Summary

| Service | Cost |
|---------|------|
| MongoDB Atlas | FREE (M0 tier) |
| Render | FREE (with limitations*) |
| Vercel | FREE |
| **Total** | **$0/month** |

*Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## Your Important URLs (Fill these in)

| What | URL |
|------|-----|
| MongoDB Atlas | https://cloud.mongodb.com |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Your Frontend | https://_________________.vercel.app |
| Your Backend | https://_________________.onrender.com |

---

## Admin Login Credentials

- **Email:** admin@bangalorefashionmag.com
- **Password:** Admin@123BFM

---

## Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Note which step you're on
3. Share with me and I'll help!

---

**Congratulations! Your website is now live!** 🎉
