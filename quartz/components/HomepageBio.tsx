import { resolveRelative } from "../util/path"
import homepageBioStyle from "./styles/homepageBio.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export interface Options {
  showAvatar: boolean
  showSocialLinks: boolean
  showCurrentFocus: boolean
  showQuickLinks: boolean
}

const defaultOptions: Options = {
  showAvatar: true,
  showSocialLinks: true,
  showCurrentFocus: true,
  showQuickLinks: true,
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const HomepageBio: QuartzComponent = ({
    displayClass,
    fileData,
    allFiles,
    ctx,
  }: QuartzComponentProps) => {
    const socialLinks = [
      { name: "GitHub", url: "https://github.com/samlazrak", icon: "github" },
      { name: "LinkedIn", url: "https://www.linkedin.com/in/samlazrak", icon: "linkedin" },
      { name: "Main Website", url: "https://samlazrak.github.io/", icon: "website" },
    ]

    const quickLinks = [
      {
        title: "Current Research",
        slug: "research/PhD",
        description: "AI in Medicine & Biomedical Engineering",
      },
      {
        title: "Publications",
        slug: "research/Publications",
        description: "Research publications and papers",
      },
      { title: "Art Projects", slug: "art/My-Art", description: "Mixed-media and digital art" },
      {
        title: "Community Work",
        slug: "projects/Build-Birmingham",
        description: "Tech community building",
      },
    ]

    const getSocialIcon = (iconType: string) => {
      switch (iconType) {
        case "github":
          return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          )
        case "linkedin":
          return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          )
        case "website":
          return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          )
        default:
          return null
      }
    }

    return (
      <div class={`homepage-bio ${displayClass ?? ""}`}>
        <div class="bio-container">
          {options.showAvatar && (
            <div class="bio-avatar">
              <div class="avatar-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
          )}

          <div class="bio-content">
            <div class="bio-header">
              <h1 class="bio-name">Sam Lazrak</h1>
              <p class="bio-title">Software Engineer & AI Researcher</p>
            </div>

            <div class="bio-description">
              <p>
                Welcome to my digital garden! I'm a software engineer with 5+ years of experience
                and a passion for advancing artificial intelligence in medicine and biomedical
                engineering. My academic background includes a Bachelor's in Computer Science,
                providing a strong technical foundation for AI development, and a Bachelor's in
                Philosophy, which has equipped me with critical thinking skills and a deep
                understanding of ethical reasoning—essential for responsible innovation in
                healthcare technology.
              </p>

              <div class="digital-garden-explanation">
                <h3>What is a Digital Garden?</h3>
                <p>
                  A digital garden is a collection of interconnected notes, thoughts, and ideas that
                  grow and evolve over time—like a real garden. Unlike traditional blogs with
                  chronological posts, digital gardens focus on connections between ideas, allowing
                  knowledge to flourish through links and relationships. I'm building this garden to
                  explore the intersection of AI and healthcare, document my research journey, and
                  create a living knowledge base that grows smarter with each interaction.
                </p>
              </div>

              {options.showCurrentFocus && (
                <div class="current-focus">
                  <h3>Current Focus</h3>
                  <p>
                    Pursuing PhD research focused on applying AI to healthcare, particularly in
                    medical imaging and clinical decision support. My work emphasizes
                    privacy-preserving approaches, building on published research in influenza virus
                    protein interactions and ion channel regulation.
                  </p>
                </div>
              )}

              <div class="tech-stack">
                <h3>Technical Expertise</h3>
                <div class="tech-categories">
                  <div class="tech-category">
                    <strong>Languages:</strong> Python, Java, C#, JavaScript/TypeScript, SQL
                  </div>
                  <div class="tech-category">
                    <strong>AI/ML:</strong> TensorFl2ow, PyTorch, scikit-learn, CNNs, NLP,
                    LlamaSharp
                  </div>
                  <div class="tech-category">
                    <strong>Web:</strong> React, Angular, Spring Boot, .NET/Blazor, Node.js
                  </div>
                  <div class="tech-category">
                    <strong>Cloud/DevOps:</strong> AWS, Azure, Docker, PostgreSQL, CI/CD
                  </div>
                </div>
              </div>
            </div>

            {options.showSocialLinks && (
              <div class="bio-social">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    class="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                  >
                    {getSocialIcon(link.icon)}
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {options.showQuickLinks && (
          <div class="quick-links">
            <h3>Explore</h3>
            <div class="quick-links-grid">
              {quickLinks.map((link, index) => {
                const relativeUrl = resolveRelative(fileData.slug!, link.slug as any)
                return (
                  <a key={index} href={relativeUrl} class="quick-link-card" data-no-popover={false}>
                    <h4>{link.title}</h4>
                    <p>{link.description}</p>
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  HomepageBio.displayName = "HomepageBio"
  HomepageBio.css = homepageBioStyle
  return HomepageBio
}) satisfies QuartzComponentConstructor
