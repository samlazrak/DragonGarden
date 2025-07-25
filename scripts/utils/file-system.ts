import { promises as fs } from "fs"
import { glob } from "glob"
import { dirname } from "path"

export interface FileSystem {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  mkdir(path: string, recursive?: boolean): Promise<void>
  rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>
  glob(pattern: string): Promise<string[]>
}

export class NodeFileSystem implements FileSystem {
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, "utf8")
  }

  async writeFile(path: string, content: string): Promise<void> {
    await fs.mkdir(dirname(path), { recursive: true })
    return fs.writeFile(path, content, "utf8")
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  async mkdir(path: string, recursive = false): Promise<void> {
    await fs.mkdir(path, { recursive })
  }

  async rm(path: string, options: { recursive?: boolean; force?: boolean } = {}): Promise<void> {
    await fs.rm(path, options)
  }

  async glob(pattern: string): Promise<string[]> {
    return await glob(pattern)
  }
}
