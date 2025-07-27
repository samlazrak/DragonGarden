import { classNames } from "../util/lang"
import script from "./scripts/airecommendations.inline"
import style from "./styles/airecommendations.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface AIRecommendationsOptions {
  mode: "related" | "personalized" | "trending"
  explanations: boolean
  maxItems: number
  title?: string
  showThumbnails?: boolean
  showDescription?: boolean
}

const defaultOptions: AIRecommendationsOptions = {
  mode: "personalized",
  explanations: true,
  maxItems: 5,
  title: "AI Recommendations",
  showThumbnails: false,
  showDescription: true,
}

export default ((userOpts?: Partial<AIRecommendationsOptions>) => {
  const AIRecommendations: QuartzComponent = ({
    displayClass,
    cfg,
    fileData,
    allFiles,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    const currentSlug = fileData.slug!

    return (
      <div class={classNames(displayClass, "ai-recommendations")}>
        <div class="recommendations-header">
          <h3>{opts.title}</h3>
          <div class="mode-selector">
            <button
              class={`mode-btn ${opts.mode === "related" ? "active" : ""}`}
              data-mode="related"
              title="Related Content"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-width="2" />
              </svg>
            </button>
            <button
              class={`mode-btn ${opts.mode === "personalized" ? "active" : ""}`}
              data-mode="personalized"
              title="For You"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <path d="M12 2v20M2 12h20" stroke-width="2" />
              </svg>
            </button>
            <button
              class={`mode-btn ${opts.mode === "trending" ? "active" : ""}`}
              data-mode="trending"
              title="Trending"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke-width="2" />
              </svg>
            </button>
          </div>
        </div>
        <div
          class="recommendations-container"
          data-current-slug={currentSlug}
          data-mode={opts.mode}
          data-max-items={opts.maxItems}
          data-show-explanations={opts.explanations}
          data-show-description={opts.showDescription}
        >
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Analyzing content...</p>
          </div>
        </div>
      </div>
    )
  }

  AIRecommendations.css = style
  AIRecommendations.afterDOMLoaded = script

  return AIRecommendations
}) satisfies QuartzComponentConstructor
