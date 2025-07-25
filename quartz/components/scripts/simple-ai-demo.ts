// Simple AI demo implementation using lightweight models or APIs

interface SentimentResult {
  label: string;
  score: number;
  scores: Array<{ label: string; score: number }>;
}

interface ImageClassificationResult {
  label: string;
  score: number;
  scores: Array<{ label: string; score: number }>;
}

interface TextGenerationResult {
  text: string;
  prompt: string;
}

type DemoResult = SentimentResult | ImageClassificationResult | TextGenerationResult;

interface DemoError {
  error: string;
}

class SimpleAIDemo {
  private demos: NodeListOf<Element>;

  constructor() {
    this.demos = document.querySelectorAll('.interactive-ai-demo');
    this.init();
  }

  private init(): void {
    this.demos.forEach((demo: Element) => {
      const runBtn = demo.querySelector('.run-demo-btn') as HTMLButtonElement;
      const demoType = (demo as HTMLElement).dataset.demoType;
      
      if (runBtn && demoType) {
        runBtn.addEventListener('click', () => this.runDemo(demo, demoType));
      }
      
      // Set up example buttons
      const exampleBtns = demo.querySelectorAll('.example-btn') as NodeListOf<HTMLButtonElement>;
      exampleBtns.forEach((btn: HTMLButtonElement) => {
        btn.addEventListener('click', (e: Event) => {
          const target = e.target as HTMLButtonElement;
          const value = target.dataset.value;
          const input = demo.querySelector('.text-input') as HTMLTextAreaElement;
          if (input && value) input.value = value;
        });
      });
    });
  }

  private async runDemo(demo: Element, demoType: string): Promise<void> {
    const input = this.getInput(demo);
    if (!input) {
      this.showError(demo, 'Please provide input');
      return;
    }

    this.setLoading(demo, true);
    
    try {
      let result: DemoResult | DemoError;
      
      switch (demoType) {
        case 'nlp':
          result = await this.runSentimentAnalysis(input as string);
          break;
        case 'vision':
          result = await this.runImageClassification(input as File);
          break;
        case 'generative':
          result = await this.runTextGeneration(input as string);
          break;
        default:
          result = { error: 'Unknown demo type' };
      }
      
      if ('error' in result) {
        this.showError(demo, result.error);
      } else {
        this.displayResult(demo, result, demoType);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.showError(demo, 'An error occurred: ' + errorMessage);
    } finally {
      this.setLoading(demo, false);
    }
  }

  private getInput(demo: Element): string | File | null {
    const textInput = demo.querySelector('.text-input') as HTMLTextAreaElement;
    if (textInput) return textInput.value.trim();
    
    const imageInput = demo.querySelector('.image-input') as HTMLInputElement;
    if (imageInput && imageInput.files && imageInput.files[0]) return imageInput.files[0];
    
    return null;
  }

  private async runSentimentAnalysis(text: string): Promise<SentimentResult> {
    // Simple rule-based sentiment analysis
    const positiveWords: string[] = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'awesome'];
    const negativeWords: string[] = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'disappointing', 'horrible'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach((word: string) => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach((word: string) => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    let label: string;
    let score: number;
    
    if (positiveScore > negativeScore) {
      label = 'POSITIVE';
      score = Math.min(0.6 + positiveScore * 0.1, 0.99);
    } else if (negativeScore > positiveScore) {
      label = 'NEGATIVE';
      score = Math.min(0.6 + negativeScore * 0.1, 0.99);
    } else {
      label = 'NEUTRAL';
      score = 0.85;
    }
    
    return {
      label,
      score,
      scores: [
        { label, score },
        { label: label === 'POSITIVE' ? 'NEGATIVE' : 'POSITIVE', score: 1 - score }
      ]
    };
  }

  private async runImageClassification(file: File): Promise<ImageClassificationResult> {
    // Simulate image classification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const labels: string[] = ['cat', 'dog', 'bird', 'car', 'person'];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    const score = 0.7 + Math.random() * 0.25;
    
    return {
      label: randomLabel,
      score,
      scores: labels.map((label: string) => ({
        label,
        score: label === randomLabel ? score : Math.random() * (1 - score)
      })).sort((a, b) => b.score - a.score)
    };
  }

  private async runTextGeneration(prompt: string): Promise<TextGenerationResult> {
    // Simple template-based generation
    const continuations: string[] = [
      " and the journey continues with endless possibilities ahead.",
      " which demonstrates the power of human creativity and innovation.",
      " as we explore the boundaries of what's possible together.",
      " revealing new insights with every step forward."
    ];
    
    const randomContinuation = continuations[Math.floor(Math.random() * continuations.length)];
    
    return {
      text: prompt + randomContinuation,
      prompt
    };
  }

  private displayResult(demo: Element, result: DemoResult, demoType: string): void {
    const output = demo.querySelector('.demo-output') as HTMLElement;
    if (!output) return;
    
    let html = '';
    
    if (demoType === 'nlp' || demoType === 'vision') {
      const classificationResult = result as SentimentResult | ImageClassificationResult;
      html = `
        <div class="classification-result">
          <div class="main-result">
            <span class="result-label">Prediction:</span>
            <span class="result-value ${classificationResult.label.toLowerCase()}">${classificationResult.label}</span>
            <span class="confidence">${(classificationResult.score * 100).toFixed(1)}% confidence</span>
          </div>
          <div class="all-scores">
            ${classificationResult.scores.map(score => `
              <div class="score-item">
                <span class="score-label">${score.label}</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${score.score * 100}%"></div>
                </div>
                <span class="score-value">${(score.score * 100).toFixed(1)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (demoType === 'generative') {
      const generationResult = result as TextGenerationResult;
      html = `
        <div class="generation-result">
          <div class="generated-text">
            <p><span class="prompt-text">${generationResult.prompt}</span>${generationResult.text.substring(generationResult.prompt.length)}</p>
          </div>
        </div>
      `;
    }
    
    output.innerHTML = html;
  }

  private setLoading(demo: Element, loading: boolean): void {
    const btn = demo.querySelector('.run-demo-btn') as HTMLButtonElement;
    const status = demo.querySelector('.status-text') as HTMLElement;
    
    if (btn) {
      if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }
    
    if (status) {
      status.textContent = loading ? 'Processing...' : 'Ready';
    }
  }

  private showError(demo: Element, message: string): void {
    const output = demo.querySelector('.demo-output') as HTMLElement;
    if (output) {
      output.innerHTML = `
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <p>${message}</p>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SimpleAIDemo());
} else {
  new SimpleAIDemo();
}