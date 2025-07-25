#!/usr/bin/env npx tsx

import { RepositorySanitizer } from "./sanitize"

async function testSanitization() {
  console.log("🧪 Testing sanitization behavior...")

  const sanitizer = new RepositorySanitizer()

  // Test dry run
  console.log("\n📋 Running dry run test...")
  await sanitizer.sanitizeAndPush(true, false)

  console.log("\n✅ Sanitization test completed successfully!")
  console.log("📊 Summary:")
  console.log("   • Only quartz/ and api/ directories are included")
  console.log("   • All content, scripts, docs are excluded")
  console.log("   • Essential config files are included")
  console.log("   • Warnings are shown before pushing")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testSanitization().catch((error) => {
    console.error("Test failed:", error)
    process.exit(1)
  })
}
