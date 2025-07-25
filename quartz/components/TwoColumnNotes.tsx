import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { Date, getDate } from "./Date"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface Options {
  title?: string
  limit?: number
  showTags?: boolean
}

const defaultOptions: Options = {
  title: "Notes",
  limit: 5,
  showTags: true,
}

export default ((userOpts?: Partial<Options>) => {
  const TwoColumnNotes: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }

    // Filter all notes (files in content folder, excluding index.md)
    const allNotes = allFiles.filter((file) => {
      const slug = file.slug || ""
      return slug !== "index"
    })

    // Shuffle the notes to get random entries
    const shuffledNotes = [...allNotes].sort(() => Math.random() - 0.5)

    // Limit to the specified number of items
    const limitedNotes = opts.limit ? shuffledNotes.slice(0, opts.limit) : shuffledNotes

    return (
      <div class={classNames(displayClass, "single-column-notes")}>
        <div class="notes-container">
          <h3>{opts.title}</h3>
          <ul class="notes-list">
            {limitedNotes.map((page) => {
              const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
              const tags = page.frontmatter?.tags ?? []

              return (
                <li class="note-item">
                  <div class="note-content">
                    <div class="note-header">
                      <h4>
                        <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                          {title}
                        </a>
                      </h4>
                      {page.dates && (
                        <span class="note-date">
                          <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                        </span>
                      )}
                    </div>
                    {opts.showTags && tags.length > 0 && (
                      <div class="note-tags">
                        {tags.map((tag) => (
                          <a
                            class="internal tag-link"
                            href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                          >
                            {tag}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  TwoColumnNotes.css = `
    .single-column-notes {
      margin: 2rem 0;
    }

    .notes-container {
      margin-top: 1rem;
    }

    .notes-container h3 {
      margin: 0 0 1rem 0;
      color: var(--secondary);
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
    }

    .notes-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .note-item {
      margin-bottom: 1rem;
      padding: 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      transition: all 0.2s ease;
    }

    .note-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: var(--secondary);
    }

    .note-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .note-header h4 {
      margin: 0;
      flex: 1;
    }

    .note-header h4 a {
      color: var(--secondary);
      text-decoration: none;
    }

    .note-header h4 a:hover {
      text-decoration: underline;
    }

    .note-date {
      font-size: 0.8rem;
      color: var(--darkgray);
      white-space: nowrap;
    }

    .note-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .note-tags .tag-link {
      background: var(--highlight);
      color: var(--secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      text-decoration: none;
    }

    .note-tags .tag-link:hover {
      background: var(--secondary);
      color: var(--bg);
    }
  `

  return TwoColumnNotes
}) satisfies QuartzComponentConstructor
