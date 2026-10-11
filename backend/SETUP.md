# SPACE STRIKE Backend Setup Guide

## Prerequisites
✅ Node.js v24.20.0 (installed)
✅ npm 11.19.0 (installed)
❓ PostgreSQL database (required)

## Installation Steps

### 1. Install Node.js Dependencies

**Open PowerShell/Terminal in the backend directory** and run:

```powershell
cd "C:\Users\User\OneDrive\Desktop\SPACE FIGHTER\backend"
npm install express pg bcrypt express-session cors dotenv
```

This installs:
- `express` - Web framework
- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `express-session` - Session management
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation, remember the password you set for the `postgres` user
3. After installation, open pgAdmin or use `psql` command line
4. Create a new database:
   ```sql
   CREATE DATABASE space_strike;
   ```

**Option B: Cloud Database (Recommended for deployment)**
- ElephantSQL (free tier): https://www.elephantsql.com/
- Supabase (free tier): https://supabase.com/
- Neon (free tier): https://neon.tech/

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=space_strike
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here
   
   SESSION_SECRET=your_random_secret_string_change_this
   
   PORT=3000
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:5500
   ```

### 4. Initialize Database Schema

Run the SQL schema file in PostgreSQL:

**Using psql:**
```powershell
psql -U postgres -d space_strike -f database\schema.sql
```

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to your server
3. Open the `space_strike` database
4. Click Tools > Query Tool
5. Open `database/schema.sql` and execute it

### 5. Start the Backend Server

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

### 6. Test the Backend

Open your browser and visit:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-10-08T...",
  "environment": "development"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check session status

### Player Data
- `GET /api/player/profile` - Get player profile
- `PUT /api/player/profile` - Update profile
- `GET /api/player/progress` - Get chapter/level progress
- `PUT /api/player/progress` - Update progress
- `GET /api/player/fighters` - Get unlocked fighters
- `POST /api/player/fighters` - Unlock new fighter
- `GET /api/player/inventory` - Get inventory
- `PUT /api/player/inventory` - Update inventory
- `PUT /api/player/coins` - Update coins

### Game Results
- `POST /api/game/result` - Submit game result
- `GET /api/game/history` - Get player's game history
- `GET /api/game/leaderboard` - Get global leaderboard
- `GET /api/game/rank` - Get player's rank

## Troubleshooting

### npm install hangs
- Try: `npm cache clean --force` then retry
- Check internet connection
- Try installing packages one by one

### Database connection error
- Verify PostgreSQL is running
- Check credentials in `.env` file
- Ensure database `space_strike` exists
- Check firewall settings

### Port 3000 already in use
- Change `PORT=3000` to another port in `.env`
- Or kill the process using port 3000:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <process_id> /F
  ```

## Next Steps

After backend is running:
1. Open `register.html` in browser to create accounts
2. Test with two different accounts to verify isolation
3. Play the game and verify data saves to database
4. Check leaderboard functionality

## Security Notes

**⚠️ Before deploying to production:**
1. Change `SESSION_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Enable HTTPS (set `cookie.secure = true`)
4. Use strong database passwords
5. Configure CORS to only allow your frontend domain
6. Never commit `.env` file to git (already in `.gitignore`)
