````markdown
# 🚀 BrainStorm AI

An intelligent brainstorming board with AI-powered features for enhanced creativity and organization. Built with React, Node.js, and Groq AI.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure JWT-based authentication
- 📋 **Multi-Board Management** - Create and manage multiple boards
- 🎯 **Drag & Drop** - Smooth card movement with @dnd-kit
- 💾 **Real-time Persistence** - MongoDB Atlas integration
- 🎨 **Notion-Inspired UI** - Clean, modern, and responsive design

### AI Features (Powered by Groq)
- 💡 **Idea Suggestions** - Get AI-generated related ideas for your cards
- 🎯 **Smart Clustering** - Automatic grouping of similar ideas using embeddings
- 📊 **Board Summarization** - AI-powered insights, themes, and next steps
- 😊 **Mood Analysis** - Sentiment analysis for each card
- 🔍 **Semantic Search** - Find cards by meaning, not just keywords

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing fast development
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop
- **React Context** for state management

### Backend
- **Node.js** with Express & TypeScript
- **MongoDB Atlas** for database
- **JWT** for authentication
- **Groq AI** (llama-3.1-8b-instant) for AI features
- **Custom embeddings** with TF-IDF and stemming

### AI Integration
- **Groq SDK** for fast AI responses (llama-3.1-8b-instant)
- **Custom hash-based embeddings** (384D vectors with TF-IDF)
- **Hierarchical clustering** for idea grouping
- **Cosine similarity** for semantic search

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works!)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd nbTask
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

2. **Set up environment variables:**

   Create `server/.env`:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string
   GROQ_API_KEY=your_groq_api_key
   PORT=5001
   ```

   Create `client/.env.local`:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

3. **Start development servers:**

   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

4. **Open your browser:** `http://localhost:5173`

## 📁 Project Structure

```
nbTask/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AuthForm.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BoardView.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Column.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── context/       # React context
│   │   │   ├── AuthContext.tsx
│   │   │   └── BoardContext.tsx
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── boardController.ts
│   │   │   ├── cardController.ts
│   │   │   └── aiController.ts
│   │   ├── models/        # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Board.ts
│   │   │   ├── Column.ts
│   │   │   └── Card.ts
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   │   └── aiService.ts
│   │   ├── middleware/    # Auth & error handling
│   │   └── server.ts
│   └── package.json
│
└── README.md             # This file
```

## 🎯 Key Features Explained

### 1. Smart Clustering
Automatically groups similar ideas using custom embeddings:
- **Hash-based 384D vectors** with TF-IDF weighting
- **Word stemming** for better matching (e.g., "deforestation" → "forest")
- **N-gram support** (bi-grams, tri-grams) for better context
- **Hierarchical agglomerative clustering** algorithm
- **Adjustable similarity threshold** (0.2-0.95) via UI slider

### 2. Board Summarization
Hybrid approach combining programmatic analysis + AI:
- **Keyword extraction** with frequency analysis
- **Theme detection** from card content
- **Mood distribution** statistics (positive/neutral/negative)
- **AI-generated insights** for top ideas and next steps
- **Markdown export** for easy sharing

### 3. Semantic Search
Find cards by meaning, not just keywords:
- **Custom embedding generation** for each card on creation
- **Cosine similarity** comparison for relevance
- **Low threshold (0.2)** optimized for hash embeddings
- **Force regeneration** ensures up-to-date search results

### 4. Drag & Drop
Smooth, Trello-style workflow:
- **@dnd-kit** library for performance
- **Trello-inspired workflow** - only "Ideas" column has "Add Card" button
- **Drag overlay** for visual feedback during drag
- **Touch-friendly** for mobile devices

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user
```

### Boards
```
GET    /api/boards           # Get all user boards
POST   /api/boards           # Create new board
GET    /api/boards/:id       # Get specific board with columns & cards
PUT    /api/boards/:id       # Update board name
DELETE /api/boards/:id       # Delete board
```

### Cards
```
POST   /api/cards            # Create card (auto-triggers AI suggestions)
PUT    /api/cards/:id        # Update card
DELETE /api/cards/:id        # Delete card
PUT    /api/cards/:id/move   # Move card between columns
```

### AI Features
```
POST   /api/ai/suggest       # Get 3 related idea suggestions
POST   /api/ai/cluster       # Cluster board cards by similarity
POST   /api/ai/summarize     # Generate structured board summary
POST   /api/ai/mood          # Analyze card sentiment
POST   /api/ai/search        # Semantic search across cards
```

## 🎨 UI Design

The UI is inspired by Notion's clean aesthetic:

### Color Palette
- **Primary Blue:** `#2383e2` (buttons, active states, links)
- **Background:** `#f7f6f3` (warm beige for main area)
- **Text Colors:**
  - Primary: `#37352f`
  - Secondary: `#787774`
  - Tertiary: `#9b9a97`
- **Borders:** `#e9e9e7` (subtle gray)
- **Hover States:** `#f1f1ef` (light gray), `#1a73cf` (darker blue)
- **Active Tabs:** `#e5f2ff` (light blue background)

### Design Principles
- **Clean typography** with proper hierarchy
- **Consistent spacing** (4px grid system)
- **Subtle shadows** for depth without distraction
- **Smooth animations** (200ms transitions)
- **Responsive layout** from mobile to desktop

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create/edit/delete boards
- [ ] Add cards in Ideas column
- [ ] Drag cards between columns
- [ ] AI suggestions appear for new cards
- [ ] Clustering groups similar ideas (threshold: 0.3)
- [ ] Summary generates structured insights
- [ ] Semantic search finds relevant cards
- [ ] Mood detection shows correct sentiment
- [ ] Export board as Markdown
- [ ] Responsive on mobile (< 768px)

### API Testing with curl
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login (save the token)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Create board (use token from login)
curl -X POST http://localhost:5001/api/boards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Test Board"}'
```

## 🚢 Deployment

### Environment Variables (Production)
Set these in your deployment platform (Vercel, Railway, etc.):

```env
# Backend
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secure_random_string_here
GROQ_API_KEY=gsk_...
NODE_ENV=production
PORT=5001

# Frontend
VITE_API_URL=https://your-backend-url.vercel.app
```

### Vercel Deployment
```bash
# Frontend
cd client
npm install -g vercel
vercel login
vercel --prod

# Backend
cd server
vercel --prod
```

### Other Platforms
- **Railway:** Connect GitHub repo, set env vars, deploy
- **Render:** Add web service, set env vars, deploy
- **Heroku:** `git push heroku main`

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- ✅ Check MongoDB connection string format
- ✅ Verify Groq API key at [console.groq.com](https://console.groq.com)
- ✅ Kill existing process: `lsof -ti:5001 | xargs kill -9`
- ✅ Check `.env` file exists in `server/` directory

**Frontend won't load:**
- ✅ Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- ✅ Check `VITE_API_URL` in `client/.env.local`
- ✅ Open browser DevTools Console for errors
- ✅ Verify backend is running on port 5001

**AI features not working:**
- ✅ Verify Groq API key is valid (check quota)
- ✅ Check server terminal for error logs
- ✅ Ensure cards have substantial content (> 10 words)
- ✅ Try regenerating embeddings (delete and recreate card)

**Clustering creates too many groups:**
- ✅ Lower the similarity threshold (try 0.2-0.3)
- ✅ Ensure cards have enough descriptive content
- ✅ Check embeddings are generated (see server logs)
- ✅ Try with semantically related cards

**Search returns no results:**
- ✅ Threshold should be 0.2 (low for hash embeddings)
- ✅ Check card embeddings exist in database
- ✅ Try different/broader search terms
- ✅ Ensure cards have been created after last code update

**MongoDB connection issues:**
- ✅ Whitelist IP: 0.0.0.0/0 (or your IP) in Atlas
- ✅ Check password doesn't have special characters needing encoding
- ✅ Verify cluster is not paused in MongoDB Atlas
- ✅ Test connection string with MongoDB Compass

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with clear, descriptive commits
4. Test thoroughly (all features should work)
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request with detailed description

### Commit Convention
- `feat:` - New feature (e.g., `feat: add dark mode`)
- `fix:` - Bug fix (e.g., `fix: resolve drag-drop glitch`)
- `refactor:` - Code refactoring (e.g., `refactor: optimize clustering algorithm`)
- `docs:` - Documentation changes (e.g., `docs: update API endpoints`)
- `style:` - Code style changes (e.g., `style: format with prettier`)
- `test:` - Test additions (e.g., `test: add auth integration tests`)

## 📖 Documentation

- **[docs/SEMANTIC-SEARCH-FEATURE.md](./docs/SEMANTIC-SEARCH-FEATURE.md)** - Search implementation details
- **[docs/BOARD-SUMMARY-FEATURE.md](./docs/BOARD-SUMMARY-FEATURE.md)** - Summary feature architecture
- **[docs/DRAG-DROP-ANALYSIS.md](./docs/DRAG-DROP-ANALYSIS.md)** - Drag & drop implementation
- **[docs/UI-REDESIGN-TRELLO-INSPIRED.md](./docs/UI-REDESIGN-TRELLO-INSPIRED.md)** - UI design decisions

## 📄 License

MIT License - feel free to use this project for learning or building your own applications.

## 🙏 Acknowledgments

- **[Groq](https://groq.com/)** for blazing fast AI inference
- **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** for reliable database hosting
- **[Vercel](https://vercel.com/)** for seamless deployment
- **[@dnd-kit](https://dndkit.com/)** for smooth drag-and-drop
- **[Notion](https://notion.so/)** for UI design inspiration

## 🎯 Development Roadmap

### Planned Features
- [ ] Real-time collaboration with WebSockets
- [ ] Board templates for common use cases
- [ ] Advanced filtering and sorting
- [ ] Card comments and discussions
- [ ] File attachments on cards
- [ ] Board activity history
- [ ] Export to PDF with AI summary
- [ ] Mobile app (React Native)

### Performance Optimizations
- [ ] Implement Redis caching for AI responses
- [ ] Add database indexing for faster queries
- [ ] Lazy loading for large boards
- [ ] WebWorkers for embedding generation
- [ ] CDN for static assets

---

Built with ❤️ using React, Node.js, TypeScript, and AI

**Questions or Issues?** Open an issue on GitHub or contact the maintainer!
