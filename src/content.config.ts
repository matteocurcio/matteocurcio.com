import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    service: z.enum(["color", "editing", "motion"]),
    client: z.string(),
    year: z.number(),
    excerpt: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    videoUrl: z.string().url().optional(),
    previewVideo: z.string().optional(),
    order: z.number().default(100),

    // Migration helpers (safe to keep for redirects/content parity checks)
    originalUrl: z.string().url().optional(),
    wpId: z.number().int().optional(),
    wpCategoryIds: z.array(z.string()).default([])
  })
});

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(), // ISO date (YYYY-MM-DD)
    excerpt: z.string().default(""),
    cover: z.string().optional(),
    coverAlt: z.string().default(""),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),

    // Migration helpers
    originalUrl: z.string().url().optional()
  })
});

export const collections = { projects, posts };
