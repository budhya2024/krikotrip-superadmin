import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4000'),
  VITE_NEON_AUTH_URL: z.string().url().default('http://localhost:4000/auth'),
  VITE_IDLE_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(30),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  VITE_NEON_AUTH_URL: import.meta.env.VITE_NEON_AUTH_URL || 'http://localhost:4000/auth',
  VITE_IDLE_TIMEOUT_MINUTES: import.meta.env.VITE_IDLE_TIMEOUT_MINUTES || 30,
})
