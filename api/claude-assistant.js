// Claude Opus Assistant API for RatGarden
// Optimized for Max subscription efficiency

export const config = {
  runtime: "edge",
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export default async function handler(req) {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Anthropic API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { text, feature, context } = await req.json()

    // Rate limiting and token optimization
    const maxTokens = getMaxTokensForFeature(feature)
    const model = getOptimalModel(feature, text.length)

    let systemPrompt = getSystemPrompt(feature)
    let userPrompt = buildUserPrompt(text, feature, context)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.1, // Low temperature for consistent results
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = parseResponse(data.content[0].text, feature)

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Claude Assistant error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}

// Token optimization functions
function getMaxTokensForFeature(feature) {
  const tokenLimits = {
    grammar: 300,
    style: 400,
    suggestions: 200,
    completion: 500,
    summarize: 300,
    medical: 600, // Higher for medical content validation
  }
  return tokenLimits[feature] || 300
}

function getOptimalModel(feature, textLength) {
  // Use Haiku for simple tasks, Sonnet for complex ones, Opus for medical
  if (feature === "medical") return "claude-3-5-sonnet-20241022"
  if (textLength > 2000) return "claude-3-5-sonnet-20241022"
  return "claude-3-5-haiku-20241022" // Most cost-effective for simple tasks
}

function getSystemPrompt(feature) {
  const prompts = {
    grammar: `You are a grammar and spelling expert. Provide corrections in JSON format with minimal tokens. Focus only on actual errors.`,
    style: `You are a writing style expert. Provide style improvements in JSON format. Be concise and actionable.`,
    suggestions: `You are a content strategist. Provide brief, actionable suggestions in JSON format.`,
    completion: `You are a writing assistant. Continue the text naturally and concisely. Return JSON with completion.`,
    summarize: `You are a summarization expert. Create concise summaries in JSON format.`,
    medical: `You are a medical content validator. Check for accuracy, HIPAA compliance, and evidence-based claims. Return detailed analysis in JSON.`,
  }
  return prompts[feature] || prompts.grammar
}

function buildUserPrompt(text, feature, context = "") {
  const basePrompt = `Analyze this text and provide feedback in JSON format. Text: ${text}`

  if (context) {
    return `${basePrompt}\n\nContext: ${context}`
  }

  return basePrompt
}

function parseResponse(responseText, feature) {
  try {
    // Try to parse as JSON first
    return JSON.parse(responseText)
  } catch (error) {
    // Fallback to structured response
    return {
      error: "Invalid JSON response",
      raw_response: responseText,
      feature,
    }
  }
}
