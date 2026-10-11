# SPACE STRIKE Deployment Guide

Complete guide to deploy SPACE STRIKE as a public multi-user game.

## 🎯 Overview

**Tech Stack:**
- Frontend: HTML5, Canvas, Vanilla JavaScript (static files)
- Backend: Node.js + Express
- Database: PostgreSQL (Neon serverless)
- Authentication: bcrypt + express-session
- Hosting: Frontend (Netlify/Vercel), Backend (Railway/Render)

## 📋 Deployment Checklist

### Phase 1: Database Setup (✅ READY)
- [ ] Create Neon account
- [ ] Create PostgreSQL database
- [ ] Configure connection in `.env`
- [ ] Run `npm run setup` to initialize schema
- [ ] Verify tables created

### Phase 2: Backend Deployment (⏳ IN PROGRESS)
- [ ] Install dependencies: `npm install`
- [ ] Test locally: `npm start`
- [ ] Deploy to Railway or Render
- [ ] Set environment variables
- [ ] Test API endpoints

### Phase 3: Frontend Integration (📝 TODO)
- [ ] Update storage.js to use backend APIs
- [ ] Add authentication check on game load
- [ ] Sync progress to database
- [ ] Test two-user isolation
- [ ] Verify leaderboard

### Phase 4: Frontend Deployment (📝 TODO)
- [ ] Deploy to Netlify or Vercel
- [ ] Update CORS settings in backend
- [ ] Update API_BASE_URL in frontend
- [ ] Test production build

### Phase 5: Testing & Launch (📝 TODO)
- [ ] Create 2+ test accounts
- [ ] Test all game modes
- [ ] Verify leaderboard updates
- [ ] Test on mobile devices
- [ ] Load testing
- [ ] Security audit

## 🗄️ Database Setup (Step-by-Step)

Follow: `backend/CLOUD_DATABASE_SETUP.md`

**Quick version:**
1. Go to https://neon.tech/ and sign up
2. Create project "space-strike"
3. Copy connection string
4. Create `backend/.env` from `.env.example`
5. Parse connection string into .env variables
6. Run: `npm run setup`

## 🖥️ Backend Deployment Options

### Option A: Railway (Recommended - Easiest)

**Why Railway:**
- ✅ Free tier: $5 credit/month (enough for small games)
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL (alternative to Neon)
- ✅ Environment variables UI
- ✅ Automatic HTTPS

**Steps:**
1. Go to https://railway.app/ and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select SPACE FIGHTER repo
4. Set root directory to `/backend`
5. Add environment variables from `.env`
6. Deploy!

### Option B: Render (Free Tier Available)

**Why Render:**
- ✅ Completely free tier (750 hours/month)
- ✅ Automatic SSL
- ✅ Easy GitHub integration

**Steps:**
1. Go to https://render.com/ and sign up
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Create service

### Option C: Heroku

**Note:** No longer has free tier, but still popular.

## 🌐 Frontend Deployment Options

### Option A: Netlify (Recommended)

**Why Netlify:**
- ✅ Free tier
- ✅ Drag-and-drop deployment
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Instant deployments

**Steps:**
1. Go to https://netlify.com/ and sign up
2. Drag and drop your project folder
3. Or connect GitHub for auto-deploy
4. Configure:
   - Build command: (none - static site)
   - Publish directory: `/`
5. Update `API_BASE_URL` in login.html and register.html to your backend URL
6. Deploy!

### Option B: Vercel

**Why Vercel:**
- ✅ Free tier
- ✅ GitHub integration
- ✅ Fast CDN
- ✅ Serverless functions support

**Steps:**
1. Go to https://vercel.com/ and sign up
2. Import project from GitHub
3. Configure:
   - Framework: Other
   - Root directory: `/`
4. Deploy!

### Option C: GitHub Pages (Free, but limited)

**Limitations:**
- Static files only
- No server-side code
- Need separate backend deployment

## 🔧 Configuration After Deployment

### 1. Update CORS in Backend

Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.netlify.app', // Your actual frontend URL
  credentials: true
}));
```

### 2. Update API URL in Frontend

Edit `login.html` and `register.html`:
```javascript
const API_BASE_URL = 'https://your-backend-domain.railway.app/api';
```

### 3. Set Production Environment

In backend `.env` or hosting platform:
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.netlify.app
```

## 🔐 Security Checklist

Before going public:
- [ ] Change `SESSION_SECRET` to strong random string (32+ chars)
- [ ] Set `NODE_ENV=production`
- [ ] Enable secure cookies (`cookie.secure = true`)
- [ ] Configure CORS to only allow your frontend domain
- [ ] Use strong database password
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Never commit `.env` file (check `.gitignore`)
- [ ] Rate limiting on auth endpoints (add middleware)
- [ ] Input sanitization (already done)
- [ ] SQL injection protection (already done - parameterized queries)

## 📊 Monitoring & Maintenance

### Backend Monitoring
- Check Railway/Render logs for errors
- Monitor database size in Neon dashboard
- Set up error alerts

### Database Maintenance
- Check for slow queries in Neon dashboard
- Monitor connection pool usage
- Enable auto-vacuum (PostgreSQL default)

### Performance Optimization
- Enable connection pooling in Neon
- Add caching for leaderboard (Redis - future)
- Optimize database indexes (already done)
- Compress assets (gzip)

## 🚀 Recommended Deployment Flow

**For fastest deployment:**

1. **Database** (5 min): Neon → Copy connection string → Configure .env → npm run setup
2. **Backend** (10 min): Railway → Connect GitHub → Set env vars → Deploy
3. **Frontend** (5 min): Netlify → Drag & drop → Update API_BASE_URL → Deploy
4. **Test** (10 min): Create accounts → Play games → Check leaderboard

**Total: ~30 minutes to live deployment**

## 🌍 Custom Domain (Optional)

### For Frontend (Netlify):
1. Buy domain (Namecheap, Google Domains, etc.)
2. In Netlify: Domain settings → Add custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

### For Backend (Railway):
1. In Railway: Settings → Domains
2. Add custom domain
3. Update DNS with CNAME record
4. Update CORS and frontend API_BASE_URL

## 🐛 Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` in backend .env
- Verify `origin` in server.js CORS config
- Ensure `credentials: true` in both frontend fetch and backend CORS

### Database Connection Failed
- Verify Neon connection string is correct
- Check `DB_SSL=true` for Neon
- Test connection with `node setup-database.js`

### Session Not Persisting
- Check `cookie.secure` setting (should match HTTPS)
- Verify `credentials: 'include'` in frontend fetch calls
- Check SESSION_SECRET is set

### 502 Bad Gateway (Backend)
- Check backend logs for errors
- Verify PORT environment variable
- Ensure backend is actually running

## 📈 Scaling Considerations

**When you outgrow free tiers:**

1. **Database:** Upgrade Neon to Pro ($19/mo)
   - More storage
   - Better performance
   - More connections

2. **Backend:** Upgrade Railway ($10-20/mo)
   - More compute resources
   - Better uptime
   - Priority support

3. **Add caching:** Redis for leaderboard/sessions
4. **Add CDN:** CloudFlare for faster asset delivery
5. **Load balancing:** Multiple backend instances

## 🎮 Launch Checklist

Before announcing:
- [ ] Test with 5+ concurrent users
- [ ] Verify all 3 game modes work
- [ ] Check leaderboard updates in real-time
- [ ] Test on desktop and mobile
- [ ] Create tutorial/help page
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] Create social media assets
- [ ] Write game description
- [ ] Test account recovery flow (future feature)

## 📞 Support Resources

- **Neon Support:** https://neon.tech/docs/introduction
- **Railway Support:** https://railway.app/help
- **Netlify Support:** https://docs.netlify.com/
- **Node.js Docs:** https://nodejs.org/docs/
- **Express Docs:** https://expressjs.com/

## 🎉 You're Ready!

Follow the steps above and SPACE STRIKE will be live for players worldwide!

**Estimated time:** 1-2 hours for complete deployment
**Cost:** $0 (using free tiers)
