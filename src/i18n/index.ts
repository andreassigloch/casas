/**
 * i18n Helper Functions
 * @author andreas@siglochconsulting.de
 */

import de from './de.json';

// Supported locales
export const locales = ['de', 'en', 'pt', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

// Type for translation keys (nested dot notation)
type NestedKeyOf<T, K extends string = ''> = T extends object
  ? {
      [P in keyof T & string]: T[P] extends object
        ? NestedKeyOf<T[P], K extends '' ? P : `${K}.${P}`>
        : K extends ''
          ? P
          : `${K}.${P}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof de>;

// Translation cache
const translationCache: Record<Locale, typeof de | null> = {
  de: de,
  en: null,
  pt: null,
  fr: null,
};

/**
 * Load translations for a locale
 */
async function loadTranslations(locale: Locale): Promise<typeof de> {
  if (translationCache[locale]) {
    return translationCache[locale]!;
  }

  try {
    const translations = await import(`./${locale}.json`);
    translationCache[locale] = translations.default;
    return translations.default;
  } catch {
    console.warn(`Translations for ${locale} not found, falling back to de`);
    return de;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Get translation for a key
 * Synchronous version - uses cached translations
 */
export function t(key: TranslationKey, locale: Locale = 'de'): string {
  const translations = translationCache[locale] || de;
  return getNestedValue(translations as Record<string, unknown>, key);
}

/**
 * Get translation (async) - loads translations if needed
 */
export async function tAsync(key: TranslationKey, locale: Locale): Promise<string> {
  const translations = await loadTranslations(locale);
  return getNestedValue(translations as Record<string, unknown>, key);
}

/**
 * Extract locale from URL path
 */
export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    return segments[0] as Locale;
  }

  return defaultLocale;
}

/**
 * Get localized path for a given path and locale
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove any existing locale prefix
  let cleanPath = path;
  for (const loc of locales) {
    if (cleanPath.startsWith(`/${loc}/`)) {
      cleanPath = cleanPath.slice(loc.length + 1);
      break;
    }
    if (cleanPath === `/${loc}`) {
      cleanPath = '/';
      break;
    }
  }

  // Default locale has no prefix
  if (locale === defaultLocale) {
    return cleanPath;
  }

  // Add locale prefix
  return `/${locale}${cleanPath}`;
}

/**
 * Get all localized versions of a path
 */
export function getAllLocalizedPaths(path: string): Record<Locale, string> {
  return {
    de: getLocalizedPath(path, 'de'),
    en: getLocalizedPath(path, 'en'),
    pt: getLocalizedPath(path, 'pt'),
    fr: getLocalizedPath(path, 'fr'),
  };
}

/**
 * Get language name for display
 */
export function getLanguageName(locale: Locale): string {
  const names: Record<Locale, string> = {
    de: 'Deutsch',
    en: 'English',
    pt: 'Português',
    fr: 'Français',
  };
  return names[locale];
}

/**
 * Get language code for HTML lang attribute
 */
export function getHtmlLang(locale: Locale): string {
  const codes: Record<Locale, string> = {
    de: 'de-DE',
    en: 'en-GB',
    pt: 'pt-PT',
    fr: 'fr-FR',
  };
  return codes[locale];
}

/**
 * Initialize translations for SSG
 * Call this at build time to pre-load all translations
 */
export async function initTranslations(): Promise<void> {
  await Promise.all(locales.map((locale) => loadTranslations(locale)));
}

/**
 * Get translations object for a locale (for direct access)
 */
export function getTranslations(locale: Locale): typeof de {
  return translationCache[locale] || de;
}

export default { t, tAsync, getLocaleFromUrl, getLocalizedPath, locales, defaultLocale };
