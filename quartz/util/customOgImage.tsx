import readingTime from "reading-time"
import { formatDate, getDate } from "../components/Date"
import { i18n } from "../i18n"
import { SocialImageOptions } from "./og"
import { getFontSpecificationName } from "./theme"

// Custom OG image template for The Rat's Garden
export const ratsGardenImage: SocialImageOptions["imageStructure"] = ({
  cfg,
  userOpts,
  title,
  description,
  fileData,
  iconBase64,
}) => {
  const { colorScheme } = userOpts
  const fontBreakPoint = 32
  const useSmallerFont = title.length > fontBreakPoint

  // Format date if available
  const rawDate = getDate(cfg, fileData)
  const date = rawDate ? formatDate(rawDate, cfg.locale) : null

  // Calculate reading time
  const { minutes } = readingTime(fileData.text ?? "")
  const readingTimeText = i18n(cfg.locale).components.contentMeta.readingTime({
    minutes: Math.ceil(minutes),
  })

  // Get tags if available
  const tags = fileData.frontmatter?.tags ?? []
  const bodyFont = getFontSpecificationName(cfg.theme.typography.body)
  const headerFont = getFontSpecificationName(cfg.theme.typography.header)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: cfg.theme.colors[colorScheme].light,
        padding: "2.5rem",
        fontFamily: bodyFont,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `radial-gradient(circle at 20% 80%, ${cfg.theme.colors[colorScheme].secondary} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${cfg.theme.colors[colorScheme].tertiary} 0%, transparent 50%)`,
        }}
      />

      {/* Header Section with Rat Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {iconBase64 && (
          <img
            src={iconBase64}
            width={80}
            height={80}
            style={{
              borderRadius: "50%",
              border: `3px solid ${cfg.theme.colors[colorScheme].secondary}`,
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: cfg.theme.colors[colorScheme].dark,
              fontFamily: headerFont,
            }}
          >
            The Rat's Garden
          </div>
          <div
            style={{
              fontSize: 24,
              color: cfg.theme.colors[colorScheme].gray,
              fontFamily: bodyFont,
            }}
          >
            {cfg.baseUrl}
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div
        style={{
          display: "flex",
          marginTop: "1.5rem",
          marginBottom: "2rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: useSmallerFont ? 56 : 64,
            fontFamily: headerFont,
            fontWeight: 700,
            color: cfg.theme.colors[colorScheme].dark,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Description Section */}
      <div
        style={{
          display: "flex",
          flex: 1,
          fontSize: 32,
          color: cfg.theme.colors[colorScheme].darkgray,
          lineHeight: 1.4,
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {description}
        </p>
      </div>

      {/* Footer with Metadata */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: `2px solid ${cfg.theme.colors[colorScheme].lightgray}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left side - Date and Reading Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            color: cfg.theme.colors[colorScheme].gray,
            fontSize: 24,
          }}
        >
          {date && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <svg
                style={{ marginRight: "0.5rem" }}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {date}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg
              style={{ marginRight: "0.5rem" }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {readingTimeText}
          </div>
        </div>

        {/* Right side - Tags */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            maxWidth: "60%",
          }}
        >
          {tags.slice(0, 3).map((tag: string) => (
            <div
              style={{
                display: "flex",
                padding: "0.5rem 1rem",
                backgroundColor: cfg.theme.colors[colorScheme].highlight,
                color: cfg.theme.colors[colorScheme].secondary,
                borderRadius: "12px",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              #{tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
