import { join } from "path"
import { FileSystem, NodeFileSystem } from "./utils/file-system"
import { ConsoleLogger, Logger } from "./utils/logger"

interface CacheCleanerConfig {
  cacheDir: string
  logger?: Logger
  fileSystem?: FileSystem
}

export class SemanticCacheCleaner {
  private config: CacheCleanerConfig
  private logger: Logger
  private fileSystem: FileSystem

  constructor(config: CacheCleanerConfig) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.fileSystem = config.fileSystem || new NodeFileSystem()
  }

  async clearCache(): Promise<void> {
    try {
      const exists = await this.fileSystem.exists(this.config.cacheDir)

      if (exists) {
        await this.fileSystem.rm(this.config.cacheDir, { recursive: true, force: true })
        this.logger.success("Semantic cache cleared successfully")
      } else {
        this.logger.info("No semantic cache found to clear")
      }
    } catch (error) {
      this.logger.error(`Error clearing semantic cache: ${error}`)
      throw error
    }
  }
}

// CLI entry point
async function main(): Promise<void> {
  const cacheDir = join(process.cwd(), ".quartz-cache", "semantic")
  const cleaner = new SemanticCacheCleaner({ cacheDir })

  await cleaner.clearCache()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Cache clearing failed:", error)
    process.exit(1)
  })
}
