import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { SimpleSlug, resolveRelative } from "../util/path"
import { SemanticLink } from "../util/semantic"
import semanticLinksStyle from "./styles/semanticLinks.scss"

export interface Options {
  title: string
  maxSuggestions: number
  minStrength: number
  showStrength: boolean
  showConfidence: boolean
  showExplanation: boolean
  showSentiment: boolean
  showSentimentAlignment: boolean
}

const defaultOptions: Options = {
  title: "Semantic Links",
  maxSuggestions: 5,
  minStrength: 0.3,
  showStrength: true,
  showConfidence: false,
  showExplanation: true,
  showSentiment: true,
  showSentimentAlignment: true,
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const SemanticLinks: QuartzComponent = ({ 
    displayClass, 
    fileData, 
    allFiles, 
    ctx 
  }: QuartzComponentProps) => {
    const semanticLinks = fileData.semanticLinks || []
    
    // Filter and sort semantic links
    const filteredLinks = semanticLinks
      .filter(link => link.strength >= options.minStrength)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, options.maxSuggestions)

    if (filteredLinks.length === 0) {
      return null
    }

    const strengthColor = (strength: number): string => {
      if (strength >= 0.7) return "semantic-strong"
      if (strength >= 0.5) return "semantic-medium"
      return "semantic-weak"
    }

    const strengthLabel = (strength: number): string => {
      if (strength >= 0.7) return "Strong"
      if (strength >= 0.5) return "Medium"
      return "Weak"
    }

    const formatStrength = (strength: number): string => {
      return `${Math.round(strength * 100)}%`
    }

    const getSentimentEmoji = (emotion: string): string => {
      switch (emotion) {
        case 'positive': return '😊'
        case 'negative': return '😞'
        case 'neutral': return '😐'
        default: return '❓'
      }
    }

    const getSentimentColor = (emotion: string): string => {
      switch (emotion) {
        case 'positive': return 'sentiment-positive'
        case 'negative': return 'sentiment-negative'
        case 'neutral': return 'sentiment-neutral'
        default: return 'sentiment-unknown'
      }
    }

    const formatPolarity = (polarity: number): string => {
      if (polarity > 0.2) return 'positive'
      if (polarity < -0.2) return 'negative'
      return 'neutral'
    }

    const getSentimentAlignmentIndicator = (alignment: any): string => {
      if (!alignment) return ''
      
      if (alignment.emotionMatch && alignment.compatibility > 0.7) {
        return '🤝' // Strong alignment
      } else if (alignment.emotionMatch) {
        return '👍' // Same emotion
      } else if (alignment.compatibility > 0.5) {
        return '⚖️' // Balanced
      } else {
        return '🔄' // Different sentiment
      }
    }

    return (
      <div class={`semantic-links ${displayClass ?? ""}`}>
        <h3>{options.title}</h3>
        <div class="semantic-links-container">
          {filteredLinks.map((link, index) => {
            const targetFile = allFiles.find(f => f.slug === link.target)
            const targetTitle = targetFile?.frontmatter?.title || link.target
            const relativeUrl = resolveRelative(fileData.slug!, link.target)
            
            // Get sentiment data for source and target
            const sourceSentiment = fileData.semanticEmbedding?.sentiment
            const targetSentiment = targetFile?.semanticEmbedding?.sentiment
            
            return (
              <div 
                key={index} 
                class={`semantic-link-item ${strengthColor(link.strength)}`}
              >
                <div class="semantic-link-header">
                  <a 
                    href={relativeUrl} 
                    class="semantic-link-title"
                    data-no-popover={false}
                  >
                    {targetTitle}
                  </a>
                  <div class="semantic-link-indicators">
                    {options.showStrength && (
                      <span class={`semantic-strength ${strengthColor(link.strength)}`}>
                        {formatStrength(link.strength)}
                      </span>
                    )}
                    {options.showConfidence && link.confidence && (
                      <span class="semantic-confidence">
                        {Math.round(link.confidence * 100)}% confidence
                      </span>
                    )}
                    {options.showSentimentAlignment && link.sentimentAlignment && (
                      <span class="sentiment-alignment" title={`Sentiment compatibility: ${Math.round(link.sentimentAlignment.compatibility * 100)}%`}>
                        {getSentimentAlignmentIndicator(link.sentimentAlignment)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div class="semantic-link-meta">
                  <span class={`semantic-type semantic-type-${link.type}`}>
                    {link.type === "semantic" ? "AI Suggested" : 
                     link.type === "tag-based" ? "Tag Related" : "Direct Link"}
                  </span>
                  <span class={`semantic-strength-label ${strengthColor(link.strength)}`}>
                    {strengthLabel(link.strength)}
                  </span>
                </div>
                
                {options.showSentiment && (sourceSentiment || targetSentiment) && (
                  <div class="semantic-sentiment">
                    {sourceSentiment && (
                      <span class={`sentiment-indicator ${getSentimentColor(sourceSentiment.emotion)}`}>
                        <span class="sentiment-emoji">{getSentimentEmoji(sourceSentiment.emotion)}</span>
                        <span class="sentiment-label">This: {sourceSentiment.emotion}</span>
                      </span>
                    )}
                    {targetSentiment && (
                      <span class={`sentiment-indicator ${getSentimentColor(targetSentiment.emotion)}`}>
                        <span class="sentiment-emoji">{getSentimentEmoji(targetSentiment.emotion)}</span>
                        <span class="sentiment-label">Target: {targetSentiment.emotion}</span>
                      </span>
                    )}
                  </div>
                )}
                
                {options.showExplanation && link.explanation && (
                  <div class="semantic-explanation">
                    {link.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div class="semantic-links-footer">
          <span class="semantic-links-note">
            Links suggested by AI based on content similarity and sentiment analysis
          </span>
        </div>
      </div>
    )
  }

  SemanticLinks.displayName = "SemanticLinks"
  SemanticLinks.css = semanticLinksStyle
  return SemanticLinks
}) satisfies QuartzComponentConstructor