import Backlinks from "./Backlinks"
import SemanticLinks from "./SemanticLinks"
import script from "./scripts/sidebarTabs.inline"
import rightSidebarTabsStyle from "./styles/rightSidebarTabs.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface Options {
  defaultTab?: "related" | "backlinks"
  semanticLinksOptions?: {
    title: string
    maxSuggestions: number
    minStrength: number
    showStrength: boolean
    showConfidence: boolean
    showExplanation: boolean
  }
}

const defaultOptions: Options = {
  defaultTab: "related",
  semanticLinksOptions: {
    title: "Related Content",
    maxSuggestions: 5,
    minStrength: 0.1,
    showStrength: true,
    showConfidence: false,
    showExplanation: true,
  },
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const RightSidebarTabs: QuartzComponent = ({
    displayClass,
    fileData,
    allFiles,
    ctx,
    externalResources,
    children,
    tree,
  }: QuartzComponentProps) => {
    const SemanticLinksComponent = SemanticLinks(options.semanticLinksOptions)
    const BacklinksComponent = Backlinks()

    return (
      <div class={`right-sidebar-tabs ${displayClass ?? ""}`}>
        <div class="tab-header">
          <button
            class="tab-button active"
            data-tab="related"
            data-onclick="switchRightTab('related')"
          >
            🔗 Related
          </button>
          <button
            class="tab-button"
            data-tab="backlinks"
            data-onclick="switchRightTab('backlinks')"
          >
            ↩️ Backlinks
          </button>
        </div>

        <div class="tab-content">
          <div class="tab-panel active" data-panel="related">
            <SemanticLinksComponent
              displayClass={displayClass}
              fileData={fileData}
              allFiles={allFiles}
              ctx={ctx}
              externalResources={externalResources}
              children={children}
              tree={tree}
              cfg={ctx.cfg.configuration}
            />
          </div>
          <div class="tab-panel" data-panel="backlinks">
            <BacklinksComponent
              displayClass={displayClass}
              fileData={fileData}
              allFiles={allFiles}
              ctx={ctx}
              externalResources={externalResources}
              children={children}
              tree={tree}
              cfg={ctx.cfg.configuration}
            />
          </div>
        </div>
      </div>
    )
  }

  RightSidebarTabs.displayName = "RightSidebarTabs"
  RightSidebarTabs.css = rightSidebarTabsStyle
  RightSidebarTabs.afterDOMLoaded = script
  return RightSidebarTabs
}) satisfies QuartzComponentConstructor
