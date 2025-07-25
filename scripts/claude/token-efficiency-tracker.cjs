#!/usr/bin/env node

// Token Efficiency Tracker for Claude Opus Max Subscription
// Tracks usage patterns and provides optimization recommendations

const fs = require("fs")
const path = require("path")
const sqlite3 = require("sqlite3").verbose()

class TokenEfficiencyTracker {
  constructor() {
    this.dbPath = path.join(process.env.HOME, ".claude-knowledge", "db", "claude-knowledge.db")
    this.ensureDatabase()
  }

  ensureDatabase() {
    const db = new sqlite3.Database(this.dbPath)

    db.serialize(() => {
      // Token usage tracking
      db.run(`CREATE TABLE IF NOT EXISTS token_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        task_description TEXT,
        tokens_used INTEGER,
        tokens_saved INTEGER,
        method_used TEXT,
        sub_agent_used TEXT,
        project TEXT,
        efficiency_score REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)

      // Efficiency patterns
      db.run(`CREATE TABLE IF NOT EXISTS efficiency_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_name TEXT NOT NULL,
        description TEXT,
        before_tokens INTEGER,
        after_tokens INTEGER,
        savings_percent REAL,
        usage_count INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)

      // Sub-agent performance
      db.run(`CREATE TABLE IF NOT EXISTS sub_agent_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        tasks_completed INTEGER DEFAULT 0,
        avg_tokens_saved REAL DEFAULT 0,
        success_rate REAL DEFAULT 1.0,
        last_used TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)

      // Cost analysis
      db.run(`CREATE TABLE IF NOT EXISTS cost_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        total_tokens INTEGER,
        total_cost REAL,
        cost_per_token REAL,
        model_used TEXT,
        efficiency_improvement REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)
    })

    db.close()
  }

  async trackUsage(data) {
    const db = new sqlite3.Database(this.dbPath)

    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO token_usage 
        (date, time, task_description, tokens_used, tokens_saved, method_used, sub_agent_used, project, efficiency_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const efficiencyScore =
        data.tokens_saved > 0
          ? (data.tokens_saved / (data.tokens_used + data.tokens_saved)) * 100
          : 0

      stmt.run(
        new Date().toISOString().split("T")[0],
        new Date().toTimeString().split(" ")[0],
        data.task_description,
        data.tokens_used,
        data.tokens_saved,
        data.method_used,
        data.sub_agent_used || null,
        data.project || "RatGarden",
        efficiencyScore,
        (err) => {
          if (err) reject(err)
          else resolve()
          stmt.finalize()
          db.close()
        },
      )
    })
  }

  async getEfficiencyReport(days = 7) {
    const db = new sqlite3.Database(this.dbPath)

    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          SUM(tokens_used) as total_tokens_used,
          SUM(tokens_saved) as total_tokens_saved,
          AVG(efficiency_score) as avg_efficiency,
          COUNT(*) as total_sessions,
          SUM(CASE WHEN sub_agent_used IS NOT NULL THEN 1 ELSE 0 END) as sub_agent_sessions
        FROM token_usage 
        WHERE date >= date('now', '-${days} days')
      `

      db.get(query, (err, row) => {
        if (err) reject(err)
        else resolve(row)
        db.close()
      })
    })
  }

  async getTopEfficiencyPatterns(limit = 5) {
    const db = new sqlite3.Database(this.dbPath)

    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          method_used,
          AVG(efficiency_score) as avg_efficiency,
          COUNT(*) as usage_count,
          SUM(tokens_saved) as total_tokens_saved
        FROM token_usage 
        WHERE method_used IS NOT NULL
        GROUP BY method_used
        ORDER BY avg_efficiency DESC
        LIMIT ${limit}
      `

      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
        db.close()
      })
    })
  }

  async getSubAgentPerformance() {
    const db = new sqlite3.Database(this.dbPath)

    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          sub_agent_used,
          COUNT(*) as usage_count,
          AVG(efficiency_score) as avg_efficiency,
          SUM(tokens_saved) as total_tokens_saved
        FROM token_usage 
        WHERE sub_agent_used IS NOT NULL
        GROUP BY sub_agent_used
        ORDER BY avg_efficiency DESC
      `

      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
        db.close()
      })
    })
  }

  async generateRecommendations() {
    const [report, patterns, subAgents] = await Promise.all([
      this.getEfficiencyReport(),
      this.getTopEfficiencyPatterns(),
      this.getSubAgentPerformance(),
    ])

    const recommendations = []

    // Analyze efficiency patterns
    if (report.avg_efficiency < 25) {
      recommendations.push({
        type: "warning",
        message: "Low efficiency detected. Consider using sub-agents more frequently.",
        impact: "high",
      })
    }

    // Identify underutilized sub-agents
    const usedAgents = subAgents.map((agent) => agent.sub_agent_used)
    const allAgents = [
      "unit-test-engineer",
      "code-reviewer",
      "software-architecture-expert",
      "ai-ml-engineer-mentor",
      "professional-writer-career-advisor",
      "privacy-auditor",
    ]

    const unusedAgents = allAgents.filter((agent) => !usedAgents.includes(agent))
    if (unusedAgents.length > 0) {
      recommendations.push({
        type: "suggestion",
        message: `Consider using these sub-agents: ${unusedAgents.join(", ")}`,
        impact: "medium",
      })
    }

    // Token optimization suggestions
    if (report.total_tokens_used > 10000) {
      recommendations.push({
        type: "optimization",
        message: "High token usage detected. Consider batching tasks and using templates.",
        impact: "high",
      })
    }

    return {
      report,
      patterns,
      subAgents,
      recommendations,
    }
  }

  async saveEfficiencyPattern(pattern) {
    const db = new sqlite3.Database(this.dbPath)

    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO efficiency_patterns 
        (pattern_name, description, before_tokens, after_tokens, savings_percent)
        VALUES (?, ?, ?, ?, ?)
      `)

      stmt.run(
        pattern.name,
        pattern.description,
        pattern.before_tokens,
        pattern.after_tokens,
        pattern.savings_percent,
        (err) => {
          if (err) reject(err)
          else resolve()
          stmt.finalize()
          db.close()
        },
      )
    })
  }
}

// CLI interface
if (require.main === module) {
  const tracker = new TokenEfficiencyTracker()
  const command = process.argv[2]

  switch (command) {
    case "track":
      const data = {
        task_description: process.argv[3] || "Unknown task",
        tokens_used: parseInt(process.argv[4]) || 0,
        tokens_saved: parseInt(process.argv[5]) || 0,
        method_used: process.argv[6] || null,
        sub_agent_used: process.argv[7] || null,
        project: process.argv[8] || "RatGarden",
      }

      tracker
        .trackUsage(data)
        .then(() => console.log("Usage tracked successfully"))
        .catch(console.error)
      break

    case "report":
      tracker
        .generateRecommendations()
        .then((result) => {
          console.log("\n📊 Token Efficiency Report")
          console.log("========================")
          console.log(`Total Tokens Used: ${result.report.total_tokens_used || 0}`)
          console.log(`Total Tokens Saved: ${result.report.total_tokens_saved || 0}`)
          console.log(`Average Efficiency: ${result.report.avg_efficiency?.toFixed(1) || 0}%`)
          console.log(
            `Sub-agent Usage: ${result.report.sub_agent_sessions || 0}/${result.report.total_sessions || 0}`,
          )

          console.log("\n🏆 Top Efficiency Patterns:")
          result.patterns.forEach((pattern) => {
            console.log(
              `  ${pattern.method_used}: ${pattern.avg_efficiency?.toFixed(1)}% efficiency`,
            )
          })

          console.log("\n🤖 Sub-agent Performance:")
          result.subAgents.forEach((agent) => {
            console.log(
              `  ${agent.sub_agent_used}: ${agent.avg_efficiency?.toFixed(1)}% efficiency (${agent.usage_count} uses)`,
            )
          })

          console.log("\n💡 Recommendations:")
          result.recommendations.forEach((rec) => {
            console.log(`  ${rec.type.toUpperCase()}: ${rec.message}`)
          })
        })
        .catch(console.error)
      break

    default:
      console.log("Usage:")
      console.log(
        '  node token-efficiency-tracker.cjs track "task description" tokens_used tokens_saved method sub_agent',
      )
      console.log("  node token-efficiency-tracker.cjs report")
  }
}

module.exports = TokenEfficiencyTracker
