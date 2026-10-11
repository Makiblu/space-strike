# 🗄️ Neon Database Setup for SPACE STRIKE

## What is Neon?

**Neon** (neon.tech) is a serverless PostgreSQL database - perfect for SPACE STRIKE because:
- ✅ Free tier with 0.5GB storage
- ✅ No installation needed
- ✅ Automatic backups and scaling
- ✅ SSL/TLS security built-in
- ✅ Works from anywhere

## 📋 Setup Steps (5 minutes)

### Step 1: Create Neon Account

1. Open browser and go to: **https://console.neon.tech/signup**
2. Sign up with GitHub, Google, or email (it's free)
3. Verify your email if needed

### Step 2: Create Project

After logging in:
1. Click **"Create a project"** button
2. Fill in:
   - **Project name:** `space-strike` (or any name you like)
   - **PostgreSQL version:** 16 (default)
   - **Region:** Choose closest to you (e.g., US East)
3. Click **"Create Project"**

### Step 3: Get Connection Details

After project creation, you'll see a connection string like:

```
postgresql://neondb_owner:AbCd1234XyZ@ep-cool-sun-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

### Step 4: Parse Connection String

Break down your connection string into parts:

**Example:**
```
postgresql://myuser:mypass123@ep-cool-sun-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Becomes:
- `DB_HOST` = `ep-cool-sun-12345.us-east-2.aws.neon.tech`
- `DB_USER` = `myuser`
- `DB_PASSWORD` = `mypass123`
- `DB_NAME` = `neondb`
- `DB_PORT` = `5432` (always this)
- `DB_SSL` = `true` (Neon requires SSL)

### Step 5: Update .env File

Open `backend\.env` file and fill in your details:

```env
# Database Configuration (from Neon)
DB_HOST=ep-your-project.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=true

# Session Configuration (generate a random 32+ character string)
SESSION_SECRET=SpaceStrike2026SecretKey123456789AbCdEfGh

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5500
```

**⚠️ Important:** Replace the values with YOUR actual Neon credentials!

### Step 6: Install Dependencies

Open PowerShell in the backend directory:

```powershell
cd "C:\Users\User\OneDrive\Desktop\SPACE FIGHTER\backend"

# Install packages one by one to avoid timeout
npm install express
npm install pg
npm install bcrypt
npm install express-session
npm install cors
npm install dotenv
```

### Step 7: Initialize Database

This will create all tables, indexes, and triggers:

```powershell
npm run setup
```

**Expected output:**
```
🚀 SPACE STRIKE Database Setup
================================

📡 Connecting to database...
✅ Connected to database

📖 Reading schema file...
✅ Schema file loaded

⚙️  Executing schema...
✅ Schema executed successfully

🔍 Verifying tables...
✅ Tables created:
   - users
   - player_profiles
   - player_progress
   - player_fighters
   - player_inventory
   - game_results
   - sessions

🎉 Database setup complete!
```

### Step 8: Start Backend

```powershell
npm start
```

**Expected output:**
```
🚀 SPACE STRIKE Backend running on port 3000
📡 Environment: development
🔗 Frontend URL: http://localhost:5500
✅ Health check: http://localhost:3000/api/health
```

### Step 9: Test

1. Open browser: `http://localhost:3000/api/health`
   - Should see: `{"status":"ok","timestamp":"...","environment":"development"}`

2. Open: `register.html` in browser (or via Live Server on port 5500)
3. Create a test account
4. Login and play!

## ✅ Verification Checklist

- [ ] Neon account created
- [ ] Project "space-strike" created
- [ ] Connection string copied
- [ ] `.env` file configured with correct credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Database initialized (`npm run setup`)
- [ ] Backend started (`npm start`)
- [ ] Health check working
- [ ] Test account created successfully

## 🐛 Troubleshooting

### "npm install hangs"
- Install packages one at a time (see Step 6)
- Or try: `npm install --prefer-offline`

### "Database connection failed"
- Double-check your connection string breakdown
- Ensure `DB_SSL=true` is set
- Verify no typos in `.env` file
- Check Neon project is "Active" in dashboard

### "ENOTFOUND" error
- Check `DB_HOST` - should be full Neon hostname
- Ensure internet connection is working
- Try pinging the host

### "Password authentication failed"
- Verify `DB_PASSWORD` matches exactly
- Check for extra spaces in `.env`
- Try resetting password in Neon dashboard

### "Database does not exist"
- Check `DB_NAME=neondb` (Neon's default)
- Or create database in Neon SQL Editor

## 🎯 What's Next?

After successful setup:
1. Create multiple test accounts
2. Play games and check data persists
3. View data in Neon SQL Editor
4. Check leaderboard functionality
5. Deploy to production (see DEPLOYMENT_GUIDE.md)

## 🔍 View Your Data in Neon

1. Go to Neon dashboard
2. Click "SQL Editor"
3. Run queries:

```sql
-- See all users
SELECT username, email, created_at FROM users;

-- See leaderboard
SELECT * FROM global_leaderboard WHERE game_mode = 'quick_play' LIMIT 10;

-- Check a specific user's data
SELECT u.username, pp.coins, pp.level, pp.xp, pp.selected_fighter
FROM player_profiles pp
JOIN users u ON pp.user_id = u.user_id
WHERE u.username = 'your_username';
```

## 📞 Need Help?

- **Neon Docs:** https://neon.tech/docs
- **Neon Discord:** https://discord.gg/neon
- **Check:** `backend/SETUP.md` for more troubleshooting

## 🎉 You're All Set!

Once you see "Database setup complete" and backend is running, you have a fully functional multi-user game backend with:
- ✅ Secure password hashing (bcrypt)
- ✅ Session-based authentication
- ✅ Cloud database storage
- ✅ Global leaderboards
- ✅ Progress sync
- ✅ Multi-user support

**Time to play!** 🚀
