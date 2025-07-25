import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/interactiveaidemo.scss"
// Use simpler implementation for better reliability
const script = `
  const script = document.createElement('script');
  script.src = '/static/simple-ai-demo.js';
  document.head.appendChild(script);
`
import { classNames } from "../util/lang"

export interface InteractiveAIDemoOptions {
  demoType: "nlp" | "vision" | "generative" | "custom"
  modelSource: "huggingface" | "custom" | "api"
  fallbackBehavior: "api" | "static" | "none"
  title?: string
  description?: string
  modelId?: string
  apiEndpoint?: string
  defaultInput?: string
}

const defaultOptions: InteractiveAIDemoOptions = {
  demoType: "nlp",
  modelSource: "huggingface",
  fallbackBehavior: "static",
}

interface DemoConfig {
  title: string
  description: string
  modelId: string
  inputType: "text" | "image" | "both"
  outputType: "text" | "image" | "visualization"
  placeholder: string
  examples: Array<{ label: string; value: string }>
}

const demoConfigs: Record<string, DemoConfig> = {
  nlp: {
    title: "Text Classification Demo",
    description: "Analyze sentiment and classify text using AI",
    modelId: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    inputType: "text",
    outputType: "visualization",
    placeholder: "Enter text to analyze...",
    examples: [
      { label: "Positive", value: "This blog post is absolutely fantastic! I learned so much." },
      { label: "Negative", value: "I found this content confusing and poorly written." },
      { label: "Neutral", value: "The article covers the basics of machine learning." }
    ]
  },
  vision: {
    title: "Image Classification Demo",
    description: "Classify images using computer vision AI",
    modelId: "Xenova/vit-base-patch16-224",
    inputType: "image",
    outputType: "visualization",
    placeholder: "Upload an image to classify...",
    examples: [
      { label: "Cat", value: "/static/examples/cat.jpg" },
      { label: "Dog", value: "/static/examples/dog.jpg" },
      { label: "Bird", value: "/static/examples/bird.jpg" }
    ]
  },
  generative: {
    title: "Text Generation Demo",
    description: "Generate creative text using AI",
    modelId: "Xenova/gpt2",
    inputType: "text",
    outputType: "text",
    placeholder: "Start typing your prompt...",
    examples: [
      { label: "Story", value: "Once upon a time in a digital garden" },
      { label: "Code", value: "function fibonacci(n) {" },
      { label: "Poetry", value: "Roses are red, violets are blue" }
    ]
  }
}

export default ((userOpts?: Partial<InteractiveAIDemoOptions>) => {
  const InteractiveAIDemo: QuartzComponent = ({ 
    displayClass,
    fileData 
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    const config = opts.demoType === "custom" 
      ? {
          title: opts.title || "Custom AI Demo",
          description: opts.description || "Interactive AI demonstration",
          modelId: opts.modelId || "",
          inputType: "text" as const,
          outputType: "text" as const,
          placeholder: "Enter input...",
          examples: []
        }
      : demoConfigs[opts.demoType]
    
    return (
      <div 
        class={classNames(displayClass, "interactive-ai-demo")}
        data-demo-type={opts.demoType}
        data-model-source={opts.modelSource}
        data-model-id={config.modelId}
        data-fallback={opts.fallbackBehavior}
        data-api-endpoint={opts.apiEndpoint || ""}
        data-default-input={opts.defaultInput || ""}
      >
        <div class="demo-header">
          <h3>{config.title}</h3>
          <p class="demo-description">{config.description}</p>
        </div>
        
        <div class="demo-content">
          <div class="input-section">
            <label class="input-label">Input:</label>
            
            {config.inputType === "text" && (
              <textarea 
                class="demo-input text-input" 
                placeholder={config.placeholder}
                rows="4"
              >{opts.defaultInput || ""}</textarea>
            )}
            
            {config.inputType === "image" && (
              <div class="image-input-container">
                <input 
                  type="file" 
                  class="demo-input image-input" 
                  accept="image/*"
                  id={`image-input-${Date.now()}`}
                />
                <label for={`image-input-${Date.now()}`} class="image-input-label">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke-width="2"/>
                    <polyline points="21 15 16 10 5 21" stroke-width="2"/>
                  </svg>
                  <span>Click to upload image</span>
                </label>
                <div class="image-preview"></div>
              </div>
            )}
            
            {config.examples.length > 0 && (
              <div class="examples-section">
                <span class="examples-label">Try these examples:</span>
                <div class="example-buttons">
                  {config.examples.map(example => (
                    <button 
                      class="example-btn" 
                      data-value={example.value}
                    >
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button class="run-demo-btn">
              <span class="btn-text">Run Demo</span>
              <span class="loading-spinner"></span>
            </button>
          </div>
          
          <div class="output-section">
            <label class="output-label">Output:</label>
            <div class="demo-output">
              <div class="output-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-width="2"/>
                </svg>
                <p>Results will appear here after running the demo</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="demo-footer">
          <div class="model-info">
            <span class="info-label">Model:</span>
            <span class="info-value">{config.modelId}</span>
          </div>
          <div class="status-info">
            <span class="status-indicator"></span>
            <span class="status-text">Ready</span>
          </div>
        </div>
      </div>
    )
  }

  InteractiveAIDemo.css = style
  InteractiveAIDemo.afterDOMLoaded = script

  return InteractiveAIDemo
}) satisfies QuartzComponentConstructor