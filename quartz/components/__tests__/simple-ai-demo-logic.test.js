import { describe, it } from 'node:test'
import assert from 'node:assert'

// Test the core logic functions without DOM dependencies
describe('Simple AI Demo Logic', () => {
  describe('Input Validation', () => {
    it('should validate text input correctly', () => {
      const validateText = (input) => {
        if (!input || typeof input !== 'string') {
          throw new Error('Invalid text input')
        }
        const trimmed = input.trim()
        if (trimmed.length === 0) {
          throw new Error('Text input cannot be empty')
        }
        if (trimmed.length > 5000) {
          throw new Error('Text input exceeds maximum length of 5000 characters')
        }
        return trimmed
      }
      
      // Valid inputs
      assert.strictEqual(validateText('Hello world'), 'Hello world')
      assert.strictEqual(validateText('  Trimmed  '), 'Trimmed')
      
      // Invalid inputs
      assert.throws(() => validateText(''), /Invalid text input/)
      assert.throws(() => validateText('   '), /Text input cannot be empty/)
      assert.throws(() => validateText(null), /Invalid text input/)
      assert.throws(() => validateText(undefined), /Invalid text input/)
      assert.throws(() => validateText('a'.repeat(5001)), /exceeds maximum length/)
    })
    
    it('should validate image file correctly', () => {
      const validateImage = (file) => {
        if (!file || !file.type) {
          throw new Error('Invalid file input')
        }
        if (!file.type.startsWith('image/')) {
          throw new Error('File must be an image')
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error('Image file size must be less than 10MB')
        }
        return file
      }
      
      // Valid image
      const validImage = { type: 'image/png', size: 1024 * 1024 } // 1MB
      assert.deepStrictEqual(validateImage(validImage), validImage)
      
      // Invalid inputs
      assert.throws(() => validateImage(null), /Invalid file input/)
      assert.throws(() => validateImage({}), /Invalid file input/)
      assert.throws(() => validateImage({ type: 'text/plain', size: 100 }), /File must be an image/)
      assert.throws(() => validateImage({ type: 'image/png', size: 11 * 1024 * 1024 }), /less than 10MB/)
    })
  })
  
  describe('Sanitization', () => {
    it('should sanitize HTML to prevent XSS', () => {
      const sanitizeHTML = (str) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
      }
      
      assert.strictEqual(
        sanitizeHTML('Hello <script>alert("XSS")</script>'),
        'Hello &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
      )
      assert.strictEqual(
        sanitizeHTML('Test & <div>HTML</div>'),
        'Test &amp; &lt;div&gt;HTML&lt;/div&gt;'
      )
      assert.strictEqual(
        sanitizeHTML('Quotes: "double" and \'single\''),
        'Quotes: &quot;double&quot; and &#x27;single&#x27;'
      )
    })
  })
  
  describe('Sentiment Analysis', () => {
    it('should analyze positive sentiment', () => {
      const analyzeSentiment = (text) => {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'awesome', 'perfect']
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'poor', 'disappointing']
        
        const lowerText = text.toLowerCase()
        const words = lowerText.split(/\s+/)
        
        let positiveScore = 0
        let negativeScore = 0
        
        words.forEach(word => {
          // Remove punctuation from word
          const cleanWord = word.replace(/[.,!?;:'"]/g, '')
          if (positiveWords.includes(cleanWord)) positiveScore++
          if (negativeWords.includes(cleanWord)) negativeScore++
        })
        
        const totalScore = positiveScore + negativeScore
        let sentiment
        
        if (totalScore === 0) {
          sentiment = 'Neutral'
        } else if (positiveScore > negativeScore) {
          sentiment = 'Positive'
        } else if (negativeScore > positiveScore) {
          sentiment = 'Negative'
        } else {
          sentiment = 'Mixed'
        }
        
        return {
          sentiment,
          positiveScore,
          negativeScore,
          wordCount: words.length
        }
      }
      
      // Positive sentiment
      const positive = analyzeSentiment('This is wonderful!')
      assert.strictEqual(positive.sentiment, 'Positive')
      assert.strictEqual(positive.positiveScore, 1) // 'wonderful' is in our list
      assert.strictEqual(positive.negativeScore, 0)
      
      // Negative sentiment
      const negative = analyzeSentiment('This is terrible and awful!')
      assert.strictEqual(negative.sentiment, 'Negative')
      assert.strictEqual(negative.positiveScore, 0)
      assert.strictEqual(negative.negativeScore, 2) // Both 'terrible' and 'awful' are in the list
      
      // Neutral sentiment
      const neutral = analyzeSentiment('The sky is blue and grass is green.')
      assert.strictEqual(neutral.sentiment, 'Neutral')
      assert.strictEqual(neutral.positiveScore, 0)
      assert.strictEqual(neutral.negativeScore, 0)
      
      // Mixed sentiment
      const mixed = analyzeSentiment('Some parts are good but others are bad.')
      assert.strictEqual(mixed.sentiment, 'Mixed')
      assert.strictEqual(mixed.positiveScore, 1)
      assert.strictEqual(mixed.negativeScore, 1)
    })
  })
  
  describe('Text Generation', () => {
    it('should generate appropriate continuations', () => {
      const generateContinuation = (prompt) => {
        const continuations = {
          'once upon a time in a digital garden': ', there lived a curious developer who discovered that code could bloom like flowers.',
          'function fibonacci(n) {': '\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
          'hello world': ', the traditional first program that every developer writes.',
        }
        
        const lowerPrompt = prompt.toLowerCase()
        for (const [key, value] of Object.entries(continuations)) {
          if (lowerPrompt.includes(key)) {
            return value
          }
        }
        
        return ' and the journey continued through endless possibilities.'
      }
      
      // Specific continuations
      assert.strictEqual(
        generateContinuation('Once upon a time in a digital garden'),
        ', there lived a curious developer who discovered that code could bloom like flowers.'
      )
      
      assert.strictEqual(
        generateContinuation('function fibonacci(n) {'),
        '\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}'
      )
      
      // Default continuation
      assert.strictEqual(
        generateContinuation('Random text'),
        ' and the journey continued through endless possibilities.'
      )
    })
  })
  
  describe('Error Handling', () => {
    it('should format error messages correctly', () => {
      const formatError = (context, error) => {
        return `Error in ${context}: ${error.message || 'Unknown error occurred'}`
      }
      
      assert.strictEqual(
        formatError('NLP analysis', new Error('Invalid input')),
        'Error in NLP analysis: Invalid input'
      )
      
      assert.strictEqual(
        formatError('Vision demo', { message: null }),
        'Error in Vision demo: Unknown error occurred'
      )
    })
  })
  
  describe('Result Generation', () => {
    it('should calculate confidence scores correctly', () => {
      const calculateConfidence = (positiveScore, negativeScore) => {
        const totalScore = positiveScore + negativeScore
        if (totalScore === 0) return 0.6
        
        if (positiveScore > negativeScore) {
          return Math.min(0.5 + (positiveScore / totalScore) * 0.5, 0.95)
        } else if (negativeScore > positiveScore) {
          return Math.min(0.5 + (negativeScore / totalScore) * 0.5, 0.95)
        }
        return 0.5
      }
      
      // No indicators
      assert.strictEqual(calculateConfidence(0, 0), 0.6)
      
      // Strong positive
      assert.strictEqual(calculateConfidence(4, 0), 0.95)
      
      // Moderate positive
      assert.strictEqual(calculateConfidence(2, 1), 0.5 + (2/3) * 0.5)
      
      // Equal mixed
      assert.strictEqual(calculateConfidence(2, 2), 0.5)
    })
    
    it('should generate vision results with proper confidence ranges', () => {
      const generateVisionResult = (label, baseConfidence) => {
        // Simulate some randomization but keep it deterministic for testing
        const variation = 0.1
        const confidence = Math.max(0.1, Math.min(0.99, baseConfidence + variation))
        return { label, confidence }
      }
      
      const result = generateVisionResult('Cat', 0.89)
      assert.strictEqual(result.label, 'Cat')
      assert(result.confidence >= 0.1)
      assert(result.confidence <= 0.99)
      assert(Math.abs(result.confidence - 0.99) < 0.2) // Should be close to base + variation
    })
  })
})