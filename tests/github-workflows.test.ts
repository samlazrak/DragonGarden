import { existsSync, readFileSync } from "fs"
import { describe, expect, it } from "node:test"
import { join } from "path"

describe("GitHub Workflows Configuration", () => {
  const sanitizeConfigPath = join(process.cwd(), "scripts", "sanitize-config.json")
  const workflowDir = join(process.cwd(), ".github", "workflows")

  it("sanitize-config.json excludes .github directory", () => {
    const config = JSON.parse(readFileSync(sanitizeConfigPath, "utf8"))
    expect(config.filesToExclude).toContain(".github/")
  })

  it("workflow files exist and are properly formatted", () => {
    const sanitizeWorkflowPath = join(workflowDir, "sanitize-and-push.yml")
    const scheduledWorkflowPath = join(workflowDir, "scheduled-sanitize.yml")

    expect(existsSync(sanitizeWorkflowPath)).toBe(true)
    expect(existsSync(scheduledWorkflowPath)).toBe(true)

    // Check that workflow files contain required elements
    const sanitizeContent = readFileSync(sanitizeWorkflowPath, "utf8")
    const scheduledContent = readFileSync(scheduledWorkflowPath, "utf8")

    // Check for required workflow elements
    expect(sanitizeContent).toContain("name: Sanitize and Push to Public Repo")
    expect(sanitizeContent).toContain("workflow_dispatch:")
    expect(sanitizeContent).toContain("PUBLIC_REPO_SSH_KEY")

    expect(scheduledContent).toContain("name: Scheduled Sanitize and Push")
    expect(scheduledContent).toContain("schedule:")
    expect(scheduledContent).toContain("PUBLIC_REPO_SSH_KEY")
  })

  it("workflow files are excluded from public repo", () => {
    const config = JSON.parse(readFileSync(sanitizeConfigPath, "utf8"))

    // Check that .github directory is excluded
    expect(config.filesToExclude).toContain(".github/")

    // Check that specific workflow files are also excluded
    expect(config.filesToExclude).toContain("docs/github-workflows-setup.md")
  })

  it("workflow files have valid YAML structure", () => {
    const sanitizeWorkflowPath = join(workflowDir, "sanitize-and-push.yml")
    const scheduledWorkflowPath = join(workflowDir, "scheduled-sanitize.yml")

    const sanitizeContent = readFileSync(sanitizeWorkflowPath, "utf8")
    const scheduledContent = readFileSync(scheduledWorkflowPath, "utf8")

    // Basic YAML structure checks
    expect(sanitizeContent).toMatch(/^name:/m)
    expect(sanitizeContent).toMatch(/^on:/m)
    expect(sanitizeContent).toMatch(/^jobs:/m)

    expect(scheduledContent).toMatch(/^name:/m)
    expect(scheduledContent).toMatch(/^on:/m)
    expect(scheduledContent).toMatch(/^jobs:/m)
  })
})
