#!/usr/bin/env npx tsx

import { Command } from "commander"
import { SemanticCacheCleaner } from "./clear-semantic-cache"
import { CSSBuildTester, CSSDebugger, CSSTransformTester, SCSSFileTester } from "./css-testing"
import { DevServer } from "./dev-with-drafts"
import { GraphLinkGenerator } from "./generate-graph-links"
import { PushWithSanitize } from "./push-with-sanitize"
import { LaunchAgentSetup } from "./setup-launchagent"

const program = new Command()

program
  .name("ratgarden-scripts")
  .description("RatGarden development and maintenance scripts")
  .version("1.0.0")

// Development commands
program
  .command("dev-with-drafts")
  .description("Start development server with drafts enabled")
  .action(async () => {
    const server = new DevServer({ includeDrafts: true })
    await server.start()
  })

program
  .command("generate-graph-links")
  .description("Generate graph links for Quartz")
  .action(async () => {
    const generator = new GraphLinkGenerator({
      contentDir: "./content",
    })
    await generator.generateGraphLinks()
  })

program
  .command("clear-semantic-cache")
  .description("Clear semantic analysis cache")
  .action(async () => {
    const cleaner = new SemanticCacheCleaner({
      cacheDir: "./.quartz-cache/semantic",
    })
    await cleaner.clearCache()
  })

// Deployment commands
program
  .command("push-with-sanitize")
  .description("Push to private repo and sanitize for public repo")
  .action(async () => {
    const pusher = new PushWithSanitize()
    await pusher.execute()
  })

// Setup commands
program
  .command("setup-launchagent")
  .description("Setup Quartz as macOS launch agent")
  .action(async () => {
    const setup = new LaunchAgentSetup()
    await setup.setup()
  })

// Testing commands
program
  .command("test-scss")
  .description("Test individual SCSS files")
  .action(async () => {
    const tester = new SCSSFileTester()
    const filesToTest = [
      "./quartz/styles/custom.scss",
      "./quartz/components/styles/semanticLinks.scss",
      "./quartz/styles/base.scss",
      "./quartz/styles/variables.scss",
      "./quartz/styles/themes/_index.scss",
    ]
    await tester.testFiles(filesToTest)
  })

program
  .command("test-build-css")
  .description("Test complete CSS build process")
  .action(async () => {
    const tester = new CSSBuildTester()
    await tester.testBuildProcess()
  })

program
  .command("test-transform")
  .description("Test lightningcss transformation")
  .action(async () => {
    const tester = new CSSTransformTester()
    await tester.testTransform()
  })

program
  .command("debug-css")
  .description("Debug CSS compilation output")
  .action(async () => {
    const cssDebugger = new CSSDebugger()
    await cssDebugger.debugCSS()
  })

program.parse()
