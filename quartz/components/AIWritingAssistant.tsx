import { classNames } from "../util/lang"
import script from "./scripts/aiwritingassistant.inline"
import style from "./styles/aiwritingassistant.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface AIWritingAssistantOptions {
  features: ("grammar" | "style" | "suggestions" | "completion" | "summarize")[]
  provider: "openai" | "anthropic" | "gemini" | "local" | "mock"
  cacheStrategy: "aggressive" | "moderate" | "none"
  position?: "floating" | "inline"
  apiEndpoint?: string
}

const defaultOptions: AIWritingAssistantOptions = {
  features: ["grammar", "style", "suggestions"],
  provider: "mock", // Use mock for demo
  cacheStrategy: "moderate",
  position: "floating",
}

export default ((userOpts?: Partial<AIWritingAssistantOptions>) => {
  const AIWritingAssistant: QuartzComponent = ({
    displayClass,
    fileData,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }

    // Only show on content pages, not listings
    if (!fileData.slug || fileData.slug.endsWith("/")) {
      return null
    }

    return (
      <div
        class={classNames(displayClass, "ai-writing-assistant", opts.position)}
        data-features={JSON.stringify(opts.features)}
        data-provider={opts.provider}
        data-cache-strategy={opts.cacheStrategy}
        data-api-endpoint={opts.apiEndpoint || ""}
      >
        <button class="ai-assistant-trigger" title="AI Writing Assistant">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
              stroke-width="2"
            />
            <path d="M12 8v4M12 16h.01" stroke-width="2" />
          </svg>
          <span class="assistant-label">AI Assistant</span>
        </button>

        <div class="assistant-panel">
          <div class="panel-header">
            <h3>AI Writing Assistant</h3>
            <button class="close-btn" aria-label="Close">
              ×
            </button>
          </div>

          <div class="panel-content">
            <div class="feature-tabs">
              {opts.features.includes("grammar") && (
                <button class="tab-btn active" data-feature="grammar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke-width="2" />
                  </svg>
                  Grammar
                </button>
              )}
              {opts.features.includes("style") && (
                <button class="tab-btn" data-feature="style">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      stroke-width="2"
                    />
                  </svg>
                  Style
                </button>
              )}
              {opts.features.includes("suggestions") && (
                <button class="tab-btn" data-feature="suggestions">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke-width="2" />
                    <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" />
                  </svg>
                  Suggestions
                </button>
              )}
              {opts.features.includes("completion") && (
                <button class="tab-btn" data-feature="completion">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-width="2" />
                  </svg>
                  Complete
                </button>
              )}
              {opts.features.includes("summarize") && (
                <button class="tab-btn" data-feature="summarize">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="21" y1="10" x2="3" y2="10" stroke-width="2" />
                    <line x1="21" y1="6" x2="3" y2="6" stroke-width="2" />
                    <line x1="21" y1="14" x2="3" y2="14" stroke-width="2" />
                    <line x1="21" y1="18" x2="3" y2="18" stroke-width="2" />
                  </svg>
                  Summarize
                </button>
              )}
            </div>

            <div class="feature-content">
              <div class="input-area">
                <textarea
                  class="text-input"
                  placeholder="Paste or type text here for AI assistance..."
                  rows={6}
                ></textarea>
                <div class="input-actions">
                  <button class="action-btn primary analyze-btn">
                    <span class="btn-text">Analyze</span>
                    <span class="loading-spinner"></span>
                  </button>
                  <button class="action-btn clear-btn">Clear</button>
                </div>
              </div>

              <div class="results-area">
                <div class="results-placeholder">
                  <p>Results will appear here after analysis...</p>
                </div>
              </div>
            </div>

            <div class="assistant-footer">
              <div class="usage-info">
                <span class="usage-label">Environment:</span>
                <span class="usage-count">Loading...</span>
              </div>
              <div class="provider-info">
                <span class="provider-label">Status:</span>
                <span class="provider-name">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  AIWritingAssistant.css = style
  AIWritingAssistant.afterDOMLoaded = script

  return AIWritingAssistant
}) satisfies QuartzComponentConstructor
