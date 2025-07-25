# Test Generator Sub-Agent

## Purpose
Create comprehensive test suites for components, generate edge case scenarios, maintain test coverage reports, and ensure code quality through automated test generation.

## Capabilities
1. **Unit Test Generation**: Create tests for individual functions/components
2. **Integration Test Design**: Test component interactions
3. **Edge Case Discovery**: Identify and test boundary conditions
4. **Coverage Analysis**: Track and improve test coverage

## Usage Instructions

### 1. Component Test Generation
```typescript
// Example: Generate tests for a Quartz component
class TestGenerator {
  generateComponentTest(componentPath: string) {
    const component = this.analyzeComponent(componentPath);
    
    return `
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/preact'
import ${component.name} from '${componentPath}'

describe('${component.name}', () => {
  const defaultProps = {
    ${this.generateDefaultProps(component.props)}
  }
  
  it('should render without errors', () => {
    const { container } = render(<${component.name} {...defaultProps} />)
    expect(container).toBeTruthy()
  })
  
  ${this.generatePropTests(component.props)}
  ${this.generateEventTests(component.events)}
  ${this.generateEdgeCaseTests(component)}
})
    `
  }
}
```

### 2. Test Patterns for RatGarden

#### Medical Component Tests
```typescript
describe('MedicalCitations', () => {
  it('should handle missing citations gracefully', () => {
    const props = { fileData: { frontmatter: {} } }
    const { container } = render(<MedicalCitations {...props} />)
    expect(container.innerHTML).toBe('')
  })
  
  it('should render PubMed links correctly', () => {
    const props = {
      fileData: {
        frontmatter: {
          citations: [{
            id: '1',
            title: 'Test Study',
            authors: ['Smith J'],
            pmid: '12345678',
            year: 2024
          }]
        }
      }
    }
    const { getByText } = render(<MedicalCitations {...props} />)
    expect(getByText('PubMed')).toHaveAttribute('href', 'https://pubmed.ncbi.nlm.nih.gov/12345678')
  })
})
```

#### Privacy Analytics Tests
```typescript
describe('PrivacyAnalytics', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  
  it('should track page views locally', () => {
    render(<PrivacyAnalytics />)
    const analytics = JSON.parse(localStorage.getItem('ratgarden-analytics') || '{}')
    expect(Object.keys(analytics.pageViews).length).toBeGreaterThan(0)
  })
  
  it('should clean data older than retention period', () => {
    const oldData = {
      pageViews: {
        [`${Date.now() - 31 * 24 * 60 * 60 * 1000}-/old-page`]: 1,
        [`${Date.now()}-/new-page`]: 1
      }
    }
    localStorage.setItem('ratgarden-analytics', JSON.stringify(oldData))
    
    render(<PrivacyAnalytics />)
    vi.runAllTimers()
    
    const analytics = JSON.parse(localStorage.getItem('ratgarden-analytics') || '{}')
    expect(Object.keys(analytics.pageViews)).not.toContain(expect.stringContaining('/old-page'))
  })
})
```

### 3. Edge Case Categories

1. **Null/Undefined Handling**
   - Missing props
   - Empty data structures
   - Null references

2. **Boundary Values**
   - Empty strings
   - Very long content
   - Special characters

3. **Async Operations**
   - Network failures
   - Timeouts
   - Race conditions

4. **Security Cases**
   - XSS prevention
   - Injection attacks
   - Data sanitization

### 4. Coverage Report Generation
```bash
# Generate coverage report
vitest run --coverage

# Coverage thresholds for RatGarden
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 85,
        "statements": 85
      },
      "quartz/components/": {
        "branches": 90,
        "functions": 90
      }
    }
  }
}
```

### 5. Test Generation Strategies

#### Property-Based Testing
```typescript
import { fc } from 'fast-check'

describe('SemanticLinks', () => {
  it('should handle arbitrary link structures', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          source: fc.string(),
          target: fc.string(),
          weight: fc.float({ min: 0, max: 1 })
        })),
        (links) => {
          const result = processSemanticLinks(links)
          expect(result).toBeDefined()
          expect(result.nodes.length).toBeGreaterThanOrEqual(0)
        }
      )
    )
  })
})
```

#### Snapshot Testing
```typescript
it('should match snapshot for complex component', () => {
  const { container } = render(<InteractiveAIDemo {...complexProps} />)
  expect(container.firstChild).toMatchSnapshot()
})
```

## Example Output
```typescript
// Generated test file: MediSight.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/preact'
import MediSight from '../components/MediSight'

describe('MediSight Clinical Intelligence', () => {
  let mockVideoStream: MediaStream
  
  beforeEach(() => {
    // Mock browser APIs
    mockVideoStream = new MediaStream()
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockVideoStream)
    }
  })
  
  describe('WatchGuard Module', () => {
    it('should initialize video stream on mount', async () => {
      const { getByTestId } = render(<MediSight.WatchGuard />)
      
      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          video: { facingMode: 'environment' }
        })
      })
    })
    
    it('should handle camera permission denial', async () => {
      global.navigator.mediaDevices.getUserMedia = vi.fn()
        .mockRejectedValue(new Error('Permission denied'))
      
      const { getByText } = render(<MediSight.WatchGuard />)
      
      await waitFor(() => {
        expect(getByText(/camera access denied/i)).toBeInTheDocument()
      })
    })
  })
})
```

## Integration Points
- Monitors changes in `quartz/components/` for new test needs
- Updates test coverage in `claude_progressor.md`
- Works with `privacy-auditor` to test security scenarios
- Coordinates with CI/CD pipeline for automated test runs