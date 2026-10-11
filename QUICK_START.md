# 🚀 SPACE STRIKE Quick Start Guide

Get your game live in **30 minutes**!

## ⚡ Super Quick Setup

### 1. Create Cloud Database (5 min)

1. Go to **https://neon.tech/** → Sign up (free)
2. Create project: `space-strike`
3. Copy the connection string that looks like:
   ```
   postgresql://user:pass@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```

### 2. Configure Backend (2 min)

1. Copy `backend\.env.example` to `backend\.env`
2. Break down your connection string into the .env file:
   ```env
   DB_HOST=ep-xxx.region.neon.tech
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=neondb
   DB_SSL=true
   SESSION_SECRET=make_this_a_random_32_character_string_123456
   ```

### 3. Install & Initialize (5 min)

Open PowerShell in the project folder:

```powershell
cd "C:\Users\User\OneDrive\Desktop\SPACE FIGHTER\backend"

# Install dependencies (one by one to avoid timeout)
npm install express
npm install pg
npm install bcrypt
npm install express-session
npm install cors
npm install dotenv

# Initialize database
npm run setup

# Start backend
npm start
```

### 4. Test (2 min)

1. Open browser: `http://localhost:3000/api/health`
2. Should see: `{"status":"ok",...}`
3. Open: `register.html` in browser
4. Create test account
5. Login and play!

## 🎮 That's It - You're Running!

Now you have:
- ✅ Secure authentication with password hashing
- ✅ Cloud database storing all player data
- ✅ Multi-user support (each account is isolated)
- ✅ Global leaderboard
- ✅ Progress sync across sessions

## 🌐 Deploy to Public (Optional - 15 min)

### Backend → Railway
1. Go to https://railway.app/
2. "New Project" → Deploy from GitHub
3. Add environment variables from your `.env`
4. Get backend URL: `https://your-app.railway.app`

### Frontend → Netlify
1. Go to https://netlify.com/
2. Drag & drop your project folder
3. Update API_BASE_URL in `login.html` and `register.html` to your Railway URL
4. Done!

**Full deployment guide:** See `DEPLOYMENT_GUIDE.md`

## 🐛 Troubleshooting

### "npm install hangs"
Install packages one by one:
```powershell
npm install express
npm install pg
npm install bcrypt
npm install express-session
npm install cors
npm install dotenv
```

### "Database connection failed"
- Double-check connection string breakdown in `.env`
- Ensure `DB_SSL=true` for Neon
- Test connection: `npm run setup`

### "Cannot connect to backend"
- Check backend is running: `npm start`
- Verify URL in login.html matches: `http://localhost:3000/api`
- Check for errors in backend console

### "Session not saving"
- Clear browser cookies
- Hard refresh: `Ctrl + Shift + R`
- Check `credentials: 'include'` in fetch calls

## 📚 Full Documentation

- **Backend Setup:** `backend/SETUP.md`
- **Cloud Database:** `backend/CLOUD_DATABASE_SETUP.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`
- **API Docs:** `backend/SETUP.md` (API Endpoints section)

## 🎯 Current Status

✅ Backend infrastructure complete
✅ Database schema ready
✅ Authentication system ready
✅ Login/Register pages ready
⏳ Need to install dependencies
⏳ Need to set up cloud database
⏳ Need to integrate frontend with backend APIs

## 📞 Need Help?

Check the detailed guides above or review the code comments in:
- `backend/server.js` - Main server
- `backend/routes/auth.js` - Authentication
- `backend/routes/player.js` - Player data
- `backend/routes/game.js` - Game results

## 🎉 Ready to Play!

Once setup is complete, you can:
1. Create multiple user accounts
2. Play all 3 game modes
3. Compete on the leaderboard
4. Unlock all 10 fighters
5. Progress through 50 adventure levels

**Next:** Follow the 3 steps above to get started!
