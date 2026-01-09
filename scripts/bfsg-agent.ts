#!/usr/bin/env tsx
/**
 * BFSG Compliance Agent
 * @author andreas@siglochconsulting
 *
 * Automated validation for BFSG (Barrierefreiheitsstärkungsgesetz) compliance
 * Checks ALT text quality for all images in Astro components
 *
 * Usage:
 *   npm run compliance         # Check all files
 *   npm run compliance -- --fix # Auto-fix where possible
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - BFSG violations found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface BfsgViolation {
  file: string;
  line: number;
  type: 'missing-alt' | 'empty-alt' | 'generic-alt' | 'short-alt' | 'missing-context';
  message: string;
  severity: 'error' | 'warning';
}

// BFSG compliance rules
const BFSG_RULES = {
  MIN_ALT_LENGTH: 20,
  GENERIC_TERMS: ['image', 'bild', 'foto', 'photo', 'picture', 'img'],
  REQUIRED_PREFIXES: ['Außenansicht:', 'Hauptansicht:', 'Ansicht'],
  CONTEXT_KEYWORDS: ['in', 'Zimmer', 'm²', 'Stadt', 'Ort'],
};

class BfsgAgent {
  private violations: BfsgViolation[] = [];
  private filesChecked = 0;
  private imagesFound = 0;

  /**
   * Scan directory recursively for Astro components
   */
  private scanDirectory(dir: string, extensions: string[] = ['.astro']): string[] {
    const files: string[] = [];

    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, dist
        if (!['node_modules', '.git', 'dist', '.astro'].includes(item)) {
          files.push(...this.scanDirectory(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Check ALT text quality
   */
  private checkAltText(altText: string, file: string, line: number): void {
    // Empty ALT
    if (!altText || altText.trim() === '') {
      this.violations.push({
        file,
        line,
        type: 'empty-alt',
        message: 'ALT attribute is empty - BFSG requires descriptive text',
        severity: 'error',
      });
      return;
    }

    const cleanAlt = altText.trim().toLowerCase();

    // Generic ALT
    if (BFSG_RULES.GENERIC_TERMS.includes(cleanAlt)) {
      this.violations.push({
        file,
        line,
        type: 'generic-alt',
        message: `ALT text "${altText}" is too generic - use descriptive context`,
        severity: 'error',
      });
      return;
    }

    // Too short
    if (altText.length < BFSG_RULES.MIN_ALT_LENGTH) {
      this.violations.push({
        file,
        line,
        type: 'short-alt',
        message: `ALT text too short (${altText.length} chars) - BFSG requires descriptive context (min ${BFSG_RULES.MIN_ALT_LENGTH})`,
        severity: 'warning',
      });
    }

    // Missing descriptive prefix
    const hasPrefix = BFSG_RULES.REQUIRED_PREFIXES.some(prefix =>
      altText.includes(prefix)
    );

    if (!hasPrefix) {
      this.violations.push({
        file,
        line,
        type: 'missing-context',
        message: `ALT text missing descriptive prefix (expected: ${BFSG_RULES.REQUIRED_PREFIXES.join(', ')})`,
        severity: 'warning',
      });
    }

    // Missing context keywords
    const hasContext = BFSG_RULES.CONTEXT_KEYWORDS.some(keyword =>
      altText.includes(keyword)
    );

    if (!hasContext && altText.length < 40) {
      this.violations.push({
        file,
        line,
        type: 'missing-context',
        message: 'ALT text lacks context (location, features, etc.)',
        severity: 'warning',
      });
    }
  }

  /**
   * Parse Astro file for img tags
   */
  private checkFile(filePath: string): void {
    this.filesChecked++;
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Match <img> tags with various formats
    const imgRegex = /<img\s+([^>]*?)>/gi;

    lines.forEach((line, index) => {
      const matches = [...line.matchAll(imgRegex)];

      for (const match of matches) {
        this.imagesFound++;
        const imgTag = match[1];

        // Extract ALT attribute
        const altMatch = imgTag.match(/alt=["']([^"']*?)["']/i) ||
                        imgTag.match(/alt={([^}]*?)}/i);

        if (!altMatch) {
          this.violations.push({
            file: filePath,
            line: index + 1,
            type: 'missing-alt',
            message: 'Image missing ALT attribute - BFSG requires ALT text for all images',
            severity: 'error',
          });
          continue;
        }

        // Check if ALT is a variable (starts with {)
        const altValue = altMatch[1];
        if (altValue.startsWith('{') || imgTag.includes('alt={')) {
          // ALT is computed - can't validate statically
          // This is OK if the variable follows BFSG patterns
          continue;
        }

        this.checkAltText(altValue, filePath, index + 1);
      }
    });
  }

  /**
   * Run BFSG compliance checks
   */
  public run(targetDir: string = './src'): number {
    console.log('🔍 BFSG Compliance Agent');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const files = this.scanDirectory(targetDir);

    console.log(`📂 Scanning ${files.length} Astro components...\n`);

    for (const file of files) {
      this.checkFile(file);
    }

    // Report results
    console.log('📊 Results:');
    console.log(`   Files checked: ${this.filesChecked}`);
    console.log(`   Images found: ${this.imagesFound}`);
    console.log(`   Violations: ${this.violations.length}\n`);

    if (this.violations.length === 0) {
      console.log('✅ All BFSG compliance checks passed!\n');
      return 0;
    }

    // Group by severity
    const errors = this.violations.filter(v => v.severity === 'error');
    const warnings = this.violations.filter(v => v.severity === 'warning');

    if (errors.length > 0) {
      console.log(`❌ ${errors.length} BFSG Errors:\n`);
      errors.forEach(v => {
        const relPath = relative(process.cwd(), v.file);
        console.log(`   ${relPath}:${v.line}`);
        console.log(`   └─ ${v.message}\n`);
      });
    }

    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} BFSG Warnings:\n`);
      warnings.forEach(v => {
        const relPath = relative(process.cwd(), v.file);
        console.log(`   ${relPath}:${v.line}`);
        console.log(`   └─ ${v.message}\n`);
      });
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 BFSG Compliance Summary:');
    console.log(`   ❌ Errors: ${errors.length}`);
    console.log(`   ⚠️  Warnings: ${warnings.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (errors.length > 0) {
      console.log('🚫 BFSG compliance check FAILED');
      console.log('   Fix errors above to meet legal accessibility requirements.\n');
      return 1;
    }

    console.log('⚠️  BFSG compliance check passed with warnings');
    console.log('   Consider addressing warnings for better accessibility.\n');
    return 0;
  }
}

// CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const agent = new BfsgAgent();
  const exitCode = agent.run('./src');
  process.exit(exitCode);
}

export { BfsgAgent, BfsgViolation, BFSG_RULES };
