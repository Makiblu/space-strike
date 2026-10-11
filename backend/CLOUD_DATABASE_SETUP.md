# Cloud Database Setup with Neon (Recommended)

Neon is a serverless PostgreSQL database that's perfect for SPACE STRIKE. It's **free**, fast, and requires no installation.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Neon Account

1. Go to **https://neon.tech/**
2. Click **"Sign Up"** (free - no credit card required)
3. Sign up with GitHub, Google, or email

### Step 2: Create Database

1. After signing in, click **"Create a project"**
2. **Project name:** `space-strike`
3. **PostgreSQL version:** 16 (latest)
4. **Region:** Choose closest to you (e.g., US East for faster response)
5. Click **"Create Project"**

### Step 3: Get Connection String

After creation, you'll see a **Connection Details** panel with a connection string like:

```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Configure Backend

1. Open `backend\.env` file (create it by copying `.env.example`)
2. Parse the connection string and fill in:

```env
# Database Configuration (from Neon connection string)
DB_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=username_from_connection_string
DB_PASSWORD=password_from_connection_string
DB_SSL=true

# Session Configuration
SESSION_SECRET=change_this_to_a_random_secret_string_minimum_32_chars

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5500
```

**Example breakdown of connection string:**
```
postgresql://myuser:mypass123@ep-cool-sun-12345.us-east-2.aws.neon.tech/neondb?sslmode=require

DB_HOST=ep-cool-sun-12345.us-east-2.aws.neon.tech
DB_USER=myuser
DB_PASSWORD=mypass123
DB_NAME=neondb
DB_SSL=true
```

### Step 5: Install Dependencies

```powershell
cd "C:\Users\User\OneDrive\Desktop\SPACE FIGHTER\backend"
npm install express pg bcrypt express-session cors dotenv
```

### Step 6: Initialize Database Schema

```powershell
node setup-database.js
```

You should see:
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
   - game_results
   - player_fighters
   - player_inventory
   - player_profiles
   - player_progress
   - sessions
   - users

🎉 Database setup complete!
```

### Step 7: Start Backend

```powershell
npm start
```

You should see:
```
🚀 SPACE STRIKE Backend running on port 3000
📡 Environment: development
🔗 Frontend URL: http://localhost:5500
✅ Health check: http://localhost:3000/api/health
```

### Step 8: Test

1. Visit: http://localhost:3000/api/health
2. Open: `register.html` in browser
3. Create test account
4. Check Neon dashboard to see data

## ✅ Advantages of Neon

- ✅ **Free tier:** 0.5 GB storage, 1 compute unit
- ✅ **No installation:** Cloud-hosted, nothing to install
- ✅ **Automatic backups:** Built-in
- ✅ **Fast:** High-performance SSD storage
- ✅ **SSL/TLS:** Secure by default
- ✅ **Auto-scaling:** Scales to zero when not in use (saves resources)
- ✅ **Easy deployment:** Works with Vercel, Netlify, etc.

## 🔧 Neon Dashboard Features

In your Neon dashboard you can:
- **SQL Editor:** Run queries directly
- **Metrics:** Monitor database performance
- **Connection pooling:** Enable for better performance
- **Branches:** Create dev/staging/prod environments
- **Backups:** Point-in-time recovery

## 🌐 Alternative Cloud Databases

If Neon doesn't work for you:

### ElephantSQL (https://www.elephantsql.com/)
- Free tier: 20 MB storage
- Very simple setup
- Good for small projects

### Supabase (https://supabase.com/)
- Free tier: 500 MB storage
- Includes authentication and real-time features
- Good for larger projects

### Railway (https://railway.app/)
- Free tier: 512 MB storage
- Simple PostgreSQL deployment
- Good for hobbyists

## 🔐 Security Tips

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use strong passwords** - Generate random ones
3. **Rotate secrets** - Change SESSION_SECRET regularly
4. **Enable 2FA** - On your Neon account
5. **Monitor logs** - Check for suspicious activity

## 📊 Database Management

### View data in Neon:
1. Go to Neon dashboard
2. Click "SQL Editor"
3. Run queries:
```sql
-- See all users
SELECT * FROM users;

-- See leaderboard
SELECT * FROM global_leaderboard WHERE game_mode = 'quick_play' LIMIT 10;

-- Check player progress
SELECT u.username, pp.coins, pp.level, pp.xp 
FROM player_profiles pp 
JOIN users u ON pp.user_id = u.user_id;
```

### Reset database:
```powershell
node setup-database.js
```
This will drop and recreate all tables.

## 🚀 Ready for Production

When you're ready to deploy:
1. Set `NODE_ENV=production` in `.env`
2. Update `FRONTEND_URL` to your actual domain
3. Enable connection pooling in Neon
4. Consider upgrading to Neon Pro for better performance
5. Set up monitoring and alerts

## 📞 Need Help?

- **Neon Docs:** https://neon.tech/docs/introduction
- **Neon Discord:** https://discord.gg/neon
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
