/**
 * Site Configuration - sesimbrinha-casas
 * @author andreas@siglochconsulting.de
 *
 * Ferienwohnungen in Sesimbra, Portugal
 * Subdomain: casas.sesimbrinha.de
 */

export const siteConfig = {
  // Site Meta
  name: 'Sesimbrinha Casas',
  title: 'Sesimbrinha - Ferienwohnungen in Sesimbra, Portugal',
  description: 'Drei einzigartige Ferienwohnungen in Sesimbra - vom renovierten Bauernhaus mit Pool bis zur Strandpromenade mit Meerblick.',
  url: 'https://casas.sesimbrinha.de',
  locale: 'de-DE',

  // Contact Information - TODO: Fill with actual data
  contact: {
    name: 'Ana', // Property Manager
    company: 'Sesimbrinha',
    email: 'TODO@sesimbrinha.de',
    phone: '+351 TODO',
    address: {
      street: 'Beco da Fonte Nova 2',
      zip: '2970-776',
      city: 'Sesimbra',
      country: 'Portugal',
    },
  },

  // Social Media
  social: {
    instagram: '', // TODO
  },

  // Theme Colors - Magenta (Brand)
  colors: {
    primary: '#B5176D',
    primaryLight: '#D4459A',
    primaryDark: '#8B1155',
  },

  // Layout
  layout: {
    maxWidth: '1200px',
  },

  // SEO
  seo: {
    defaultOgImage: '/images/og-default.jpg',
  },

  // Geo Location (Sesimbra Center)
  geo: {
    latitude: 38.4437,
    longitude: -9.1020,
  },

  // Features
  features: {
    enableContactForm: true,
    enableBookingLinks: true,
  },

  // Navigation DE
  navigation: {
    de: [
      { label: 'Home', href: '/' },
      { label: 'Apartments', href: '/apartments/' },
      { label: 'Infos', href: '/info/' },
      { label: 'Kontakt', href: '/kontakt/' },
    ],
    en: [
      { label: 'Home', href: '/en/' },
      { label: 'Apartments', href: '/en/apartments/' },
      { label: 'Info', href: '/en/info/' },
      { label: 'Contact', href: '/en/contact/' },
    ],
  },

  // Stuff.sesimbrinha.de Link
  stuffUrl: 'https://stuff.sesimbrinha.de',

  devPort: 4323,
} as const;

// Apartments Data
export const apartments = [
  {
    id: 'casal-regina',
    name: 'Casal Regina',
    slug: { de: 'casal-regina', en: 'casal-regina' },
    type: 'house',
    location: 'Almoinha (Landhaus)',
    address: 'R. Casal Regina 27, 2970-873 Almoinha',
    size: { indoor: 80, outdoor: 5000 },
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    features: ['pool', 'bbq', 'garden', 'parking', 'wheelchair-accessible'],
    geo: { lat: 38.4712, lng: -9.1202 },
    images: [
      { src: '/images/apartments/casal-regina/19.webp', alt: 'Casal Regina - Außenbereich' },
      { src: '/images/apartments/casal-regina/01.webp', alt: 'Casal Regina - Blumenweg zum Haus' },
      { src: '/images/apartments/casal-regina/02.webp', alt: 'Casal Regina - Außenansicht' },
      { src: '/images/apartments/casal-regina/03.webp', alt: 'Casal Regina - Garten' },
      { src: '/images/apartments/casal-regina/04.webp', alt: 'Casal Regina - Terrasse' },
      { src: '/images/apartments/casal-regina/05.webp', alt: 'Casal Regina - Pool' },
      { src: '/images/apartments/casal-regina/06.webp', alt: 'Casal Regina - Wohnbereich' },
      { src: '/images/apartments/casal-regina/07.webp', alt: 'Casal Regina - Küche' },
      { src: '/images/apartments/casal-regina/08.webp', alt: 'Casal Regina - Schlafzimmer 1' },
      { src: '/images/apartments/casal-regina/09.webp', alt: 'Casal Regina - Schlafzimmer 2' },
      { src: '/images/apartments/casal-regina/10.webp', alt: 'Casal Regina - Schlafzimmer 3' },
      { src: '/images/apartments/casal-regina/11.webp', alt: 'Casal Regina - Bad 1' },
      { src: '/images/apartments/casal-regina/12.webp', alt: 'Casal Regina - Bad 2' },
      { src: '/images/apartments/casal-regina/13.webp', alt: 'Casal Regina - Details' },
      { src: '/images/apartments/casal-regina/14.webp', alt: 'Casal Regina - Innenansicht' },
      { src: '/images/apartments/casal-regina/15.webp', alt: 'Casal Regina - Einrichtung' },
      { src: '/images/apartments/casal-regina/16.webp', alt: 'Casal Regina - Ausstattung' },
      { src: '/images/apartments/casal-regina/17.webp', alt: 'Casal Regina - Ambiente' },
      { src: '/images/apartments/casal-regina/18.webp', alt: 'Casal Regina - Ausblick' },
      { src: '/images/apartments/casal-regina/20.webp', alt: 'Casal Regina - Grundstück' },
      { src: '/images/apartments/casal-regina/21.webp', alt: 'Casal Regina - Übersicht' },
    ],
  },
  {
    id: 'teresa',
    name: 'Apartment Teresa',
    slug: { de: 'teresa', en: 'teresa' },
    type: 'apartment',
    location: 'Strandpromenade (unten)',
    address: 'Beco da Fonte Nova 2, 2970-776 Sesimbra',
    size: { indoor: 90, outdoor: 25 },
    guests: 6,
    bedrooms: 2,
    bathrooms: 2,
    features: ['terrace', 'bbq', 'sea-view', 'separate-unit'],
    geo: { lat: 38.4437, lng: -9.1040 },
  },
  {
    id: 'marceana',
    name: 'Apartment Marceana',
    slug: { de: 'marceana', en: 'marceana' },
    type: 'apartment',
    location: 'Strandpromenade (oben)',
    address: 'Beco da Fonte Nova 2, 2970-776 Sesimbra',
    size: { indoor: 60, outdoor: 35 },
    guests: 4,
    bedrooms: 1,
    bathrooms: 1,
    features: ['terrace', 'bbq', 'panorama-view', 'glass-front'],
    geo: { lat: 38.4437, lng: -9.1040 },
  },
] as const;

// House Rules
export const houseRules = {
  deposit: {
    amount: 150,
    currency: 'EUR',
    method: 'cash', // or bank transfer for direct booking
  },
  pets: {
    allowed: true,
    fee: 25,
    requirements: ['vet-stamp', 'vaccinations'],
  },
  smoking: 'outdoor-only',
  checkout: {
    keyReturn: 'on-table',
    cleaning: 'not-required-but-tidy',
  },
  heating: {
    extraCost: true,
    documentedByAna: true,
  },
} as const;

// Organization Schema.org data (for SEO)
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.contact.address.street,
    postalCode: siteConfig.contact.address.zip,
    addressLocality: siteConfig.contact.address.city,
    addressCountry: 'PT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: siteConfig.geo.latitude,
    longitude: siteConfig.geo.longitude,
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Ferienwohnungen',
    itemListElement: apartments.map((apt) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'VacationRental',
        name: apt.name,
        numberOfRooms: apt.bedrooms,
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: apt.guests,
        },
      },
    })),
  },
} as const;

export default siteConfig;
