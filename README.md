# Persona-Based AI Chatbot

A working prototype of a persona-based AI chatbot that lets users have real conversations with three distinct personalities: Anshuman Singh, Abhimanyu Saxena, and Kshitij Mishra — co-founders of Scaler/InterviewBit.

## Overview

This application demonstrates prompt engineering principles by implementing three unique system prompts, each crafted to replicate the communication style, values, and teaching methodology of real people. Users can switch between personas and each persona maintains a distinct personality in the AI's responses.

## Features

✨ **Three Distinct Personas**
- **Anshuman Singh** — The First-Principles Master (Socratic method, algorithmic thinking)
- **Abhimanyu Saxena** — The System Architecture Realist (production-focused, scalability)
- **Kshitij Mishra** — The Pragmatic Full-Stack Mentor (hands-on debugging, modern frameworks)

🎨 **Clean, Responsive UI**
- Modern gradient design with dark theme
- Persona switcher with visual indicators
- Suggestion chips for quick-start questions
- Typing indicator with animated dots
- Mobile-responsive layout

💡 **Smart Features**
- Automatic conversation reset when persona switches
- Suggestion chips relevant to each persona
- Error handling with user-friendly messages
- Real-time typing indicators
- Smooth message scrolling

🔒 **Security**
- API keys stored in environment variables (never hardcoded)
- `.env.example` provided for reference
- No sensitive data committed to repository

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend:** Next.js API Routes
- **LLM:** OpenAI GPT-3.5 Turbo (easily switchable to other providers)
- **Deployment:** Vercel (or Netlify, Railway, etc.)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (or alternative LLM provider)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Persona_Based_AI_ChatBOT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your OpenAI API key
   OPENAI_API_KEY=sk-...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `OPENAI_API_KEY`
   - Deploy

3. **Your live app is now available at `your-project.vercel.app`**

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy using Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Add environment variables in Netlify dashboard**

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Backend API for chat
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main chat interface
│   └── globals.css                # Global styles
├── public/                         # Static assets
├── .env.example                    # Example environment variables
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
├── README.md                       # This file
└── prompts.md                      # System prompts documentation
```

## How It Works

### Frontend Flow
1. User selects a persona from the top switcher
2. Active persona is highlighted; conversation resets
3. User can click suggestion chips or type their question
4. Message is sent to backend API
5. Typing indicator appears while waiting for response
6. AI response is displayed with appropriate styling

### Backend Flow
1. API route receives POST request with messages and persona
2. Appropriate system prompt is prepended to messages
3. OpenAI API is called with the formatted message stack
4. Response is returned to frontend
5. Frontend displays the streamed or standard JSON response

## System Prompts

All three system prompts are documented in detail in [prompts.md](prompts.md), including:
- Persona descriptions and values
- Chain-of-thought instructions
- Few-shot examples
- Constraints and output specifications

## Troubleshooting

**Issue: "OpenAI API key not configured"**
- Ensure `.env.local` file exists with `OPENAI_API_KEY=sk-...`
- Restart the development server after adding the key

**Issue: CORS errors**
- Ensure you're using the correct API endpoint
- Check that the API route is at `/api/chat`

**Issue: Slow responses**
- OpenAI API calls may take 5-10 seconds
- Check your API rate limits
- Consider upgrading your OpenAI plan

**Issue: Mobile layout looks broken**
- Clear browser cache
- Try a different mobile device/browser

## Performance Notes

- Initial load: ~2-3 seconds (Vercel cold start)
- Subsequent loads: <500ms
- API response time: 3-8 seconds (depends on OpenAI)
- Mobile-optimized with responsive design

## Future Enhancements

- [ ] Add conversation history persistence
- [ ] Implement user authentication
- [ ] Add export conversation feature
- [ ] Support for more personas
- [ ] Streaming responses for better UX
- [ ] Dark/light theme toggle
- [ ] Analytics integration
- [ ] Rate limiting per user

## Contributing

This is an assignment project. However, feel free to fork and extend!

## Marking Rubric

This project is evaluated on:
1. **GitHub Repository** (2 pts) — Clean structure, `.env.example`, no API keys committed, clear README
2. **Live Deployment** (2 pts) — Live URL accessible, persona switching works in production
3. **Frontend Quality** (2 pts) — Clean UI, switcher works, suggestion chips present, typing indicator, mobile-friendly
4. **Backend & Prompt Quality** (2 pts) — Correct API wiring, distinct prompts, few-shot examples, CoT instruction
5. **Documentation & Reflection** (2 pts) — `prompts.md` with annotations, `reflection.md` (300-500 words)

## License

Educational project for Scaler Academy | Prompt Engineering Assignment

## Support

For issues or questions:
1. Check this README
2. Review [prompts.md](prompts.md) for system prompt details
3. Check [reflection.md](reflection.md) for design rationale

---

**Built with ❤️ for Scaler Academy | Prompt Engineering Assignment**
