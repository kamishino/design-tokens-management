import { z } from 'zod';

// 1. Base Token Schema (W3C Design Token Community Group Draft compliant)
export const BaseTokenSchema = z.object({
  $value: z.union([z.string(), z.number()]),
  $type: z.enum(['color', 'typography', 'spacing', 'dimension', 'fontFamily', 'fontWeight']),
  $description: z.string().optional(),
  $extensions: z.record(z.string(), z.any()).optional(), // For custom metadata
});

// 2. Color Token
export const ColorTokenSchema = BaseTokenSchema.extend({
  $type: z.literal('color'),
  $value: z.string().regex(/^#|^rgba|^hsla|^var\(/, "Invalid color format"), // Basic hex/rgb check
});

// 3. Typography Token
export const TypographyTokenSchema = BaseTokenSchema.extend({
  $type: z.literal('typography'),
  $value: z.object({
    fontFamily: z.string(),
    fontSize: z.string(),
    fontWeight: z.union([z.string(), z.number()]),
    lineHeight: z.union([z.string(), z.number()]),
  }),
});

// 4. Token Set Schema (Recursive placeholder, refined in implementation)
export const TokenSetSchema = z.record(z.string(), z.any());
