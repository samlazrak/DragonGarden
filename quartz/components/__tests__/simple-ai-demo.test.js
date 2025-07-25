import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Simple AI Demo Script', () => {
  let dom
  let window
  let document
  let consoleErrorSpy
  let consoleWarnSpy
  
  beforeEach(() => {
    // Create a new JSDOM instance for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div class="interactive-ai-demo" data-demo-type="nlp">
            <div class="demo-header">
              <h3>Test Demo</h3>
            </div>
            <div class="demo-content">
              <textarea class="text-input"></textarea>
              <button class="example-btn" data-value="Test example">Example</button>
              <button class="run-demo-btn">
                <span class="btn-text">Run Demo</span>
                <span class="loading-spinner"></span>
              </button>
              <div class="demo-output"></div>
            </div>
            <div class="demo-footer">
              <div class="status-info">
                <span class="status-indicator"></span>
                <span class="status-text">Ready</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `, {
      url: 'http://localhost:8080',
      runScripts: 'dangerously',
      resources: 'usable'
    })
    
    window = dom.window
    document = window.document
    global.window = window
    global.document = document
    global.navigator = window.navigator
    
    // Mock clipboard API
    global.navigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
    
    // Spy on console methods
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // Load the script
    const scriptPath = path.resolve(__dirname, '../../../public/static/simple-ai-demo.js')
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8')
    const scriptElement = document.createElement('script')
    scriptElement.textContent = scriptContent
    document.head.appendChild(scriptElement)
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
    dom.window.close()
  })
  
  describe('Initialization', () => {
    it('should initialize demos on DOMContentLoaded', () => {
      const demo = document.querySelector('.interactive-ai-demo')
      expect(demo.hasAttribute('id')).toBe(true)
      expect(demo.id).toMatch(/^ai-demo-\d+$/)
    })
    
    it('should handle missing demo elements gracefully', () => {
      document.body.innerHTML = ''
      window.dispatchEvent(new window.Event('DOMContentLoaded'))
      expect(consoleWarnSpy).toHaveBeenCalledWith('[AI Demo]: No demo elements found on page')
    })
    
    it('should set aria attributes for accessibility', () => {
      const runBtn = document.querySelector('.run-demo-btn')
      const exampleBtn = document.querySelector('.example-btn')
      
      expect(runBtn.getAttribute('aria-label')).toBe('Run AI demo')
      expect(exampleBtn.getAttribute('aria-label')).toMatch(/Example \d+/)
    })
  })
  
  describe('Example Button Functionality', () => {
    it('should populate text input when example button is clicked', () => {
      const exampleBtn = document.querySelector('.example-btn')
      const textInput = document.querySelector('.text-input')
      
      exampleBtn.click()
      expect(textInput.value).toBe('Test example')
    })
    
    it('should handle missing text input gracefully', () => {
      const textInput = document.querySelector('.text-input')
      textInput.remove()
      
      const exampleBtn = document.querySelector('.example-btn')
      expect(() => exampleBtn.click()).not.toThrow()
    })
  })
  
  describe('Input Validation', () => {
    it('should validate empty text input', async () => {
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      runBtn.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(output.innerHTML).toContain('Text input cannot be empty')
      expect(output.querySelector('.error-output')).toBeTruthy()
    })
    
    it('should validate text length limits', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      // Create text longer than 5000 characters
      textInput.value = 'a'.repeat(5001)
      runBtn.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(output.innerHTML).toContain('exceeds maximum length')
    })
  })
  
  describe('NLP Demo', () => {
    it('should analyze positive sentiment correctly', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      textInput.value = 'This is absolutely wonderful and amazing!'
      runBtn.click()
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      expect(output.querySelector('.sentiment-label').textContent).toBe('Positive')
      expect(output.querySelector('.confidence-text').textContent).toMatch(/\d+% confidence/)
    })
    
    it('should analyze negative sentiment correctly', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      textInput.value = 'This is terrible and awful!'
      runBtn.click()
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      expect(output.querySelector('.sentiment-label').textContent).toBe('Negative')
    })
    
    it('should analyze neutral sentiment correctly', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      textInput.value = 'The sky is blue and grass is green.'
      runBtn.click()
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      expect(output.querySelector('.sentiment-label').textContent).toBe('Neutral')
    })
  })
  
  describe('Vision Demo', () => {
    beforeEach(() => {
      // Update demo type to vision
      const demo = document.querySelector('.interactive-ai-demo')
      demo.dataset.demoType = 'vision'
      demo.innerHTML += `
        <input type="file" class="image-input" accept="image/*">
        <div class="image-preview"></div>
      `
    })
    
    it('should require image upload', async () => {
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      runBtn.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(output.innerHTML).toContain('Please upload an image')
    })
    
    it('should validate image file type', () => {
      const imageInput = document.querySelector('.image-input')
      const file = new window.File([''], 'test.txt', { type: 'text/plain' })
      
      // Simulate file selection
      Object.defineProperty(imageInput, 'files', {
        value: [file],
        writable: false
      })
      
      const changeEvent = new window.Event('change', { bubbles: true })
      imageInput.dispatchEvent(changeEvent)
      
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
  
  describe('Generative Demo', () => {
    beforeEach(() => {
      const demo = document.querySelector('.interactive-ai-demo')
      demo.dataset.demoType = 'generative'
    })
    
    it('should generate text continuation', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      textInput.value = 'Once upon a time in a digital garden'
      runBtn.click()
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      expect(output.querySelector('.generated-continuation')).toBeTruthy()
      expect(output.innerHTML).toContain('code could bloom like flowers')
    })
    
    it('should handle copy to clipboard', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      textInput.value = 'Hello world'
      runBtn.click()
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const copyBtn = output.querySelector('.copy-btn')
      copyBtn.click()
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })
  
  describe('Error Handling', () => {
    it('should handle unknown demo types', async () => {
      const demo = document.querySelector('.interactive-ai-demo')
      demo.dataset.demoType = 'unknown'
      
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      runBtn.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(output.querySelector('.error-output')).toBeTruthy()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
    
    it('should handle missing required elements', () => {
      const demo = document.querySelector('.interactive-ai-demo')
      const runBtn = demo.querySelector('.run-demo-btn')
      runBtn.remove()
      
      // Re-initialize
      window.dispatchEvent(new window.Event('DOMContentLoaded'))
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize demo'),
        expect.any(Error)
      )
    })
  })
  
  describe('UI State Management', () => {
    it('should disable button during processing', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const btnText = runBtn.querySelector('.btn-text')
      const spinner = runBtn.querySelector('.loading-spinner')
      
      textInput.value = 'Test text'
      runBtn.click()
      
      // Check immediate state
      expect(runBtn.disabled).toBe(true)
      expect(runBtn.getAttribute('aria-busy')).toBe('true')
      expect(btnText.style.display).toBe('none')
      expect(spinner.style.display).toBe('inline-block')
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check restored state
      expect(runBtn.disabled).toBe(false)
      expect(runBtn.getAttribute('aria-busy')).toBe('false')
      expect(btnText.style.display).toBe('inline')
      expect(spinner.style.display).toBe('none')
    })
    
    it('should update status indicators correctly', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const statusText = document.querySelector('.status-text')
      const statusIndicator = document.querySelector('.status-indicator')
      
      // Initial state
      expect(statusText.textContent).toBe('Ready')
      expect(statusIndicator.classList.contains('ready')).toBe(true)
      
      textInput.value = 'Test text'
      runBtn.click()
      
      // Processing state
      expect(statusText.textContent).toBe('Processing...')
      expect(statusIndicator.classList.contains('processing')).toBe(true)
      
      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Complete state
      expect(statusText.textContent).toBe('Complete')
      expect(statusIndicator.classList.contains('complete')).toBe(true)
    })
  })
  
  describe('Sanitization', () => {
    it('should sanitize HTML in user input', async () => {
      const textInput = document.querySelector('.text-input')
      const runBtn = document.querySelector('.run-demo-btn')
      const output = document.querySelector('.demo-output')
      
      textInput.value = 'Test <script>alert("XSS")</script> text'
      runBtn.click()
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      expect(output.innerHTML).not.toContain('<script>')
      expect(output.innerHTML).toContain('&lt;script&gt;')
    })
  })
})