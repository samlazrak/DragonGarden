import { execSync } from "child_process"

export interface GitOperations {
  getCurrentBranch(): string
  push(remote?: string, branch?: string): void
  add(files: string[]): void
  commit(message: string): void
  clone(url: string, path: string): void
  init(): void
  remoteAdd(name: string, url: string): void
}

export class GitOperationsImpl implements GitOperations {
  getCurrentBranch(): string {
    return execSync('git symbolic-ref HEAD | sed "s!refs/heads/!!"', { encoding: "utf8" }).trim()
  }

  push(remote = "origin", branch?: string): void {
    const cmd = branch ? `git push ${remote} ${branch}` : "git push"
    execSync(cmd, { stdio: "inherit" })
  }

  add(files: string[]): void {
    execSync(`git add ${files.join(" ")}`, { stdio: "inherit" })
  }

  commit(message: string): void {
    execSync(`git commit -m "${message}"`, { stdio: "inherit" })
  }

  clone(url: string, path: string): void {
    execSync(`git clone ${url} ${path}`, { stdio: "inherit" })
  }

  init(): void {
    execSync("git init", { stdio: "inherit" })
  }

  remoteAdd(name: string, url: string): void {
    execSync(`git remote add ${name} ${url}`, { stdio: "inherit" })
  }
}
