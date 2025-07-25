import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative } from "../util/path"

interface Options {
  title: string
  links: Array<{
    title: string
    description?: string
    tags?: string[]
  }>
}

export default ((opts?: Options) => {
  const HomePageLinks: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    if (!opts) return null

    return (
      <div class={classNames(displayClass, "homepage-links")}>
        <h2>{opts.title}</h2>
        <div class="links-grid">
          {opts.links.map((link) => {
            // Convert title to slug format
            const slug = link.title.toLowerCase().replace(/\s+/g, "-")
            const href = resolveRelative(fileData.slug!, slug as any)

            return (
              <div class="link-card">
                <a href={href} class="internal">
                  <h3>{link.title}</h3>
                  {link.description && <p>{link.description}</p>}
                  {link.tags && (
                    <div class="tags">
                      {link.tags.map((tag) => (
                        <span class="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  HomePageLinks.css = `
    .homepage-links {
      margin: 2rem 0;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .link-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.2s ease;
      background: var(--bg);
    }

    .link-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--secondary);
    }

    .link-card a {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .link-card h3 {
      margin: 0 0 0.5rem 0;
      color: var(--secondary);
    }

    .link-card p {
      margin: 0 0 1rem 0;
      color: var(--darkgray);
      font-size: 0.9rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .tag {
      background: var(--highlight);
      color: var(--secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
  `

  return HomePageLinks
}) satisfies QuartzComponentConstructor
