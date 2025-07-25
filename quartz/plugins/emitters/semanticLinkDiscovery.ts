import { QuartzEmitterPlugin } from "../types"
import { semanticAnalyzer, SemanticEmbedding, SemanticLink } from "../../util/semantic"
import { semanticCache } from "../../util/semanticCache"
import { FilePath, FullSlug } from "../../util/path"
import { BuildCtx } from "../../util/ctx"
import { ProcessedContent } from "../vfile"

export interface Options {
  enableSemanticLinks: boolean
  enableCrossReferenceStrength: boolean
  minSimilarity: number
  maxSuggestedLinks: number
  semanticLinkThreshold: number
  cacheEmbeddings: boolean
}

const defaultOptions: Options = {
  enableSemanticLinks: true,
  enableCrossReferenceStrength: true,
  minSimilarity: 0.3,
  maxSuggestedLinks: 8,
  semanticLinkThreshold: 0.4,
  cacheEmbeddings: true,
}

export const SemanticLinkDiscovery: QuartzEmitterPlugin<Partial<Options>> = (opts = {}) => {
  const options = { ...defaultOptions, ...opts }
  
  return {
    name: "SemanticLinkDiscovery",
    async emit(ctx: BuildCtx, content: ProcessedContent[]) {
      // This runs with access to all content at once
      if (!options.enableSemanticLinks && !options.enableCrossReferenceStrength) {
        return []
      }

      console.log("Starting semantic link discovery for", content.length, "files")
      
      // Check if we're in a browser environment for full semantic processing
      const isBrowser = typeof window !== 'undefined'
      
      try {
        // Initialize cache if caching is enabled
        if (options.cacheEmbeddings) {
          await semanticCache.initialize()
          
          // Prune old cache entries periodically
          await semanticCache.pruneCache()
          
          const stats = semanticCache.getCacheStats()
          console.log(`Cache stats: ${stats.totalEntries} entries`)
        }
        
        // Initialize semantic analyzer
        await semanticAnalyzer.initialize()
        
        const allEmbeddings: SemanticEmbedding[] = []
        const existingLinks: { [key: string]: string[] } = {}
        
        // First pass: Generate embeddings for all files
        for (const [tree, file] of content) {
          const slug = file.data.slug as FullSlug
          const title = file.data.frontmatter?.title || "Untitled"
          const tags = file.data.frontmatter?.tags || []
          const contentText = file.data.text || ""
          
          console.log(`Processing file for semantic analysis: ${slug}`)
          
          try {
            let embedding: SemanticEmbedding
            let cachedEntry = null
            
            // Try to get from cache if enabled
            if (options.cacheEmbeddings) {
              cachedEntry = await semanticCache.getEmbedding(slug, contentText, title, tags)
              if (cachedEntry) {
                embedding = cachedEntry.embedding
                // Update the lastUpdated date to current
                embedding.lastUpdated = new Date()
              }
            }
            
            // Generate new embedding if not cached
            if (!cachedEntry) {
              embedding = await semanticAnalyzer.generateEmbedding(contentText, title, tags, slug)
              
              // Save to cache if enabled (we'll save semantic links later)
              if (options.cacheEmbeddings) {
                await semanticCache.saveEmbedding(slug, embedding)
              }
            }
            
            allEmbeddings.push(embedding)
            
            // Store existing links for strength calculation
            existingLinks[slug] = (file.data.links || []).map(link => link.toString())
            
            // Store embedding in file data
            file.data.semanticEmbedding = embedding.embedding
            
            if (isBrowser) {
              console.log(`${cachedEntry ? "Loaded cached" : "Generated"} embedding for: ${slug}`)
            }
          } catch (error) {
            console.error(`Failed to generate embedding for ${slug}:`, error)
          }
        }
        
        console.log(`Generated ${allEmbeddings.length} embeddings`)
        
        // Second pass: Generate semantic links and cross-reference strengths
        for (const [tree, file] of content) {
          const slug = file.data.slug as FullSlug
          const sourceEmbedding = allEmbeddings.find(e => e.slug === slug)
          
          if (!sourceEmbedding) continue
          
          // Generate semantic link suggestions
          if (options.enableSemanticLinks) {
            let suggestions: SemanticLink[] = []
            let fromCache = false
            
            // Check if we have cached semantic links
            if (options.cacheEmbeddings) {
              const cachedEntry = await semanticCache.getEmbedding(
                slug,
                sourceEmbedding.content,
                sourceEmbedding.title,
                sourceEmbedding.tags
              )
              
              if (cachedEntry && cachedEntry.semanticLinks) {
                suggestions = cachedEntry.semanticLinks
                fromCache = true
              }
            }
            
            // Generate new suggestions if not cached
            if (!fromCache) {
              if (isBrowser) {
                // Full semantic analysis in browser
                suggestions = semanticAnalyzer.suggestSemanticLinks(
                  sourceEmbedding,
                  allEmbeddings,
                  {
                    minSimilarity: options.minSimilarity,
                    maxSuggestions: options.maxSuggestedLinks,
                    excludeSelf: true,
                    useSentimentAwareSimilarity: true,
                    sentimentWeight: 0.3,
                    preferSameEmotion: true,
                    polarityTolerance: 1.0
                  }
                )
              } else {
                // Fallback to tag-based suggestions during build
                suggestions = generateTagBasedSuggestions(
                  sourceEmbedding,
                  allEmbeddings,
                  options.maxSuggestedLinks
                )
              }
              
              // Save suggestions to cache if enabled
              if (options.cacheEmbeddings && suggestions.length > 0) {
                await semanticCache.saveEmbedding(slug, sourceEmbedding, suggestions)
              }
            }
            
            // Filter suggestions above threshold
            const filteredSuggestions = suggestions.filter(
              link => link.strength >= options.semanticLinkThreshold
            )
            
            file.data.semanticLinks = filteredSuggestions
            
            if (filteredSuggestions.length > 0) {
              console.log(`${fromCache ? "Loaded cached" : "Generated"} ${filteredSuggestions.length} semantic links for: ${slug}`)
              console.log(`Semantic links for ${slug}:`, filteredSuggestions.map(s => `${s.target} (${s.strength.toFixed(2)})`))
              console.log(`Stored semantic links in file.data.semanticLinks:`, file.data.semanticLinks)
            }
          }
          
          // Calculate cross-reference strengths
          if (options.enableCrossReferenceStrength) {
            const crossReferenceStrengths = new Map()
            
            for (const targetEmbedding of allEmbeddings) {
              if (targetEmbedding.slug === slug) continue
              
              const strength = semanticAnalyzer.calculateCrossReferenceStrength(
                sourceEmbedding,
                targetEmbedding,
                existingLinks
              )
              
              crossReferenceStrengths.set(targetEmbedding.slug, strength)
            }
            
            file.data.crossReferenceStrength = crossReferenceStrengths
          }
        }
        
        console.log("Semantic link discovery completed successfully")
        
      } catch (error) {
        console.error("Error during semantic link discovery:", error)
      }
      
      // Return empty array since we don't emit any files
      return []
    }
  }
}

// Helper function for tag-based suggestions during build time
function generateTagBasedSuggestions(
  sourceEmbedding: SemanticEmbedding,
  allEmbeddings: SemanticEmbedding[],
  maxSuggestions: number
): SemanticLink[] {
  const suggestions: SemanticLink[] = []
  
  console.log(`Generating tag-based suggestions for ${sourceEmbedding.slug} with tags: [${sourceEmbedding.tags.join(", ")}]`)
  
  for (const targetEmbedding of allEmbeddings) {
    if (targetEmbedding.slug === sourceEmbedding.slug) continue
    
    // Calculate shared tags score
    const sharedTags = sourceEmbedding.tags.filter(tag => 
      targetEmbedding.tags.includes(tag)
    )
    
    if (sharedTags.length > 0) {
      const strength = Math.min(sharedTags.length / Math.max(sourceEmbedding.tags.length, 1), 1.0)
      
      console.log(`  - ${targetEmbedding.slug}: ${sharedTags.length} shared tags [${sharedTags.join(", ")}] -> strength: ${strength.toFixed(2)}`)
      
      suggestions.push({
        target: targetEmbedding.slug,
        strength,
        confidence: strength,
        type: "tag-based",
        explanation: `Shares tags: ${sharedTags.join(", ")}`
      })
    }
  }
  
  console.log(`  Total suggestions: ${suggestions.length}`)
  
  return suggestions
    .sort((a, b) => b.strength - a.strength)
    .slice(0, maxSuggestions)
}

export default SemanticLinkDiscovery