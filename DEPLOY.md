# 🚀 Quick Deploy - SPACE STRIKE

## Fastest Path: Deploy to Render (FREE)

### Step 1: Push to GitHub (5 minutes)

```powershell
# In PowerShell, run these commands:
cd "C:\Users\User\OneDrive\Desktop\SPACE FIGHTER"

git init
git add .
git commit -m "Initial commit - SPACE STRIKE"

# Now create a new repository on https://github.com/new
# Repository name: space-strike
# Make it Public or Private (your choice)
# DO NOT add README, .gitignore, or license (we already have them)

# After creating the repo, run (replace YOUR_USERNAME):
git remote add origin https://github.com/YOUR_USERNAME/space-strike.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend (3 minutes)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Find and select your `space-strike` repository
5. Fill in:
   - **Name:** `space-strike-backend`
   - **Region:** Singapore
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Click "Advanced" and add these Environment Variables:
   ```
   NODE_ENV = production
   DB_HOST = ep-broad-forest-b32nhroo-pooler.c-4.ap-southeast-1.aws.neon.tech
   DB_PORT = 5432
   DB_NAME = neondb
   DB_USER = neondb_owner
   DB_PASSWORD = npg_r9jVioQFnWd1
   DB_SSL = true
   SESSION_SECRET = SpaceStrike2026SecureRandomKey87654321AbCdEfGhIjKlMnOpQrSt
   FRONTEND_URL = https://space-strike-frontend.onrender.com
   ```

7. Click **"Create Web Service"**
8. Wait ~3 minutes, then copy your backend URL

### Step 3: Deploy Frontend (2 minutes)

1. Click **"New +"** → **"Static Site"**
2. Select your `space-strike` repository again
3. Fill in:
   - **Name:** `space-strike-frontend`
   - **Branch:** `main`
   - **Build Command:** `echo "No build needed"`
   - **Publish Directory:** `.`

4. Click **"Create Static Site"**

### Step 4: Connect Frontend to Backend (1 minute)

1. After frontend deploys, click **"Redirects/Rewrites"**
2. Click **"Add Rule"**
3. Fill in:
   - **Source:** `/api/*`
   - **Destination:** `https://YOUR-BACKEND-URL.onrender.com/api/*`
   - **Action:** Rewrite

4. Save

### Step 5: Update Backend with Frontend URL (1 minute)

1. Go to your backend service
2. Environment → Edit `FRONTEND_URL`
3. Change to your actual frontend URL: `https://space-strike-frontend.onrender.com`
4. Save (it will redeploy automatically)

## ✅ Done! Test Your Game

Visit: `https://space-strike-frontend.onrender.com`

## 🧪 Quick Test

1. Register a new account
2. Play Quick Play mode
3. Kill some enemies
4. Check coins are saved
5. Test on mobile device!

## ⚠️ Important Notes

- **First load takes 30-60 seconds** (free tier wakes up from sleep)
- After 15 minutes of inactivity, backend sleeps again
- All subsequent loads are fast
- Your database (Neon) never sleeps!

## 🆘 If Something Goes Wrong

### Backend won't start:
- Check logs in Render dashboard
- Verify all environment variables are set
- Check database connection

### Frontend loads but can't login:
- Verify backend URL in redirects/rewrites
- Check backend is running: visit `https://your-backend-url.onrender.com/api/health`

### Coins don't save:
- Check backend logs
- Verify database environment variables
- Test database connection in Neon dashboard

## 📱 Share Your Game!

Once deployed, share the URL with friends:
- Works on desktop (keyboard controls)
- Works on mobile (touch controls + auto landscape detection)
- All data synced to cloud database

---

**Total Deploy Time: ~12 minutes** 🎉
