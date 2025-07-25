import { QuartzFilterPlugin } from "../types"

export const RemoveDrafts: QuartzFilterPlugin<{}> = () => ({
  name: "RemoveDrafts",
  shouldPublish(_ctx, [_tree, vfile]) {
    // Check if we should include private content (for local development)
    const includePrivate = process.env.QUARTZ_INCLUDE_PRIVATE === "true"
    
    if (includePrivate) {
      return true // Include all content including private
    }
    
    const privateFlag: boolean =
      vfile.data?.frontmatter?.private === true || vfile.data?.frontmatter?.private === "true"
    return !privateFlag
  },
})
