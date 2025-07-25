import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/aisearch.scss"
import script from "./scripts/aisearch.inline"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

export interface AISearchOptions {
  enablePreview: boolean
  searchMode: "semantic" | "hybrid" | "keyword"
  enableExplanations: boolean
  maxResults: number
  embeddingModel?: "minilm" | "use" | "custom"
}

const defaultOptions: AISearchOptions = {
  enablePreview: true,
  searchMode: "hybrid",
  enableExplanations: true,
  maxResults: 8,
  embeddingModel: "minilm",
}

export default ((userOpts?: Partial<AISearchOptions>) => {
  const AISearch: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    const searchPlaceholder = i18n(cfg.locale).components.search.searchBarPlaceholder
    return (
      <div class={classNames(displayClass, "ai-search")}>
        <button class="search-button">
          <p>{i18n(cfg.locale).components.search.title}</p>
          <svg class="search-icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.9 19.7">
            <title>AI Search</title>
            <g class="search-path" fill="none">
              <path stroke-linecap="square" d="M18.5 18.3l-5.4-5.4" />
              <circle cx="8" cy="8" r="7" />
            </g>
          </svg>
          <svg class="ai-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 8.5L12 6l2.5 2.5M12 6v12M7 12l-2.5 2.5L2 12m5 0H2m17 0l2.5 2.5L22 12m-5 0h5m-10 5l-2.5 2.5L7 22m5-5v5"/>
          </svg>
        </button>
        <div class="search-container">
          <div class="search-space">
            <div class="search-header">
              <input
                autocomplete="off"
                class="search-bar"
                name="search"
                type="text"
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
              />
              <div class="search-modes">
                <button class="mode-button" data-mode="keyword" title="Keyword Search">
                  <span class="mode-icon">🔤</span>
                  <span class="mode-label">Keyword</span>
                </button>
                <button class="mode-button active" data-mode="hybrid" title="Hybrid Search">
                  <span class="mode-icon">🔀</span>
                  <span class="mode-label">Hybrid</span>
                </button>
                <button class="mode-button" data-mode="semantic" title="Semantic Search">
                  <span class="mode-icon">🧠</span>
                  <span class="mode-label">Semantic</span>
                </button>
              </div>
            </div>
            <div class="search-layout" 
                 data-preview={opts.enablePreview}
                 data-mode={opts.searchMode}
                 data-explanations={opts.enableExplanations}
                 data-max-results={opts.maxResults}
                 data-embedding-model={opts.embeddingModel}>
            </div>
          </div>
        </div>
      </div>
    )
  }

  AISearch.afterDOMLoaded = script
  AISearch.css = style

  return AISearch
}) satisfies QuartzComponentConstructor