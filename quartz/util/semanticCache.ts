import { createHash } from "crypto"
import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { SemanticEmbedding, SemanticLink } from "./semantic"
import { FullSlug } from "./path"

interface CacheEntry {
  embedding: SemanticEmbedding
  semanticLinks?: SemanticLink[]
  contentHash: string
  timestamp: number
}

interface CacheManifest {
  version: string
  entries: {
    [slug: string]: {
      contentHash: string
      timestamp: number
    }
  }
}

export class SemanticCache {
  private cacheDir: string
  private manifestPath: string
  private manifest: CacheManifest | null = null
  private readonly cacheVersion = "1.0.0"
  private readonly maxCacheAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

  constructor(cacheDir: string = ".quartz-cache/semantic") {
    this.cacheDir = cacheDir
    this.manifestPath = path.join(cacheDir, "manifest.json")
  }

  async initialize(): Promise<void> {
    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      await mkdir(this.cacheDir, { recursive: true })
    }

    // Load or create manifest
    if (existsSync(this.manifestPath)) {
      try {
        const manifestData = await readFile(this.manifestPath, "utf-8")
        this.manifest = JSON.parse(manifestData)
        
        // Check cache version
        if (this.manifest?.version !== this.cacheVersion) {
          console.log("Cache version mismatch, clearing cache...")
          await this.clearCache()
          this.manifest = this.createEmptyManifest()
        }
      } catch (error) {
        console.error("Failed to load cache manifest:", error)
        this.manifest = this.createEmptyManifest()
      }
    } else {
      this.manifest = this.createEmptyManifest()
    }
  }

  private createEmptyManifest(): CacheManifest {
    return {
      version: this.cacheVersion,
      entries: {}
    }
  }

  private getContentHash(content: string, title: string, tags: string[]): string {
    const combined = `${title}|${content}|${tags.join(",")}`
    return createHash("sha256").update(combined).digest("hex")
  }

  private getCacheFilePath(slug: FullSlug): string {
    // Convert slug to safe filename
    const safeFilename = slug.replace(/\//g, "_") + ".json"
    return path.join(this.cacheDir, safeFilename)
  }

  async getEmbedding(
    slug: FullSlug,
    content: string,
    title: string,
    tags: string[]
  ): Promise<CacheEntry | null> {
    if (!this.manifest) return null

    const contentHash = this.getContentHash(content, title, tags)
    const manifestEntry = this.manifest.entries[slug]

    // Check if we have a valid cache entry
    if (manifestEntry && manifestEntry.contentHash === contentHash) {
      // Check if cache is not too old
      const age = Date.now() - manifestEntry.timestamp
      if (age < this.maxCacheAge) {
        try {
          const cachePath = this.getCacheFilePath(slug)
          if (existsSync(cachePath)) {
            const cacheData = await readFile(cachePath, "utf-8")
            const entry = JSON.parse(cacheData) as CacheEntry
            
            // Validate entry
            if (entry.contentHash === contentHash) {
              console.log(`Cache hit for ${slug}`)
              return entry
            }
          }
        } catch (error) {
          console.error(`Failed to read cache for ${slug}:`, error)
        }
      } else {
        console.log(`Cache expired for ${slug}`)
      }
    }

    return null
  }

  async saveEmbedding(
    slug: FullSlug,
    embedding: SemanticEmbedding,
    semanticLinks?: SemanticLink[]
  ): Promise<void> {
    if (!this.manifest) return

    const contentHash = this.getContentHash(
      embedding.content,
      embedding.title,
      embedding.tags
    )

    const entry: CacheEntry = {
      embedding,
      semanticLinks,
      contentHash,
      timestamp: Date.now()
    }

    try {
      const cachePath = this.getCacheFilePath(slug)
      await writeFile(cachePath, JSON.stringify(entry, null, 2))

      // Update manifest
      this.manifest.entries[slug] = {
        contentHash,
        timestamp: entry.timestamp
      }

      await this.saveManifest()
      console.log(`Cached embedding for ${slug}`)
    } catch (error) {
      console.error(`Failed to save cache for ${slug}:`, error)
    }
  }

  async saveManifest(): Promise<void> {
    if (!this.manifest) return

    try {
      await writeFile(this.manifestPath, JSON.stringify(this.manifest, null, 2))
    } catch (error) {
      console.error("Failed to save cache manifest:", error)
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Remove all cache files
      if (existsSync(this.cacheDir)) {
        const { rmdir } = await import("fs/promises")
        await rmdir(this.cacheDir, { recursive: true })
        await mkdir(this.cacheDir, { recursive: true })
      }
      
      this.manifest = this.createEmptyManifest()
      await this.saveManifest()
      console.log("Cache cleared successfully")
    } catch (error) {
      console.error("Failed to clear cache:", error)
    }
  }

  async pruneCache(): Promise<void> {
    if (!this.manifest) return

    const now = Date.now()
    const prunedEntries: typeof this.manifest.entries = {}
    let prunedCount = 0

    for (const [slug, entry] of Object.entries(this.manifest.entries)) {
      const age = now - entry.timestamp
      if (age < this.maxCacheAge) {
        prunedEntries[slug] = entry
      } else {
        // Remove old cache file
        try {
          const cachePath = this.getCacheFilePath(slug as FullSlug)
          if (existsSync(cachePath)) {
            const { unlink } = await import("fs/promises")
            await unlink(cachePath)
          }
          prunedCount++
        } catch (error) {
          console.error(`Failed to remove cache file for ${slug}:`, error)
        }
      }
    }

    this.manifest.entries = prunedEntries
    await this.saveManifest()
    
    if (prunedCount > 0) {
      console.log(`Pruned ${prunedCount} expired cache entries`)
    }
  }

  getCacheStats(): {
    totalEntries: number
    cacheSize: number
    oldestEntry: Date | null
    newestEntry: Date | null
  } {
    if (!this.manifest) {
      return {
        totalEntries: 0,
        cacheSize: 0,
        oldestEntry: null,
        newestEntry: null
      }
    }

    const entries = Object.values(this.manifest.entries)
    const timestamps = entries.map(e => e.timestamp).sort((a, b) => a - b)

    return {
      totalEntries: entries.length,
      cacheSize: entries.length, // Could calculate actual disk size if needed
      oldestEntry: timestamps.length > 0 ? new Date(timestamps[0]) : null,
      newestEntry: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]) : null
    }
  }
}

// Global cache instance
export const semanticCache = new SemanticCache()