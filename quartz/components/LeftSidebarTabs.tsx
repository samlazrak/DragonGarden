import Explorer from "./Explorer"
import script from "./scripts/sidebarTabs.inline"
import leftSidebarTabsStyle from "./styles/leftSidebarTabs.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface Options {
  defaultTab?: "explorer" | "toc"
}

const defaultOptions: Options = {
  defaultTab: "explorer",
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const LeftSidebarTabs: QuartzComponent = ({
    displayClass,
    fileData,
    allFiles,
    ctx,
    externalResources,
    children,
    tree,
  }: QuartzComponentProps) => {
    const ExplorerComponent = Explorer({
      title: "Explore",
      folderClickBehavior: "link",
      folderDefaultState: "collapsed",
      useSavedState: true,
      mapFn: (node) => node,
      sortFn: (a, b) => {
        // folders first, then files, both alphabetically
        if ((!a.file && !b.file) || (a.file && b.file)) {
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      },
      filterFn: (node) => node.name !== "tags",
    })

    return (
      <div class={`left-sidebar-tabs ${displayClass ?? ""}`}>
        <div class="tab-header">
          <button
            class="tab-button active"
            data-tab="explorer"
            data-onclick="switchLeftTab('explorer')"
          >
            📁 Explore
          </button>
        </div>

        <div class="tab-content">
          <div class="tab-panel active" data-panel="explorer">
            <ExplorerComponent
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

  LeftSidebarTabs.displayName = "LeftSidebarTabs"
  LeftSidebarTabs.css = leftSidebarTabsStyle
  LeftSidebarTabs.afterDOMLoaded = script
  return LeftSidebarTabs
}) satisfies QuartzComponentConstructor
