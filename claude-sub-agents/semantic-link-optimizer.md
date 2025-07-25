# Semantic Link Optimizer Sub-Agent

## Purpose
Discover hidden connections between posts, suggest new wikilinks, and optimize the knowledge graph connectivity in the RatGarden digital garden.

## Capabilities
1. **Link Discovery**: Use NLP to find conceptually related content
2. **Wikilink Suggestions**: Identify opportunities for new connections
3. **Graph Analysis**: Evaluate and improve graph connectivity
4. **Orphan Detection**: Find isolated content that needs linking

## Usage Instructions

### 1. Analyze Current Link Structure
```typescript
// Check existing wikilinks
grep -h "\[\[.*\]\]" content/**/*.md | sort | uniq -c

// Find pages with few connections
for file in content/**/*.md; do
  links=$(grep -c "\[\[" "$file" || echo 0)
  echo "$links $file"
done | sort -n | head -10
```

### 2. Semantic Analysis Process
1. **Extract Key Concepts**: Parse each document for main themes
2. **Calculate Similarity**: Use TF-IDF or embeddings to find related content
3. **Generate Link Suggestions**: Propose bidirectional links between related pages

### 3. Implementation Strategy
```javascript
// Example semantic link discovery
class SemanticLinkOptimizer {
  async analyzeContent(filePath) {
    const content = await readFile(filePath);
    const concepts = this.extractConcepts(content);
    const relatedPages = await this.findRelatedContent(concepts);
    
    return {
      file: filePath,
      suggestedLinks: relatedPages.map(page => ({
        target: page.path,
        relevance: page.score,
        context: page.matchedConcepts
      }))
    };
  }
  
  extractConcepts(content) {
    // Extract medical terms, technical concepts, philosophical ideas
    const patterns = {
      medical: /\b(clinical|patient|diagnosis|treatment|HIPAA)\b/gi,
      technical: /\b(AI|ML|algorithm|privacy|encryption)\b/gi,
      philosophical: /\b(ethics|autonomy|consent|moral)\b/gi
    };
    
    return Object.entries(patterns).flatMap(([category, pattern]) => 
      content.match(pattern)?.map(term => ({ term, category })) || []
    );
  }
}
```

### 4. Link Optimization Rules
- **Bidirectional Links**: Ensure A→B implies B→A when relevant
- **Hub Pages**: Create index pages for major topics
- **Context Preservation**: Add links within meaningful sentences
- **Avoid Over-linking**: Max 5-7 links per section

## Example Output
```markdown
## Link Optimization Report for: content/research/SageScan-Privacy-Enhanced-Clinical-AI.md

### Suggested New Links:
1. **To**: [[Privacy Philosophy in Healthcare]]
   - **Relevance**: 0.92
   - **Context**: "Drawing from my philosophy background..."
   - **Reason**: Strong conceptual overlap with privacy ethics

2. **To**: [[NVIDIA Edge Computing Guide]]
   - **Relevance**: 0.87
   - **Context**: "NVIDIA Jetson AGX Orin for edge computing"
   - **Reason**: Technical implementation details

3. **From**: [[AI Ethics in Healthcare]]
   - **Add link to this page**: High relevance to ethical AI discussion

### Graph Improvements:
- Current connectivity: 12 links
- Suggested additions: 5 links
- New connectivity score: 85% (up from 72%)
```

## Integration Points
- Reads from `quartz/plugins/emitters/semanticLinkDiscovery.ts`
- Updates `content/map.json` for graph visualization
- Coordinates with `content-curator` for new topic discovery
- Validates suggestions with `privacy-auditor` for sensitive links