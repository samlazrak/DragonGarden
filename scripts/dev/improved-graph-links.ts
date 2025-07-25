import { basename, join } from "path"
import { FileSystem, NodeFileSystem } from "../utils/file-system"
import { ConsoleLogger, Logger } from "../utils/logger"

interface ImprovedGraphLinkGeneratorConfig {
  contentDir: string
  logger?: Logger
  fileSystem?: FileSystem
  method?: 'frontmatter' | 'invisible-section' | 'comment-links'
}

export class ImprovedGraphLinkGenerator {
  private config: ImprovedGraphLinkGeneratorConfig
  private logger: Logger
  private fileSystem: FileSystem

  constructor(config: ImprovedGraphLinkGeneratorConfig) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.fileSystem = config.fileSystem || new NodeFileSystem()
    this.config.method = config.method || 'comment-links'
  }

  async generateGraphLinks(): Promise<void> {
    this.logger.info(`Starting improved graph link generation using ${this.config.method} method...`)

    try {
      const markdownFiles = await this.getMarkdownFiles(this.config.contentDir)
      const indexFiles = markdownFiles.filter((file) => basename(file) === "index.md")

      for (const indexFile of indexFiles) {
        await this.processIndexFile(indexFile, markdownFiles)
      }

      this.logger.success("Improved graph link generation completed successfully")
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

      // Skip .obsidian directory and draft files if needed
      if (pathParts.includes(".obsidian")) {
        continue
      }

      files.push(item)
    }

    return files
  }

  private async processIndexFile(indexFile: string, allMarkdownFiles: string[]): Promise<void> {
    const relativePath = indexFile.replace(this.config.contentDir, "").replace(/^\//, "")
    this.logger.info(`Processing ${relativePath} with ${this.config.method} method`)

    try {
      const content = await this.fileSystem.readFile(indexFile)
      const updatedContent = await this.updateGraphLinksSection(content, allMarkdownFiles, indexFile)

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

  private async updateGraphLinksSection(content: string, markdownFiles: string[], currentFile: string): Promise<string> {
    switch (this.config.method) {
      case 'frontmatter':
        return this.updateFrontmatterLinks(content, markdownFiles, currentFile)
      case 'invisible-section':
        return this.updateInvisibleSection(content, markdownFiles, currentFile)
      case 'comment-links':
        return this.updateCommentLinks(content, markdownFiles, currentFile)
      default:
        throw new Error(`Unknown method: ${this.config.method}`)
    }
  }

  private updateFrontmatterLinks(content: string, markdownFiles: string[], currentFile: string): string {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!frontmatterMatch) {
      this.logger.warning("No frontmatter found, skipping frontmatter method")
      return content
    }

    const links = this.generateLinkList(markdownFiles, currentFile)
    const frontmatter = frontmatterMatch[1]
    
    // Remove existing graph_links if present
    const cleanedFrontmatter = frontmatter.replace(/graph_links:\s*\[[\s\S]*?\]/m, '').trim()
    
    const newFrontmatter = `---
${cleanedFrontmatter}
graph_links: [${links.map(link => `"${link}"`).join(', ')}]
---`

    return content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter)
  }

  private updateInvisibleSection(content: string, markdownFiles: string[], currentFile: string): string {
    const links = this.generateLinkList(markdownFiles, currentFile)
    const linkText = links.map(link => `[[${link}]]`).join(' ')
    
    const graphLinksSection = `<!-- Graph links for connectivity -->
<section style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
${linkText}
</section>
<!-- End graph links -->`

    return this.replaceOrInsertSection(content, graphLinksSection)
  }

  private updateCommentLinks(content: string, markdownFiles: string[], currentFile: string): string {
    const links = this.generateLinkList(markdownFiles, currentFile)
    
    // Create invisible wikilinks in HTML comments that Quartz can still parse
    const linkComments = links.map(link => `<!-- [[${link}]] -->`).join('\n')
    
    const graphLinksSection = `<!-- Graph connectivity links - parsed by Quartz -->
${linkComments}
<!-- End graph connectivity -->`

    return this.replaceOrInsertSection(content, graphLinksSection, 
      "<!-- Graph connectivity links - parsed by Quartz -->",
      "<!-- End graph connectivity -->")
  }

  private generateLinkList(markdownFiles: string[], currentFile: string): string[] {
    return markdownFiles
      .filter((filePath) => {
        // Don't link to self
        return filePath !== currentFile
      })
      .map((filePath) => {
        const relativePath = filePath.replace(this.config.contentDir, "").replace(/^\//, "")
        return relativePath.replace(/\.md$/, "")
      })
      .sort()
  }

  private replaceOrInsertSection(
    content: string, 
    newSection: string,
    startMarker: string = "<!-- Graph links for connectivity -->",
    endMarker: string = "<!-- End graph links -->"
  ): string {
    const startIndex = content.indexOf(startMarker)
    const endIndex = content.indexOf(endMarker)
    
    if (startIndex !== -1 && endIndex !== -1) {
      // Replace existing section
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
        // No frontmatter, add at beginning
        return newSection + "\n\n" + content
      }
    }
  }
}

// CLI entry point with method selection
async function main(): Promise<void> {
  const method = process.argv[2] as 'frontmatter' | 'invisible-section' | 'comment-links' || 'comment-links'
  
  console.log(`Using method: ${method}`)
  
  const generator = new ImprovedGraphLinkGenerator({
    contentDir: join(process.cwd(), "content"),
    method: method
  })

  await generator.generateGraphLinks()
}

// Check if this is the main module being executed
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Improved graph link generation failed:", error)
    process.exit(1)
  })
}