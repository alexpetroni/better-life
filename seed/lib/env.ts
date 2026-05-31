// Seeding is environment-aware: a rich demo seed for dev/staging, a minimal seed
// for production (which at least populates the pillar config).
export type SeedEnv = 'demo' | 'minimal'

export function getSeedEnv(): SeedEnv {
  const explicit = process.env.SEED_ENV?.toLowerCase()
  if (explicit === 'minimal' || explicit === 'demo') return explicit
  return process.env.NODE_ENV === 'production' ? 'minimal' : 'demo'
}
