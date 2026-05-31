import type { Pillar } from '@better-life/contracts'

declare global {
  namespace App {
    interface Locals {
      locale: string
      /** First-touch UTM parsed from the attribution cookie, if any. */
      utm: Record<string, string> | null
    }
    interface PageData {
      nav?: Pillar[]
      locale?: string
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}
