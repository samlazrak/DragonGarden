#!/usr/bin/env node

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { handleBuild, handleCreate, handleUpdate, handleRestore, handleSync } from "./cli/handlers.js"
import { BuildArgv, CreateArgv, SyncArgv, CommonArgv } from "./cli/args.js"

yargs(hideBin(process.argv))
  .scriptName("quartz")
  .version("4.0.0")
  .usage("$0 <cmd> [args]")
  .command("create", "Setup Quartz for your local machine", CreateArgv, handleCreate)
  .command("update", "Get the latest Quartz updates", CommonArgv, handleUpdate)
  .command("restore", "Restore your content folder from the cache", CommonArgv, handleRestore)
  .command("sync", "Sync your Quartz to and from GitHub", SyncArgv, handleSync)
  .command("build", "Build Quartz into a bundle of static HTML files", BuildArgv, handleBuild)
  .showHelpOnFail(false)
  .help()
  .strict()
  .demandCommand().argv