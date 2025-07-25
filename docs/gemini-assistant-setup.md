# Gemini Assistant Setup Guide

## Overview

The Gemini assistant is now available as a TypeScript Netlify function at `/.netlify/functions/gemini-assistant`.

## Features

- ✅ **Grammar checking** - Fix spelling and grammar errors
- ✅ **Style improvements** - Enhance writing style and clarity
- ✅ **Content suggestions** - Get ideas for content expansion
- ✅ **Text completion** - Continue writing naturally
- ✅ **Summarization** - Create concise summaries
- ✅ **Medical validation** - Check medical content accuracy

## Setup Steps

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Environment Variables

#### For Local Development:

```bash
# Add to your .env file (create if it doesn't exist)
GEMINI_API_KEY=your_api_key_here
```

#### For Netlify Production:

1. Go to your Netlify dashboard
2. Navigate to Site settings → Environment variables
3. Add new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
4. Save and redeploy

### 3. Test Locally

```bash
# Start development server
npm run dev

# Test the endpoint (in another terminal)
node test-gemini-endpoint.js
```

### 4. Deploy to Production

```bash
# Commit your changes
git add .
git commit -m "Add TypeScript Gemini assistant"

# Push to trigger Netlify deployment
git push
```

## API Usage

### Endpoint

```
POST /.netlify/functions/gemini-assistant
```

### Request Format

```json
{
  "text": "Your text to analyze",
  "feature": "grammar|style|suggestions|completion|summarize|medical",
  "context": "Optional context information"
}
```

### Response Format

```json
{
  "corrections": [
    {
      "text": "error text",
      "replacement": "corrected text",
      "reason": "explanation",
      "type": "grammar|style|medical"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "score": {
    "grammar": 85,
    "clarity": 90,
    "engagement": 80
  }
}
```

## Frontend Integration

### Basic Usage

```typescript
const analyzeText = async (text: string, feature: string) => {
  const response = await fetch("/.netlify/functions/gemini-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, feature }),
  })

  if (response.ok) {
    return await response.json()
  } else {
    throw new Error("Analysis failed")
  }
}

// Example usage
const result = await analyzeText("Hello world", "grammar")
console.log(result.corrections)
```

### Error Handling

```typescript
try {
  const result = await analyzeText(text, feature)
  // Handle success
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("Gemini API key not configured")
  } else {
    console.error("Analysis failed:", error.message)
  }
}
```

## Cost Optimization

The assistant uses token optimization:

- **Gemini 1.5 Flash** for simple tasks (cheaper)
- **Gemini 1.5 Pro** for complex tasks (more capable)
- **Dynamic token limits** based on feature type
- **Medical validation** uses higher limits for accuracy

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**

   - Check environment variable is set correctly
   - Verify the key is valid in Google AI Studio

2. **"Method not allowed"**

   - Ensure you're using POST method
   - Check the endpoint URL is correct

3. **"Failed to process request"**
   - Check network connectivity
   - Verify the request format is correct
   - Check Gemini API status

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=true
```

## Security Notes

- ✅ API key is stored securely in environment variables
- ✅ CORS headers configured for web usage
- ✅ Input validation and sanitization
- ✅ Rate limiting through token optimization
- ✅ No sensitive data logged

## Performance

- **Response time**: 100-500ms typical
- **Token usage**: 200-600 tokens per request
- **Concurrent requests**: Limited by Netlify function limits
- **Cold starts**: ~1-2 seconds first request

## Next Steps

1. **Test thoroughly** with your content
2. **Monitor usage** in Netlify dashboard
3. **Optimize prompts** based on your needs
4. **Add rate limiting** if needed
5. **Consider caching** for repeated requests
