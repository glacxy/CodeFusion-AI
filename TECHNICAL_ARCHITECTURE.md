# 🏗️ AI Features - Technical Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Client)                         │
│                    http://localhost:5173                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Room.jsx Component                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Monaco Editor (Code Selection Tracking)          │  │  │
│  │  │  - Text selection: selectedCode state             │  │  │
│  │  │  - onMount handler: handleEditorMount()           │  │  │
│  │  │  - Selection events captured in real-time         │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  AI Control Panel (Buttons)                        │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │ 📖 Explain  │ ⚡ Optimize │ 🔍 Review       │  │  │  │
│  │  │  │ (if selected)  │ (always)   │ (always)       │  │  │  │
│  │  │  │ 🐛 Fix Error  (if error)                     │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  │                                                      │  │  │
│  │  │  Calls: openAIPanel() → setIsAIOpen(true)           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  AIAssistantPanel (Modal)                          │  │  │
│  │  │  - isOpen state                                    │  │  │
│  │  │  - Tab navigation (error|explain|optimize|review)  │  │  │
│  │  │  - Renders active component                        │  │  │
│  │  │                                                      │  │  │
│  │  │  ┌─────────┬──────────┬──────────┬─────────────┐  │  │  │
│  │  │  │ Error   │ Explain  │Optimize  │ Review      │  │  │  │
│  │  │  │Explanation CodeExp │Analysis  │Analysis     │  │  │  │
│  │  │  └─────────┴──────────┴──────────┴─────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   aiApi.js (API Client)                  │  │
│  │                                                            │  │
│  │  Functions:                                              │  │
│  │  - checkAIStatus()     → GET /api/ai/status              │  │
│  │  - explainError()      → POST /api/ai/explain-error      │  │
│  │  - optimizeCode()      → POST /api/ai/optimize           │  │
│  │  - reviewCode()        → POST /api/ai/review             │  │
│  │  - explainCode()       → POST /api/ai/explain            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│                          ↓                                      │
│                   HTTP/HTTPS Requests                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ↓
         ↓ POST/GET Requests
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                     │
│                   http://localhost:5000                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Routes (aiRoutes.js)                     │  │
│  │                                                            │  │
│  │  GET  /api/ai/status                                     │  │
│  │  POST /api/ai/explain-error                              │  │
│  │  POST /api/ai/optimize                                   │  │
│  │  POST /api/ai/review                                     │  │
│  │  POST /api/ai/explain                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           AI Controllers (aiController.js)                │  │
│  │                                                            │  │
│  │  - getStatus()          → Check API key configured        │  │
│  │  - explainError()       → Handle error explanation        │  │
│  │  - optimizeCode()       → Handle code optimization        │  │
│  │  - reviewCode()         → Handle code review              │  │
│  │  - explainCode()        → Handle code explanation         │  │
│  │                                                            │  │
│  │  Each function:                                            │  │
│  │  1. Validates input                                        │  │
│  │  2. Checks if AI configured                               │  │
│  │  3. Calls aiService function                              │  │
│  │  4. Returns JSON response                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        AI Service (aiService.js)                          │  │
│  │                                                            │  │
│  │  - isConfigured()      → Check CLAUDE_API_KEY env var     │  │
│  │  - explainError()      → Analyze and explain errors       │  │
│  │  - optimizeCode()      → Suggest optimizations            │  │
│  │  - reviewCode()        → Review code quality              │  │
│  │  - explainCode()       → Explain code snippets            │  │
│  │  - callClaude()        → Make API calls to Claude         │  │
│  │                                                            │  │
│  │  Each function:                                            │  │
│  │  1. Constructs system prompt                              │  │
│  │  2. Constructs user message                               │  │
│  │  3. Calls callClaude()                                    │  │
│  │  4. Parses JSON response                                  │  │
│  │  5. Returns structured data                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     Environment Variables                                 │  │
│  │                                                            │  │
│  │  CLAUDE_API_KEY=sk-ant-...    (from .env file)            │  │
│  │  CLAUDE_MODEL=claude-3-5-sonnet-20241022                  │  │
│  │  (Other config: PORT, MONGO_URI, JWT_SECRET)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                        ↓                                         │
└─────────────────────────────────────────────────────────────────┘
         ↓
         ↓ HTTPS Requests (with API key in headers)
         ↓
┌─────────────────────────────────────────────────────────────────┐
│            Claude API (Anthropic)                                │
│         https://api.anthropic.com/v1/messages                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request Structure:                                              │
│  {                                                               │
│    "model": "claude-3-5-sonnet-20241022",                        │
│    "max_tokens": 2048,                                           │
│    "system": "[System prompt]",                                 │
│    "messages": [                                                 │
│      {                                                           │
│        "role": "user",                                           │
│        "content": "[User message with code]"                     │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
│                                                                  │
│  Response Structure:                                             │
│  {                                                               │
│    "content": [                                                  │
│      {                                                           │
│        "type": "text",                                           │
│        "text": "[JSON response]"                                 │
│      }                                                           │
│    ],                                                            │
│    "usage": {                                                    │
│      "input_tokens": 123,                                        │
│      "output_tokens": 456                                        │
│    }                                                             │
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Error Explanation Flow

```
User Executes Code
       ↓
   Error Occurs
       ↓
  output = { success: false, error: "...", stderr: "..." }
       ↓
  "🐛 Fix Error" button appears
       ↓
  User clicks "🐛 Fix Error"
       ↓
  Room.jsx: setIsAIOpen(true)
       ↓
  AIAssistantPanel opened with activeTab="error"
       ↓
  ErrorExplanation component renders
       ↓
  User clicks "🔍 Analyze Error"
       ↓
  explainError(code, errorMessage, language)
       ↓
  aiApi.js POST to /api/ai/explain-error
       ↓
  aiController.explainError()
       ↓
  Validation check + AI config check
       ↓
  aiService.explainError()
       ↓
  callClaude(userMessage, systemPrompt)
       ↓
  HTTPS to Claude API
       ↓
  Claude analyzes error
       ↓
  Returns JSON: { cause, location, explanation, fix, correctedCode }
       ↓
  aiService parses JSON response
       ↓
  Controller returns to frontend
       ↓
  aiApi resolves promise
       ↓
  ErrorExplanation displays results
       ↓
  User sees analysis
```

### Code Selection & Explanation Flow

```
User types code in Monaco Editor
       ↓
onMount handler sets editorRef
       ↓
User clicks and drags to select text
       ↓
Monaco emits onDidChangeCursorSelection event
       ↓
handleEditorMount captures selection
       ↓
selectedCode state updated
       ↓
"📖 Explain" button becomes enabled
       ↓
User clicks "📖 Explain"
       ↓
Room.jsx: setIsAIOpen(true)
       ↓
AIAssistantPanel opened with activeTab="explain"
       ↓
CodeExplanation component renders with selectedCode prop
       ↓
User clicks "📖 Explain This Code"
       ↓
explainCode(selectedCode, language)
       ↓
aiApi.js POST to /api/ai/explain
       ↓
aiController.explainCode()
       ↓
aiService.explainCode()
       ↓
callClaude(userMessage, systemPrompt)
       ↓
Claude explains the code
       ↓
Returns JSON: { simpleExplanation, logicBreakdown, purpose, example, keyConepts }
       ↓
CodeExplanation displays results with tags and code
       ↓
User reads explanation
```

### Code Optimization Flow

```
User types code in Monaco Editor
       ↓
User clicks "⚡ Optimize" button
       ↓
Room.jsx: setIsAIOpen(true), activeTab="optimize"
       ↓
CodeOptimization component renders
       ↓
User clicks "⚡ Optimize This Code"
       ↓
optimizeCode(code, language)
       ↓
aiApi.js POST to /api/ai/optimize
       ↓
aiController.optimizeCode()
       ↓
aiService.optimizeCode()
       ↓
callClaude analyzes complexity and performance
       ↓
Returns JSON: { timeComplexity, spaceComplexity, performanceIssues, optimizationStrategy, optimizedCode }
       ↓
CodeOptimization displays results
       ↓
User sees complexity analysis and improved code
```

---

## Component Hierarchy

```
App
└── Room.jsx (Main page)
    ├── Editor (Monaco Editor)
    │   └── Handles code and selection
    │
    ├── Tabs
    │   └── File management
    │
    ├── OutputConsole
    │   └── Execution results
    │
    ├── ChatBox
    │   └── Real-time collaboration
    │
    └── AIAssistantPanel (Modal)
        ├── State: isOpen, activeTab
        ├── Props: code, language, errorMessage, selectedCode
        │
        ├── If activeTab === "error"
        │   └── ErrorExplanation
        │       └── Calls aiApi.explainError()
        │
        ├── If activeTab === "explain"
        │   └── CodeExplanation
        │       └── Calls aiApi.explainCode()
        │
        ├── If activeTab === "optimize"
        │   └── CodeOptimization
        │       └── Calls aiApi.optimizeCode()
        │
        └── If activeTab === "review"
            └── CodeReview
                └── Calls aiApi.reviewCode()
```

---

## State Management

### Room Component State
```javascript
// Editor & Files
const [files, setFiles] = useState(initialFiles)
const [currentFile, setCurrentFile] = useState("App.jsx")
const [language, setLanguage] = useState("javascript")

// Execution
const [input, setInput] = useState("")
const [output, setOutput] = useState(null)
const [isRunning, setIsRunning] = useState(false)
const [executionTimestamp, setExecutionTimestamp] = useState(null)

// Collaboration
const [message, setMessage] = useState("")
const [messages, setMessages] = useState([])
const [roomUsers, setRoomUsers] = useState([])

// AI Features
const [isAIOpen, setIsAIOpen] = useState(false)        // Panel visibility
const [selectedCode, setSelectedCode] = useState("")   // Selected text
const editorRef = useRef(null)                         // Editor reference

// UI
const [toastMessage, setToastMessage] = useState("")
const [inviteUrl, setInviteUrl] = useState("")
```

### AIAssistantPanel State
```javascript
const [activeTab, setActiveTab] = useState("error")    // Active feature tab
const [aiAvailable, setAiAvailable] = useState(false)  // AI service status
const [loading, setLoading] = useState(true)           // Status check loading
```

### Individual Component States
Each sub-component (ErrorExplanation, etc.) manages:
```javascript
const [result, setResult] = useState(null)             // Analysis result
const [loading, setLoading] = useState(false)          // API call loading
const [error, setError] = useState(null)               // Error message
```

---

## Event Flow

### Text Selection Event Flow
```
User selects text in Monaco Editor
       ↓
Monaco Editor: onDidChangeCursorSelection event
       ↓
handleEditorMount (from onMount prop)
       ↓
editor.getSelectedText() → get selected text
       ↓
setSelectedCode(selectedText)
       ↓
React re-renders
       ↓
"📖 Explain" button enabled (disabled={!selectedCode})
```

### AI Button Click Event Flow
```
User clicks any AI button
       ↓
onClick handler calls openAIPanel(featureType)
       ↓
setIsAIOpen(true)
       ↓
React re-renders AIAssistantPanel
       ↓
AIAssistantPanel checkAIStatus() on mount
       ↓
Sets appropriate activeTab based on feature
       ↓
Renders relevant component
```

### API Call Event Flow
```
User clicks feature button inside component
       ↓
Component calls aiApi function
       ↓
Axios POST to /api/ai/feature-endpoint
       ↓
Backend validation
       ↓
AI service processes
       ↓
Claude API called
       ↓
Response returns
       ↓
Component displays results
       ↓
User sees analysis
```

---

## Error Handling Flow

```
User Action
       ↓
   Try Block
       ↓
       ├─→ API Call Fails
       │   └─→ Catch error
       │       └─→ Check error.response?.data
       │           └─→ Set error state
       │               └─→ Display error message
       │
       └─→ Validation Fails
           └─→ Return 400 status
               └─→ Send error response
                   └─→ Frontend catches
                       └─→ Display user-friendly message
```

---

## File Dependency Graph

```
Room.jsx
├── imports: AIAssistantPanel
│   ├── imports: ErrorExplanation
│   │   └── imports: aiApi.explainError
│   ├── imports: CodeOptimization
│   │   └── imports: aiApi.optimizeCode
│   ├── imports: CodeReview
│   │   └── imports: aiApi.reviewCode
│   └── imports: CodeExplanation
│       └── imports: aiApi.explainCode
│
└── imports: aiApi
    ├── explainError
    ├── optimizeCode
    ├── reviewCode
    └── explainCode
        └── All call /api/ai/* endpoints

server.js
├── imports: aiRoutes
│   └── imports: aiController
│       └── imports: aiService
│           ├── callClaude()
│           ├── explainError()
│           ├── optimizeCode()
│           ├── reviewCode()
│           └── explainCode()
```

---

## Database Considerations

### Not Currently Used by AI Features
- No database queries in AI service
- Results not stored
- Can add later:
  - AI usage logs
  - User preferences
  - Analysis history

### Future Enhancement Example
```javascript
// Store analysis results
async function saveAnalysis(userId, feature, result) {
  await Analysis.create({
    userId,
    feature,        // 'error', 'optimize', 'review', 'explain'
    result,
    timestamp: new Date(),
  });
}
```

---

## Security Flow

```
.env File (Server only)
├── CLAUDE_API_KEY=sk-ant-...
├── CLAUDE_MODEL=...
└── Only loaded on server startup

Room.jsx (Client)
├── Makes API calls to backend
├── Sends code to backend (not to Claude directly)
└── Never sees API key

aiApi.js (Client)
├── Calls /api/ai/* endpoints
├── No API key in requests
└── Backend adds API key

aiController.js (Server)
├── Validates input
├── Checks aiService.isConfigured()
└── Returns sanitized responses

aiService.js (Server)
├── Reads CLAUDE_API_KEY from env
├── Makes request to Claude API
├── Includes API key in headers (secure HTTPS)
└── Parses response safely
```

---

## Performance Optimization Opportunities

```
Current Implementation
├── Real-time API calls
├── No caching
├── No request batching
└── Full code sent each time

Future Optimizations
├── Cache similar code analysis
├── Batch multiple requests
├── Compress large code
├── Add request queuing
├── Implement rate limiting
├── Add streaming responses
└── Lazy load components
```

---

## Scalability Considerations

### Current Limits
- Single API key (shared across all users)
- No user rate limiting
- No request queuing
- No load balancing

### For Production
- Implement per-user rate limits
- Add request queue system
- Multiple API keys with rotation
- Monitor Claude API usage
- Add caching layer (Redis)
- Implement circuit breaker
- Add metrics/monitoring

---

## Monitoring & Logging

### Current Logging
```javascript
console.log("[aiService]", "message")
console.log("[aiController]", "message")
console.log("[aiApi]", "message")
```

### Can Enhance With
- Request/response logging
- Performance metrics
- Error tracking (Sentry)
- Usage analytics
- API quota monitoring
- Cost tracking

---

**Architecture Documentation Complete** ✅
