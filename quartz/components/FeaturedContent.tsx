import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { formatDate, getDate } from "./Date"
import featuredContentStyle from "./styles/featuredContent.scss"

export interface Options {
  title: string
  limit: number
  showDescription: boolean
  showDate: boolean
  showTags: boolean
  featuredSlugs?: string[]
  autoFeatured: boolean
}

const defaultOptions: Options = {
  title: "Featured Content",
  limit: 6,
  showDescription: true,
  showDate: true,
  showTags: true,
  autoFeatured: true,
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const FeaturedContent: QuartzComponent = ({ 
    displayClass, 
    fileData, 
    allFiles, 
    ctx 
  }: QuartzComponentProps) => {
    
    // Filter out current page and sort by date
    const otherFiles = allFiles
      .filter(file => file.slug !== fileData.slug)
      .filter(file => file.slug !== "tags" && !file.slug?.startsWith("tags/"))
      .sort((a, b) => {
        const dateA = getDate(ctx.cfg.configuration, a) ?? new Date()
        const dateB = getDate(ctx.cfg.configuration, b) ?? new Date()
        return dateB.getTime() - dateA.getTime()
      })

    let featuredFiles = []

    // Use manually specified featured content if provided
    if (options.featuredSlugs && options.featuredSlugs.length > 0) {
      featuredFiles = options.featuredSlugs
        .map(slug => otherFiles.find(file => file.slug === slug))
        .filter(file => file !== undefined)
    }

    // Auto-select featured content if enabled or no manual selection
    if (options.autoFeatured && featuredFiles.length < options.limit) {
      const remainingSlots = options.limit - featuredFiles.length
      const autoSelected = otherFiles
        .filter(file => !featuredFiles.some(featured => featured?.slug === file.slug))
        .slice(0, remainingSlots)
      
      featuredFiles = [...featuredFiles, ...autoSelected]
    }

    // Limit to requested number
    featuredFiles = featuredFiles.slice(0, options.limit)

    if (featuredFiles.length === 0) {
      return null
    }

    const getContentPreview = (content: string, maxLength: number = 120): string => {
      if (!content) return ""
      
      // Remove markdown syntax and clean up
      const cleaned = content
        .replace(/#{1,6}\s+/g, "") // Remove headers
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.*?)\*/g, "$1") // Remove italic
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
        .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
        .replace(/`(.*?)`/g, "$1") // Remove inline code
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks
        .replace(/\n+/g, " ") // Replace newlines with spaces
        .trim()

      if (cleaned.length <= maxLength) return cleaned
      return cleaned.substring(0, maxLength).trim() + "..."
    }

    const getFileIcon = (tags: string[]): string => {
      if (tags.includes("ai") || tags.includes("machine-learning")) return "🤖"
      if (tags.includes("art") || tags.includes("creative")) return "🎨"
      if (tags.includes("research") || tags.includes("science")) return "🔬"
      if (tags.includes("publication") || tags.includes("paper")) return "📄"
      if (tags.includes("community") || tags.includes("non-profit")) return "🌟"
      if (tags.includes("education") || tags.includes("learning")) return "📚"
      if (tags.includes("tech") || tags.includes("programming")) return "💻"
      return "📝"
    }

    return (
      <div class={`featured-content ${displayClass ?? ""}`}>
        <h3>{options.title}</h3>
        <div class="featured-grid">
          {featuredFiles.map((file, index) => {
            if (!file) return null
            
            const relativeUrl = resolveRelative(fileData.slug!, file.slug!)
            const title = file.frontmatter?.title || file.slug || "Untitled"
            const description = file.frontmatter?.description || getContentPreview(file.text || "")
            const tags = file.frontmatter?.tags || []
            const date = getDate(ctx.cfg.configuration, file)
            const icon = getFileIcon(tags)

            return (
              <div key={index} class="featured-card">
                <a href={relativeUrl} data-no-popover={false} class="featured-link">
                  <div class="featured-header">
                    <span class="featured-icon">{icon}</span>
                    <h4 class="featured-title">{title}</h4>
                  </div>
                  
                  {options.showDescription && description && (
                    <p class="featured-description">{description}</p>
                  )}
                  
                  <div class="featured-meta">
                    {options.showDate && date && (
                      <span class="featured-date">
                        {formatDate(date, ctx.cfg.configuration.locale)}
                      </span>
                    )}
                    
                    {options.showTags && tags.length > 0 && (
                      <div class="featured-tags">
                        {tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} class="featured-tag">
                            #{tag}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span class="featured-tag-more">
                            +{tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  FeaturedContent.displayName = "FeaturedContent"
  FeaturedContent.css = featuredContentStyle
  return FeaturedContent
}) satisfies QuartzComponentConstructor