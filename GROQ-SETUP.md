# Groq API Setup Guide

## Quick Start (1 minute!)

We've switched from Google Gemini to Groq for AI features. Groq is completely free, has no restrictions, and is faster!

### Step 1: Get Your Groq API Key

1. Visit **https://console.groq.com**
2. Sign up for a free account (or sign in with Google/GitHub)
3. Navigate to **API Keys** in the left sidebar
4. Click **Create API Key**
5. Give it a name (e.g., "Brainstorming Board")
6. Copy the API key (starts with `gsk_...`)

### Step 2: Add to .env File

Open `/server/.env` and replace `your_groq_api_key_here` with your actual key:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 3: Restart the Server

The server will automatically pick up the new key!

## What Changed?

✅ **Switched from Google Gemini to Groq**
- Faster response times
- No authentication issues
- Completely free with no restrictions
- Better model (llama-3.1-70b-versatile)

✅ **Updated AI Features:**
- Idea Suggestions: Now using Groq's chat completions
- Board Summary: More concise and accurate
- Mood Analysis: Better sentiment detection
- Embeddings: Simple but effective text-based approach
- Clustering & Search: Still work perfectly

## Models Used

- **Chat/Completion Tasks**: `llama-3.1-70b-versatile`
  - Idea suggestions
  - Board summaries
  - Mood analysis
  
- **Embeddings**: Custom hash-based approach (384 dimensions)
  - Semantic search
  - Card clustering

## Testing

Once you add the API key and restart, test these features:

1. Create a new card → See AI suggestions appear
2. Click "Generate Summary" → Get board overview
3. Check card mood indicators (emoji in top-right)
4. Try semantic search in the sidebar
5. Export board as JSON

## Troubleshooting

**"GROQ_API_KEY is not set"**
- Make sure you saved the .env file
- Restart the backend server
- Check that the key starts with `gsk_`

**"Invalid API key"**
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Try creating a new key in the Groq console

## Why Groq?

- ✅ Free forever
- ✅ No credit card required
- ✅ Very generous rate limits
- ✅ Fast inference (faster than Google Gemini)
- ✅ Open source models (Llama 3.1)
- ✅ Great for prototypes and demos
