# CR-002: sesimbrinha-casas MVP

## Ziel
Website für Ferienwohnungsvermietung in Sesimbra, Portugal.
Subdomain: `casas.sesimbrinha.de`

## Scope

### Seiten

| Route | Inhalt | Sprachen |
|-------|--------|----------|
| `/` | Hero, 3 Apartments Preview, Über uns | DE/EN |
| `/apartments/casal-regina/` | Landhaus, 80m², Pool, 6 Gäste | DE/EN |
| `/apartments/teresa/` | Strandpromenade, 90m², Terrasse, 6 Gäste | DE/EN |
| `/apartments/marceana/` | Strandpromenade oben, 60m², Meerblick, 4 Gäste | DE/EN |
| `/info/hausordnung/` | Hausregeln, Deposit, Check-in/out | DE/EN |
| `/info/ausstattung/` | Amenities, WiFi, Küche | DE/EN |
| `/info/anreise/` | Flughafen, Auto, Parkplätze | DE/EN |
| `/info/haustiere/` | Hunde-Policy, €25, Impfungen | DE/EN |
| `/kontakt/` | Buchungsanfrage | DE/EN |
| `/impressum/` | Rechtliches | DE |
| `/datenschutz/` | DSGVO | DE |
| `/404` | Fehlerseite | DE/EN |
| `/version` | Health/Ops | - |

### Design

- **Primary Color:** Magenta (#B5176D)
- **Layout:** Full-width Hero Images, Card Grid für Apartments
- **Responsive:** Mobile-first

### Apartments Daten

#### Casal Regina
- **Lage:** R. Casal Regina 27, Almoinha (Land)
- **Größe:** 80m² Wohnfläche, 5000m² Grundstück
- **Gäste:** bis 6
- **Zimmer:** 3 Schlafzimmer, 2 Bäder (barrierefrei)
- **Features:** Pool, BBQ, Garten, 2 Parkplätze
- **Besonderheit:** Renoviertes Bauernhaus der Urgroßmutter

#### Apartment Teresa
- **Lage:** Beco da Fonte Nova 2, Strandpromenade (unten)
- **Größe:** 90m² innen, 25m² Terrasse
- **Gäste:** bis 6
- **Zimmer:** 2 Schlafzimmer + Schlafsofa, 2 Bäder
- **Features:** BBQ-Terrasse, Meerblick, separater Bereich
- **Besonderheit:** Mini-Apartment mit eigenem Bad

#### Apartment Marceana
- **Lage:** Beco da Fonte Nova 2, Strandpromenade (oben)
- **Größe:** 60m² innen, 35m² Terrasse
- **Gäste:** bis 4
- **Zimmer:** 1 Schlafzimmer + Schlafsofa, 1 Bad
- **Features:** Beste Meeraussicht, Dachterrasse, BBQ
- **Besonderheit:** Panorama-Glasfront

### Info-Seiten Content (aus PDFs)

#### Hausordnung
- Deposit: €150 bar bei Ankunft
- Check-out: Schlüssel auf Tisch, Ana kontaktieren
- Rauchen: Nur draußen
- Reinigung: Nicht nötig, aber ordentlich hinterlassen

#### Ausstattung
- WiFi, Satellit-TV, JBL Speaker
- Waschmaschine, Trockner, Bügeleisen
- Bettwäsche, Handtücher
- Voll ausgestattete Küche
- Grundvorräte (Salz, Pfeffer, Öl)

#### Haustiere
- Hunde erlaubt: €25/Aufenthalt
- Impfung + Tierarzt-Stempel erforderlich
- Leishmaniose-Impfung empfohlen
- Hundeausstattung vorhanden

#### Anreise
- Flughafen Lissabon → Sesimbra: ~40min
- Mietwagen empfohlen
- Parkplätze: Casal Regina 2x, Casa Eugenia öffentlich

### Technisch

- **Framework:** Astro 5.x
- **Port:** 4323
- **i18n:** Astro i18n oder manuelle Routing
- **Schema.org:** VacationRental, LodgingBusiness

### Verlinkung zu stuff.sesimbrinha.de

Auf Apartment-Seiten:
> "Entdecke die Umgebung auf [stuff.sesimbrinha.de](https://stuff.sesimbrinha.de)"

## Content TODO (später zu befüllen)

- [ ] Bilder für alle 3 Apartments (aus App exportieren)
- [ ] Kontaktdaten (Ana, Telefon, E-Mail)
- [ ] Preise / Buchungslinks (Airbnb, Booking)
- [ ] Google Maps Einbettung

## Abnahmekriterien

- [ ] Build erfolgreich (0 Errors)
- [ ] Alle Seiten erreichbar (DE + EN)
- [ ] Mobile responsive
- [ ] Kontaktformular funktioniert
- [ ] Schema.org validiert
- [ ] DSGVO/BFSG Compliance

## Status

- **Erstellt:** 2024-12-10
- **Status:** In Progress
