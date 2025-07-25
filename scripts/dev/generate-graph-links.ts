import { basename, join } from "path"
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { ConsoleLogger, Logger } from "../utils/logger"

interface GraphLinkGeneratorConfig {
  contentDir: string
  logger?: Logger
  fileSystem?: FileSystem
}

export class GraphLinkGenerator {
  private config: GraphLinkGeneratorConfig
  private logger: Logger
  private fileSystem: FileSystem

  constructor(config: GraphLinkGeneratorConfig) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.fileSystem = config.fileSystem || new NodeFileSystem()
  }

  async generateGraphLinks(): Promise<void> {
    this.logger.info("Starting graph link generation...")

    try {
      const markdownFiles = await this.getMarkdownFiles(this.config.contentDir)
      const indexFiles = markdownFiles.filter((file) => basename(file) === "index.md")

      for (const indexFile of indexFiles) {
        await this.processIndexFile(indexFile, markdownFiles)
      }

      this.logger.success("Graph link generation completed successfully")
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

      // Skip .obsidian directory
      if (pathParts.includes(".obsidian")) {
        continue
      }

      files.push(item)
    }

    return files
  }

  private async processIndexFile(indexFile: string, allMarkdownFiles: string[]): Promise<void> {
    const relativePath = indexFile.replace(this.config.contentDir, "").replace(/^\//, "")
    this.logger.info(`Processing ${relativePath}`)

    try {
      const content = await this.fileSystem.readFile(indexFile)
      const updatedContent = this.updateGraphLinksSection(content, allMarkdownFiles)

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

  private updateGraphLinksSection(content: string, markdownFiles: string[]): string {
    const frontmatterEnd = content.indexOf("---", 3)
    if (frontmatterEnd === -1) {
      this.logger.warning("No frontmatter found, skipping")
      return content
    }

    const graphLinksSection = this.generateGraphLinksSection(markdownFiles)

    if (content.includes("<!-- Graph links - invisible but parsed by Quartz -->")) {
      return this.updateExistingGraphLinks(content, graphLinksSection)
    } else {
      return this.insertNewGraphLinks(content, frontmatterEnd, graphLinksSection)
    }
  }

  private generateGraphLinksSection(markdownFiles: string[]): string {
    const links = markdownFiles
      .filter((filePath) => {
        const relativePath = filePath.replace(this.config.contentDir, "").replace(/^\//, "")
        // Skip the current index file to avoid self-reference
        return !relativePath.endsWith("/index.md") || relativePath !== "index.md"
      })
      .map((filePath) => {
        const relativePath = filePath.replace(this.config.contentDir, "").replace(/^\//, "")
        const linkPath = relativePath.replace(/\.md$/, "")
        return `[[${linkPath}]]`
      })
      .join(" ")

    return `<!-- Graph links - invisible but parsed by Quartz -->
<div style="display: none;">

${links}

</div>
<!-- End graph links -->`
  }

  private updateExistingGraphLinks(content: string, newGraphLinksSection: string): string {
    const startMarker = "<!-- Graph links - invisible but parsed by Quartz -->"
    const endMarker = "<!-- End graph links -->"
    
    const startIndex = content.indexOf(startMarker)
    const endIndex = content.indexOf(endMarker)
    
    if (startIndex === -1 || endIndex === -1) {
      // Fallback to old method if markers not found
      const beforeGraphLinks = content.substring(0, startIndex)
      const afterIndex = content.indexOf("</div>", startIndex) + 6
      const afterGraphLinks = content.substring(afterIndex)
      return beforeGraphLinks + newGraphLinksSection + afterGraphLinks
    }
    
    const beforeGraphLinks = content.substring(0, startIndex)
    const afterGraphLinks = content.substring(endIndex + endMarker.length)
    
    return beforeGraphLinks + newGraphLinksSection + afterGraphLinks
  }

  private insertNewGraphLinks(
    content: string,
    frontmatterEnd: number,
    graphLinksSection: string,
  ): string {
    const beforeFrontmatter = content.substring(0, frontmatterEnd + 3)
    const afterFrontmatter = content.substring(frontmatterEnd + 3)
    return beforeFrontmatter + "\n\n" + graphLinksSection + afterFrontmatter
  }
}

// CLI entry point
async function main(): Promise<void> {
  const generator = new GraphLinkGenerator({
    contentDir: join(process.cwd(), "content"),
  })

  await generator.generateGraphLinks()
}

// Check if this is the main module being executed
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Graph link generation failed:", error)
    process.exit(1)
  })
}
