import { z } from 'zod';

/**
 * 1. Client Profile Schema
 * Metadata specific to a brand/client
 */
export const ClientProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().url().optional(),
  primaryColor: z.string().optional(), // CSS Color string
  description: z.string().optional(),
  website: z.string().url().optional(),
});

/**
 * 2. Project Schema
 * Details about a specific token project/output
 */
export const ProjectSchema = z.object({
  name: z.string(),
  client: z.string(),
  project: z.string(),
  path: z.string(), // Path to variables.css
  files: z.array(z.string()),
  lastBuild: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * 3. Manifest Schema (Main Entry)
 */
export const ManifestSchema = z.object({
  version: z.string(),
  lastUpdated: z.string().datetime(),
  clients: z.record(z.string(), ClientProfileSchema).optional(),
  projects: z.record(z.string(), ProjectSchema),
});

/**
 * 4. Token Overrides Schema
 * Models the dynamic state of the playground
 */
export interface TypographyValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string | number;
}

export type TokenValue = string | number | TypographyValue;

export interface TokenOverrides {
  [tokenName: string]: TokenValue;
}

export type SidebarPanelId = 'explorer' | 'primitives' | 'search' | 'settings';

// Inferred Types for TS usage
export type Manifest = z.infer<typeof ManifestSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ClientProfile = z.infer<typeof ClientProfileSchema>;
