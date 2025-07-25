import { basename, join } from "path"
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { ConsoleLogger, Logger } from "../utils/logger"

interface HybridGraphLinkGeneratorConfig {
  contentDir: string
  logger?: Logger
  fileSystem?: FileSystem
}

export class HybridGraphLinkGenerator {
  private config: HybridGraphLinkGeneratorConfig
  private logger: Logger
  private fileSystem: FileSystem

  constructor(config: HybridGraphLinkGeneratorConfig) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.fileSystem = config.fileSystem || new NodeFileSystem()
  }

  async generateGraphLinks(): Promise<void> {
    this.logger.info("Starting hybrid graph link generation (multiple methods for maximum compatibility)...")

    try {
      const markdownFiles = await this.getMarkdownFiles(this.config.contentDir)
      const indexFiles = markdownFiles.filter((file) => basename(file) === "index.md")

      for (const indexFile of indexFiles) {
        await this.processIndexFile(indexFile, markdownFiles)
      }

      this.logger.success("Hybrid graph link generation completed successfully")
    } catch (error) {
      this.logger.error(`Graph link generation failed: ${error}`)
      throw error
    }
  }

  private async getMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = []
    const items = await this.fileSystem.glob(join(dir, "**/*.md"))

    for (const item of items) {
      const relativePath = item.replace(dir, "").replace(/^\//, "")
      const pathParts = relativePath.split("/")

      if (pathParts.includes(".obsidian")) {
        continue
      }

      files.push(item)
    }

    return files
  }

  private async processIndexFile(indexFile: string, allMarkdownFiles: string[]): Promise<void> {
    const relativePath = indexFile.replace(this.config.contentDir, "").replace(/^\//, "")
    this.logger.info(`Processing ${relativePath} with hybrid approach`)

    try {
      const content = await this.fileSystem.readFile(indexFile)
      const updatedContent = this.updateWithHybridApproach(content, allMarkdownFiles, indexFile)

      if (updatedContent !== content) {
        await this.fileSystem.writeFile(indexFile, updatedContent)
        this.logger.success(`Updated graph links in ${relativePath}`)
      } else {
        this.logger.info(`No changes needed for ${relativePath}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process ${relativePath}: ${error}`)
    }
  }

  private updateWithHybridApproach(content: string, markdownFiles: string[], currentFile: string): string {
    const links = this.generateLinkList(markdownFiles, currentFile)
    
    // Method 1: HTML comments with wikilinks (most compatible with Quartz)
    const commentLinks = links.map(link => `<!-- [[${link}]] -->`).join('\n')
    
    // Method 2: Invisible but accessible div with proper wikilinks
    const wikiLinks = links.map(link => `[[${link}]]`).join(' ')
    
    // Method 3: Zero-width space separated wikilinks in a span
    const invisibleLinks = links.map(link => `[[${link}]]`).join('\u200B')
    
    const hybridSection = `<!-- Quartz Graph Connectivity Links - Multiple Methods for Maximum Compatibility -->

<!-- Method 1: Comment-based wikilinks -->
${commentLinks}

<!-- Method 2: Screen reader accessible but visually hidden -->
<div aria-hidden="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;">
${wikiLinks}
</div>

<!-- Method 3: Zero-width inline links -->
<span style="display: none; visibility: hidden; position: absolute; left: -9999px;">
${invisibleLinks}
</span>

<!-- End Quartz Graph Connectivity -->`

    return this.replaceOrInsertHybridSection(content, hybridSection)
  }

  private generateLinkList(markdownFiles: string[], currentFile: string): string[] {
    return markdownFiles
      .filter((filePath) => filePath !== currentFile)
      .map((filePath) => {
        const relativePath = filePath.replace(this.config.contentDir, "").replace(/^\//, "")
        return relativePath.replace(/\.md$/, "")
      })
      .sort()
  }

  private replaceOrInsertHybridSection(content: string, newSection: string): string {
    const startMarker = "<!-- Quartz Graph Connectivity Links"
    const endMarker = "<!-- End Quartz Graph Connectivity -->"
    
    // Remove any old graph link sections first
    content = this.removeOldGraphSections(content)
    
    const startIndex = content.indexOf(startMarker)
    const endIndex = content.indexOf(endMarker)
    
    if (startIndex !== -1 && endIndex !== -1) {
      // Replace existing hybrid section
      const beforeSection = content.substring(0, startIndex)
      const afterSection = content.substring(endIndex + endMarker.length)
      return beforeSection + newSection + afterSection
    } else {
      // Insert new section after frontmatter
      const frontmatterEnd = content.indexOf("---", 3)
      if (frontmatterEnd !== -1) {
        const beforeFrontmatter = content.substring(0, frontmatterEnd + 3)
        const afterFrontmatter = content.substring(frontmatterEnd + 3)
        return beforeFrontmatter + "\n\n" + newSection + "\n" + afterFrontmatter
      } else {
        return newSection + "\n\n" + content
      }
    }
  }

  private removeOldGraphSections(content: string): string {
    // Remove old graph link sections
    const oldMarkers = [
      { start: "<!-- Graph links - invisible but parsed by Quartz -->", end: "</div>" },
      { start: "<!-- Graph connectivity links - parsed by Quartz -->", end: "<!-- End graph connectivity -->" },
      { start: "<!-- Graph links for connectivity -->", end: "<!-- End graph links -->" }
    ]

    for (const marker of oldMarkers) {
      const startIndex = content.indexOf(marker.start)
      if (startIndex !== -1) {
        const endIndex = content.indexOf(marker.end, startIndex)
        if (endIndex !== -1) {
          const beforeSection = content.substring(0, startIndex)
          const afterSection = content.substring(endIndex + marker.end.length)
          content = beforeSection + afterSection
        }
      }
    }

    return content.replace(/\n\n\n+/g, '\n\n') // Clean up extra newlines
  }
}

// CLI entry point
async function main(): Promise<void> {
  const generator = new HybridGraphLinkGenerator({
    contentDir: join(process.cwd(), "content")
  })

  await generator.generateGraphLinks()
  
  console.log("\n🎯 Hybrid approach complete!")
  console.log("This method uses multiple techniques to ensure Quartz parses the graph links:")
  console.log("1. HTML comments with wikilinks")
  console.log("2. Visually hidden but accessible div")
  console.log("3. Zero-width space separated links")
  console.log("\nTest by building your site and checking the graph visualization!")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Hybrid graph link generation failed:", error)
    process.exit(1)
  })
}