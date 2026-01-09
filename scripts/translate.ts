/**
 * DeepL Translation Script
 * @author andreas@siglochconsulting.de
 *
 * Translates de.json → en.json, pt.json, fr.json
 * Only translates new or changed keys (incremental)
 *
 * Usage:
 *   npm run translate          # Translate all
 *   npm run translate:check    # Dry-run, show what would change
 */

import * as deepl from 'deepl-node';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, '../src/i18n');

// Target languages (DeepL language codes)
const TARGET_LANGS: Record<string, deepl.TargetLanguageCode> = {
  en: 'en-GB',
  pt: 'pt-PT',
  fr: 'fr',
};

// Load glossary terms that should not be translated
function loadGlossary(): string[] {
  const glossaryPath = join(I18N_DIR, 'glossary.json');
  if (!existsSync(glossaryPath)) {
    return [];
  }
  const glossary = JSON.parse(readFileSync(glossaryPath, 'utf-8'));
  return glossary.terms || [];
}

// Flatten nested object to dot-notation keys
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }

  return result;
}

// Unflatten dot-notation keys back to nested object
function unflatten(obj: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

// Protect glossary terms from translation
function protectGlossaryTerms(text: string, glossary: string[]): { text: string; replacements: Map<string, string> } {
  const replacements = new Map<string, string>();
  let protectedText = text;

  glossary.forEach((term, index) => {
    const placeholder = `__GLOSSARY_${index}__`;
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (regex.test(protectedText)) {
      protectedText = protectedText.replace(regex, placeholder);
      replacements.set(placeholder, term);
    }
  });

  return { text: protectedText, replacements };
}

// Restore glossary terms after translation
function restoreGlossaryTerms(text: string, replacements: Map<string, string>): string {
  let restoredText = text;
  for (const [placeholder, term] of replacements) {
    restoredText = restoredText.replace(new RegExp(placeholder, 'g'), term);
  }
  return restoredText;
}

// Compute hash of translations for change detection
function computeHash(translations: Record<string, string>): string {
  const str = JSON.stringify(translations, Object.keys(translations).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  // Check for API key
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error('Error: DEEPL_API_KEY environment variable not set');
    console.error('Get your free API key at: https://www.deepl.com/pro#developer');
    process.exit(1);
  }

  // Initialize DeepL
  const translator = new deepl.Translator(apiKey);

  // Check usage
  const usage = await translator.getUsage();
  console.log(`DeepL Usage: ${usage.character?.count || 0} / ${usage.character?.limit || 'unlimited'} characters`);

  // Load source translations
  const sourcePath = join(I18N_DIR, 'de.json');
  const source = JSON.parse(readFileSync(sourcePath, 'utf-8'));
  const flatSource = flatten(source);
  const sourceHash = computeHash(flatSource);

  // Load glossary
  const glossary = loadGlossary();
  console.log(`Glossary: ${glossary.length} protected terms`);

  // Process each target language
  for (const [lang, deeplLang] of Object.entries(TARGET_LANGS)) {
    console.log(`\n--- Processing ${lang.toUpperCase()} ---`);

    const targetPath = join(I18N_DIR, `${lang}.json`);
    let existingTarget: Record<string, string> = {};
    let existingHash = '';

    // Load existing translations if available
    if (existsSync(targetPath)) {
      const existing = JSON.parse(readFileSync(targetPath, 'utf-8'));
      existingTarget = flatten(existing);
      existingHash = existing._sourceHash || '';
    }

    // Find keys that need translation
    const keysToTranslate: string[] = [];
    const keysUnchanged: string[] = [];

    for (const key of Object.keys(flatSource)) {
      if (!(key in existingTarget) || sourceHash !== existingHash) {
        // New key or source changed - needs translation
        keysToTranslate.push(key);
      } else {
        keysUnchanged.push(key);
      }
    }

    // Remove keys that no longer exist in source
    const keysToRemove = Object.keys(existingTarget).filter(
      (key) => !(key in flatSource) && !key.startsWith('_')
    );

    console.log(`  Keys to translate: ${keysToTranslate.length}`);
    console.log(`  Keys unchanged: ${keysUnchanged.length}`);
    console.log(`  Keys to remove: ${keysToRemove.length}`);

    if (isDryRun) {
      if (keysToTranslate.length > 0) {
        console.log(`  Would translate: ${keysToTranslate.slice(0, 5).join(', ')}${keysToTranslate.length > 5 ? '...' : ''}`);
      }
      continue;
    }

    // Translate new/changed keys
    const newTranslations: Record<string, string> = {};

    if (keysToTranslate.length > 0) {
      // Batch translate (DeepL supports up to 50 texts per request)
      const BATCH_SIZE = 50;
      const allReplacements: Map<string, string>[] = [];

      for (let i = 0; i < keysToTranslate.length; i += BATCH_SIZE) {
        const batch = keysToTranslate.slice(i, i + BATCH_SIZE);
        const textsToTranslate: string[] = [];

        for (const key of batch) {
          const { text, replacements } = protectGlossaryTerms(flatSource[key], glossary);
          textsToTranslate.push(text);
          allReplacements.push(replacements);
        }

        console.log(`  Translating batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

        const results = await translator.translateText(textsToTranslate, 'de', deeplLang);

        for (let j = 0; j < batch.length; j++) {
          const key = batch[j];
          const translatedText = Array.isArray(results) ? results[j].text : results.text;
          const restoredText = restoreGlossaryTerms(translatedText, allReplacements[i + j]);
          newTranslations[key] = restoredText;
        }
      }
    }

    // Merge translations
    const merged: Record<string, string> = {};

    // Keep unchanged translations
    for (const key of keysUnchanged) {
      merged[key] = existingTarget[key];
    }

    // Add new translations
    for (const key of keysToTranslate) {
      merged[key] = newTranslations[key];
    }

    // Add metadata
    const output = unflatten(merged) as Record<string, unknown>;
    output._sourceHash = sourceHash;
    output._generated = new Date().toISOString();

    // Write output
    writeFileSync(targetPath, JSON.stringify(output, null, 2) + '\n');
    console.log(`  Written: ${targetPath}`);
  }

  console.log('\n✓ Translation complete');
}

main().catch((err) => {
  console.error('Translation failed:', err.message);
  process.exit(1);
});
