// Netlify function types
interface HandlerEvent {
  httpMethod: string
  body: string | null
  path: string
}

interface HandlerContext {
  // Add any context properties as needed
}

interface HandlerResponse {
  statusCode: number
  body?: string
  headers?: Record<string, string | undefined>
}

type Handler = (
  event: HandlerEvent,
  context: HandlerContext,
) => Promise<HandlerResponse> | HandlerResponse

interface GeminiRequest {
  text: string
  feature: "grammar" | "style" | "suggestions" | "completion" | "summarize" | "medical"
  context?: string
}

interface GeminiResponse {
  corrections?: Array<{
    text: string
    replacement: string
    reason: string
    type: string
  }>
  suggestions?: string[]
  completion?: string
  summary?: string
  key_points?: string[]
  score?: {
    grammar: number
    clarity: number
    engagement: number
  }
  error?: string
  raw_response?: string
  feature?: string
}

interface GeminiAPIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  }

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gemini API key not configured" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  }

  try {
    const { text, feature, context }: GeminiRequest = JSON.parse(event.body || "{}")

    if (!text || !feature) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: text and feature" }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    }

    // Rate limiting and token optimization
    const maxTokens = getMaxTokensForFeature(feature)
    const model = getOptimalModel(feature, text.length)

    let systemPrompt = getSystemPrompt(feature)
    let userPrompt = buildUserPrompt(text, feature, context)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 40,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = (await response.json()) as GeminiAPIResponse

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API")
    }

    const aiResponse = parseResponse(data.candidates[0].content.parts[0].text, feature)

    return {
      statusCode: 200,
      body: JSON.stringify(aiResponse),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  } catch (error) {
    console.error("Gemini Assistant error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process request" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  }
}

// Token optimization functions
function getMaxTokensForFeature(feature: string): number {
  const tokenLimits: Record<string, number> = {
    grammar: 300,
    style: 400,
    suggestions: 200,
    completion: 500,
    summarize: 300,
    medical: 600, // Higher for medical content validation
  }
  return tokenLimits[feature] || 300
}

function getOptimalModel(feature: string, textLength: number): string {
  // Use Gemini 1.5 Flash for simple tasks, Gemini 1.5 Pro for complex ones
  if (feature === "medical" || textLength > 2000) {
    return "gemini-1.5-pro"
  }
  return "gemini-1.5-flash" // Most cost-effective for simple tasks
}

function getSystemPrompt(feature: string): string {
  const prompts: Record<string, string> = {
    grammar: `You are a grammar and spelling expert. Provide corrections in JSON format with minimal tokens. Focus only on actual errors.`,
    style: `You are a writing style expert. Provide style improvements in JSON format. Be concise and actionable.`,
    suggestions: `You are a content strategist. Provide brief, actionable suggestions in JSON format.`,
    completion: `You are a writing assistant. Continue the text naturally and concisely. Return JSON with completion.`,
    summarize: `You are a summarization expert. Create concise summaries in JSON format.`,
    medical: `You are a medical content validator. Check for accuracy, HIPAA compliance, and evidence-based claims. Return detailed analysis in JSON.`,
  }
  return prompts[feature] || prompts.grammar
}

function buildUserPrompt(text: string, feature: string, context: string = ""): string {
  let prompt = ""

  switch (feature) {
    case "grammar":
      prompt = `Check the following text for grammar and spelling errors. Provide corrections in this JSON format:
{
  "corrections": [{"text": "error", "replacement": "correction", "reason": "explanation", "type": "grammar"}],
  "suggestions": ["general improvement suggestions"],
  "score": {"grammar": 85, "clarity": 90, "engagement": 80}
}

Text: ${text}`
      break

    case "style":
      prompt = `Analyze the writing style of this text and suggest improvements. Format response as JSON:
{
  "corrections": [{"text": "weak phrase", "replacement": "stronger phrase", "reason": "explanation", "type": "style"}],
  "suggestions": ["style improvement suggestions"],
  "score": {"grammar": 85, "clarity": 90, "engagement": 80}
}

Text: ${text}`
      break

    case "suggestions":
      prompt = `Provide content suggestions for this text. Format as JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Text: ${text}`
      break

    case "completion":
      prompt = `Continue this text naturally. Return JSON:
{
  "completion": "your continuation here"
}

Text: ${text}`
      break

    case "summarize":
      prompt = `Summarize this text concisely. Return JSON:
{
  "summary": "your summary here",
  "key_points": ["point 1", "point 2", "point 3"]
}

Text: ${text}`
      break

    case "medical":
      prompt = `Validate this medical content for accuracy and compliance. Return JSON:
{
  "corrections": [{"text": "inaccurate statement", "replacement": "accurate statement", "reason": "explanation", "type": "medical"}],
  "suggestions": ["compliance suggestions"],
  "score": {"accuracy": 85, "compliance": 90, "clarity": 80}
}

Text: ${text}`
      break

    default:
      prompt = `Analyze this text and provide feedback. Format as JSON with corrections, suggestions, and scores.

Text: ${text}`
  }

  if (context) {
    prompt = `${prompt}\n\nContext: ${context}`
  }

  return prompt
}

function parseResponse(responseText: string, feature: string): GeminiResponse {
  try {
    // Try to parse as JSON first
    return JSON.parse(responseText)
  } catch (error) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch (jsonError) {
        console.error("Failed to parse JSON from markdown:", jsonError)
      }
    }

    // Fallback to structured response
    return {
      error: "Invalid JSON response",
      raw_response: responseText,
      feature,
    }
  }
}
