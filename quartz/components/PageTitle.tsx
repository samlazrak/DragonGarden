import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const PageTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const title = fileData.frontmatter?.title
  // Use the dragon.png in static as the logo, with an absolute path
  // Make it a circle and 200% bigger than before (height/width 8.8em)
  return (
    <div class={classNames(displayClass, "page-title-container")}>
      {title && <h1 class="page-title-text">{title}</h1>}
      <h2
        class={classNames(displayClass, "page-title")}
        style={{ display: "flex", alignItems: "center", gap: "0.5em" }}
      >
        <a href={baseDir} style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/static/dragon.png"
            alt="Site Icon"
            style={{
              height: "8.8em",
              width: "8.8em",
              marginRight: "0.5em",
              verticalAlign: "middle",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </a>
      </h2>
    </div>
  )
}

PageTitle.css = `
.page-title-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.page-title-text {
  font-size: 1.5rem;
  margin: 0;
  font-family: var(--titleFont);
  text-align: left;
  color: var(--secondary);
}

.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
  
  a {
    display: flex;
    align-items: center;
  }
}

@media all and ($mobile) {
  .page-title-container {
    align-items: center;
  }
  
  .page-title-text {
    text-align: center;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
