import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { RemoveDrafts } from "../quartz/plugins/filters/draft"

describe("RemoveDrafts Plugin", () => {
  const originalEnv = process.env.QUARTZ_INCLUDE_PRIVATE

  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.QUARTZ_INCLUDE_PRIVATE
  })

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv) {
      process.env.QUARTZ_INCLUDE_PRIVATE = originalEnv
    } else {
      delete process.env.QUARTZ_INCLUDE_PRIVATE
    }
  })

  it("should filter out private posts by default", () => {
    const plugin = RemoveDrafts()
    
    // Mock content with private: true
    const privateContent = [
      null,
      {
        data: {
          frontmatter: { private: true }
        }
      }
    ] as any

    // Mock content without private flag
    const publishedContent = [
      null,
      {
        data: {
          frontmatter: {}
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, privateContent)).toBe(false)
    expect(plugin.shouldPublish({} as any, publishedContent)).toBe(true)
  })

  it("should include all posts when QUARTZ_INCLUDE_PRIVATE is true", () => {
    process.env.QUARTZ_INCLUDE_PRIVATE = "true"
    const plugin = RemoveDrafts()
    
    // Mock content with private: true
    const privateContent = [
      null,
      {
        data: {
          frontmatter: { private: true }
        }
      }
    ] as any

    // Mock content without private flag
    const publishedContent = [
      null,
      {
        data: {
          frontmatter: {}
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, privateContent)).toBe(true)
    expect(plugin.shouldPublish({} as any, publishedContent)).toBe(true)
  })

  it("should handle string 'true' private values", () => {
    const plugin = RemoveDrafts()
    
    const stringPrivateContent = [
      null,
      {
        data: {
          frontmatter: { private: "true" }
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, stringPrivateContent)).toBe(false)
  })

  it("should handle string 'true' private values when private content is included", () => {
    process.env.QUARTZ_INCLUDE_PRIVATE = "true"
    const plugin = RemoveDrafts()
    
    const stringPrivateContent = [
      null,
      {
        data: {
          frontmatter: { private: "true" }
        }
      }
    ] as any

    expect(plugin.shouldPublish({} as any, stringPrivateContent)).toBe(true)
  })
}) 