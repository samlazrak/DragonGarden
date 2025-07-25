// Semantic Link Configuration
// This file provides easy configuration for semantic link generation features

export const semanticLinkConfig = {
  // Master switch to enable/disable semantic link generation
  enabled: true,
  
  // Performance settings
  performance: {
    // Enable caching to speed up subsequent builds
    enableCaching: true,
    
    // Process files in parallel (recommended for large sites)
    parallelProcessing: true,
    
    // Maximum number of files to process in parallel
    maxConcurrency: 4,
    
    // Skip semantic processing for files larger than this (in characters)
    maxFileSize: 50000,
  },
  
  // Link generation settings
  linkGeneration: {
    // Minimum similarity score for a link to be suggested (0-1)
    minSimilarity: 0.1,
    
    // Minimum similarity score for a link to be displayed (0-1)
    displayThreshold: 0.1,
    
    // Maximum number of suggested links per page
    maxSuggestionsPerPage: 8,
    
    // Enable sentiment-aware similarity (considers emotional tone)
    useSentimentAnalysis: true,
    
    // Weight given to sentiment vs semantic similarity (0-1)
    sentimentWeight: 0.3,
    
    // Prefer links with matching emotional tone
    preferSameEmotion: true,
    
    // Maximum difference in polarity allowed (0-2)
    polarityTolerance: 1.0,
  },
  
  // Display settings
  display: {
    // Show strength percentage
    showStrength: true,
    
    // Show confidence score
    showConfidence: false,
    
    // Show explanation of why link was suggested
    showExplanation: true,
    
    // Show sentiment indicators
    showSentiment: true,
    
    // Show sentiment alignment between pages
    showSentimentAlignment: true,
    
    // Maximum links to display in UI
    maxDisplayedLinks: 5,
  },
  
  // Advanced settings
  advanced: {
    // Enable cross-reference strength calculation
    enableCrossReferenceStrength: true,
    
    // Use tag-based fallback during build time
    useTagBasedFallback: true,
    
    // Cache expiration in days
    cacheExpirationDays: 30,
    
    // Debug mode (verbose logging)
    debug: false,
  }
}

// Helper function to get config for SemanticLinkDiscovery plugin
export function getSemanticLinkPluginConfig() {
  return {
    enableSemanticLinks: semanticLinkConfig.enabled,
    enableCrossReferenceStrength: semanticLinkConfig.advanced.enableCrossReferenceStrength,
    minSimilarity: semanticLinkConfig.linkGeneration.minSimilarity,
    maxSuggestedLinks: semanticLinkConfig.linkGeneration.maxSuggestionsPerPage,
    semanticLinkThreshold: semanticLinkConfig.linkGeneration.displayThreshold,
    cacheEmbeddings: semanticLinkConfig.performance.enableCaching,
  }
}

// Helper function to get config for SemanticLinks component
export function getSemanticLinkComponentConfig() {
  return {
    title: "AI Suggested Links",
    maxSuggestions: semanticLinkConfig.display.maxDisplayedLinks,
    minStrength: semanticLinkConfig.linkGeneration.displayThreshold,
    showStrength: semanticLinkConfig.display.showStrength,
    showConfidence: semanticLinkConfig.display.showConfidence,
    showExplanation: semanticLinkConfig.display.showExplanation,
    showSentiment: semanticLinkConfig.display.showSentiment,
    showSentimentAlignment: semanticLinkConfig.display.showSentimentAlignment,
  }
}