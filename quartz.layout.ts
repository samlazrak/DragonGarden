import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { getSemanticLinkComponentConfig } from "./quartz/plugins/emitters/semanticLinkConfig"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.ConditionalRender({
      component: Component.ReadingProgress({
        showProgressBar: true,
        showReadingTime: true,
        showTimeRemaining: true,
        wordsPerMinute: 200,
        position: "top",
        showOnlyOnLongContent: true,
        minWordsForDisplay: 300,
      }),
      condition: (page) =>
        page.fileData.slug !== "index" && !page.fileData.slug?.endsWith("/index"),
    }),
  ],
  afterBody: [
    Component.ConditionalRender({
      component: Component.FeaturedContent({
        title: "Featured Content",
        limit: 6,
        showDescription: true,
        showDate: true,
        showTags: true,
        featuredSlugs: [
          "research/PhD",
          "research/Publications",
          "art/My-Art",
          "projects/Build-Birmingham",
          "tools/AI-Semantic-Links",
        ],
        autoFeatured: true,
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.TagList(),
    Component.PrivacyAnalytics(),
    Component.AIWritingAssistant({
      features: ["grammar", "style", "suggestions", "completion"],
      provider: "mock",
      position: "floating",
    }),
  ],
  footer: Component.Footer({
    links: {
      "Main Website": "https://samlazrak.github.io/",
      GitHub: "https://github.com/samlazrak",
      LinkedIn: "https://www.linkedin.com/in/samlazrak",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.AISearch({
            enablePreview: true,
            searchMode: "hybrid",
            enableExplanations: true,
            maxResults: 8,
          }),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.DesktopOnly(
      Component.LeftSidebarTabs({
        defaultTab: "explorer",
      }),
    ),
    Component.MobileOnly(
      Component.Explorer({
        title: "Explore",
        folderClickBehavior: "link",
        folderDefaultState: "collapsed",
        useSavedState: true,
        mapFn: (node) => node,
        sortFn: (a, b) => {
          // folders first, then files, both alphabetically
          if ((a.isFolder && b.isFolder) || (!a.isFolder && !b.isFolder)) {
            return a.displayName.localeCompare(b.displayName, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          }
          if (!a.isFolder && b.isFolder) {
            return 1
          } else {
            return -1
          }
        },
        filterFn: (node) => node.slugSegment !== "tags",
      }),
    ),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "Recent Notes",
        limit: 5,
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.RightSidebarTabs({
        defaultTab: "related",
        semanticLinksOptions: getSemanticLinkComponentConfig(),
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.AIRecommendations({
        mode: "personalized",
        explanations: true,
        maxItems: 5,
        title: "Recommended for You",
        showDescription: true,
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.AISearch({
            enablePreview: true,
            searchMode: "hybrid",
            enableExplanations: true,
            maxResults: 8,
          }),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.DesktopOnly(
      Component.LeftSidebarTabs({
        defaultTab: "explorer",
      }),
    ),
    Component.MobileOnly(
      Component.Explorer({
        title: "Explore",
        folderClickBehavior: "link",
        folderDefaultState: "collapsed",
        useSavedState: true,
        mapFn: (node) => node,
        sortFn: (a, b) => {
          // folders first, then files, both alphabetically
          if ((a.isFolder && b.isFolder) || (!a.isFolder && !b.isFolder)) {
            return a.displayName.localeCompare(b.displayName, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          }
          if (!a.isFolder && b.isFolder) {
            return 1
          } else {
            return -1
          }
        },
        filterFn: (node) => node.slugSegment !== "tags",
      }),
    ),
  ],
  right: [],
}
