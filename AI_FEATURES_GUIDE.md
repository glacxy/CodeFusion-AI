# 🤖 CodeFusion AI - AI Features Implementation

## Overview

CodeFusion AI now includes intelligent AI-powered assistance for programmers, powered by Anthropic's Claude API. This document outlines all the AI features and how to use them.

## Features

### 1. 🐛 Error Explanation
When your code execution fails, get AI-powered analysis of the error:
- **Error Cause**: Identifies what caused the error
- **Error Location**: Points to the problematic line(s)
- **Explanation**: Detailed explanation of why the error occurred
- **Fix Instructions**: Step-by-step guidance on how to fix it
- **Corrected Code**: A fixed version of your code

**How to use:**
1. Run your code and get an error
2. Click the "🐛 Fix Error" button
3. Click "🔍 Analyze Error" to get AI analysis

### 2. ⚡ Code Optimization
Analyze your code for performance improvements:
- **Time Complexity**: Analysis of algorithm time complexity
- **Space Complexity**: Memory usage analysis
- **Performance Issues**: Identified bottlenecks and inefficiencies
- **Optimization Strategy**: Detailed approach to optimize the code
- **Optimized Code**: An improved version with performance enhancements

**How to use:**
1. Write your code in the editor
2. Click the "⚡ Optimize" button
3. Review the optimization suggestions and optimized code

### 3. 🔍 Code Review
Get comprehensive code quality analysis:
- **Bugs**: Identified potential bugs and logical errors
- **Security Issues**: Security vulnerabilities and concerns
- **Code Quality**: Readability, maintainability, and style issues
- **Best Practices**: Violations of language best practices
- **Improvements**: Specific recommendations for improvement
- **Score**: Overall code quality rating (1-10)

**How to use:**
1. Write your code in the editor
2. Click the "🔍 Review" button
3. Click "🔍 Review This Code" to get a comprehensive review

### 4. 📖 Explain Selected Code
Get AI-powered explanations of code snippets:
- **Simple Explanation**: Easy-to-understand explanation for beginners
- **Purpose**: What the code is meant to do
- **Logic Breakdown**: Step-by-step breakdown of how it works
- **Key Concepts**: Important programming concepts used
- **Example**: Practical usage example

**How to use:**
1. Select code in the editor (highlight text)
2. Click the "📖 Explain" button (only enabled when code is selected)
3. Review the explanation

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- Claude API key from [Anthropic](https://console.anthropic.com/)
- MongoDB running locally or connection string

### Step 1: Get Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key (you'll use this in the next step)

### Step 2: Configure Environment Variables

1. In the `server` directory, create a `.env` file (or copy `.env.example`):
```bash
cp server/.env.example server/.env
```

2. Edit `server/.env` and add your Claude API key:
```
CLAUDE_API_KEY=sk-ant-your_actual_api_key_here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

Other important variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/codefusion
JWT_SECRET=your_secure_secret_key
```

### Step 3: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 4: Start the Services

```bash
# Terminal 1: Start MongoDB (if running locally)
mongod

# Terminal 2: Start the server
cd server
npm run dev

# Terminal 3: Start the client
cd client
npm run dev
```

### Step 5: Access the Application

1. Open [http://localhost:5173](http://localhost:5173) in your browser
2. Create an account or log in
3. Create or join a room
4. Start using AI features!

## API Endpoints

All AI endpoints are under `/api/ai`:

### Get AI Status
```
GET /api/ai/status
```
Check if Claude API is configured

### Explain Error
```
POST /api/ai/explain-error
Content-Type: application/json

{
  "code": "your code here",
  "errorMessage": "error message",
  "language": "javascript"
}
```

### Optimize Code
```
POST /api/ai/optimize
Content-Type: application/json

{
  "code": "your code here",
  "language": "javascript"
}
```

### Review Code
```
POST /api/ai/review
Content-Type: application/json

{
  "code": "your code here",
  "language": "javascript"
}
```

### Explain Code
```
POST /api/ai/explain
Content-Type: application/json

{
  "code": "your code here",
  "language": "javascript"
}
```

## Supported Languages

The AI features work with any programming language, but have been tested extensively with:
- JavaScript / TypeScript
- Python
- Java
- C++
- C
- Go
- Rust
- And more!

## Architecture

### Backend
- **aiService.js**: Core AI logic using Claude API
- **aiController.js**: Request handlers and validation
- **aiRoutes.js**: API endpoint definitions

### Frontend
- **aiApi.js**: API client service
- **AIAssistantPanel.jsx**: Main AI panel component
- **ErrorExplanation.jsx**: Error analysis display
- **CodeOptimization.jsx**: Optimization suggestions display
- **CodeReview.jsx**: Code quality review display
- **CodeExplanation.jsx**: Code explanation display

## Error Handling

The AI features include robust error handling:
- Validates all inputs before sending to Claude API
- Handles network errors gracefully
- Shows user-friendly error messages
- Falls back to manual operations if AI is unavailable
- Rate limiting detection and guidance

## Performance Considerations

- API requests typically take 3-10 seconds depending on code size
- Large code files (>10KB) may take longer to analyze
- Consider breaking large files into smaller chunks for analysis
- Claude API has rate limits - see Anthropic docs for details

## Troubleshooting

### "AI Service Not Available"
**Solution**: Make sure `CLAUDE_API_KEY` is set in your `.env` file and restart the server.

### "Claude API rate limit exceeded"
**Solution**: Wait a few moments before making another request. Check Anthropic's pricing/rate limit docs.

### "Invalid Claude API key"
**Solution**: Verify your API key is correct in the `.env` file. Get a new key from Anthropic Console if needed.

### Code explanation not loading
**Solution**: 
1. Check browser console for errors
2. Verify server is running on port 5000
3. Check that Claude API key is valid

## Cost Considerations

Claude API calls are metered based on token usage:
- **Input tokens**: ~$0.003 per 1K tokens
- **Output tokens**: ~$0.015 per 1K tokens

Typical costs:
- Error explanation: ~$0.01-0.05 per request
- Code optimization: ~$0.02-0.10 per request
- Code review: ~$0.03-0.15 per request
- Code explanation: ~$0.01-0.05 per request

**Estimate your costs** at [Anthropic Pricing](https://www.anthropic.com/pricing)

## Security

- API keys are never exposed to the client
- All API calls go through the secure backend
- Environment variables are used for sensitive data
- Input validation on all endpoints
- No code is logged or stored permanently

## Future Enhancements

Potential improvements:
- [ ] Code refactoring suggestions
- [ ] Performance profiling and analysis
- [ ] Test case generation
- [ ] Documentation generation
- [ ] Security vulnerability scanning
- [ ] Caching for similar code analysis
- [ ] Batch analysis for multiple files
- [ ] Custom AI model selection
- [ ] Usage analytics and statistics

## Contributing

To improve the AI features:
1. Test with various code samples
2. Report issues and bugs
3. Suggest new AI-powered features
4. Help improve prompt engineering

## License

This implementation is part of CodeFusion AI and follows the same license terms.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error details
3. Check Claude API status at Anthropic dashboard
4. Verify your API key and environment variables

---

**Happy coding with AI assistance! 🚀**
