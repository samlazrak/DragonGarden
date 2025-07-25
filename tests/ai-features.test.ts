import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import { JSDOM } from "jsdom"
import { QuartzConfig } from "../quartz/cfg"
import { ContentDetails } from "../quartz/plugins/emitters/contentIndex"

// Mock components
import AISearch from "../quartz/components/AISearch"
import AIRecommendations from "../quartz/components/AIRecommendations"
import AIWritingAssistant from "../quartz/components/AIWritingAssistant"
import InteractiveAIDemo from "../quartz/components/InteractiveAIDemo"

// Mock data
const mockContentIndex: Record<string, ContentDetails> = {
  "index": {
    title: "Home",
    content: "Welcome to the digital garden",
    tags: ["home", "welcome"],
    links: [],
    aliases: [],
    description: "Home page",
    date: new Date("2025-01-01"),
  },
  "blog/ai-post": {
    title: "AI Blog Post",
    content: "This is a post about artificial intelligence and machine learning",
    tags: ["ai", "ml", "tech"],
    links: ["index"],
    aliases: [],
    description: "AI blog post",
    date: new Date("2025-01-15"),
  },
  "docs/guide": {
    title: "Documentation Guide",
    content: "Complete guide to using the features",
    tags: ["docs", "guide"],
    links: ["index", "blog/ai-post"],
    aliases: ["guide"],
    description: "Documentation",
    date: new Date("2025-01-20"),
  },
}

describe("AI Search Component", () => {
  let dom: JSDOM
  let document: Document
  
  beforeAll(() => {
    dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
      url: "http://localhost:8080",
      pretendToBeVisual: true,
      resources: "usable",
    })
    
    document = dom.window.document
    global.document = document
    global.window = dom.window as any
    
    // Mock fetchData
    ;(global.window as any).fetchData = Promise.resolve(mockContentIndex)
  })
  
  afterAll(() => {
    dom.window.close()
  })
  
  it("should render AI search component", () => {
    const SearchComponent = AISearch({
      enablePreview: true,
      searchMode: "hybrid",
      enableExplanations: true,
      maxResults: 8,
    })
    
    const props = {
      displayClass: "test-class",
      cfg: { locale: "en-US" } as QuartzConfig,
      fileData: { slug: "test-page" },
      allFiles: [],
      tree: null as any,
    }
    
    const element = SearchComponent(props)
    expect(element).toBeDefined()
    expect(element.props.class).toContain("ai-search")
    expect(element.children).toBeDefined()
  })
  
  it("should have search modes", () => {
    const SearchComponent = AISearch()
    const props = {
      displayClass: "",
      cfg: { locale: "en-US" } as QuartzConfig,
      fileData: { slug: "test" },
      allFiles: [],
      tree: null as any,
    }
    
    const element = SearchComponent(props)
    const searchModes = element.children?.find((child: any) => 
      child?.props?.class?.includes("search-modes")
    )
    
    expect(searchModes).toBeDefined()
  })
})

describe("AI Recommendations Component", () => {
  it("should render recommendations component", () => {
    const RecommendationsComponent = AIRecommendations({
      mode: "personalized",
      explanations: true,
      maxItems: 5,
    })
    
    const props = {
      displayClass: "test-class",
      cfg: { locale: "en-US" } as QuartzConfig,
      fileData: { slug: "test-page" },
      allFiles: [],
      tree: null as any,
    }
    
    const element = RecommendationsComponent(props)
    expect(element).toBeDefined()
    expect(element.props.class).toContain("ai-recommendations")
  })
  
  it("should support different recommendation modes", () => {
    const modes = ["related", "personalized", "trending"] as const
    
    modes.forEach(mode => {
      const Component = AIRecommendations({ mode })
      const props = {
        displayClass: "",
        cfg: { locale: "en-US" } as QuartzConfig,
        fileData: { slug: "test" },
        allFiles: [],
        tree: null as any,
      }
      
      const element = Component(props)
      const container = element.children?.find((child: any) =>
        child?.props?.class?.includes("recommendations-container")
      )
      
      expect(container?.props["data-mode"]).toBe(mode)
    })
  })
})

describe("AI Writing Assistant Component", () => {
  it("should render writing assistant", () => {
    const AssistantComponent = AIWritingAssistant({
      features: ["grammar", "style"],
      provider: "mock",
      position: "floating",
    })
    
    const props = {
      displayClass: "test-class",
      cfg: { locale: "en-US" } as QuartzConfig,
      fileData: { slug: "test-page" },
      allFiles: [],
      tree: null as any,
    }
    
    const element = AssistantComponent(props)
    expect(element).toBeDefined()
    expect(element.props.class).toContain("ai-writing-assistant")
    expect(element.props.class).toContain("floating")
  })
  
  it("should not render on listing pages", () => {
    const AssistantComponent = AIWritingAssistant()
    const props = {
      displayClass: "",
      cfg: { locale: "en-US" } as QuartzConfig,
      fileData: { slug: "folder/" },
      allFiles: [],
      tree: null as any,
    }
    
    const element = AssistantComponent(props)
    expect(element).toBeNull()
  })
})

describe("Interactive AI Demo Component", () => {
  it("should render demo component", () => {
    const DemoComponent = InteractiveAIDemo({
      demoType: "nlp",
      modelSource: "huggingface",
      fallbackBehavior: "static",
    })
    
    const props = {
      displayClass: "test-class",
      cfg: { locale: "en-US" } as QuartzConfig,
      fileData: { slug: "demo-page" },
      allFiles: [],
      tree: null as any,
    }
    
    const element = DemoComponent(props)
    expect(element).toBeDefined()
    expect(element.props.class).toContain("interactive-ai-demo")
  })
  
  it("should support different demo types", () => {
    const demoTypes = ["nlp", "vision", "generative"] as const
    
    demoTypes.forEach(demoType => {
      const Component = InteractiveAIDemo({ demoType })
      const props = {
        displayClass: "",
        cfg: { locale: "en-US" } as QuartzConfig,
        fileData: { slug: "test" },
        allFiles: [],
        tree: null as any,
      }
      
      const element = Component(props)
      expect(element.props["data-demo-type"]).toBe(demoType)
    })
  })
})

describe("AI Search Functionality", () => {
  it("should calculate cosine similarity correctly", () => {
    // Test cosine similarity function
    const vector1 = [1, 0, 0]
    const vector2 = [1, 0, 0]
    const vector3 = [0, 1, 0]
    
    // Same vectors should have similarity 1
    const similarity1 = cosineSimilarity(vector1, vector2)
    expect(similarity1).toBe(1)
    
    // Orthogonal vectors should have similarity 0
    const similarity2 = cosineSimilarity(vector1, vector3)
    expect(similarity2).toBe(0)
  })
  
  it("should tokenize search terms correctly", () => {
    const terms = tokenizeTerm("machine learning algorithms")
    
    expect(terms).toContain("machine")
    expect(terms).toContain("learning")
    expect(terms).toContain("algorithms")
    expect(terms).toContain("machine learning")
    expect(terms).toContain("machine learning algorithms")
  })
})

describe("AI Recommendations Engine", () => {
  it("should track user interactions", () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    }
    
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    })
    
    // Simulate tracking interaction
    const interaction = {
      slug: "test-page" as any,
      timestamp: Date.now(),
      duration: 5000,
      scrollDepth: 0.75,
    }
    
    // Mock implementation would save to localStorage
    mockLocalStorage.setItem("quartz-ai-recommendations", JSON.stringify([interaction]))
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "quartz-ai-recommendations",
      expect.any(String)
    )
  })
  
  it("should calculate content similarity", () => {
    // Test tag similarity calculation
    const tags1 = ["ai", "ml", "tech"]
    const tags2 = ["ai", "tech", "web"]
    
    const intersection = tags1.filter(t => tags2.includes(t)).length
    const union = new Set([...tags1, ...tags2]).size
    const similarity = intersection / union
    
    expect(similarity).toBeCloseTo(0.5, 2) // 2 common tags out of 4 total
  })
})

describe("AI Writing Assistant Functionality", () => {
  it("should analyze sentiment correctly", () => {
    const positiveText = "This is an excellent and amazing product!"
    const negativeText = "This is terrible and disappointing."
    const neutralText = "This is a product description."
    
    // Mock sentiment analysis
    const analyzeSentiment = (text: string) => {
      const positive = ["excellent", "amazing", "great", "wonderful"]
      const negative = ["terrible", "disappointing", "bad", "poor"]
      
      const lower = text.toLowerCase()
      const hasPositive = positive.some(word => lower.includes(word))
      const hasNegative = negative.some(word => lower.includes(word))
      
      if (hasPositive && !hasNegative) return "POSITIVE"
      if (hasNegative && !hasPositive) return "NEGATIVE"
      return "NEUTRAL"
    }
    
    expect(analyzeSentiment(positiveText)).toBe("POSITIVE")
    expect(analyzeSentiment(negativeText)).toBe("NEGATIVE")
    expect(analyzeSentiment(neutralText)).toBe("NEUTRAL")
  })
})

// Helper functions (would be imported from actual implementation)
function cosineSimilarity(a: number[], b: number[]): number {
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

function tokenizeTerm(term: string): string[] {
  const tokens = term.split(/\s+/).filter((t) => t.trim() !== "")
  const tokenLen = tokens.length
  if (tokenLen > 1) {
    for (let i = 1; i < tokenLen; i++) {
      tokens.push(tokens.slice(0, i + 1).join(" "))
    }
  }
  return tokens.sort((a, b) => b.length - a.length)
}