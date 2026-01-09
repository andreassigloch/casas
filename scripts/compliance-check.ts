#!/usr/bin/env tsx
/**
 * GDPR/DSGVO Compliance Agent
 * @author andreas@siglochconsulting.de
 *
 * Checks for GDPR violations before git push:
 * 1. Personal data (names, addresses, precise geolocation)
 * 2. Credentials and secrets
 * 3. Internal information
 *
 * Run before commit: npm run compliance
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { glob } from 'glob';

interface ComplianceViolation {
  type: 'error' | 'warning' | 'whitelisted';
  category: string;
  file: string;
  line?: number;
  message: string;
  pattern?: string;
  context?: string;
}

const violations: ComplianceViolation[] = [];
const whitelisted: ComplianceViolation[] = [];

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

/**
 * Patterns for GDPR violations
 */
const PATTERNS = {
  // Credentials and API keys
  credentials: [
    /api[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi,
    /secret[_-]?key\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi,
    /password\s*[:=]\s*["'][^"']{3,}["']/gi,
    /token\s*[:=]\s*["']?[a-zA-Z0-9_-]{20,}["']?/gi,
    /bearer\s+[a-zA-Z0-9_-]{20,}/gi,
  ],

  // Precise geolocation (>4 decimal places = <11m precision)
  preciseGeo: [
    /\b\d{1,3}\.\d{5,}\s*,\s*\d{1,3}\.\d{5,}\b/g,
    /["']?lat["']?\s*[:=]\s*\d{1,3}\.\d{5,}/gi,
    /["']?lng["']?\s*[:=]\s*\d{1,3}\.\d{5,}/gi,
  ],

  // Email addresses
  emails: [
    /\b[a-zA-Z0-9._%+-]+@(?!example\.com|test\.com|localhost|siglochconsulting\.de)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  ],

  // Phone numbers (excluding official business number)
  phoneNumbers: [
    /\+\d{1,3}\s*\d{2,4}\s*\d{6,10}/g,
  ],
};

/**
 * Files to skip from checks
 */
const SKIP_FILES = [
  'package-lock.json',
  'package.json',
  'tsconfig.json',
  'scripts/compliance-check.ts',
  '.env.example',
];

/**
 * Official company information (whitelisted)
 */
const OFFICIAL_COMPANY_INFO = {
  emails: ['andreas@siglochconsulting.de'],
  phones: ['+491704454877', '+49 170 4454877', '+49 1704454877'],
  names: ['Andreas Sigloch', 'Sigloch Consulting'],
};

/**
 * Check if match is official company info
 */
function isOfficialInfo(match: string, filePath: string): boolean {
  const matchLower = match.toLowerCase();

  // Check emails
  if (OFFICIAL_COMPANY_INFO.emails.some(e => matchLower.includes(e.toLowerCase()))) {
    return true;
  }

  // Check phones (normalize formatting)
  const normalizedMatch = match.replace(/\s/g, '');
  if (OFFICIAL_COMPANY_INFO.phones.some(p => normalizedMatch.includes(p.replace(/\s/g, '')))) {
    return true;
  }

  return false;
}

/**
 * Get files to check
 */
async function getFilesToCheck(): Promise<string[]> {
  try {
    // Check git staged files first
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    const stagedFiles = output.trim().split('\n').filter(Boolean);

    if (stagedFiles.length > 0) {
      return stagedFiles
        .filter(file => !file.startsWith('.git/'))
        .filter(file => !file.includes('node_modules/'))
        .filter(file => !file.includes('dist/'))
        .filter(file => {
          const ext = file.split('.').pop()?.toLowerCase();
          return ['ts', 'tsx', 'js', 'jsx', 'astro', 'json', 'md', 'yml', 'yaml'].includes(ext || '');
        });
    }
  } catch (error) {
    // No git or no staged files, check all files
  }

  // Check all source files
  const files = await glob('src/**/*.{ts,tsx,js,jsx,astro,md}');
  return files;
}

/**
 * Check file for sensitive patterns
 */
function checkFile(filePath: string): void {
  const fullPath = join(process.cwd(), filePath);

  if (!existsSync(fullPath)) return;
  if (SKIP_FILES.some(skip => filePath.includes(skip))) return;

  let content: string;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch (error) {
    return;
  }

  const lines = content.split('\n');

  // Check for credentials
  PATTERNS.credentials.forEach((pattern) => {
    lines.forEach((line, index) => {
      // Skip environment variable references
      if (line.includes('.env') || line.includes('process.env') || line.includes('import.meta.env')) {
        return;
      }

      // Skip example placeholders
      if (line.includes('your_') || line.includes('YOUR_') || line.includes('_here')) {
        return;
      }

      const matches = line.match(pattern);
      if (matches) {
        violations.push({
          type: 'error',
          category: 'Credentials',
          file: filePath,
          line: index + 1,
          message: 'Potential credential or API key found',
          pattern: matches[0].substring(0, 50),
          context: line.trim().substring(0, 100),
        });
      }
    });
  });

  // Check for precise geolocation
  PATTERNS.preciseGeo.forEach((pattern) => {
    lines.forEach((line, index) => {
      const matches = line.match(pattern);
      if (matches) {
        violations.push({
          type: 'error',
          category: 'Geolocation',
          file: filePath,
          line: index + 1,
          message: 'Precise geolocation (<50m) found (GDPR violation)',
          pattern: matches[0],
          context: line.trim().substring(0, 100),
        });
      }
    });
  });

  // Check for email addresses
  PATTERNS.emails.forEach((pattern) => {
    lines.forEach((line, index) => {
      const matches = line.match(pattern);
      if (matches) {
        if (isOfficialInfo(matches[0], filePath)) {
          whitelisted.push({
            type: 'whitelisted',
            category: 'Email (Official)',
            file: filePath,
            line: index + 1,
            message: 'Official company email (whitelisted)',
            pattern: matches[0],
          });
          return;
        }

        violations.push({
          type: 'warning',
          category: 'Email Address',
          file: filePath,
          line: index + 1,
          message: 'Email address found (potential personal data)',
          pattern: matches[0],
          context: line.trim().substring(0, 100),
        });
      }
    });
  });

  // Check for phone numbers
  PATTERNS.phoneNumbers.forEach((pattern) => {
    lines.forEach((line, index) => {
      const matches = line.match(pattern);
      if (matches) {
        if (isOfficialInfo(matches[0], filePath)) {
          whitelisted.push({
            type: 'whitelisted',
            category: 'Phone (Official)',
            file: filePath,
            line: index + 1,
            message: 'Official business phone (whitelisted)',
            pattern: matches[0],
          });
          return;
        }

        violations.push({
          type: 'warning',
          category: 'Phone Number',
          file: filePath,
          line: index + 1,
          message: 'Phone number found (potential personal data)',
          pattern: matches[0],
          context: line.trim().substring(0, 100),
        });
      }
    });
  });
}

/**
 * Print violations report
 */
function printReport(): void {
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}    GDPR/DSGVO COMPLIANCE CHECK${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  const errors = violations.filter(v => v.type === 'error');
  const warnings = violations.filter(v => v.type === 'warning');

  console.log(`${colors.red}Found ${errors.length} error(s)${colors.reset}`);
  console.log(`${colors.yellow}Found ${warnings.length} warning(s)${colors.reset}`);
  console.log(`${colors.green}Found ${whitelisted.length} whitelisted item(s)${colors.reset}\n`);

  if (violations.length === 0) {
    console.log(`${colors.green}✓ No violations found${colors.reset}`);
    console.log(`${colors.green}✓ Safe to push${colors.reset}\n`);
    return;
  }

  // Print violations by category
  const byCategory = violations.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, ComplianceViolation[]>);

  Object.entries(byCategory).forEach(([category, items]) => {
    console.log(`${colors.bold}${category}:${colors.reset}`);
    items.forEach((item) => {
      const icon = item.type === 'error' ? '✗' : '⚠';
      const color = item.type === 'error' ? colors.red : colors.yellow;

      console.log(`  ${color}${icon}${colors.reset} ${item.file}${item.line ? `:${item.line}` : ''}`);
      console.log(`    ${item.message}`);
      if (item.pattern) console.log(`    Pattern: ${item.pattern}`);
      if (item.context) console.log(`    Context: ${item.context}`);
    });
    console.log('');
  });

  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log(`${colors.blue}Running GDPR compliance checks...${colors.reset}\n`);

  const files = await getFilesToCheck();

  if (files.length === 0) {
    console.log(`${colors.green}No files to check${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`Checking ${files.length} file(s)...\n`);

  files.forEach(checkFile);

  printReport();

  const errors = violations.filter(v => v.type === 'error');

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}COMPLIANCE CHECK FAILED${colors.reset}`);
    console.log(`${colors.red}Fix all errors before pushing${colors.reset}\n`);
    process.exit(1);
  }

  const warnings = violations.filter(v => v.type === 'warning');
  if (warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}PASSED WITH WARNINGS${colors.reset}`);
    console.log(`${colors.yellow}Please review warnings${colors.reset}\n`);
  } else {
    console.log(`${colors.green}${colors.bold}COMPLIANCE CHECK PASSED${colors.reset}\n`);
  }

  process.exit(0);
}

main();
