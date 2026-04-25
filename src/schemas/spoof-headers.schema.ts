import { z } from 'zod';

export const spoofHeadersConfigSchema = z.object({
  enabled: z.boolean().default(true),
  headers: z.record(z.string(), z.string()),
  notes: z.string().optional(),
});

export type SpoofHeadersConfig = z.infer<typeof spoofHeadersConfigSchema>;
export type HeadersRecord = Record<string, string>;
