import { FullSlug, resolveRelative } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

interface Recommendation {
  slug: FullSlug
  title: string
  description: string
  score: number
  explanation?: string
  tags?: string[]
  date?: Date
}

interface UserInteraction {
  slug: FullSlug
  timestamp: number
  duration: number
  scrollDepth: number
}

const STORAGE_KEY = "quartz-ai-recommendations"
const MAX_HISTORY = 100

class RecommendationEngine {
  private interactions: UserInteraction[] = []
  private contentIndex: ContentIndex = {}
  private embeddings: Record<string, number[]> = {}
  
  constructor() {
    this.loadInteractions()
    this.trackCurrentPage()
  }
  
  private loadInteractions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.interactions = JSON.parse(stored)
          .slice(-MAX_HISTORY)
          .map((i: any) => ({
            ...i,
            timestamp: new Date(i.timestamp).getTime()
          }))
      }
    } catch (e) {
      console.warn("Failed to load interaction history", e)
    }
  }
  
  private saveInteractions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.interactions))
    } catch (e) {
      console.warn("Failed to save interactions", e)
    }
  }
  
  private trackCurrentPage() {
    const startTime = Date.now()
    let maxScroll = 0
    
    const updateScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      maxScroll = Math.max(maxScroll, scrollPercent)
    }
    
    window.addEventListener("scroll", updateScroll)
    
    const saveInteraction = () => {
      const currentSlug = document.querySelector<HTMLElement>(".ai-recommendations")?.dataset.currentSlug as FullSlug
      if (!currentSlug) return
      
      const duration = Date.now() - startTime
      this.interactions.push({
        slug: currentSlug,
        timestamp: startTime,
        duration,
        scrollDepth: maxScroll
      })
      
      this.interactions = this.interactions.slice(-MAX_HISTORY)
      this.saveInteractions()
    }
    
    window.addEventListener("beforeunload", saveInteraction)
    window.addCleanup(() => {
      window.removeEventListener("scroll", updateScroll)
      window.removeEventListener("beforeunload", saveInteraction)
    })
  }
  
  async loadContentData() {
    try {
      this.contentIndex = await fetchData
      
      // Try to load embeddings
      const embResponse = await fetch("/static/embeddings.json")
      if (embResponse.ok) {
        const embData = await embResponse.json()
        this.embeddings = embData.embeddings
      }
    } catch (e) {
      console.warn("Failed to load content data", e)
    }
  }
  
  private calculateContentSimilarity(slug1: FullSlug, slug2: FullSlug): number {
    const content1 = this.contentIndex[slug1]
    const content2 = this.contentIndex[slug2]
    
    if (!content1 || !content2) return 0
    
    // Tag similarity
    const tags1 = new Set(content1.tags || [])
    const tags2 = new Set(content2.tags || [])
    const tagIntersection = [...tags1].filter(t => tags2.has(t)).length
    const tagUnion = new Set([...tags1, ...tags2]).size
    const tagSimilarity = tagUnion > 0 ? tagIntersection / tagUnion : 0
    
    // Title/content similarity (simple word overlap)
    const words1 = new Set((content1.title + " " + content1.content).toLowerCase().split(/\W+/))
    const words2 = new Set((content2.title + " " + content2.content).toLowerCase().split(/\W+/))
    const wordIntersection = [...words1].filter(w => words2.has(w) && w.length > 3).length
    const wordUnion = new Set([...words1, ...words2]).size
    const wordSimilarity = wordUnion > 0 ? wordIntersection / wordUnion : 0
    
    // Embedding similarity if available
    let embeddingSimilarity = 0
    if (this.embeddings[slug1] && this.embeddings[slug2]) {
      embeddingSimilarity = this.cosineSimilarity(this.embeddings[slug1], this.embeddings[slug2])
    }
    
    // Weighted combination
    return tagSimilarity * 0.3 + wordSimilarity * 0.3 + embeddingSimilarity * 0.4
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
  
  getRelatedContent(currentSlug: FullSlug, limit: number): Recommendation[] {
    const scores: Map<FullSlug, number> = new Map()
    
    for (const slug of Object.keys(this.contentIndex) as FullSlug[]) {
      if (slug === currentSlug) continue
      
      const similarity = this.calculateContentSimilarity(currentSlug, slug)
      if (similarity > 0.1) {
        scores.set(slug, similarity)
      }
    }
    
    return this.formatRecommendations(scores, limit, "similar content")
  }
  
  getPersonalizedContent(currentSlug: FullSlug, limit: number): Recommendation[] {
    const scores: Map<FullSlug, number> = new Map()
    const viewedSlugs = new Set(this.interactions.map(i => i.slug))
    
    // Calculate user preferences based on interaction history
    const preferenceVector = this.calculateUserPreferences()
    
    for (const slug of Object.keys(this.contentIndex) as FullSlug[]) {
      if (slug === currentSlug) continue
      
      let score = 0
      
      // Similarity to previously viewed content
      for (const interaction of this.interactions.slice(-10)) {
        const similarity = this.calculateContentSimilarity(slug, interaction.slug)
        const recency = 1 - (Date.now() - interaction.timestamp) / (7 * 24 * 60 * 60 * 1000) // 7 days
        const engagement = interaction.scrollDepth * (Math.min(interaction.duration, 300000) / 300000) // cap at 5 min
        
        score += similarity * recency * engagement * 0.3
      }
      
      // Similarity to current page
      score += this.calculateContentSimilarity(currentSlug, slug) * 0.2
      
      // Boost for unread content
      if (!viewedSlugs.has(slug)) {
        score *= 1.2
      }
      
      // Tag preference matching
      const content = this.contentIndex[slug]
      if (content.tags) {
        for (const tag of content.tags) {
          score += (preferenceVector.tags[tag] || 0) * 0.1
        }
      }
      
      if (score > 0.05) {
        scores.set(slug, score)
      }
    }
    
    return this.formatRecommendations(scores, limit, "based on your reading history")
  }
  
  getTrendingContent(limit: number): Recommendation[] {
    const scores: Map<FullSlug, number> = new Map()
    
    // Since we don't have global analytics, simulate trending based on:
    // 1. Recent additions (modified date)
    // 2. Content with many backlinks
    // 3. Random boost for variety
    
    for (const [slug, content] of Object.entries(this.contentIndex) as [FullSlug, ContentDetails][]) {
      let score = 0
      
      // Recency score
      if (content.date) {
        const age = Date.now() - new Date(content.date).getTime()
        score += Math.max(0, 1 - age / (30 * 24 * 60 * 60 * 1000)) * 0.5 // 30 days
      }
      
      // Backlink score (simulated by tag count and content length)
      score += (content.tags?.length || 0) * 0.1
      score += Math.min(content.content.length / 10000, 1) * 0.2
      
      // Random variety
      score += Math.random() * 0.2
      
      if (score > 0.1) {
        scores.set(slug, score)
      }
    }
    
    return this.formatRecommendations(scores, limit, "trending now")
  }
  
  private calculateUserPreferences() {
    const tagCounts: Record<string, number> = {}
    const wordCounts: Record<string, number> = {}
    
    for (const interaction of this.interactions) {
      const content = this.contentIndex[interaction.slug]
      if (!content) continue
      
      const weight = interaction.scrollDepth * (Math.min(interaction.duration, 300000) / 300000)
      
      // Count tags
      for (const tag of content.tags || []) {
        tagCounts[tag] = (tagCounts[tag] || 0) + weight
      }
      
      // Count significant words
      const words = (content.title + " " + content.content)
        .toLowerCase()
        .split(/\W+/)
        .filter(w => w.length > 5)
      
      for (const word of words) {
        wordCounts[word] = (wordCounts[word] || 0) + weight
      }
    }
    
    return { tags: tagCounts, words: wordCounts }
  }
  
  private formatRecommendations(scores: Map<FullSlug, number>, limit: number, defaultExplanation: string): Recommendation[] {
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([slug, score]) => {
        const content = this.contentIndex[slug]
        return {
          slug,
          title: content.title,
          description: content.content.slice(0, 150) + "...",
          score,
          explanation: score > 0.7 ? "Highly relevant" : 
                       score > 0.4 ? "Good match" : 
                       defaultExplanation,
          tags: content.tags,
          date: content.date ? new Date(content.date) : undefined
        }
      })
  }
}

async function setupRecommendations() {
  const containers = document.querySelectorAll(".recommendations-container")
  
  for (const container of containers) {
    const currentSlug = container.getAttribute("data-current-slug") as FullSlug
    const mode = container.getAttribute("data-mode") as "related" | "personalized" | "trending"
    const maxItems = parseInt(container.getAttribute("data-max-items") || "5")
    const showExplanations = container.getAttribute("data-show-explanations") === "true"
    const showDescription = container.getAttribute("data-show-description") === "true"
    
    const engine = new RecommendationEngine()
    await engine.loadContentData()
    
    let recommendations: Recommendation[] = []
    
    switch (mode) {
      case "related":
        recommendations = engine.getRelatedContent(currentSlug, maxItems)
        break
      case "personalized":
        recommendations = engine.getPersonalizedContent(currentSlug, maxItems)
        break
      case "trending":
        recommendations = engine.getTrendingContent(maxItems)
        break
    }
    
    // Render recommendations
    container.innerHTML = ""
    
    if (recommendations.length === 0) {
      container.innerHTML = `<p class="no-recommendations">No recommendations available yet. Keep exploring!</p>`
      return
    }
    
    const list = document.createElement("ul")
    list.className = "recommendation-list"
    
    for (const rec of recommendations) {
      const item = document.createElement("li")
      item.className = "recommendation-item"
      
      const link = document.createElement("a")
      link.href = resolveRelative(currentSlug, rec.slug)
      link.className = "recommendation-link"
      
      const title = document.createElement("h4")
      title.textContent = rec.title
      link.appendChild(title)
      
      if (showDescription) {
        const desc = document.createElement("p")
        desc.className = "recommendation-description"
        desc.textContent = rec.description
        link.appendChild(desc)
      }
      
      if (rec.tags && rec.tags.length > 0) {
        const tags = document.createElement("div")
        tags.className = "recommendation-tags"
        for (const tag of rec.tags.slice(0, 3)) {
          const tagEl = document.createElement("span")
          tagEl.className = "tag"
          tagEl.textContent = `#${tag}`
          tags.appendChild(tagEl)
        }
        link.appendChild(tags)
      }
      
      if (showExplanations && rec.explanation) {
        const explanation = document.createElement("span")
        explanation.className = "recommendation-explanation"
        explanation.textContent = rec.explanation
        link.appendChild(explanation)
      }
      
      item.appendChild(link)
      list.appendChild(item)
    }
    
    container.appendChild(list)
    
    // Setup mode switching
    const modeButtons = container.closest(".ai-recommendations")?.querySelectorAll(".mode-btn")
    modeButtons?.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const newMode = (e.currentTarget as HTMLElement).dataset.mode
        container.setAttribute("data-mode", newMode!)
        
        // Update active state
        modeButtons.forEach(b => b.classList.remove("active"))
        ;(e.currentTarget as HTMLElement).classList.add("active")
        
        // Re-render
        await setupRecommendations()
      })
    })
  }
}

// Wait for content index to be available
document.addEventListener("nav", async () => {
  // Small delay to ensure fetchData is available
  setTimeout(() => setupRecommendations(), 100)
})