# SPACE STRIKE Backend

## Quick Start (If dependencies are installed)

1. Ensure PostgreSQL is running and database is created
2. Copy `.env.example` to `.env` and configure
3. Run `npm start`
4. Backend will be available at `http://localhost:3000`

## If NPM Install Fails

The npm install may hang due to network issues. Here are solutions:

### Solution 1: Install packages individually
```powershell
npm install express
npm install pg
npm install bcrypt
npm install express-session
npm install cors
npm install dotenv
```

### Solution 2: Use cached packages
```powershell
npm cache clean --force
npm install --prefer-offline
```

### Solution 3: Increase timeout
```powershell
npm install --fetch-timeout=60000
```

### Solution 4: Use different registry
```powershell
npm install --registry=https://registry.npmjs.org/
```

## Project Structure

```
backend/
├── server.js              # Main Express application
├── config/
│   └── database.js        # PostgreSQL connection pool
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── player.js          # Player profile/progress endpoints
│   └── game.js            # Game results/leaderboard endpoints
├── middleware/
│   └── auth.js            # Authentication middleware
├── database/
│   └── schema.sql         # PostgreSQL database schema
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
└── .gitignore             # Git ignore rules

```

## API Documentation

See `SETUP.md` for complete API endpoint documentation.

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Session-based authentication
- ✅ HTTP-only cookies
- ✅ CORS protection
- ✅ SQL injection protection (parameterized queries)
- ✅ Input validation
- ✅ Account status checking
- ✅ Environment variable configuration

## Database Features

- ✅ User authentication with bcrypt
- ✅ Player profiles with coins/XP/level
- ✅ Chapter and level progression tracking
- ✅ Unlockable fighters
- ✅ Inventory system
- ✅ Game results history
- ✅ Global leaderboard view
- ✅ Session management
- ✅ Automatic triggers for new user setup
- ✅ Indexes for query performance

## Tech Stack

- **Runtime:** Node.js 24.20.0
- **Framework:** Express.js
- **Database:** PostgreSQL 12+
- **Authentication:** bcrypt + express-session
- **Language:** JavaScript (ES6+)
