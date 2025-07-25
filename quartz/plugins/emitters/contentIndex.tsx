import { Root } from "hast"
import { GlobalConfiguration } from "../../cfg"
import { getDate } from "../../components/Date"
import { escapeHTML } from "../../util/escape"
import { FilePath, FullSlug, SimpleSlug, joinSegments, simplifySlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { toHtml } from "hast-util-to-html"
import { write } from "./helpers"
import { i18n } from "../../i18n"
import { SemanticLink, CrossReferenceStrength, semanticAnalyzer, SemanticEmbedding } from "../../util/semantic"

export type ContentIndexMap = Map<FullSlug, ContentDetails>
export type ContentDetails = {
  slug: FullSlug
  filePath: FilePath
  title: string
  links: SimpleSlug[]
  tags: string[]
  content: string
  richContent?: string
  date?: Date
  description?: string
  semanticEmbedding?: number[]
  semanticLinks?: SemanticLink[]
  crossReferenceStrength?: Map<FullSlug, CrossReferenceStrength>
}

interface Options {
  enableSiteMap: boolean
  enableRSS: boolean
  rssLimit?: number
  rssFullHtml: boolean
  rssSlug: string
  includeEmptyFiles: boolean
}

const defaultOptions: Options = {
  enableSiteMap: true,
  enableRSS: true,
  rssLimit: 10,
  rssFullHtml: false,
  rssSlug: "the-rats-garden-of-wisdom",
  includeEmptyFiles: true,
}

function generateSiteMap(cfg: GlobalConfiguration, idx: ContentIndexMap): string {
  const base = cfg.baseUrl ?? ""
  const createURLEntry = (slug: SimpleSlug, content: ContentDetails): string => `<url>
    <loc>https://${joinSegments(base, encodeURI(slug))}</loc>
    ${content.date && `<lastmod>${content.date.toISOString()}</lastmod>`}
  </url>`
  const urls = Array.from(idx)
    .map(([slug, content]) => createURLEntry(simplifySlug(slug), content))
    .join("")
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`
}

// Helper function for tag-based semantic link generation
async function generateSemanticLinks(content: any[]) {
  console.log("ContentIndex: Starting semantic link discovery for", content.length, "files")
  
  try {
    // Initialize semantic analyzer
    await semanticAnalyzer.initialize()
    
    const allEmbeddings: SemanticEmbedding[] = []
    const existingLinks: { [key: string]: string[] } = {}
    
    // First pass: Generate embeddings for all files
    for (const [tree, file] of content) {
      const slug = file.data.slug as FullSlug
      const title = file.data.frontmatter?.title || "Untitled"
      const tags = file.data.frontmatter?.tags || []
      const content = file.data.text || ""
      
      try {
        const embedding = await semanticAnalyzer.generateEmbedding(content, title, tags, slug)
        allEmbeddings.push(embedding)
        
        // Store existing links for strength calculation
        existingLinks[slug] = (file.data.links || []).map(link => link.toString())
        
        // Store embedding in file data
        file.data.semanticEmbedding = embedding.embedding
      } catch (error) {
        console.error(`Failed to generate embedding for ${slug}:`, error)
      }
    }
    
    // Second pass: Generate semantic links
    for (const [tree, file] of content) {
      const slug = file.data.slug as FullSlug
      const sourceEmbedding = allEmbeddings.find(e => e.slug === slug)
      
      if (!sourceEmbedding) continue
      
      // Generate tag-based suggestions
      const suggestions = generateTagBasedSuggestions(sourceEmbedding, allEmbeddings, 8)
      
      // Filter suggestions above threshold
      const filteredSuggestions = suggestions.filter(link => link.strength >= 0.1)
      
      file.data.semanticLinks = filteredSuggestions
      
      if (filteredSuggestions.length > 0) {
        console.log(`ContentIndex: Generated ${filteredSuggestions.length} semantic links for: ${slug}`)
      }
    }
    
    console.log("ContentIndex: Semantic link discovery completed successfully")
    
  } catch (error) {
    console.error("ContentIndex: Error during semantic link discovery:", error)
  }
}

// Helper function for tag-based suggestions
function generateTagBasedSuggestions(
  sourceEmbedding: SemanticEmbedding,
  allEmbeddings: SemanticEmbedding[],
  maxSuggestions: number
): SemanticLink[] {
  const suggestions: SemanticLink[] = []
  
  for (const targetEmbedding of allEmbeddings) {
    if (targetEmbedding.slug === sourceEmbedding.slug) continue
    
    // Calculate shared tags score
    const sharedTags = sourceEmbedding.tags.filter(tag => 
      targetEmbedding.tags.includes(tag)
    )
    
    if (sharedTags.length > 0) {
      const strength = Math.min(sharedTags.length / Math.max(sourceEmbedding.tags.length, 1), 1.0)
      
      suggestions.push({
        target: targetEmbedding.slug,
        strength,
        confidence: strength,
        type: "tag-based",
        explanation: `Shares tags: ${sharedTags.join(", ")}`
      })
    }
  }
  
  return suggestions
    .sort((a, b) => b.strength - a.strength)
    .slice(0, maxSuggestions)
}

function generateRSSFeed(cfg: GlobalConfiguration, idx: ContentIndexMap, limit?: number): string {
  const base = cfg.baseUrl ?? ""

  const createURLEntry = (slug: SimpleSlug, content: ContentDetails): string => `<item>
    <title>${escapeHTML(content.title)}</title>
    <link>https://${joinSegments(base, encodeURI(slug))}</link>
    <guid>https://${joinSegments(base, encodeURI(slug))}</guid>
    <description>${content.richContent ?? content.description}</description>
    <pubDate>${content.date?.toUTCString()}</pubDate>
  </item>`

  const items = Array.from(idx)
    .sort(([_, f1], [__, f2]) => {
      if (f1.date && f2.date) {
        return f2.date.getTime() - f1.date.getTime()
      } else if (f1.date && !f2.date) {
        return -1
      } else if (!f1.date && f2.date) {
        return 1
      }

      return f1.title.localeCompare(f2.title)
    })
    .map(([slug, content]) => createURLEntry(simplifySlug(slug), content))
    .slice(0, limit ?? idx.size)
    .join("")

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
      <title>${escapeHTML(cfg.pageTitle)}</title>
      <link>https://${base}</link>
      <description>${!!limit ? i18n(cfg.locale).pages.rss.lastFewNotes({ count: limit }) : i18n(cfg.locale).pages.rss.recentNotes} on ${escapeHTML(
        cfg.pageTitle,
      )}</description>
      <generator>Quartz -- quartz.jzhao.xyz</generator>
      ${items}
    </channel>
  </rss>`
}

export const ContentIndex: QuartzEmitterPlugin<Partial<Options>> = (opts) => {
  opts = { ...defaultOptions, ...opts }
  return {
    name: "ContentIndex",
    async *emit(ctx, content) {
      const cfg = ctx.cfg.configuration
      const linkIndex: ContentIndexMap = new Map()
      
      // First, run semantic link discovery
      await generateSemanticLinks(content)
      
      for (const [tree, file] of content) {
        const slug = file.data.slug!
        const date = getDate(ctx.cfg.configuration, file.data) ?? new Date()
        if (opts?.includeEmptyFiles || (file.data.text && file.data.text !== "")) {
          linkIndex.set(slug, {
            slug,
            filePath: file.data.relativePath!,
            title: file.data.frontmatter?.title!,
            links: file.data.links ?? [],
            tags: file.data.frontmatter?.tags ?? [],
            content: file.data.text ?? "",
            richContent: opts?.rssFullHtml
              ? escapeHTML(toHtml(tree as Root, { allowDangerousHtml: true }))
              : undefined,
            date: date,
            description: file.data.description ?? "",
            semanticEmbedding: file.data.semanticEmbedding,
            semanticLinks: file.data.semanticLinks,
            crossReferenceStrength: file.data.crossReferenceStrength,
          })
          
          // Debug: Check if semantic links are present
          if (file.data.semanticLinks && file.data.semanticLinks.length > 0) {
            console.log(`ContentIndex: Found ${file.data.semanticLinks.length} semantic links for ${slug}`)
          }
        }
      }

      if (opts?.enableSiteMap) {
        yield write({
          ctx,
          content: generateSiteMap(cfg, linkIndex),
          slug: "sitemap" as FullSlug,
          ext: ".xml",
        })
      }

      if (opts?.enableRSS) {
        yield write({
          ctx,
          content: generateRSSFeed(cfg, linkIndex, opts.rssLimit),
          slug: (opts?.rssSlug ?? "the-rats-garden-of-wisdom") as FullSlug,
          ext: ".xml",
        })
      }

      const fp = joinSegments("static", "contentIndex") as FullSlug
      const simplifiedIndex = Object.fromEntries(
        Array.from(linkIndex).map(([slug, content]) => {
          // remove description and from content index as nothing downstream
          // actually uses it. we only keep it in the index as we need it
          // for the RSS feed
          // Also remove large semantic fields to keep JSON size manageable
          // but keep semanticLinks for the component
          delete content.description
          delete content.date
          delete content.semanticEmbedding
          delete content.crossReferenceStrength
          return [slug, content]
        }),
      )

      yield write({
        ctx,
        content: JSON.stringify(simplifiedIndex),
        slug: fp,
        ext: ".json",
      })
    },
    externalResources: (ctx) => {
      if (opts?.enableRSS) {
        return {
          additionalHead: [
            <link
              rel="alternate"
              type="application/rss+xml"
              title="RSS Feed"
              href={`https://${ctx.cfg.configuration.baseUrl}/the-rats-garden-of-wisdom.xml`}
            />,
          ],
        }
      }
    },
  }
}
