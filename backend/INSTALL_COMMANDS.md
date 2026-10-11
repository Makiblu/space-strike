# 🚀 Manual Installation Commands

Your `.env` file is already configured with Neon credentials!

## Run These Commands in PowerShell

Open PowerShell and run these commands **one at a time**:

### 1. Navigate to Backend Directory
```powershell
cd "C:\Users\User\OneDrive\Desktop\SPACE FIGHTER\backend"
```

### 2. Install Dependencies (one by one to avoid timeout)
```powershell
npm install express
npm install pg
npm install bcrypt
npm install express-session
npm install cors
npm install dotenv
```

**Each package should take 10-30 seconds. If any hangs, press Ctrl+C and try again.**

### 3. Initialize Database
```powershell
npm run setup
```

**Expected output:**
```
🚀 SPACE STRIKE Database Setup
================================
📡 Connecting to database...
✅ Connected to database
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

### 4. Start Backend Server
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

### 5. Test in Browser

Open: `http://localhost:3000/api/health`

Should see:
```json
{
  "status": "ok",
  "timestamp": "2026-10-08T...",
  "environment": "development"
}
```

### 6. Test Registration

Open `register.html` in your browser and create a test account!

---

## 🐛 Troubleshooting

### If npm install still hangs:
Try with increased timeout:
```powershell
npm install express --fetch-timeout=60000
```

Or use yarn instead:
```powershell
npm install -g yarn
yarn add express pg bcrypt express-session cors dotenv
```

### If database connection fails:
Your credentials are already configured! Check:
- Neon project is active in dashboard
- Internet connection is working
- No firewall blocking connection

---

## ✅ Your Current Configuration

```
DB_HOST=ep-broad-forest-b32nhroo-pooler.c-4.ap-southeast-1.aws.neon.tech
DB_USER=neondb_owner
DB_NAME=neondb
DB_SSL=true (required for Neon)
```

Everything is configured - you just need to install packages!
