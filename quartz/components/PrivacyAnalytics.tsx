import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/privacyanalytics.scss"

interface AnalyticsData {
  pageViews: Record<string, number>
  readingTime: Record<string, number>
  referrers: Record<string, number>
  searchQueries: string[]
}

const PrivacyAnalytics: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={`privacy-analytics ${displayClass ?? ""}`}>
      <h3>Privacy-First Analytics</h3>
      <div class="analytics-notice">
        <p>All analytics are processed locally. No data leaves your device.</p>
      </div>
      <div id="analytics-dashboard">
        <div class="metric-card">
          <h4>Page Views</h4>
          <div id="pageview-chart"></div>
        </div>
        <div class="metric-card">
          <h4>Reading Patterns</h4>
          <div id="reading-heatmap"></div>
        </div>
        <div class="metric-card">
          <h4>Content Engagement</h4>
          <div id="engagement-metrics"></div>
        </div>
      </div>
    </div>
  )
}

PrivacyAnalytics.css = style
PrivacyAnalytics.afterDOMLoaded = `
const ANALYTICS_KEY = 'ratgarden-analytics';
const RETENTION_DAYS = 30;

class PrivacyAnalytics {
  constructor() {
    this.data = this.loadData();
    this.initializeTracking();
    this.renderDashboard();
  }

  loadData() {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : {
      pageViews: {},
      readingTime: {},
      referrers: {},
      searchQueries: []
    };
  }

  saveData() {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(this.data));
  }

  cleanOldData() {
    const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    // Clean old entries
    Object.keys(this.data.pageViews).forEach(key => {
      const timestamp = parseInt(key.split('-')[0]);
      if (timestamp < cutoff) delete this.data.pageViews[key];
    });
  }

  initializeTracking() {
    // Track page view
    const pageKey = \`\${Date.now()}-\${window.location.pathname}\`;
    this.data.pageViews[pageKey] = (this.data.pageViews[pageKey] || 0) + 1;

    // Track reading time
    let startTime = Date.now();
    let totalTime = 0;

    const updateReadingTime = () => {
      const now = Date.now();
      totalTime += now - startTime;
      startTime = now;
      
      const path = window.location.pathname;
      this.data.readingTime[path] = (this.data.readingTime[path] || 0) + totalTime;
      totalTime = 0;
      
      this.saveData();
    };

    // Update reading time on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        updateReadingTime();
      } else {
        startTime = Date.now();
      }
    });

    // Update on page unload
    window.addEventListener('beforeunload', updateReadingTime);

    // Track referrer (privacy-friendly)
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      const referrerDomain = new URL(document.referrer).hostname;
      this.data.referrers[referrerDomain] = (this.data.referrers[referrerDomain] || 0) + 1;
    }

    // Clean old data and save
    this.cleanOldData();
    this.saveData();
  }

  generateHeatmap() {
    const pages = Object.entries(this.data.readingTime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return pages.map(([path, time]) => ({
      path,
      time: Math.round(time / 1000 / 60), // Convert to minutes
      intensity: Math.min(time / 300000, 1) // 5 min max for full intensity
    }));
  }

  renderDashboard() {
    const dashboard = document.getElementById('analytics-dashboard');
    if (!dashboard) return;

    // Render page views
    const pageViewEl = document.getElementById('pageview-chart');
    if (pageViewEl) {
      const recentViews = Object.entries(this.data.pageViews)
        .filter(([key]) => {
          const timestamp = parseInt(key.split('-')[0]);
          return timestamp > Date.now() - (7 * 24 * 60 * 60 * 1000); // Last 7 days
        })
        .length;
      
      pageViewEl.innerHTML = \`
        <div class="metric-value">\${recentViews}</div>
        <div class="metric-label">views this week</div>
      \`;
    }

    // Render reading heatmap
    const heatmapEl = document.getElementById('reading-heatmap');
    if (heatmapEl) {
      const heatmapData = this.generateHeatmap();
      heatmapEl.innerHTML = heatmapData.map(({ path, time, intensity }) => \`
        <div class="heatmap-row">
          <span class="path">\${path}</span>
          <div class="heatmap-bar" style="width: \${intensity * 100}%; opacity: \${0.3 + intensity * 0.7}">
            \${time}m
          </div>
        </div>
      \`).join('');
    }

    // Render engagement metrics
    const engagementEl = document.getElementById('engagement-metrics');
    if (engagementEl) {
      const totalReadingTime = Object.values(this.data.readingTime)
        .reduce((sum, time) => sum + time, 0);
      const avgReadingTime = totalReadingTime / Object.keys(this.data.readingTime).length || 0;
      
      engagementEl.innerHTML = \`
        <div class="engagement-stat">
          <div class="stat-value">\${Math.round(totalReadingTime / 1000 / 60)}</div>
          <div class="stat-label">total minutes read</div>
        </div>
        <div class="engagement-stat">
          <div class="stat-value">\${Math.round(avgReadingTime / 1000 / 60)}</div>
          <div class="stat-label">avg minutes per page</div>
        </div>
      \`;
    }
  }
}

// Initialize only if dashboard exists
if (document.getElementById('analytics-dashboard')) {
  new PrivacyAnalytics();
}
`

export default (() => PrivacyAnalytics) satisfies QuartzComponentConstructor