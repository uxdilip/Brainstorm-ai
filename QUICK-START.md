# Quick Reference Cheat Sheet

## Environment Setup (First Time Only)

### 1. Get MongoDB Atlas URI
```
1. Visit: https://cloud.mongodb.com
2. Sign up (free)
3. Create Cluster → Connect → Connect Application
4. Copy connection string
5. Replace <password> with your DB password
```

### 2. Get Google AI API Key
```
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
```

### 3. Configure Environment

**server/.env**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/brainstorm
JWT_SECRET=change_this_to_something_random_and_secure
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
NODE_ENV=development
PORT=5000
```

**client/.env.local**
```env
VITE_API_URL=http://localhost:5000
```

## Daily Development

### Terminal 1: Backend
```bash
cd server
npm run dev
```
Runs on http://localhost:5000

### Terminal 2: Frontend
```bash
cd client
npm run dev
```
Runs on http://localhost:5173

## Testing the App

### 1. Register/Login
- Use real email format (validation enabled)
- Password min 6 characters
- Token auto-saved in localStorage

### 2. Create Cards
- Click "Add Card" in any column
- Title required, description optional
- AI suggestions appear in ~2-3 seconds

### 3. Use AI Features

**Get Suggestions:**
- Automatically triggered on card creation
- View in "Ideas" tab in sidebar
- Click "Add to Board" to use them

**Cluster Ideas:**
- Need at least 2 cards
- Click "Cluster" button
- See colored backgrounds on grouped cards

**Summarize Board:**
- Click "Summarize" button
- Switch to "Summary" tab
- View markdown-formatted insights

**Search:**
- Switch to "Search" tab
- Type query, hit Enter or click search
- See semantically related cards

**Export:**
- Click download icon
- Gets board-export.md file
- Contains summary + suggestions

## Git Workflow

### View Status
```bash
git status
git log --oneline
```

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Make Changes & Commit
```bash
git add .
git commit -m "feat: add new feature"
```

### Merge to Main
```bash
git checkout main
git merge feature/my-feature
```

### Push to Remote (if you have one)
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

## Common Issues & Fixes

### Backend won't start
```bash
Check MongoDB connection
Verify Google API key
Kill process on port 5000: lsof -ti:5000 | xargs kill
```

### Frontend won't load
```bash
Clear browser cache
Check console for errors
Verify API URL in .env.local
```

### AI not working
```bash
Check Google API key is valid
Check quota: https://makersuite.google.com
View server logs for errors
```

### Database connection error
```bash
Verify MongoDB Atlas:
- IP whitelist (0.0.0.0/0 for testing)
- Correct password in connection string
- Cluster is running (not paused)
```

## API Testing with Thunder Client / Postman

### 1. Register User
```
POST http://localhost:5000/api/auth/register
Body: {"username":"test","email":"test@test.com","password":"test123"}
```

### 2. Login (Get Token)
```
POST http://localhost:5000/api/auth/login
Body: {"email":"test@test.com","password":"test123"}
Save token from response!
```

### 3. Get Boards (Use Token)
```
GET http://localhost:5000/api/boards
Headers: Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Create Card
```
POST http://localhost:5000/api/cards
Headers: Authorization: Bearer YOUR_TOKEN_HERE
Body: {
  "columnId": "COLUMN_ID_FROM_BOARD",
  "boardId": "BOARD_ID",
  "title": "Test Card",
  "description": "Testing"
}
```

## Deployment Quick Start

### Deploy Backend
```bash
cd server
npm install -g vercel
vercel login
vercel --prod
```

### Deploy Frontend
```bash
cd client
vercel --prod
```

### Set Environment Variables in Vercel
```
Dashboard → Project → Settings → Environment Variables
Add all vars from .env files
```

## File Structure Quick Reference

```
nbTask/
├── server/src/
│   ├── controllers/  - Request handlers
│   ├── models/       - MongoDB schemas
│   ├── routes/       - API endpoints
│   ├── services/     - AI logic
│   └── server.ts     - App entry
│
├── client/src/
│   ├── components/   - React components
│   ├── context/      - State management
│   ├── services/     - API client
│   └── types/        - TypeScript types
│
├── README.md         - Project overview
├── SETUP.md          - Detailed setup
├── DEVELOPMENT.md    - Dev guide
└── DEMO-SCRIPT.md    - Video script
```

## Keyboard Shortcuts in App

- **Esc** - Close modals
- **Enter** - Submit forms
- **Tab** - Navigate forms

## Browser DevTools

### Check Authentication
```
Application → Local Storage → http://localhost:5173
Look for 'token' key
```

### Check API Calls
```
Network tab → Filter: XHR
See all API requests/responses
```

### Check Errors
```
Console tab
Look for red errors
```

## Performance Tips

1. **Embeddings cached** - Only generated once per card
2. **AI responses** - Usually 1-3 seconds
3. **Drag performance** - Smooth with hardware acceleration
4. **Database queries** - Indexed for speed

## Security Checklist

- ✅ Passwords hashed (bcrypt)
- ✅ JWT tokens expire (7 days)
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ MongoDB auth enabled
- ✅ Input validation on server

## Next Steps After Setup

1. ✅ Create account
2. ✅ Add 5+ diverse cards
3. ✅ Test drag and drop
4. ✅ Try all AI features
5. ✅ Refresh page to verify persistence
6. ✅ Create second board
7. ✅ Export board
8. ✅ Test search
9. ✅ Record demo video
10. ✅ Deploy to production

## Support Resources

- **MongoDB Docs:** https://www.mongodb.com/docs/
- **Google AI Docs:** https://ai.google.dev/docs
- **React Docs:** https://react.dev/
- **Express Docs:** https://expressjs.com/
- **Tailwind Docs:** https://tailwindcss.com/docs

## Demo Checklist

Before recording:
- [ ] Clear browser cache
- [ ] Test all features work
- [ ] Prepare interesting test data
- [ ] Check internet connection
- [ ] Close unnecessary apps
- [ ] Zoom browser for readability
- [ ] Practice run-through once

## Evaluation Self-Check

- [ ] User authentication works
- [ ] Cards can be added/edited/deleted
- [ ] Drag-drop between columns works
- [ ] Board persists on refresh
- [ ] AI suggestions appear
- [ ] Clustering groups similar cards
- [ ] Summary generates insights
- [ ] At least one bonus feature works
- [ ] UI is clean and responsive
- [ ] Code is modular and clean

## Emergency Contacts

If stuck, check:
1. This cheat sheet
2. SETUP.md for detailed steps
3. DEVELOPMENT.md for architecture
4. Server console for errors
5. Browser console for frontend errors
6. MongoDB Atlas dashboard for DB issues
7. Google AI Studio for API quota

---

**Remember:** The app is complete! Just need to configure your own API keys and MongoDB connection.

**Time to complete setup:** ~15 minutes
**Time to test all features:** ~10 minutes
**Time to record demo:** ~10 minutes

**Total time investment:** ~35 minutes

You've got this! 🚀
