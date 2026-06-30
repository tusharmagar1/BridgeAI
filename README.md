# 🌉 BridgeAI — Multilingual AI Chatbot

A fast, beautiful, multilingual AI chatbot powered by **GroqCloud** (Llama 3.3 70B), **MySQL**, and **Redis**.

![BridgeAI Screenshot](screenshot.png)

## ✨ Features

- 🌍 **Auto Language Detection** — No manual language selection needed
- ⚡ **Ultra-Fast Streaming** — 800+ tokens/sec via GroqCloud LPU
- 💬 **Real-time Chat** — Word-by-word streaming with smooth animations
- 🎨 **Glassmorphism UI** — Modern, premium design with Framer Motion animations
- 🗣️ **Voice Ready** — Whisper STT + TTS integration prepared
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🔒 **Rate Limited** — Redis-backed request throttling
- 🧠 **Context Memory** — Full conversation history in MySQL

## 🏗 Architecture

```
Frontend (React 19 + Vite + Tailwind + Framer Motion)
    ↓
Backend (Node.js + Express)
    ↓
GroqCloud API (Llama 3.3 70B / 3.1 8B)
    ↓
MySQL (conversations + messages)
Redis (sessions + translation cache)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MySQL (you already have this!)
- Redis (you already have this at `G:\Doc\Redis`)
- GroqCloud API Key ([Get free key](https://console.groq.com/keys))

### 1. Clone & Setup

```bash
git clone <your-repo>
cd bridgeai
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# 1. Copy the environment template to create your local environment file
cp .env.example .env

# 2. Open backend/.env and fill in your actual credentials.
#    - Never commit the backend/.env file to version control.
#    - Keep backend/.env.example updated with placeholders only.

# 3. Run database migrations
npm run db:migrate

# 4. Start backend
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📁 Project Structure

```
bridgeai/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & Redis config
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (Groq, Chat)
│   │   ├── middleware/     # Rate limiting, auth
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript types
│   │   └── lib/            # Utilities
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/conversations` | Create new conversation |
| GET | `/api/chat/conversations/:userId` | List user's conversations |
| GET | `/api/chat/conversations/:id/messages` | Get conversation messages |
| POST | `/api/chat/conversations/:id/chat` | Stream chat (SSE) |
| PATCH | `/api/chat/messages/:id/feedback` | Rate message |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js 20, Express |
| Database | MySQL |
| Cache | Redis |
| AI API | GroqCloud (OpenAI-compatible) |
| State | Zustand |
| Icons | Lucide React |

## 🎯 Next Steps

1. ✅ **MVP** — Basic chat with streaming
2. 🔄 **Voice** — Whisper STT + TTS
3. 🔄 **RAG** — Document upload & knowledge base
4. 🔄 **Auth** — User authentication
5. 🔄 **Mobile** — PWA support

## 🌐 Deployment

When deploying the application to production:
1. Set `NODE_ENV=production` in the backend environment.
2. Set `FRONTEND_URL` to the fully qualified domain name of your deployed frontend (e.g., `https://your-app.com`). The backend will validate this at startup and use it to configure CORS securely.

## 📝 License

MIT

---

Built with ❤️ by Tushar Magar
