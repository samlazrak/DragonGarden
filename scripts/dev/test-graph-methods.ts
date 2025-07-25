import { ImprovedGraphLinkGenerator } from './improved-graph-links'
import { join } from 'path'

async function testAllMethods(): Promise<void> {
  console.log("Testing all graph link methods...\n")
  
  const methods: Array<'frontmatter' | 'invisible-section' | 'comment-links'> = [
    'comment-links',
    'invisible-section', 
    'frontmatter'
  ]
  
  for (const method of methods) {
    console.log(`\n=== Testing ${method.toUpperCase()} method ===`)
    
    try {
      const generator = new ImprovedGraphLinkGenerator({
        contentDir: join(process.cwd(), "content"),
        method: method
      })
      
      await generator.generateGraphLinks()
      console.log(`✅ ${method} method completed successfully`)
      
    } catch (error) {
      console.error(`❌ ${method} method failed:`, error)
    }
  }
  
  console.log("\n=== Testing Complete ===")
  console.log("Check your content/index.md file to see the results")
  console.log("Build your site and check if the graph connections work properly")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testAllMethods().catch(console.error)
}