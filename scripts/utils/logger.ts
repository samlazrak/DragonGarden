export interface Logger {
  info(message: string): void
  success(message: string): void
  warning(message: string): void
  error(message: string): void
  debug(message: string): void
}

export class ConsoleLogger implements Logger {
  private colors = {
    info: "\x1b[34m",
    success: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m",
    debug: "\x1b[35m",
    reset: "\x1b[0m",
  }

  private prefixes = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    debug: "🐛",
  }

  info(message: string): void {
    console.log(`${this.colors.info}${this.prefixes.info}${this.colors.reset} ${message}`)
  }

  success(message: string): void {
    console.log(`${this.colors.success}${this.prefixes.success}${this.colors.reset} ${message}`)
  }

  warning(message: string): void {
    console.log(`${this.colors.warning}${this.prefixes.warning}${this.colors.reset} ${message}`)
  }

  error(message: string): void {
    console.log(`${this.colors.error}${this.prefixes.error}${this.colors.reset} ${message}`)
  }

  debug(message: string): void {
    console.log(`${this.colors.debug}${this.prefixes.debug}${this.colors.reset} ${message}`)
  }
}
