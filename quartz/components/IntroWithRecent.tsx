import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import { htmlToJsx } from "../util/jsx"
import { ComponentChildren } from "preact"

interface Options {
  introTitle?: string
  recentTitle?: string
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  introTitle: "Welcome",
  recentTitle: "Latest Note",
  showTags: true,
  filter: (f) => f.slug !== "intro" && f.slug !== "index",
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const IntroWithRecent: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }

    // Find the intro file
    const introFile = allFiles.find((f) => f.slug === "intro")

    // Get the most recent note (excluding intro and index)
    const recentPages = allFiles.filter(opts.filter).sort(opts.sort)
    const mostRecent = recentPages[0]

    return (
      <div class={classNames(displayClass, "intro-with-recent")}>
        {/* Intro Section */}
        {introFile && (
          <div class="intro-section">
            <h2>{opts.introTitle}</h2>
            <div class="intro-content">
              {htmlToJsx(introFile.filePath!, introFile.tree as any) as ComponentChildren}
            </div>
          </div>
        )}

        {/* Most Recent Note Section */}
        {mostRecent && (
          <div class="recent-section">
            <h2>{opts.recentTitle}</h2>
            <div class="recent-note">
              <div class="note-header">
                <h3>
                  <a href={resolveRelative(fileData.slug!, mostRecent.slug!)} class="internal">
                    {mostRecent.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title}
                  </a>
                </h3>
                {mostRecent.dates && (
                  <p class="meta">
                    <Date date={getDate(cfg, mostRecent)!} locale={cfg.locale} />
                  </p>
                )}
                {opts.showTags && mostRecent.frontmatter?.tags && (
                  <ul class="tags">
                    {mostRecent.frontmatter.tags.map((tag: string) => (
                      <li>
                        <a
                          class="internal tag-link"
                          href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                        >
                          {tag}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div class="note-preview">
                {htmlToJsx(mostRecent.filePath!, mostRecent.tree as any) as ComponentChildren}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  IntroWithRecent.css = `
    .intro-with-recent {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .intro-section, .recent-section {
      background: var(--secondary);
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid var(--border);
    }
    
    .intro-section h2, .recent-section h2 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: var(--secondary);
    }
    
    .intro-content {
      line-height: 1.6;
    }
    
    .recent-note {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .note-header h3 {
      margin: 0;
    }
    
    .note-header h3 a {
      color: var(--secondary);
      text-decoration: none;
    }
    
    .note-header h3 a:hover {
      text-decoration: underline;
    }
    
    .meta {
      margin: 0.5rem 0;
      font-size: 0.9rem;
      color: var(--secondary);
    }
    
    .tags {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tags li {
      margin: 0;
    }
    
    .tag-link {
      background: var(--highlight);
      color: var(--secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      text-decoration: none;
    }
    
    .tag-link:hover {
      background: var(--secondary);
      color: var(--bg);
    }
    
    .note-preview {
      line-height: 1.6;
    }
    
    .note-preview h1, .note-preview h2, .note-preview h3 {
      display: none;
    }
  `

  return IntroWithRecent
}) satisfies QuartzComponentConstructor
