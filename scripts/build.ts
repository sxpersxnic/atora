#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync, rmSync, statSync } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
}

// Logging utilities
const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.magenta}▶${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.gray}${msg}${colors.reset}`),
}

interface BuildOptions {
  clean?: boolean
  watch?: boolean
  analyze?: boolean
  verbose?: boolean
  typeCheck?: boolean
  lint?: boolean
  test?: boolean
  skipOptimization?: boolean
}

class LibraryBuilder {
  private startTime: number
  private options: BuildOptions

  constructor(options: BuildOptions = {}) {
    this.startTime = performance.now()
    this.options = {
      clean: true,
      typeCheck: true,
      lint: true,
      test: false, // Skip tests by default in build
      ...options,
    }
  }

  private exec(command: string, description?: string): void {
    try {
      if (description) {
        log.step(description)
      }
      
      if (this.options.verbose) {
        log.dim(`  Running: ${command}`)
      }

      execSync(command, {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        encoding: 'utf8',
      })
    } catch (error: any) {
      log.error(`Failed to execute: ${command}`)
      if (error.stdout) log.error(`stdout: ${error.stdout}`)
      if (error.stderr) log.error(`stderr: ${error.stderr}`)
      process.exit(1)
    }
  }

  private async checkPrerequisites(): Promise<void> {
    log.step('Checking prerequisites...')

    // Check if package.json exists
    if (!existsSync('package.json')) {
      log.error('package.json not found. Are you in the right directory?')
      process.exit(1)
    }

    // Check if node_modules exists
    if (!existsSync('node_modules')) {
      log.warn('node_modules not found. Installing dependencies...')
      this.exec('pnpm install', 'Installing dependencies')
    }

    // Check for required files
    const requiredFiles = [
      'tsconfig.json',
      'tsup.config.ts',
      'src/index.ts',
    ]

    for (const file of requiredFiles) {
      if (!existsSync(file)) {
        log.error(`Required file missing: ${file}`)
        process.exit(1)
      }
    }

    log.success('Prerequisites check passed')
  }

  private async cleanDistFolder(): Promise<void> {
    if (!this.options.clean) return

    log.step('Cleaning build directory...')
    
    const distPath = join(process.cwd(), 'dist')
    if (existsSync(distPath)) {
      rmSync(distPath, { recursive: true, force: true })
      log.success('Build directory cleaned')
    } else {
      log.dim('  No build directory to clean')
    }
  }

  private async runTypeCheck(): Promise<void> {
    if (!this.options.typeCheck) return

    log.step('Running TypeScript type check...')
    this.exec('pnpm type-check', 'Type checking')
    log.success('Type check passed')
  }

  private async runLinting(): Promise<void> {
    if (!this.options.lint) return

    log.step('Running ESLint...')
    this.exec('pnpm lint', 'Linting code')
    log.success('Linting passed')
  }

  private async runTests(): Promise<void> {
    if (!this.options.test) return

    log.step('Running tests...')
    this.exec('pnpm test --run', 'Running test suite')
    log.success('Tests passed')
  }

  private async buildLibrary(): Promise<void> {
    log.step('Building library with tsup...')
    
    const buildCommand = this.options.watch 
      ? 'tsup --watch'
      : 'tsup'
    
    this.exec(buildCommand, 'Compiling TypeScript and bundling')
    
    if (!this.options.watch) {
      log.success('Library build completed')
    }
  }

  private async analyzeBundle(): Promise<void> {
    if (!this.options.analyze) return

    log.step('Analyzing bundle...')
    
    const distPath = join(process.cwd(), 'dist')
    if (!existsSync(distPath)) {
      log.warn('Dist folder not found, skipping bundle analysis')
      return
    }

    try {
      // Get file sizes
      const files = ['index.js', 'index.mjs', 'index.d.ts']
      log.info('Bundle analysis:')
      
      for (const file of files) {
        const filePath = join(distPath, file)
        if (existsSync(filePath)) {
          const stats = statSync(filePath)
          const sizeKB = (stats.size / 1024).toFixed(2)
          log.dim(`  ${file}: ${sizeKB} KB`)
        }
      }
    } catch (error) {
      log.warn('Could not analyze bundle sizes')
    }
  }

  private async optimizeBuild(): Promise<void> {
    if (this.options.skipOptimization) return

    log.step('Optimizing build...')
    
    // Check if build outputs exist
    const distPath = join(process.cwd(), 'dist')
    if (!existsSync(distPath)) {
      log.error('Build output not found')
      process.exit(1)
    }

    // Verify essential files exist
    const essentialFiles = ['index.js', 'index.d.ts']
    for (const file of essentialFiles) {
      if (!existsSync(join(distPath, file))) {
        log.error(`Essential build file missing: ${file}`)
        process.exit(1)
      }
    }

    log.success('Build optimization completed')
  }

  private printBuildSummary(): void {
    const duration = ((performance.now() - this.startTime) / 1000).toFixed(2)
    
    console.log('\n' + '='.repeat(50))
    log.success(`Build completed successfully in ${duration}s`)
    console.log('='.repeat(50))
    
    log.info('Build outputs:')
    log.dim('  ./dist/index.js     - CommonJS build')
    log.dim('  ./dist/index.mjs    - ES Modules build')
    log.dim('  ./dist/index.d.ts   - TypeScript declarations')
    
    if (existsSync('dist/styles.css')) {
      log.dim('  ./dist/styles.css   - Compiled styles')
    }

    console.log('\n' + colors.cyan + 'Ready to publish! 🚀' + colors.reset)
    console.log('Run ' + colors.yellow + 'pnpm publish' + colors.reset + ' to publish to npm')
  }

  private printWatchInfo(): void {
    console.log('\n' + '='.repeat(50))
    log.info('Watching for changes...')
    console.log('='.repeat(50))
    log.dim('Press Ctrl+C to stop watching')
  }

  async build(): Promise<void> {
    try {
      console.log(colors.cyan + '🏗️  Building React Component Library' + colors.reset)
      console.log('='.repeat(50) + '\n')

      await this.checkPrerequisites()
      await this.cleanDistFolder()
      await this.runTypeCheck()
      await this.runLinting()
      await this.runTests()
      await this.buildLibrary()
      
      if (!this.options.watch) {
        await this.optimizeBuild()
        await this.analyzeBundle()
        this.printBuildSummary()
      } else {
        this.printWatchInfo()
      }

    } catch (error: any) {
      log.error('Build failed!')
      console.error(error)
      process.exit(1)
    }
  }
}

// CLI Interface
function parseArgs(): BuildOptions {
  const args = process.argv.slice(2)
  const options: BuildOptions = {}

  for (const arg of args) {
    switch (arg) {
      case '--no-clean':
        options.clean = false
        break
      case '--watch':
      case '-w':
        options.watch = true
        break
      case '--analyze':
      case '-a':
        options.analyze = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--no-type-check':
        options.typeCheck = false
        break
      case '--no-lint':
        options.lint = false
        break
      case '--test':
      case '-t':
        options.test = true
        break
      case '--skip-optimization':
        options.skipOptimization = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        if (arg.startsWith('--')) {
          log.warn(`Unknown option: ${arg}`)
        }
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
${colors.cyan}React Component Library Build Script${colors.reset}

${colors.yellow}Usage:${colors.reset}
  pnpm build [options]

${colors.yellow}Options:${colors.reset}
  --watch, -w              Watch for changes and rebuild
  --analyze, -a            Analyze bundle size
  --verbose, -v            Verbose output
  --test, -t               Run tests before building
  --no-clean               Skip cleaning dist folder
  --no-type-check          Skip TypeScript type checking
  --no-lint                Skip ESLint
  --skip-optimization      Skip build optimization
  --help, -h               Show this help message

${colors.yellow}Examples:${colors.reset}
  pnpm build                    # Standard build
  pnpm build --watch            # Build and watch for changes
  pnpm build --analyze --test   # Build with analysis and tests
  pnpm build --verbose          # Build with detailed output
`)
}

// Main execution
async function main() {
  const options = parseArgs()
  const builder = new LibraryBuilder(options)
  await builder.build()
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n' + colors.yellow + '⚠ Build interrupted by user' + colors.reset)
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n' + colors.yellow + '⚠ Build terminated' + colors.reset)
  process.exit(0)
})

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error('Unexpected error during build:')
    console.error(error)
    process.exit(1)
  })
}