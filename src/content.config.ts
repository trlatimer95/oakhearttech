import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    service: z.string(),
    summary: z.string(),
    problem: z.string(),
    fix: z.string(),
    result: z.string(),
    // Set to false once the case study has real, approved content.
    draft: z.boolean().default(true),
    order: z.number().default(100),
  }),
});

export const collections = { work };
