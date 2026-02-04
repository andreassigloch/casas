# CR-004: Migration auf @sigloch/quality-checkers

**Status:** Open
**Quelle:** BoK Projektinventar-Analyse
**Abhängigkeiten:** CR-002 (_management) muss abgeschlossen sein

## Problem

sesimbrinha-casas nutzt lokale Kopien der Quality-Checker-Scripts:
- `compliance-check.ts` (10.464B - identisch mit sicon)
- `bfsg-agent.ts`

`design-token-lint.ts` und `code-quality-agent.ts` fehlen in diesem Projekt.

## Ziel

Lokale Scripts durch `@sigloch/quality-checkers` Dependency ersetzen. Optional fehlende Checker (design-token-lint, code-quality) aktivieren.

## Scope

1. `@sigloch/quality-checkers` als Dependency installieren
2. Lokale `scripts/compliance-check.ts` durch Import ersetzen
3. Lokale `scripts/bfsg-agent.ts` durch Import ersetzen
4. Git-Hooks (`.githooks/pre-push`) auf neue Imports anpassen
5. npm-Scripts in `package.json` aktualisieren
6. Lokale Script-Dateien entfernen
7. Optional: `design-token-lint` und `code-quality-agent` aktivieren

## Akzeptanzkriterien

- [ ] Keine lokalen Quality-Checker-Scripts mehr in `scripts/`
- [ ] `npm run compliance:dsgvo` funktioniert via Paket
- [ ] `npm run compliance:bfsg` funktioniert via Paket
- [ ] Git-Hook `pre-push` läuft erfolgreich
- [ ] Alle bestehenden Tests grün

## Nicht im Scope

- Änderungen an der Checker-Logik (gehört in CR-002)
- i18n-spezifische Compliance-Regeln (separater CR)
