import * as use from "@tensorflow-models/universal-sentence-encoder"
import * as tf from "@tensorflow/tfjs-node"
import { FullSlug } from "./path"

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Simple sentiment lexicon for basic sentiment analysis
const SENTIMENT_LEXICON = {
  // Positive words
  amazing: 1.0, awesome: 1.0, excellent: 1.0, fantastic: 1.0, great: 0.8, good: 0.6, 
  wonderful: 1.0, beautiful: 0.8, brilliant: 1.0, perfect: 1.0, outstanding: 1.0,
  impressive: 0.8, inspiring: 0.8, innovative: 0.8, creative: 0.6, fascinating: 0.8,
  interesting: 0.6, promising: 0.6, successful: 0.8, effective: 0.6, powerful: 0.8,
  valuable: 0.6, useful: 0.6, helpful: 0.6, clear: 0.4, elegant: 0.8, sophisticated: 0.6,
  love: 0.8, like: 0.4, enjoy: 0.6, excited: 0.8, happy: 0.8, pleased: 0.6,
  
  // Negative words
  terrible: -1.0, awful: -1.0, horrible: -1.0, bad: -0.6, poor: -0.6, worst: -1.0,
  disappointing: -0.8, frustrating: -0.8, annoying: -0.6, confusing: -0.4, difficult: -0.4,
  challenging: -0.2, problematic: -0.6, complicated: -0.4, unclear: -0.4, messy: -0.6,
  broken: -0.8, failed: -0.8, wrong: -0.6, missing: -0.4, incomplete: -0.4,
  hate: -0.8, dislike: -0.4, boring: -0.6, slow: -0.4, weak: -0.4, limited: -0.4,
  
  // Neutral/objective words that might indicate lower subjectivity
  research: 0.0, study: 0.0, analysis: 0.0, method: 0.0, approach: 0.0, system: 0.0,
  process: 0.0, technique: 0.0, algorithm: 0.0, framework: 0.0, model: 0.0, data: 0.0,
}

class SentimentAnalyzer {
  analyzeSentiment(text: string): {
    polarity: number
    subjectivity: number
    emotion: string
    confidence: number
  } {
    const words = text.toLowerCase().split(/\s+/)
    const sentimentScores: number[] = []
    const subjectivityIndicators: number[] = []
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '')
      if (SENTIMENT_LEXICON.hasOwnProperty(cleanWord)) {
        const score = SENTIMENT_LEXICON[cleanWord as keyof typeof SENTIMENT_LEXICON]
        sentimentScores.push(score)
        
        // Higher absolute values indicate more subjectivity
        subjectivityIndicators.push(Math.abs(score))
      }
    }
    
    // Calculate polarity (average sentiment)
    const polarity = sentimentScores.length > 0 
      ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
      : 0
    
    // Calculate subjectivity (presence of emotional language)
    const subjectivity = subjectivityIndicators.length > 0
      ? Math.min(subjectivityIndicators.reduce((sum, score) => sum + score, 0) / words.length, 1.0)
      : 0
    
    // Determine dominant emotion
    let emotion: string
    if (polarity > 0.2) {
      emotion = 'positive'
    } else if (polarity < -0.2) {
      emotion = 'negative'
    } else {
      emotion = 'neutral'
    }
    
    // Calculate confidence based on number of sentiment words found
    const confidence = Math.min(sentimentScores.length / Math.max(words.length * 0.1, 1), 1.0)
    
    return {
      polarity: Math.max(-1, Math.min(1, polarity)),
      subjectivity: Math.max(0, Math.min(1, subjectivity)),
      emotion,
      confidence
    }
  }
  
  calculateSentimentAlignment(
    sentiment1: NonNullable<SemanticEmbedding['sentiment']>,
    sentiment2: NonNullable<SemanticEmbedding['sentiment']>
  ): { polarityDiff: number; emotionMatch: boolean; compatibility: number } {
    const polarityDiff = sentiment1.polarity - sentiment2.polarity
    const emotionMatch = sentiment1.emotion === sentiment2.emotion
    
    // Calculate compatibility: higher when polarities are close and emotions match
    let compatibility = 1 - Math.abs(polarityDiff) / 2 // 0 to 1 based on polarity difference
    
    if (emotionMatch) {
      compatibility *= 1.2 // Boost for matching emotions
    }
    
    // Consider confidence - lower compatibility if either has low confidence
    const avgConfidence = (sentiment1.confidence + sentiment2.confidence) / 2
    compatibility *= avgConfidence
    
    return {
      polarityDiff,
      emotionMatch,
      compatibility: Math.max(0, Math.min(1, compatibility))
    }
  }
}

export interface SemanticEmbedding {
  slug: FullSlug
  embedding: number[]
  content: string
  title: string
  tags: string[]
  lastUpdated: Date
  sentiment?: {
    polarity: number      // -1 to 1, where -1 is very negative, 1 is very positive
    subjectivity: number  // 0 to 1, where 0 is objective, 1 is subjective
    emotion: string       // dominant emotion: positive, negative, neutral
    confidence: number    // 0 to 1, confidence in sentiment analysis
  }
}

export interface SemanticLink {
  target: FullSlug
  strength: number
  confidence: number
  type: "semantic" | "tag-based" | "explicit"
  explanation?: string
  sentimentAlignment?: {
    polarityDiff: number    // difference in polarity (-2 to 2)
    emotionMatch: boolean   // whether emotions match
    compatibility: number  // 0 to 1, how well sentiments align
  }
}

export interface CrossReferenceStrength {
  source: FullSlug
  target: FullSlug
  strength: number
  bidirectional: boolean
  factors: {
    semanticSimilarity: number
    sharedTags: number
    contentOverlap: number
    linkFrequency: number
    sentimentAlignment?: number
  }
}

export class SemanticAnalyzer {
  private model: use.UniversalSentenceEncoder | null = null
  private embeddingCache: Map<string, SemanticEmbedding> = new Map()
  private initialized = false
  private sentimentAnalyzer = new SentimentAnalyzer()

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    // Skip initialization during build time (Node.js environment)
    if (!isBrowser) {
      console.log("Skipping semantic analysis initialization in Node.js environment")
      return
    }
    
    try {
      console.log("Loading Universal Sentence Encoder model...")
      this.model = await use.load()
      this.initialized = true
      console.log("Semantic analysis model loaded successfully")
    } catch (error) {
      console.error("Failed to load semantic analysis model:", error)
      throw error
    }
  }

  async generateEmbedding(content: string, title: string, tags: string[], slug: FullSlug): Promise<SemanticEmbedding> {
    // Combine title, content, and tags for comprehensive embedding
    const combinedText = this.prepareTextForEmbedding(title, content, tags)
    
    // Analyze sentiment for all content (works in both browser and Node.js)
    const sentiment = this.sentimentAnalyzer.analyzeSentiment(combinedText)
    
    // Skip semantic embedding during build time in Node.js environment
    if (!isBrowser) {
      return {
        slug,
        embedding: new Array(512).fill(0), // Placeholder embedding
        content: combinedText,
        title,
        tags,
        lastUpdated: new Date(),
        sentiment
      }
    }
    
    if (!this.model) {
      throw new Error("SemanticAnalyzer not initialized. Call initialize() first.")
    }

    const cacheKey = `${slug}-${this.hashContent(content)}`
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!
    }
    
    try {
      const embeddings = await this.model.embed([combinedText])
      const embeddingArray = await embeddings.data()
      embeddings.dispose() // Clean up tensor memory
      
      // Convert to regular array (first 512 values for the single text)
      const embedding = Array.from(embeddingArray).slice(0, 512)
      
      const semanticEmbedding: SemanticEmbedding = {
        slug,
        embedding,
        content: combinedText,
        title,
        tags,
        lastUpdated: new Date(),
        sentiment
      }
      
      this.embeddingCache.set(cacheKey, semanticEmbedding)
      return semanticEmbedding
    } catch (error) {
      console.error(`Failed to generate embedding for ${slug}:`, error)
      throw error
    }
  }

  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same length")
    }

    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i]
      norm1 += embedding1[i] * embedding1[i]
      norm2 += embedding2[i] * embedding2[i]
    }

    norm1 = Math.sqrt(norm1)
    norm2 = Math.sqrt(norm2)

    if (norm1 === 0 || norm2 === 0) {
      return 0
    }

    return dotProduct / (norm1 * norm2)
  }

  calculateSentimentAwareSimilarity(
    source: SemanticEmbedding,
    target: SemanticEmbedding,
    options: {
      sentimentWeight?: number // 0 to 1, how much to weight sentiment vs semantic similarity
      preferSameEmotion?: boolean // boost links with same emotion
      polarityTolerance?: number // 0 to 2, how different polarities can be
    } = {}
  ): number {
    const {
      sentimentWeight = 0.3,
      preferSameEmotion = true,
      polarityTolerance = 1.0
    } = options
    
    // Base semantic similarity
    const semanticSimilarity = this.calculateCosineSimilarity(source.embedding, target.embedding)
    
    // If no sentiment data, return just semantic similarity
    if (!source.sentiment || !target.sentiment) {
      return semanticSimilarity
    }
    
    // Calculate sentiment compatibility
    const sentimentAlignment = this.sentimentAnalyzer.calculateSentimentAlignment(source.sentiment, target.sentiment)
    
    // Apply polarity tolerance filter
    if (Math.abs(sentimentAlignment.polarityDiff) > polarityTolerance) {
      // Reduce similarity for very different polarities
      return semanticSimilarity * 0.7
    }
    
    // Boost for same emotion if preferred
    let emotionBoost = 1.0
    if (preferSameEmotion && sentimentAlignment.emotionMatch) {
      emotionBoost = 1.2
    }
    
    // Combine semantic and sentiment similarities
    const combinedSimilarity = (
      semanticSimilarity * (1 - sentimentWeight) +
      sentimentAlignment.compatibility * sentimentWeight
    ) * emotionBoost
    
    return Math.min(combinedSimilarity, 1.0)
  }

  suggestSemanticLinks(
    sourceEmbedding: SemanticEmbedding,
    allEmbeddings: SemanticEmbedding[],
    options: {
      minSimilarity?: number
      maxSuggestions?: number
      excludeSelf?: boolean
      useSentimentAwareSimilarity?: boolean
      sentimentWeight?: number
      preferSameEmotion?: boolean
      polarityTolerance?: number
    } = {}
  ): SemanticLink[] {
    const {
      minSimilarity = 0.3,
      maxSuggestions = 10,
      excludeSelf = true,
      useSentimentAwareSimilarity = false,
      sentimentWeight = 0.3,
      preferSameEmotion = true,
      polarityTolerance = 1.0
    } = options

    const suggestions: SemanticLink[] = []

    for (const targetEmbedding of allEmbeddings) {
      if (excludeSelf && targetEmbedding.slug === sourceEmbedding.slug) {
        continue
      }

      const similarity = useSentimentAwareSimilarity 
        ? this.calculateSentimentAwareSimilarity(sourceEmbedding, targetEmbedding, {
            sentimentWeight,
            preferSameEmotion,
            polarityTolerance
          })
        : this.calculateCosineSimilarity(sourceEmbedding.embedding, targetEmbedding.embedding)

      if (similarity >= minSimilarity) {
        const link: SemanticLink = {
          target: targetEmbedding.slug,
          strength: similarity,
          confidence: this.calculateConfidence(similarity, sourceEmbedding, targetEmbedding),
          type: this.determineSemanticLinkType(sourceEmbedding, targetEmbedding),
          explanation: this.generateLinkExplanation(sourceEmbedding, targetEmbedding, similarity),
          sentimentAlignment: this.calculateSentimentAlignment(sourceEmbedding, targetEmbedding)
        }

        suggestions.push(link)
      }
    }

    // Sort by strength (highest first) and limit results
    return suggestions
      .sort((a, b) => b.strength - a.strength)
      .slice(0, maxSuggestions)
  }

  calculateCrossReferenceStrength(
    source: SemanticEmbedding,
    target: SemanticEmbedding,
    existingLinks: { [key: string]: string[] } = {}
  ): CrossReferenceStrength {
    const semanticSimilarity = this.calculateCosineSimilarity(source.embedding, target.embedding)
    const sharedTags = this.calculateSharedTagsScore(source.tags, target.tags)
    const contentOverlap = this.calculateContentOverlap(source.content, target.content)
    const linkFrequency = this.calculateLinkFrequency(source.slug, target.slug, existingLinks)
    
    // Calculate sentiment alignment if available
    let sentimentAlignment = 0
    if (source.sentiment && target.sentiment) {
      const alignment = this.sentimentAnalyzer.calculateSentimentAlignment(source.sentiment, target.sentiment)
      sentimentAlignment = alignment.compatibility
    }

    // Weighted combination of factors (adjust weights to include sentiment)
    const strength = (
      semanticSimilarity * 0.4 +
      sharedTags * 0.2 +
      contentOverlap * 0.2 +
      linkFrequency * 0.1 +
      sentimentAlignment * 0.1
    )

    return {
      source: source.slug,
      target: target.slug,
      strength: Math.min(strength, 1.0), // Cap at 1.0
      bidirectional: this.isBidirectionalLink(source.slug, target.slug, existingLinks),
      factors: {
        semanticSimilarity,
        sharedTags,
        contentOverlap,
        linkFrequency,
        sentimentAlignment: sentimentAlignment > 0 ? sentimentAlignment : undefined
      }
    }
  }

  private prepareTextForEmbedding(title: string, content: string, tags: string[]): string {
    // Clean and combine text components
    const cleanContent = this.cleanMarkdown(content)
    const tagText = tags.length > 0 ? `Tags: ${tags.join(", ")}` : ""
    
    return `${title}\n\n${cleanContent}\n\n${tagText}`.trim()
  }

  private cleanMarkdown(content: string): string {
    // Remove markdown syntax for better semantic understanding
    return content
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
      .trim()
  }

  private calculateSharedTagsScore(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 || tags2.length === 0) return 0
    
    const set1 = new Set(tags1)
    const set2 = new Set(tags2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size // Jaccard similarity
  }

  private calculateContentOverlap(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/))
    const words2 = new Set(content2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  private calculateLinkFrequency(
    source: FullSlug,
    target: FullSlug,
    existingLinks: { [key: string]: string[] }
  ): number {
    const sourceLinks = existingLinks[source] || []
    const targetLinks = existingLinks[target] || []
    
    let frequency = 0
    if (sourceLinks.includes(target)) frequency += 0.5
    if (targetLinks.includes(source)) frequency += 0.5
    
    return frequency
  }

  private isBidirectionalLink(
    source: FullSlug,
    target: FullSlug,
    existingLinks: { [key: string]: string[] }
  ): boolean {
    const sourceLinks = existingLinks[source] || []
    const targetLinks = existingLinks[target] || []
    
    return sourceLinks.includes(target) && targetLinks.includes(source)
  }

  private calculateConfidence(
    similarity: number,
    source: SemanticEmbedding,
    target: SemanticEmbedding
  ): number {
    // Higher confidence for:
    // - Higher similarity
    // - Shared tags
    // - Recent content
    // - Sentiment alignment
    
    let confidence = similarity
    
    // Boost confidence for shared tags
    if (source.tags.some(tag => target.tags.includes(tag))) {
      confidence *= 1.2
    }
    
    // Boost confidence for recent content
    const daysSinceUpdate = (Date.now() - source.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < 30) {
      confidence *= 1.1
    }
    
    // Factor in sentiment alignment
    if (source.sentiment && target.sentiment) {
      const sentimentAlignment = this.sentimentAnalyzer.calculateSentimentAlignment(source.sentiment, target.sentiment)
      
      // Boost confidence for good sentiment compatibility
      if (sentimentAlignment.compatibility > 0.7) {
        confidence *= 1.15
      }
      
      // Slight boost for emotion matches, even if polarity differs
      if (sentimentAlignment.emotionMatch) {
        confidence *= 1.05
      }
    }
    
    return Math.min(confidence, 1.0)
  }

  private determineSemanticLinkType(
    source: SemanticEmbedding,
    target: SemanticEmbedding
  ): "semantic" | "tag-based" | "explicit" {
    // Check if they share tags
    if (source.tags.some(tag => target.tags.includes(tag))) {
      return "tag-based"
    }
    
    // Default to semantic
    return "semantic"
  }

  private generateLinkExplanation(
    source: SemanticEmbedding,
    target: SemanticEmbedding,
    similarity: number
  ): string {
    const sharedTags = source.tags.filter(tag => target.tags.includes(tag))
    let explanation = ""
    
    if (sharedTags.length > 0) {
      explanation = `Shares tags: ${sharedTags.join(", ")} (${(similarity * 100).toFixed(1)}% similarity)`
    } else {
      explanation = `Semantically similar content (${(similarity * 100).toFixed(1)}% similarity)`
    }
    
    // Add sentiment information if available
    if (source.sentiment && target.sentiment) {
      const sentimentAlignment = this.sentimentAnalyzer.calculateSentimentAlignment(source.sentiment, target.sentiment)
      if (sentimentAlignment.emotionMatch) {
        explanation += ` • Similar ${source.sentiment.emotion} sentiment`
      } else {
        explanation += ` • Contrasting sentiments (${source.sentiment.emotion} vs ${target.sentiment.emotion})`
      }
    }
    
    return explanation
  }

  private hashContent(content: string): string {
    // Simple hash function for cache keys
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  clearCache(): void {
    this.embeddingCache.clear()
  }

  getCacheSize(): number {
    return this.embeddingCache.size
  }

  private calculateSentimentAlignment(
    source: SemanticEmbedding,
    target: SemanticEmbedding
  ): { polarityDiff: number; emotionMatch: boolean; compatibility: number } | undefined {
    if (!source.sentiment || !target.sentiment) {
      return undefined
    }
    
    return this.sentimentAnalyzer.calculateSentimentAlignment(source.sentiment, target.sentiment)
  }
}

// Global instance
export const semanticAnalyzer = new SemanticAnalyzer()