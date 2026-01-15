/**
 * Astro Content Collections Config
 * @author andreas@siglochconsulting.de
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const apartments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apartments' }),
  schema: z.object({
    apartmentId: z.string(),
    locale: z.enum(['de', 'en', 'pt', 'fr']),
    highlight: z.string(),
  }),
});

export const collections = { apartments };
