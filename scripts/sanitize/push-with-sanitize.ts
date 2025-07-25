import { execSync } from "child_process"
import { GitOperations, GitOperationsImpl } from "./utils/git"
import { ConsoleLogger, Logger } from "./utils/logger"

interface PushWithSanitizeConfig {
  logger?: Logger
  git?: GitOperations
}

export class PushWithSanitize {
  private config: PushWithSanitizeConfig
  private logger: Logger
  private git: GitOperations

  constructor(config: PushWithSanitizeConfig = {}) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
    this.git = config.git || new GitOperationsImpl()
  }

  async execute(): Promise<void> {
    this.logger.info("🚀 Starting push with sanitization process...")

    const currentBranch = this.git.getCurrentBranch()

    if (currentBranch === "main") {
      await this.pushToMain()
    } else {
      await this.pushToOtherBranch()
    }

    this.logger.success("✅ Push process completed successfully!")
  }

  private async pushToMain(): Promise<void> {
    this.logger.info("")
    this.logger.info("📤 Step 1: Pushing to private repository...")

    try {
      this.git.push()
      this.logger.success("Successfully pushed to private repository")

      this.logger.info("")
      this.logger.info("🔄 Step 2: Running sanitization and push to public repository...")
      this.logger.info("")
      this.logger.info("📋 This will:")
      this.logger.info("   ✅ Exclude ALL content (private and public)")
      this.logger.info("   ✅ Exclude ALL build artifacts and cache files")
      this.logger.info("   ✅ Include only source code and configuration")
      this.logger.info("   ✅ Use Git LFS for large files")
      this.logger.info("   ✅ Use optimized git operations")
      this.logger.info("")

      // Run the TypeScript sanitization script in fast mode
      await this.runSanitization()

      this.logger.info("")
      this.logger.success("Sanitization and public push completed successfully")
      this.logger.success("🎉 Both private and public repositories are now up to date!")
    } catch (error) {
      this.logger.error(`Sanitization failed: ${error}`)
      this.logger.warning("Private repo was pushed successfully, but public repo was not updated")
      this.logger.info("To retry the public push, run: npm run push-public")
      throw error
    }
  }

  private async pushToOtherBranch(): Promise<void> {
    this.logger.info("ℹ️  Not pushing to main branch, running normal push only...")
    this.git.push()
  }

  private async runSanitization(): Promise<void> {
    this.logger.info("Running sanitization script in fast mode...")
    execSync("npx tsx scripts/sanitize.ts --fast", { stdio: "inherit" })
  }
}

// CLI entry point
async function main(): Promise<void> {
  const pusher = new PushWithSanitize()
  await pusher.execute()
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Push with sanitize failed:", error)
    process.exit(1)
  })
}
