import readingProgressStyle from "./styles/readingProgress.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface Options {
  showProgressBar: boolean
  showReadingTime: boolean
  showTimeRemaining: boolean
  wordsPerMinute: number
  position: "top" | "bottom"
  showOnlyOnLongContent: boolean
  minWordsForDisplay: number
}

const defaultOptions: Options = {
  showProgressBar: true,
  showReadingTime: true,
  showTimeRemaining: true,
  wordsPerMinute: 200, // Average reading speed
  position: "top",
  showOnlyOnLongContent: true,
  minWordsForDisplay: 300, // Only show for articles with 300+ words
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const ReadingProgress: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    // Calculate reading statistics
    const content = fileData.text || ""
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    const estimatedReadingTime = Math.ceil(wordCount / options.wordsPerMinute)

    // Don't show for short content if the option is enabled
    if (options.showOnlyOnLongContent && wordCount < options.minWordsForDisplay) {
      return null
    }

    // Format reading time
    const formatReadingTime = (minutes: number): string => {
      if (minutes < 1) return "< 1 min read"
      if (minutes === 1) return "1 min read"
      return `${minutes} min read`
    }

    // Generate progress bar component with inline script
    const progressBarScript = `
      function initReadingProgress() {
        const progressBar = document.querySelector('.reading-progress-bar');
        const progressFill = document.querySelector('.reading-progress-fill');
        const timeRemaining = document.querySelector('.time-remaining');
        const contentElement = document.querySelector('article') || document.querySelector('.page-content') || document.querySelector('main');
        
        if (!progressBar || !progressFill || !contentElement) return;
        
        const totalReadingTime = ${estimatedReadingTime};
        
        function updateProgress() {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = scrollTop / docHeight;
          const clampedPercent = Math.max(0, Math.min(1, scrollPercent));
          
          // Update progress bar
          progressFill.style.width = (clampedPercent * 100) + '%';
          
          // Update time remaining
          if (timeRemaining) {
            const remainingTime = Math.ceil(totalReadingTime * (1 - clampedPercent));
            if (remainingTime <= 0) {
              timeRemaining.textContent = 'Finished';
            } else if (remainingTime === 1) {
              timeRemaining.textContent = '1 min left';
            } else {
              timeRemaining.textContent = remainingTime + ' min left';
            }
          }
          
          // Show/hide progress bar based on scroll position
          if (scrollPercent > 0.05) {
            progressBar.classList.add('visible');
          } else {
            progressBar.classList.remove('visible');
          }
        }
        
        // Initial update
        updateProgress();
        
        // Update on scroll with throttling
        let ticking = false;
        function throttledUpdate() {
          if (!ticking) {
            requestAnimationFrame(() => {
              updateProgress();
              ticking = false;
            });
            ticking = true;
          }
        }
        
        window.addEventListener('scroll', throttledUpdate, { passive: true });
        window.addEventListener('resize', throttledUpdate, { passive: true });
      }
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReadingProgress);
      } else {
        initReadingProgress();
      }
    `

    return (
      <div class={`reading-progress ${displayClass ?? ""} position-${options.position}`}>
        {options.showProgressBar && (
          <div class="reading-progress-bar">
            <div class="reading-progress-fill"></div>
            <div class="reading-progress-content">
              {options.showReadingTime && (
                <span class="reading-time">📖 {formatReadingTime(estimatedReadingTime)}</span>
              )}
              {options.showTimeRemaining && (
                <span class="time-remaining">{formatReadingTime(estimatedReadingTime)} left</span>
              )}
            </div>
          </div>
        )}

        {/* Inline script for progress tracking */}
        <script dangerouslySetInnerHTML={{ __html: progressBarScript }} />
      </div>
    )
  }

  ReadingProgress.displayName = "ReadingProgress"
  ReadingProgress.css = readingProgressStyle
  return ReadingProgress
}) satisfies QuartzComponentConstructor
