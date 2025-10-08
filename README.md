# AI-Powered Brainstorming Board

A Trello/Notion-style brainstorming board with AI-powered features for enhanced creativity and organization.

## Features

### Core Features
- User authentication (email/username based)
- Drag-and-drop card management
- Multi-column board organization
- Real-time persistence with MongoDB
- Responsive, intuitive UI

### AI Features
- **Idea Suggestions**: Get 2-3 AI-generated related ideas when creating cards
- **Smart Clustering**: Automatic grouping of similar ideas using AI embeddings
- **Board Summarization**: One-click AI summary of key themes and insights
- **Mood Analysis**: Sentiment analysis for each card (positive/neutral/negative)
- **Semantic Search**: AI-powered search across your ideas

### Bonus Features
- Multi-user shared boards for collaborative brainstorming
- Export boards as Markdown or PDF with AI summaries
- Real-time updates for shared sessions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Beautiful DnD for drag-and-drop
- Axios for API communication
- Deployed on Vercel

### Backend
- Node.js with Express
- MongoDB Atlas for database
- JWT authentication
- Google Gemini API for AI features
- Deployed on Vercel Serverless Functions

### AI Integration
- Google Gemini 1.5 Flash for suggestions and summaries
- Google Embedding Model for clustering and search
- Sentiment analysis for mood detection

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Google AI API key

### Environment Variables

Create `.env` file in the server directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_API_KEY=your_google_ai_api_key
NODE_ENV=development
```

Create `.env.local` file in the client directory:

```env
VITE_API_URL=http://localhost:5000
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nbTask
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Start MongoDB (if running locally) or ensure MongoDB Atlas is configured

5. Start the development servers:

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

6. Open your browser to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PUT /api/cards/:id/move` - Move card between columns

### AI Features
- `POST /api/ai/suggest` - Get AI idea suggestions
- `POST /api/ai/cluster` - Cluster board ideas
- `POST /api/ai/summarize` - Generate board summary
- `POST /api/ai/analyze-mood` - Analyze card sentiment
- `POST /api/ai/search` - Semantic search

## Project Structure

```
nbTask/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (auth, board)
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `feature/*` - Feature branches

### Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes
- `test:` - Test additions

## Deployment

### Frontend (Vercel)
```bash
cd client
vercel --prod
```

### Backend (Vercel)
```bash
cd server
vercel --prod
```

## Demo Video

[Demo Video Link]

## Contributing

1. Create a feature branch
2. Make your changes
3. Write clean, modular code
4. Test thoroughly
5. Submit pull request

## License

MIT

## Author

Built as part of AI-Powered Brainstorming Board assessment.
