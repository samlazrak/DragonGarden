import { execSync } from "child_process"
import { copyFileSync, existsSync } from "fs"
import { join } from "path"
import { ConsoleLogger, Logger } from "../utils/logger"

interface LaunchAgentConfig {
  logger?: Logger
  plistSource?: string
  plistDest?: string
}

export class LaunchAgentSetup {
  private config: LaunchAgentConfig
  private logger: Logger

  constructor(config: LaunchAgentConfig = {}) {
    this.config = config
    this.logger = config.logger || new ConsoleLogger()
  }

  async setup(): Promise<void> {
    const plistSource = this.config.plistSource || join(process.cwd(), "homebrew.mxcl.quartz.plist")
    const plistDest =
      this.config.plistDest ||
      join(process.env.HOME!, "Library/LaunchAgents/homebrew.mxcl.quartz.plist")

    try {
      if (!existsSync(plistSource)) {
        throw new Error(`Plist source file not found: ${plistSource}`)
      }

      // Copy plist file
      copyFileSync(plistSource, plistDest)
      this.logger.info(`Copied plist to ${plistDest}`)

      // Unload existing agent if present
      try {
        execSync(`launchctl unload "${plistDest}"`, { stdio: "pipe" })
        this.logger.info("Unloaded existing launch agent")
      } catch {
        // Ignore error if agent wasn't loaded
      }

      // Load the new agent
      execSync(`launchctl load "${plistDest}"`, { stdio: "inherit" })
      this.logger.success("Quartz dev server will now run at login.")
    } catch (error) {
      this.logger.error(`Failed to setup launch agent: ${error}`)
      throw error
    }
  }
}

// CLI entry point
async function main(): Promise<void> {
  const setup = new LaunchAgentSetup()
  await setup.setup()
}

// Check if this is the main module being executed
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Launch agent setup failed:", error)
    process.exit(1)
  })
}
