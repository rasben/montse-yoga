// Tiny i18n helpers used across the site.
//
// Astro's i18n config sets Astro.currentLocale based on the URL. These helpers
// turn that into a translation lookup function and let us build links that
// stay in the visitor's current language.
//
// Adding a new string: edit src/i18n/ui.ts and add the same key under en, es,
// and da. Then call `t('your.key')` from any page or component.

import { ui, type Lang } from './ui';

export type { Lang } from './ui';

export const LOCALES: readonly Lang[] = ['en', 'es', 'da'] as const;
export const DEFAULT_LOCALE: Lang = 'en';

const LOCALE_LABELS: Record<Lang, string> = {
    en: 'English',
    es: 'Español',
    da: 'Dansk',
};

const LOCALE_FLAGS: Record<Lang, string> = {
    en: '🇬🇧',
    es: '🇪🇸',
    da: '🇩🇰',
};

const LOCALE_HTML_LANG: Record<Lang, string> = {
    en: 'en',
    es: 'es',
    da: 'da',
};

const LOCALE_OG: Record<Lang, string> = {
    en: 'en_US',
    es: 'es_ES',
    da: 'da_DK',
};

/** Normalise an Astro.currentLocale value (possibly undefined) into one of our locales. */
export function asLang(value: string | undefined | null): Lang {
    if (value === 'es' || value === 'da' || value === 'en') return value;
    return DEFAULT_LOCALE;
}

/** Return a translation function for the given language. Falls back to English when a key is missing in es/da. */
export function useTranslations(lang: Lang) {
    return function t(key: string): string {
        const dict = ui[lang] as Record<string, unknown>;
        const fallback = ui[DEFAULT_LOCALE] as Record<string, unknown>;
        const value = lookup(dict, key) ?? lookup(fallback, key);
        if (value == null) {
            // Visible during development; safer than crashing the build.
            console.warn(`[i18n] missing key: ${key} (${lang})`);
            return key;
        }
        return String(value);
    };
}

/** Look up a comma-free dotted key in a nested object. */
function lookup(obj: Record<string, unknown>, key: string): unknown {
    const parts = key.split('.');
    let cur: unknown = obj;
    for (const p of parts) {
        if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
            cur = (cur as Record<string, unknown>)[p];
        } else {
            return undefined;
        }
    }
    return cur;
}

/** Read an array (e.g. weeks, FAQs, niches) from the dictionary with the same fallback rules. */
export function useList(lang: Lang) {
    return function list<T = unknown>(key: string): T[] {
        const dict = ui[lang] as Record<string, unknown>;
        const fallback = ui[DEFAULT_LOCALE] as Record<string, unknown>;
        const value = lookup(dict, key) ?? lookup(fallback, key);
        if (!Array.isArray(value)) {
            console.warn(`[i18n] missing list: ${key} (${lang})`);
            return [] as T[];
        }
        return value as T[];
    };
}

/**
 * Build a localized path. The default locale stays at the root (e.g. /teacher-yoga),
 * other locales get a /es/ or /da/ prefix (e.g. /es/teacher-yoga). Pass a path that
 * starts with '/'. Anchors and external URLs are returned untouched.
 */
export function localizedPath(path: string, lang: Lang): string {
    if (!path.startsWith('/')) return path; // anchors, mailto:, https://...
    if (lang === DEFAULT_LOCALE) return path;
    if (path === '/') return `/${lang}/`;
    return `/${lang}${path}`;
}

/** Strip the locale prefix from a pathname so we can build alternate-language URLs. */
export function stripLocale(pathname: string): { lang: Lang; rest: string } {
    const match = pathname.match(/^\/(es|da)(\/|$)/);
    if (match) {
        const lang = match[1] as Lang;
        const rest = pathname.slice(match[0].length - (match[2] === '/' ? 1 : 0));
        return { lang, rest: rest || '/' };
    }
    return { lang: 'en', rest: pathname || '/' };
}

export function localeLabel(lang: Lang): string {
    return LOCALE_LABELS[lang];
}

export function localeFlag(lang: Lang): string {
    return LOCALE_FLAGS[lang];
}

export function htmlLang(lang: Lang): string {
    return LOCALE_HTML_LANG[lang];
}

export function ogLocale(lang: Lang): string {
    return LOCALE_OG[lang];
}
