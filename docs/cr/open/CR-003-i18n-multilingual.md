# CR-003: Mehrsprachigkeit (DE/EN/PT/FR)

## Ziel
Automatisierte Mehrsprachigkeit mit deutscher Redaktionssprache und DeepL-Übersetzung.

## Ausgangslage
- CR-002 definiert DE/EN manuell
- Texte hardcoded in Komponenten
- Keine Automatisierung

## Neuer Scope

### Sprachen
| Sprache | URL-Prefix | Status |
|---------|------------|--------|
| Deutsch | `/` (default) | Redaktionssprache |
| Englisch | `/en/` | Auto-übersetzt |
| Portugiesisch | `/pt/` | Auto-übersetzt |
| Französisch | `/fr/` | Auto-übersetzt |

### Architektur
```
src/i18n/
├── de.json          ← Quelltexte (Redaktion)
├── en.json          ← Generiert via DeepL
├── pt.json          ← Generiert via DeepL
├── fr.json          ← Generiert via DeepL
├── glossary.json    ← Nicht übersetzen
└── index.ts         ← t() Helper + Typen
```

### Workflow
1. Redakteur schreibt/ändert Text in `de.json`
2. `npm run translate` → DeepL generiert en/pt/fr.json
3. Commit + Deploy

## Implementierung

### Phase 1: i18n-Grundstruktur ✅
- [x] `src/i18n/de.json` - Deutsche Quelltexte
- [x] `src/i18n/glossary.json` - Nicht übersetzen
- [x] `src/i18n/index.ts` - t() Helper, Typen
- [x] `astro.config.mjs` - i18n Config
- [x] `tsconfig.json` - @i18n/* Alias

### Phase 2: DeepL-Integration ✅
- [x] `scripts/translate.ts` - Übersetzungs-Script
- [x] `.env.example` - DEEPL_API_KEY
- [x] `package.json` - npm run translate, deepl-node dependency

### Phase 3: Komponenten ✅
- [x] `LanguageSwitcher.astro` - DE|EN|PT|FR Buttons
- [x] `BaseLayout.astro` - lang, hreflang Tags
- [x] `Header.astro` - Switcher einbinden

### Phase 4: Content-Migration ⏳
- [ ] Seiten auf t() umstellen (optional, hardcoded DE okay für MVP)
- [ ] DeepL API Key einrichten
- [ ] Initiale Übersetzung ausführen: `npm run translate`

## Abhängigkeiten
```json
"deepl-node": "^1.x"
```

## Voraussetzung
- DeepL API Key (Free Tier: 500k Zeichen/Monat)
- https://www.deepl.com/pro#developer

## Abnahmekriterien
- [ ] `npm run translate` generiert en/pt/fr.json
- [ ] Alle Seiten in 4 Sprachen erreichbar
- [ ] Sprachumschalter funktioniert
- [ ] hreflang Tags für SEO vorhanden
- [ ] Build erfolgreich

## Wiederverwendbarkeit
Pattern dokumentiert für stuff.sesimbrinha.de (~50 Seiten).

## Status
- **Erstellt:** 2024-12-23
- **Status:** In Progress
