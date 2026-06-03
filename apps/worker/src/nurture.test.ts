import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMarketingEmail, profileNurtureContent } from './nurture'
import {
  findReengageableLeads,
  hasRecentMarketingEmail,
  isMailable,
  recordMarketingEmail,
} from './db'
import type { NurtureEmailProps } from '@better-life/emails'
import type { Providers } from './providers'
import { query } from './db'

const TEST_DOMAIN = '@nurture.test'

// Minimal providers: only the email channel matters for nurture; the others are
// unused stubs. `sendMarketing` is spied so we can assert exactly one send.
function mockProviders(configured = true) {
  const sent: { to: string; subject: string; props: NurtureEmailProps }[] = []
  const sendMarketing = vi.fn(async (opts: { to: string; subject: string; props: NurtureEmailProps }) => {
    sent.push(opts)
  })
  const stub = { isConfigured: () => configured } as any
  const providers: Providers = {
    oblio: stub,
    anaf: stub,
    sameday: stub,
    email: { isConfigured: () => configured, sendConfirmation: vi.fn(), sendMarketing },
  }
  return { providers, sendMarketing, sent }
}

async function makeLead(opts: {
  local: string
  marketing?: boolean | null // undefined → no consent row; true/false → latest row
  lastSeenDaysAgo?: number
}): Promise<string> {
  const email = opts.local + TEST_DOMAIN
  const lastSeen =
    opts.lastSeenDaysAgo == null ? null : `now() - interval '${opts.lastSeenDaysAgo} days'`
  const id = (
    await query<{ id: string }>(
      `insert into app.leads (email, last_seen_at) values ($1, ${lastSeen ?? 'null'}) returning id`,
      [email]
    )
  )[0].id
  if (opts.marketing != null) {
    await query(
      `insert into app.consent_records (lead_id, purpose, granted, consent_text, consent_version, locale)
       values ($1, 'marketing', $2, 'test', 'test', 'ro')`,
      [id, opts.marketing]
    )
  }
  return id
}

const content = { heading: 'Salut', paragraphs: ['Un rând.'], cta: { label: 'Mergi', path: '/somnium/shop' } }

beforeEach(async () => {
  await query(`delete from app.leads where email like '%${TEST_DOMAIN}'`)
})
afterAll(async () => {
  await query(`delete from app.leads where email like '%${TEST_DOMAIN}'`)
})

describe('marketing-consent gate', () => {
  it('mailable only when the latest marketing consent is granted', async () => {
    const granted = await makeLead({ local: 'granted', marketing: true })
    const none = await makeLead({ local: 'none' }) // no consent row
    const revoked = await makeLead({ local: 'revoked', marketing: true })
    // A later revoke row must win over the earlier grant.
    await query(
      `insert into app.consent_records (lead_id, purpose, granted, consent_text, consent_version, locale)
       values ($1, 'marketing', false, 'unsub', 'test', 'ro')`,
      [revoked]
    )

    expect(await isMailable(granted)).toBe(true)
    expect(await isMailable(none)).toBe(false)
    expect(await isMailable(revoked)).toBe(false)
  })
})

describe('sendMarketingEmail', () => {
  it('sends to a mailable lead, logs it, and builds unsubscribe + cta links', async () => {
    const id = await makeLead({ local: 'send', marketing: true })
    const { providers, sendMarketing, sent } = mockProviders(true)

    const res = await sendMarketingEmail(id, 'nurture_tip', content, providers)

    expect(res).toEqual({ kind: 'nurture_tip', status: 'sent' })
    expect(sendMarketing).toHaveBeenCalledTimes(1)
    expect(sent[0].props.unsubscribeUrl).toContain('/unsubscribe?token=')
    expect(sent[0].props.cta?.url).toContain('/somnium/shop')
    expect(await hasRecentMarketingEmail(id, 1)).toBe(true)
  })

  it('skips (not_mailable) and does not send when consent is absent or revoked', async () => {
    const id = await makeLead({ local: 'noconsent' })
    const { providers, sendMarketing } = mockProviders(true)

    const res = await sendMarketingEmail(id, 'nurture_tip', content, providers)

    expect(res).toEqual({ kind: 'nurture_tip', status: 'skipped', reason: 'not_mailable' })
    expect(sendMarketing).not.toHaveBeenCalled()
    expect(await hasRecentMarketingEmail(id, 1)).toBe(false)
  })

  it('skips (no_credentials) without logging, so it can be retried when configured', async () => {
    const id = await makeLead({ local: 'nokey', marketing: true })
    const { providers, sendMarketing } = mockProviders(false)

    const res = await sendMarketingEmail(id, 'nurture_tip', content, providers)

    expect(res).toEqual({ kind: 'nurture_tip', status: 'skipped', reason: 'no_credentials' })
    expect(sendMarketing).not.toHaveBeenCalled()
    expect(await hasRecentMarketingEmail(id, 1)).toBe(false) // not logged → retryable
  })
})

describe('findReengageableLeads', () => {
  it('selects inactive, consented, not-recently-emailed leads only', async () => {
    const candidate = await makeLead({ local: 'reengage', marketing: true, lastSeenDaysAgo: 40 })
    const active = await makeLead({ local: 'active', marketing: true, lastSeenDaysAgo: 3 })
    const noConsent = await makeLead({ local: 'reengage-noconsent', lastSeenDaysAgo: 40 })
    const recentlyMailed = await makeLead({ local: 'reengage-mailed', marketing: true, lastSeenDaysAgo: 40 })
    await recordMarketingEmail(recentlyMailed, 'nurture_tip') // sent just now → within cooldown

    const ids = (await findReengageableLeads(30)).map((l) => l.id)

    expect(ids).toContain(candidate)
    expect(ids).not.toContain(active)
    expect(ids).not.toContain(noConsent)
    expect(ids).not.toContain(recentlyMailed)
  })
})

describe('profileNurtureContent', () => {
  it('branches the +1d tip on the profile key', () => {
    const hyper = profileNurtureContent('somnium', 'nurture_tip', 'hyperarousal')
    const generic = profileNurtureContent('somnium', 'nurture_tip', null)
    expect(hyper.paragraphs[0]).not.toEqual(generic.paragraphs[0])
    expect(profileNurtureContent('somnium', 'nurture_product', null).cta?.path).toBe('/somnium/shop')
  })

  it('is pillar-aware: Better Body uses body tips + content CTA (no shop)', () => {
    const body = profileNurtureContent('better-body', 'nurture_tip', 'sedentary')
    const sleep = profileNurtureContent('somnium', 'nurture_tip', 'sedentary')
    expect(body.paragraphs[0]).not.toEqual(sleep.paragraphs[0]) // distinct copy per pillar
    expect(profileNurtureContent('better-body', 'nurture_product', null).cta?.path).toBe('/pillars/better-body')
  })

  it('falls back to the somnium sequence for an unknown pillar', () => {
    expect(profileNurtureContent('mystery', 'nurture_product', null).cta?.path).toBe('/somnium/shop')
  })
})
