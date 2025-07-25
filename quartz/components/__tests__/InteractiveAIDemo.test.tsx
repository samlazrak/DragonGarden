import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { h } from 'preact'
import { render } from 'preact-render-to-string'

// Mock the SCSS import
mock.module('../styles/interactiveaidemo.scss', {
  namedExports: {
    default: '.interactive-ai-demo { display: block; }'
  }
})

const InteractiveAIDemo = await import('../InteractiveAIDemo.tsx').then(m => m.default)
const { QuartzComponentProps } = await import('../types.ts')

// Mock QuartzComponentProps
const mockProps: QuartzComponentProps = {
  displayClass: 'test-class',
  fileData: {
    slug: 'test-slug',
    frontmatter: {
      title: 'Test Page',
      tags: ['test'],
    },
    dates: {
      created: new Date('2025-01-25'),
      modified: new Date('2025-01-25'),
    },
  },
  cfg: {} as any,
  tree: {} as any,
  allFiles: [],
}

describe('InteractiveAIDemo', () => {
  describe('Component Rendering', () => {
    it('should render with default options', () => {
      const Component = InteractiveAIDemo()
      const html = render(h(Component, mockProps))
      
      assert(html.includes('interactive-ai-demo'))
      assert(html.includes('data-demo-type="nlp"'))
      assert(html.includes('data-model-source="huggingface"'))
      assert(html.includes('data-fallback="static"'))
    })

    it('should render with custom options', () => {
      const Component = InteractiveAIDemo({
        demoType: 'vision',
        modelSource: 'api',
        fallbackBehavior: 'none',
        title: 'Custom Demo',
        description: 'Custom Description',
        modelId: 'custom-model',
        apiEndpoint: 'https://api.example.com',
        defaultInput: 'Hello world',
      })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('data-demo-type="vision"'))
      assert(html.includes('data-model-source="api"'))
      assert(html.includes('data-fallback="none"'))
      assert(html.includes('data-api-endpoint="https://api.example.com"'))
      assert(html.includes('data-default-input="Hello world"'))
    })

    it('should apply custom display class', () => {
      const Component = InteractiveAIDemo()
      const html = render(h(Component, mockProps))
      
      assert(html.includes('test-class'))
      assert(html.includes('interactive-ai-demo'))
    })
  })

  describe('Demo Type Configurations', () => {
    it('should render NLP demo correctly', () => {
      const Component = InteractiveAIDemo({ demoType: 'nlp' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('Text Classification Demo'))
      assert(html.includes('text-input'))
      assert(html.includes('Enter text to analyze...'))
      // Check for 3 example buttons
      const exampleMatches = html.match(/example-btn/g)
      assert.strictEqual(exampleMatches?.length, 3)
    })

    it('should render vision demo correctly', () => {
      const Component = InteractiveAIDemo({ demoType: 'vision' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('Image Classification Demo'))
      assert(html.includes('image-input'))
      assert(html.includes('type="file"'))
      assert(html.includes('accept="image/*"'))
    })

    it('should render generative demo correctly', () => {
      const Component = InteractiveAIDemo({ demoType: 'generative' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('Text Generation Demo'))
      assert(html.includes('text-input'))
      assert(html.includes('Start typing your prompt...'))
    })

    it('should render custom demo correctly', () => {
      const Component = InteractiveAIDemo({
        demoType: 'custom',
        title: 'My Custom Demo',
        description: 'A custom AI demo',
        modelId: 'my-model',
      })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('My Custom Demo'))
      assert(html.includes('A custom AI demo'))
      assert(html.includes('my-model'))
    })
  })

  describe('Input Elements', () => {
    it('should render text input for text-based demos', () => {
      const Component = InteractiveAIDemo({ demoType: 'nlp' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('<textarea'))
      assert(html.includes('class="demo-input text-input"'))
      assert(html.includes('placeholder="Enter text to analyze..."'))
      assert(html.includes('rows="4"'))
    })

    it('should render image input for vision demos', () => {
      const Component = InteractiveAIDemo({ demoType: 'vision' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('<input'))
      assert(html.includes('type="file"'))
      assert(html.includes('class="demo-input image-input"'))
      assert(html.includes('accept="image/*"'))
    })

    it('should render default input value when provided', () => {
      const Component = InteractiveAIDemo({
        demoType: 'nlp',
        defaultInput: 'Test input text',
      })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('Test input text'))
    })
  })

  describe('Example Buttons', () => {
    it('should render example buttons with correct labels', () => {
      const Component = InteractiveAIDemo({ demoType: 'nlp' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('Positive'))
      assert(html.includes('Negative'))
      assert(html.includes('Neutral'))
    })

    it('should have correct data-value attributes', () => {
      const Component = InteractiveAIDemo({ demoType: 'generative' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('data-value="Once upon a time in a digital garden"'))
      assert(html.includes('data-value="function fibonacci(n) {"'))
      assert(html.includes('data-value="Roses are red, violets are blue"'))
    })
  })

  describe('UI Elements', () => {
    it('should render run demo button', () => {
      const Component = InteractiveAIDemo()
      const html = render(h(Component, mockProps))
      
      assert(html.includes('run-demo-btn'))
      assert(html.includes('Run Demo'))
      assert(html.includes('loading-spinner'))
    })

    it('should render output section with placeholder', () => {
      const Component = InteractiveAIDemo()
      const html = render(h(Component, mockProps))
      
      assert(html.includes('output-section'))
      assert(html.includes('Output:'))
      assert(html.includes('Results will appear here after running the demo'))
    })

    it('should render model info and status', () => {
      const Component = InteractiveAIDemo({ demoType: 'nlp' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('model-info'))
      assert(html.includes('Model:'))
      assert(html.includes('distilbert'))
      assert(html.includes('status-info'))
      assert(html.includes('Ready'))
    })
  })

  describe('CSS and Script Loading', () => {
    it('should have CSS attached', () => {
      const Component = InteractiveAIDemo()
      assert(Component.css !== undefined)
      assert(typeof Component.css === 'string')
      assert(Component.css.includes('interactive-ai-demo'))
    })

    it('should have afterDOMLoaded script', () => {
      const Component = InteractiveAIDemo()
      assert(Component.afterDOMLoaded !== undefined)
      assert(typeof Component.afterDOMLoaded === 'string')
      assert(Component.afterDOMLoaded.includes('simple-ai-demo.js'))
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined options gracefully', () => {
      const Component = InteractiveAIDemo(undefined)
      const html = render(h(Component, mockProps))
      
      assert(html.includes('interactive-ai-demo'))
      assert(html.includes('data-demo-type="nlp"'))
    })

    it('should handle empty custom demo config', () => {
      const Component = InteractiveAIDemo({ demoType: 'custom' })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('Custom AI Demo'))
      assert(html.includes('Interactive AI demonstration'))
      assert(html.includes('data-model-id=""'))
    })

    it('should handle special characters in data attributes', () => {
      const Component = InteractiveAIDemo({
        apiEndpoint: 'https://api.example.com?key="value"&foo=bar',
        defaultInput: 'Text with "quotes" and \'apostrophes\'',
      })
      const html = render(h(Component, mockProps))
      
      assert(html.includes('data-api-endpoint="https://api.example.com?key=&quot;value&quot;&amp;foo=bar"'))
      assert(html.includes('Text with &quot;quotes&quot; and &#x27;apostrophes&#x27;'))
    })
  })
})