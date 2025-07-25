interface AIResponse {
  suggestions: string[]
  corrections: Array<{
    text: string
    replacement: string
    reason: string
    type: "grammar" | "style" | "clarity"
  }>
  summary?: string
  completion?: string
  score?: {
    grammar: number
    clarity: number
    engagement: number
  }
}

class AIWritingAssistant {
  private element: HTMLElement
  private provider: string
  private features: string[]
  private cacheStrategy: string
  private apiEndpoint: string
  private cache: Map<string, AIResponse> = new Map()
  private isLocalDev: boolean = false

  constructor(element: HTMLElement) {
    this.element = element
    this.provider = element.dataset.provider || "mock"
    this.features = JSON.parse(element.dataset.features || "[]")
    this.cacheStrategy = element.dataset.cacheStrategy || "moderate"
    this.apiEndpoint = element.dataset.apiEndpoint || ""

    // Check if we're in local development
    this.isLocalDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port !== ""

    this.setupEventListeners()
    this.updateEnvironmentDisplay()
  }

  private updateEnvironmentDisplay() {
    const usageInfo = this.element.querySelector(".usage-info")
    const providerInfo = this.element.querySelector(".provider-info")

    if (usageInfo) {
      if (this.isLocalDev) {
        usageInfo.innerHTML = `
          <span class="usage-label">Environment:</span>
          <span class="usage-count local-dev">🟢 Local Development</span>
        `
      } else {
        usageInfo.innerHTML = `
          <span class="usage-label">Environment:</span>
          <span class="usage-count production">🔴 Demo Mode Only</span>
        `
      }
    }

    if (providerInfo) {
      if (this.isLocalDev) {
        providerInfo.innerHTML = `
          <span class="provider-label">Provider:</span>
          <span class="provider-name">${this.provider}</span>
        `
      } else {
        providerInfo.innerHTML = `
          <span class="provider-label">Status:</span>
          <span class="provider-name demo-mode">Demo Mode - Local Dev Only</span>
        `
      }
    }
  }

  private setupEventListeners() {
    const trigger = this.element.querySelector(".ai-assistant-trigger")
    const closeBtn = this.element.querySelector(".close-btn")
    const analyzeBtn = this.element.querySelector(".analyze-btn")
    const clearBtn = this.element.querySelector(".clear-btn")
    const tabs = this.element.querySelectorAll(".tab-btn")
    const panel = this.element.querySelector(".assistant-panel")

    trigger?.addEventListener("click", () => {
      panel?.classList.add("active")
      this.element.classList.add("panel-open")
    })

    closeBtn?.addEventListener("click", () => {
      panel?.classList.remove("active")
      this.element.classList.remove("panel-open")
    })

    analyzeBtn?.addEventListener("click", () => this.analyze())
    clearBtn?.addEventListener("click", () => this.clear())

    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        tabs.forEach((t) => t.classList.remove("active"))
        ;(e.currentTarget as HTMLElement).classList.add("active")
      })
    })

    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.element.contains(e.target as Node) && panel?.classList.contains("active")) {
        panel.classList.remove("active")
        this.element.classList.remove("panel-open")
      }
    })
  }

  private async analyze() {
    const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
    const text = textInput?.value.trim()

    if (!text) {
      this.showError("Please enter some text to analyze")
      return
    }

    // Show demo mode message for production
    if (!this.isLocalDev) {
      this.showError(
        "AI Assistant is only available in local development environment. This is a demo mode.",
      )
      return
    }

    const activeFeature =
      this.element.querySelector(".tab-btn.active")?.getAttribute("data-feature") || "grammar"

    this.setLoading(true)

    try {
      const response = await this.callAI(text, activeFeature)
      this.displayResults(response, activeFeature)
    } catch (error) {
      this.showError("Failed to analyze text. Please try again.")
      console.error("AI Assistant error:", error)
    } finally {
      this.setLoading(false)
    }
  }

  private async callAI(text: string, feature: string): Promise<AIResponse> {
    // Check cache
    const cacheKey = `${feature}:${text.substring(0, 100)}`
    if (this.cacheStrategy !== "none" && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // Mock implementation for demo
    if (this.provider === "mock") {
      const response = await this.mockAIResponse(text, feature)

      if (this.cacheStrategy !== "none") {
        this.cache.set(cacheKey, response)
      }

      return response
    }

    // Real API implementation
    try {
      const apiResponse = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text, feature }),
      })

      if (!apiResponse.ok) {
        // Fall back to mock if API fails
        console.warn("API request failed, falling back to mock response")
        return this.mockAIResponse(text, feature)
      }

      const apiResult = await apiResponse.json()

      // Validate response structure
      if (
        !apiResult.suggestions &&
        !apiResult.corrections &&
        !apiResult.completion &&
        !apiResult.summary
      ) {
        console.warn("Invalid API response structure, falling back to mock")
        return this.mockAIResponse(text, feature)
      }

      if (this.cacheStrategy !== "none") {
        this.cache.set(cacheKey, apiResult)
      }

      return apiResult
    } catch (error) {
      console.error("API error:", error)
      // Fall back to mock on any error
      return this.mockAIResponse(text, feature)
    }
  }

  private async mockAIResponse(text: string, feature: string): Promise<AIResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response: AIResponse = {
      suggestions: [],
      corrections: [],
      score: {
        grammar: Math.floor(Math.random() * 20) + 80,
        clarity: Math.floor(Math.random() * 20) + 80,
        engagement: Math.floor(Math.random() * 20) + 80,
      },
    }

    // Generate more realistic Gemini-style responses based on actual text content
    const textLower = text.toLowerCase()
    const words = text.split(" ")

    switch (feature) {
      case "grammar":
        // Look for common grammar issues in the actual text
        const corrections: Array<{
          text: string
          replacement: string
          reason: string
          type: "grammar" | "style" | "clarity"
        }> = []

        if (textLower.includes("recieve")) {
          corrections.push({
            text: "recieve",
            replacement: "receive",
            reason: "Common spelling mistake - 'i' before 'e' except after 'c'",
            type: "grammar",
          })
        }
        if (textLower.includes("seperate")) {
          corrections.push({
            text: "seperate",
            replacement: "separate",
            reason: "Common spelling mistake - 'a' not 'e'",
            type: "grammar",
          })
        }
        if (textLower.includes("definately")) {
          corrections.push({
            text: "definately",
            replacement: "definitely",
            reason: "Common spelling mistake - 'i' not 'a'",
            type: "grammar",
          })
        }

        // Add some contextual suggestions
        if (textLower.includes("very")) {
          corrections.push({
            text: "very",
            replacement: "extremely",
            reason: "Consider using more specific adjectives for impact",
            type: "style",
          })
        }

        response.corrections =
          corrections.length > 0
            ? corrections
            : [
                {
                  text: "it's",
                  replacement: "its",
                  reason: "Use 'its' for possession, 'it's' for 'it is'",
                  type: "grammar",
                },
              ]

        response.suggestions = [
          "Consider using active voice for better clarity",
          "Break long sentences into shorter ones for readability",
          "Check for subject-verb agreement throughout the text",
        ]
        break

      case "style":
        response.corrections = [
          {
            text: "very important",
            replacement: "crucial",
            reason: "Use stronger adjectives to improve impact",
            type: "style",
          },
        ]
        response.suggestions = [
          "Vary sentence length for better rhythm",
          "Consider adding transitional phrases between paragraphs",
          "Use more specific and vivid language to engage readers",
        ]
        break

      case "suggestions":
        response.suggestions = [
          "Add a compelling hook in the introduction",
          "Include specific examples to support your points",
          "Consider adding a call-to-action at the end",
          "Use concrete details to make abstract concepts more tangible",
        ]
        break

      case "completion":
        const lastWords = words.slice(-3).join(" ")
        const completions = [
          `${lastWords} and furthermore, this demonstrates the importance of continuous improvement in technical writing.`,
          `${lastWords} which highlights the significance of clear communication in professional settings.`,
          `${lastWords} thereby emphasizing the value of thoughtful content creation.`,
        ]
        response.completion = completions[Math.floor(Math.random() * completions.length)]
        break

      case "summarize":
        const summaries = [
          "This text discusses the importance of AI-assisted writing tools in modern content creation. Key points include grammar checking, style improvements, and the potential for AI to enhance clarity and engagement in written communication.",
          "The content explores how artificial intelligence can support writing processes through automated analysis and suggestions, focusing on improving both technical accuracy and reader engagement.",
          "This piece examines the role of AI in content creation, emphasizing how technology can enhance writing quality while maintaining human creativity and judgment.",
        ]
        response.summary = summaries[Math.floor(Math.random() * summaries.length)]
        break
    }

    return response
  }

  private displayResults(response: AIResponse, feature: string) {
    const resultsArea = this.element.querySelector(".results-area")
    if (!resultsArea) return

    let html = ""

    switch (feature) {
      case "grammar":
      case "style":
        if (response.corrections.length > 0) {
          html += "<div class='corrections-section'>"
          html += "<h4>Corrections:</h4>"
          html += "<ul class='corrections-list'>"

          for (const correction of response.corrections) {
            html += `
              <li class='correction-item'>
                <span class='correction-text'>"${correction.text}"</span>
                <span class='arrow'>→</span>
                <span class='replacement'>"${correction.replacement}"</span>
                <p class='reason'>${correction.reason}</p>
              </li>
            `
          }

          html += "</ul></div>"
        }

        if (response.suggestions.length > 0) {
          html += "<div class='suggestions-section'>"
          html += "<h4>Suggestions:</h4>"
          html += "<ul class='suggestions-list'>"

          for (const suggestion of response.suggestions) {
            html += `<li class='suggestion-item'>${suggestion}</li>`
          }

          html += "</ul></div>"
        }

        if (response.score) {
          html += "<div class='score-section'>"
          html += "<h4>Writing Score:</h4>"
          html += "<div class='scores'>"
          html += `<div class='score-item'><span>Grammar:</span> <span class='score-value'>${response.score.grammar}%</span></div>`
          html += `<div class='score-item'><span>Clarity:</span> <span class='score-value'>${response.score.clarity}%</span></div>`
          html += `<div class='score-item'><span>Engagement:</span> <span class='score-value'>${response.score.engagement}%</span></div>`
          html += "</div></div>"
        }
        break

      case "suggestions":
        html += "<div class='suggestions-section'>"
        html += "<h4>AI Suggestions:</h4>"
        html += "<ul class='suggestions-list enhanced'>"

        for (const suggestion of response.suggestions) {
          html += `<li class='suggestion-item'>${suggestion}</li>`
        }

        html += "</ul></div>"
        break

      case "completion":
        html += "<div class='completion-section'>"
        html += "<h4>AI Completion:</h4>"
        html += `<p class='completion-text'>${response.completion}</p>`
        html += "<button class='action-btn secondary use-completion'>Use This Text</button>"
        html += "</div>"
        break

      case "summarize":
        html += "<div class='summary-section'>"
        html += "<h4>AI Summary:</h4>"
        html += `<p class='summary-text'>${response.summary}</p>`
        html += "</div>"
        break
    }

    resultsArea.innerHTML = html

    // Add event listener for "Use This Text" button
    const useBtn = resultsArea.querySelector(".use-completion")
    if (useBtn) {
      useBtn.addEventListener("click", () => {
        const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
        if (textInput && response.completion) {
          textInput.value = response.completion
        }
      })
    }
  }

  private clear() {
    const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
    const resultsArea = this.element.querySelector(".results-area")

    if (textInput) textInput.value = ""
    if (resultsArea) {
      resultsArea.innerHTML =
        '<div class="results-placeholder"><p>Results will appear here after analysis...</p></div>'
    }
  }

  private setLoading(loading: boolean) {
    const analyzeBtn = this.element.querySelector(".analyze-btn")
    if (analyzeBtn) {
      if (loading) {
        analyzeBtn.classList.add("loading")
        analyzeBtn.setAttribute("disabled", "true")
      } else {
        analyzeBtn.classList.remove("loading")
        analyzeBtn.removeAttribute("disabled")
      }
    }
  }

  private showError(message: string) {
    const resultsArea = this.element.querySelector(".results-area")
    if (resultsArea) {
      resultsArea.innerHTML = `<div class="error-message">${message}</div>`
    }
  }
}

// Initialize all AI Writing Assistants on the page
document.addEventListener("DOMContentLoaded", () => {
  const assistants = document.querySelectorAll(".ai-writing-assistant")
  assistants.forEach((element) => {
    new AIWritingAssistant(element as HTMLElement)
  })
})
