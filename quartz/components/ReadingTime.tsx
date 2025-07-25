import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface Options {
  wordsPerMinute: number
  showWordCount: boolean
  minWordsToShow: number
}

const defaultOptions: Options = {
  wordsPerMinute: 200,
  showWordCount: false,
  minWordsToShow: 100,
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const ReadingTime: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    // Calculate reading statistics
    const content = fileData.text || ""
    const wordCount = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
    const estimatedReadingTime = Math.ceil(wordCount / options.wordsPerMinute)

    // Don't show for very short content
    if (wordCount < options.minWordsToShow) {
      return null
    }

    // Format reading time
    const formatReadingTime = (minutes: number): string => {
      if (minutes < 1) return "< 1 min read"
      if (minutes === 1) return "1 min read"
      return `${minutes} min read`
    }

    return (
      <span class={`content-reading-time ${displayClass ?? ""}`}>
        {formatReadingTime(estimatedReadingTime)}
        {options.showWordCount && <span class="word-count"> • {wordCount} words</span>}
      </span>
    )
  }

  ReadingTime.displayName = "ReadingTime"
  return ReadingTime
}) satisfies QuartzComponentConstructor
