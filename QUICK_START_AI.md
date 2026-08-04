# 🚀 AI Features - Quick Start Guide

## 5-Minute Setup

### 1. Get Your Claude API Key (2 minutes)
```
1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Click "API Keys" 
4. Click "Create Key"
5. Copy the key that starts with "sk-ant-"
```

### 2. Configure Environment (1 minute)
```bash
# In the server folder, create .env file
CLAUDE_API_KEY=sk-ant-your_key_here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
PORT=5000
```

### 3. Start Services (2 minutes)
```bash
# Terminal 1: Server
cd server
npm install
npm run dev

# Terminal 2: Client  
cd client
npm install
npm run dev

# Open http://localhost:5173
```

## Using AI Features

### 🐛 Explain Errors
```
Run code → See error → Click "🐛 Fix Error" → Get explanation + fix
```

### 📖 Explain Code
```
Select code in editor → Click "📖 Explain" → Get explanation
```

### ⚡ Optimize Code
```
Write code → Click "⚡ Optimize" → Get optimization suggestions
```

### 🔍 Review Code
```
Write code → Click "🔍 Review" → Get quality feedback + score
```

## Common Commands

```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build

# Check AI status
curl http://localhost:5000/api/ai/status

# Test error explanation
curl -X POST http://localhost:5000/api/ai/explain-error \
  -H "Content-Type: application/json" \
  -d '{
    "code": "let x = 1; console.log(x.toUpperCase());",
    "errorMessage": "TypeError: x.toUpperCase is not a function",
    "language": "javascript"
  }'
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| AI not available | Check CLAUDE_API_KEY in .env |
| Slow responses | Claude API might be rate limited |
| "Not found" errors | Make sure server is running on port 5000 |
| Selection not working | Click to place cursor first, then drag to select |

## Cost Example

100 students, 10 AI queries each per day:
- 1,000 requests/day
- Average cost: ~$2-5 per day
- Monthly estimate: ~$60-150

See [Anthropic Pricing](https://www.anthropic.com/pricing) for details.

---

**Next Step**: Open http://localhost:5173 and create a room! 🎉
