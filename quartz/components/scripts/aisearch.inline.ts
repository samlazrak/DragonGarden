import FlexSearch from "flexsearch"
import { ContentDetails } from "../../plugins/emitters/contentIndex"
import { registerEscapeHandler, removeAllChildren } from "./util"
import { FullSlug, normalizeRelativeURLs, resolveRelative } from "../../util/path"

interface Item {
  id: number
  slug: FullSlug
  title: string
  content: string
  tags: string[]
  score?: number
  explanation?: string
}

interface EmbeddingData {
  embeddings: Record<string, number[]>
  model: string
  dimensions: number
}

type SearchType = "keyword" | "semantic" | "hybrid"
type SearchMode = "basic" | "tags"

let searchType: SearchType = "hybrid"
let searchMode: SearchMode = "basic"
let currentSearchTerm: string = ""
let embeddings: EmbeddingData | null = null
let searchEmbeddingCache: Map<string, number[]> = new Map()

const encoder = (str: string) => str.toLowerCase().split(/([^a-z]|[^\x00-\x7F])/)
let index = new FlexSearch.Document<Item>({
  charset: "latin:extra",
  encode: encoder,
  document: {
    id: "id",
    tag: "tags",
    index: [
      {
        field: "title",
        tokenize: "forward",
      },
      {
        field: "content",
        tokenize: "forward",
      },
      {
        field: "tags",
        tokenize: "forward",
      },
    ],
  },
})

const p = new DOMParser()
const fetchContentCache: Map<FullSlug, Element[]> = new Map()
const contextWindowWords = 30
const numSearchResults = 8
const numTagResults = 5

async function loadEmbeddings(): Promise<void> {
  if (embeddings) return
  
  try {
    const response = await fetch("/static/embeddings.json")
    if (response.ok) {
      embeddings = await response.json()
      console.log(`Loaded ${Object.keys(embeddings.embeddings).length} embeddings`)
    }
  } catch (error) {
    console.warn("Failed to load embeddings, falling back to keyword search", error)
  }
}

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

async function getSearchEmbedding(query: string): Promise<number[] | null> {
  if (!embeddings) return null
  
  if (searchEmbeddingCache.has(query)) {
    return searchEmbeddingCache.get(query)!
  }
  
  // In a real implementation, this would call an API or use a client-side model
  // For now, we'll use a simple average of word embeddings from our corpus
  const words = query.toLowerCase().split(/\s+/)
  const wordEmbeddings: number[][] = []
  
  for (const [slug, embedding] of Object.entries(embeddings.embeddings)) {
    const content = index.get(slug)?.[0]
    if (content && words.some(word => content.content.toLowerCase().includes(word))) {
      wordEmbeddings.push(embedding)
    }
  }
  
  if (wordEmbeddings.length === 0) return null
  
  // Average the embeddings
  const avgEmbedding = new Array(embeddings.dimensions).fill(0)
  for (const emb of wordEmbeddings) {
    for (let i = 0; i < emb.length; i++) {
      avgEmbedding[i] += emb[i]
    }
  }
  
  for (let i = 0; i < avgEmbedding.length; i++) {
    avgEmbedding[i] /= wordEmbeddings.length
  }
  
  searchEmbeddingCache.set(query, avgEmbedding)
  return avgEmbedding
}

async function semanticSearch(query: string, limit: number): Promise<Item[]> {
  if (!embeddings) return []
  
  const queryEmbedding = await getSearchEmbedding(query)
  if (!queryEmbedding) return []
  
  const results: Array<{ slug: string; score: number }> = []
  
  for (const [slug, docEmbedding] of Object.entries(embeddings.embeddings)) {
    const similarity = cosineSimilarity(queryEmbedding, docEmbedding)
    results.push({ slug, score: similarity })
  }
  
  results.sort((a, b) => b.score - a.score)
  
  return results.slice(0, limit).map(({ slug, score }) => {
    const item = index.get(slug as FullSlug)?.[0]
    if (!item) return null
    
    return {
      ...item,
      score,
      explanation: `Semantic similarity: ${(score * 100).toFixed(1)}%`
    }
  }).filter(Boolean) as Item[]
}

async function hybridSearch(query: string, limit: number): Promise<Item[]> {
  // Get both keyword and semantic results
  const [keywordResults, semanticResults] = await Promise.all([
    index.searchAsync({
      query: query,
      limit: limit * 2,
      index: ["title", "content"],
    }),
    semanticSearch(query, limit)
  ])
  
  // Combine and deduplicate results
  const resultMap = new Map<number, Item>()
  
  // Add keyword results with normalized scores
  const keywordIds = keywordResults.flatMap(r => r.result as number[])
  keywordIds.forEach((id, idx) => {
    const item = formatForDisplay(query, id)
    item.score = 1 - (idx / keywordIds.length) * 0.5 // 1.0 to 0.5
    item.explanation = "Keyword match"
    resultMap.set(id, item)
  })
  
  // Merge semantic results
  for (const semResult of semanticResults) {
    const existing = resultMap.get(semResult.id)
    if (existing) {
      // Combine scores for items found by both methods
      existing.score = (existing.score! + semResult.score!) / 2
      existing.explanation = "Keyword + Semantic match"
    } else {
      semResult.score = semResult.score! * 0.8 // Slightly lower weight for semantic-only
      resultMap.set(semResult.id, semResult)
    }
  }
  
  // Sort by combined score and return top results
  return Array.from(resultMap.values())
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit)
}

const tokenizeTerm = (term: string) => {
  const tokens = term.split(/\s+/).filter((t) => t.trim() !== "")
  const tokenLen = tokens.length
  if (tokenLen > 1) {
    for (let i = 1; i < tokenLen; i++) {
      tokens.push(tokens.slice(0, i + 1).join(" "))
    }
  }
  return tokens.sort((a, b) => b.length - a.length)
}

function highlight(searchTerm: string, text: string, trim?: boolean) {
  const tokenizedTerms = tokenizeTerm(searchTerm)
  let tokenizedText = text.split(/\s+/).filter((t) => t !== "")

  let startIndex = 0
  let endIndex = tokenizedText.length - 1
  if (trim) {
    const includesCheck = (tok: string) =>
      tokenizedTerms.some((term) => tok.toLowerCase().startsWith(term.toLowerCase()))
    const occurrencesIndices = tokenizedText.map(includesCheck)

    let bestSum = 0
    let bestIndex = 0
    for (let i = 0; i < Math.max(tokenizedText.length - contextWindowWords, 0); i++) {
      const window = occurrencesIndices.slice(i, i + contextWindowWords)
      const windowSum = window.reduce((total, cur) => total + (cur ? 1 : 0), 0)
      if (windowSum >= bestSum) {
        bestSum = windowSum
        bestIndex = i
      }
    }

    startIndex = Math.max(bestIndex - contextWindowWords, 0)
    endIndex = Math.min(startIndex + 2 * contextWindowWords, tokenizedText.length - 1)
    tokenizedText = tokenizedText.slice(startIndex, endIndex)
  }

  const slice = tokenizedText
    .map((tok) => {
      for (const searchTok of tokenizedTerms) {
        if (tok.toLowerCase().includes(searchTok.toLowerCase())) {
          const regex = new RegExp(searchTok.toLowerCase(), "gi")
          return tok.replace(regex, `<span class="highlight">$&</span>`)
        }
      }
      return tok
    })
    .join(" ")

  return `${startIndex === 0 ? "" : "..."}${slice}${
    endIndex === tokenizedText.length - 1 ? "" : "..."
  }`
}

function highlightHTML(searchTerm: string, el: HTMLElement) {
  const p = new DOMParser()
  const tokenizedTerms = tokenizeTerm(searchTerm)
  const html = p.parseFromString(el.innerHTML, "text/html")

  const createHighlightSpan = (text: string) => {
    const span = document.createElement("span")
    span.className = "highlight"
    span.textContent = text
    return span
  }

  const highlightTextNodes = (node: Node, term: string) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const nodeText = node.nodeValue ?? ""
      const regex = new RegExp(term.toLowerCase(), "gi")
      const matches = nodeText.match(regex)
      if (!matches || matches.length === 0) return
      const spanContainer = document.createElement("span")
      let lastIndex = 0
      for (const match of matches) {
        const matchIndex = nodeText.indexOf(match, lastIndex)
        spanContainer.appendChild(document.createTextNode(nodeText.slice(lastIndex, matchIndex)))
        spanContainer.appendChild(createHighlightSpan(match))
        lastIndex = matchIndex + match.length
      }
      spanContainer.appendChild(document.createTextNode(nodeText.slice(lastIndex)))
      node.parentNode?.replaceChild(spanContainer, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if ((node as HTMLElement).classList.contains("highlight")) return
      Array.from(node.childNodes).forEach((child) => highlightTextNodes(child, term))
    }
  }

  for (const term of tokenizedTerms) {
    highlightTextNodes(html.body, term)
  }

  return html.body
}

function highlightTags(term: string, tags: string[]) {
  if (!tags || searchMode !== "tags") {
    return []
  }

  return tags
    .map((tag) => {
      if (tag.toLowerCase().includes(term.toLowerCase())) {
        return `<li><p class="match-tag">#${tag}</p></li>`
      } else {
        return `<li><p>#${tag}</p></li>`
      }
    })
    .slice(0, numTagResults)
}

const idDataMap: FullSlug[] = []

function formatForDisplay(term: string, id: number): Item {
  const slug = idDataMap[id]
  const data = (window as any).contentIndex as ContentIndex
  return {
    id,
    slug,
    title: searchMode === "tags" ? data[slug].title : highlight(term, data[slug].title ?? ""),
    content: highlight(term, data[slug].content ?? "", true),
    tags: highlightTags(term.substring(1), data[slug].tags),
  }
}

async function setupSearch(searchElement: Element, currentSlug: FullSlug, data: ContentIndex) {
  const container = searchElement.querySelector(".search-container") as HTMLElement
  if (!container) return

  const sidebar = container.closest(".sidebar") as HTMLElement | null

  const searchButton = searchElement.querySelector(".search-button") as HTMLButtonElement
  if (!searchButton) return

  const searchBar = searchElement.querySelector(".search-bar") as HTMLInputElement
  if (!searchBar) return

  const searchLayout = searchElement.querySelector(".search-layout") as HTMLElement
  if (!searchLayout) return

  // Load configuration from data attributes
  const enablePreview = searchLayout.dataset.preview === "true"
  const initialSearchType = (searchLayout.dataset.mode || "hybrid") as SearchType
  const enableExplanations = searchLayout.dataset.explanations === "true"
  const maxResults = parseInt(searchLayout.dataset.maxResults || "8")
  
  searchType = initialSearchType

  // Setup mode buttons
  const modeButtons = searchElement.querySelectorAll(".mode-button")
  modeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLElement
      const mode = target.dataset.mode as SearchType
      
      // Update active state
      modeButtons.forEach(b => b.classList.remove("active"))
      target.classList.add("active")
      
      // Update search type and re-run search
      searchType = mode
      if (currentSearchTerm) {
        onType({ target: searchBar } as any)
      }
    })
  })

  // Populate idDataMap
  idDataMap.length = 0
  idDataMap.push(...(Object.keys(data) as FullSlug[]))

  const appendLayout = (el: HTMLElement) => {
    searchLayout.appendChild(el)
  }

  let preview: HTMLDivElement | undefined = undefined
  let previewInner: HTMLDivElement | undefined = undefined
  const results = document.createElement("div")
  results.className = "results-container"
  appendLayout(results)

  if (enablePreview) {
    preview = document.createElement("div")
    preview.className = "preview-container"
    appendLayout(preview)
  }

  // Load embeddings
  await loadEmbeddings()

  function hideSearch() {
    container.classList.remove("active")
    searchBar.value = ""
    if (sidebar) sidebar.style.zIndex = ""
    removeAllChildren(results)
    if (preview) {
      removeAllChildren(preview)
    }
    searchLayout.classList.remove("display-results")
    searchMode = "basic"
    searchButton.focus()
  }

  function showSearch(mode: SearchMode) {
    searchMode = mode
    if (sidebar) sidebar.style.zIndex = "1"
    container.classList.add("active")
    searchBar.focus()
  }

  function resolveUrl(slug: FullSlug): URL {
    return new URL(resolveRelative(currentSlug, slug), location.toString())
  }

  const resultToHTML = ({ slug, title, content, tags, score, explanation }: Item) => {
    const htmlTags = tags.length > 0 ? `<ul class="tags">${tags.join("")}</ul>` : ``
    const scoreDisplay = enableExplanations && explanation ? 
      `<span class="search-explanation">${explanation}</span>` : ""
    
    const itemTile = document.createElement("a")
    itemTile.classList.add("result-card")
    itemTile.id = slug
    itemTile.href = resolveUrl(slug).toString()
    itemTile.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${title}</h3>
        ${scoreDisplay}
      </div>
      ${htmlTags}
      <p class="card-description">${content}</p>
    `
    
    itemTile.addEventListener("click", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      hideSearch()
    })

    async function onMouseEnter(ev: MouseEvent) {
      if (!ev.target) return
      const target = ev.target as HTMLInputElement
      await displayPreview(target)
    }

    itemTile.addEventListener("mouseenter", onMouseEnter)
    window.addCleanup(() => itemTile.removeEventListener("mouseenter", onMouseEnter))

    return itemTile
  }

  let currentHover: HTMLInputElement | null = null

  async function displayResults(finalResults: Item[]) {
    removeAllChildren(results)
    if (finalResults.length === 0) {
      results.innerHTML = `<a class="result-card no-match">
          <h3>No results.</h3>
          <p>Try another search term?</p>
      </a>`
    } else {
      results.append(...finalResults.map(resultToHTML))
    }

    if (finalResults.length === 0 && preview) {
      removeAllChildren(preview)
    } else {
      const firstChild = results.firstElementChild as HTMLElement
      firstChild.classList.add("focus")
      currentHover = firstChild as HTMLInputElement
      await displayPreview(firstChild)
    }
  }

  async function fetchContent(slug: FullSlug): Promise<Element[]> {
    if (fetchContentCache.has(slug)) {
      return fetchContentCache.get(slug) as Element[]
    }

    const targetUrl = resolveUrl(slug).toString()
    const contents = await fetch(targetUrl)
      .then((res) => res.text())
      .then((contents) => {
        if (contents === undefined) {
          throw new Error(`Could not fetch ${targetUrl}`)
        }
        const html = p.parseFromString(contents ?? "", "text/html")
        normalizeRelativeURLs(html, targetUrl)
        return [...html.getElementsByClassName("popover-hint")]
      })

    fetchContentCache.set(slug, contents)
    return contents
  }

  async function displayPreview(el: HTMLElement | null) {
    if (!searchLayout || !enablePreview || !el || !preview) return
    const slug = el.id as FullSlug
    const innerDiv = await fetchContent(slug).then((contents) =>
      contents.flatMap((el) => [...highlightHTML(currentSearchTerm, el as HTMLElement).children]),
    )
    previewInner = document.createElement("div")
    previewInner.classList.add("preview-inner")
    previewInner.append(...innerDiv)
    preview.replaceChildren(previewInner)

    const highlights = [...preview.getElementsByClassName("highlight")].sort(
      (a, b) => b.innerHTML.length - a.innerHTML.length,
    )
    highlights[0]?.scrollIntoView({ block: "start" })
  }

  async function onType(e: HTMLElementEventMap["input"]) {
    if (!searchLayout || !index) return
    currentSearchTerm = (e.target as HTMLInputElement).value
    searchLayout.classList.toggle("display-results", currentSearchTerm !== "")
    searchMode = currentSearchTerm.startsWith("#") ? "tags" : "basic"

    let finalResults: Item[] = []

    if (searchMode === "tags") {
      currentSearchTerm = currentSearchTerm.substring(1).trim()
      const searchResults = await index.searchAsync({
        query: currentSearchTerm,
        limit: maxResults,
        index: ["tags"],
      })
      
      const ids = searchResults.flatMap(r => r.result as number[])
      finalResults = ids.map(id => formatForDisplay(currentSearchTerm, id))
    } else {
      switch (searchType) {
        case "keyword":
          const keywordResults = await index.searchAsync({
            query: currentSearchTerm,
            limit: maxResults,
            index: ["title", "content"],
          })
          const ids = keywordResults.flatMap(r => r.result as number[])
          finalResults = ids.map(id => formatForDisplay(currentSearchTerm, id))
          break
          
        case "semantic":
          finalResults = await semanticSearch(currentSearchTerm, maxResults)
          break
          
        case "hybrid":
          finalResults = await hybridSearch(currentSearchTerm, maxResults)
          break
      }
    }

    await displayResults(finalResults)
  }

  async function shortcutHandler(e: HTMLElementEventMap["keydown"]) {
    if (e.key === "k" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault()
      const searchBarOpen = container.classList.contains("active")
      searchBarOpen ? hideSearch() : showSearch("basic")
      return
    } else if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault()
      const searchBarOpen = container.classList.contains("active")
      searchBarOpen ? hideSearch() : showSearch("tags")
      searchBar.value = "#"
      return
    }

    if (currentHover) {
      currentHover.classList.remove("focus")
    }

    if (!container.classList.contains("active")) return
    
    if (e.key === "Enter") {
      if (results.contains(document.activeElement)) {
        const active = document.activeElement as HTMLInputElement
        if (active.classList.contains("no-match")) return
        await displayPreview(active)
        active.click()
      } else {
        const anchor = document.getElementsByClassName("result-card")[0] as HTMLInputElement | null
        if (!anchor || anchor.classList.contains("no-match")) return
        await displayPreview(anchor)
        anchor.click()
      }
    } else if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
      e.preventDefault()
      if (results.contains(document.activeElement)) {
        const currentResult = currentHover || (document.activeElement as HTMLInputElement | null)
        const prevResult = currentResult?.previousElementSibling as HTMLInputElement | null
        currentResult?.classList.remove("focus")
        prevResult?.focus()
        if (prevResult) currentHover = prevResult
        await displayPreview(prevResult)
      }
    } else if (e.key === "ArrowDown" || e.key === "Tab") {
      e.preventDefault()
      if (document.activeElement === searchBar || currentHover !== null) {
        const firstResult = currentHover || (document.getElementsByClassName("result-card")[0] as HTMLInputElement | null)
        const secondResult = firstResult?.nextElementSibling as HTMLInputElement | null
        firstResult?.classList.remove("focus")
        secondResult?.focus()
        if (secondResult) currentHover = secondResult
        await displayPreview(secondResult)
      }
    }
  }

  document.addEventListener("keydown", shortcutHandler)
  window.addCleanup(() => document.removeEventListener("keydown", shortcutHandler))
  searchButton.addEventListener("click", () => showSearch("basic"))
  window.addCleanup(() => searchButton.removeEventListener("click", () => showSearch("basic")))
  searchBar.addEventListener("input", onType)
  window.addCleanup(() => searchBar.removeEventListener("input", onType))

  registerEscapeHandler(container, hideSearch)
  await fillDocument(data)
}

let indexPopulated = false
async function fillDocument(data: ContentIndex) {
  if (indexPopulated) return
  let id = 0
  const promises: Array<Promise<unknown>> = []
  for (const [slug, fileData] of Object.entries<ContentDetails>(data)) {
    promises.push(
      index.addAsync(id++, {
        id,
        slug: slug as FullSlug,
        title: fileData.title,
        content: fileData.content,
        tags: fileData.tags,
      }),
    )
  }

  await Promise.all(promises)
  indexPopulated = true
}

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  const data = await fetchData
  ;(window as any).contentIndex = data // Store for later use
  const searchElements = document.getElementsByClassName("ai-search")
  for (const element of searchElements) {
    await setupSearch(element, currentSlug, data)
  }
})