import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createServiceZonesWorkflow,
} from '@medusajs/medusa/core-flows'
import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import fs from 'fs'
import path from 'path'

// Persist the publishable key into the repo-root .env so the storefront BFF picks
// it up with no manual step (clean clone: migrate → seed → run).
function writePublishableKey(token: string) {
  const envPath = path.resolve(process.cwd(), '../../.env')
  try {
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
    if (/^MEDUSA_PUBLISHABLE_KEY=.*/m.test(env)) {
      env = env.replace(/^MEDUSA_PUBLISHABLE_KEY=.*/m, `MEDUSA_PUBLISHABLE_KEY=${token}`)
    } else {
      env += `\nMEDUSA_PUBLISHABLE_KEY=${token}\n`
    }
    fs.writeFileSync(envPath, env)
    return true
  } catch {
    return false
  }
}

// Idempotent demo catalog for Somnium (RON). Re-runs reuse existing records,
// keyed on stable handles/names — products enter via this seed, never duplicated.
export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)

  logger.info('▶ Seeding Somnium demo catalog (RON)…')

  // ── Sales channel ──────────────────────────────────────────────────────────
  let [salesChannel] = await salesChannelModule.listSalesChannels({ name: 'Somnium' })
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: 'Somnium' }] },
    })
    salesChannel = result[0]
    logger.info('  ＋ sales channel: Somnium')
  }

  // ── Region (Romania, RON) ────────────────────────────────────────────────--
  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name'],
    filters: { name: 'România' } as any,
  })
  let regionId = regions[0]?.id
  if (!regionId) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          { name: 'România', currency_code: 'ron', countries: ['ro'], payment_providers: ['pp_system_default'] },
        ],
      },
    })
    regionId = result[0].id
    logger.info('  ＋ region: România (RON)')
  }

  // ── Publishable API key (storefront) ─────────────────────────────────────--
  const { data: existingKeys } = await query.graph({
    entity: 'api_key',
    fields: ['id', 'token', 'title', 'type'],
    filters: { title: 'Somnium storefront' } as any,
  })
  let publishableKey = existingKeys[0]
  if (!publishableKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: { api_keys: [{ title: 'Somnium storefront', type: 'publishable', created_by: 'seed' }] },
    })
    publishableKey = result[0]
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: publishableKey.id, add: [salesChannel.id] },
    })
    logger.info('  ＋ publishable key created — set MEDUSA_PUBLISHABLE_KEY in .env')
  }
  const wrote = writePublishableKey(publishableKey.token)
  logger.info(
    wrote
      ? `  ✔ MEDUSA_PUBLISHABLE_KEY written to .env (${publishableKey.token.slice(0, 12)}…)`
      : `  ℹ MEDUSA_PUBLISHABLE_KEY=${publishableKey.token} (set this in .env)`
  )

  // ── Stock location + fulfillment ───────────────────────────────────────────
  const { data: locations } = await query.graph({
    entity: 'stock_location',
    fields: ['id', 'name'],
    filters: { name: 'Depozit București' } as any,
  })
  let stockLocationId = locations[0]?.id
  if (!stockLocationId) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: { locations: [{ name: 'Depozit București', address: { city: 'București', country_code: 'ro', address_1: 'Str. Exemplu 1' } }] },
    })
    stockLocationId = result[0].id
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocationId, add: [salesChannel.id] },
    })

    // manual fulfillment provider + shipping profile + zone + option
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' },
    })

    let [shippingProfile] = await fulfillmentModule.listShippingProfiles({ type: 'default' })
    if (!shippingProfile) {
      const { result: sp } = await createShippingProfilesWorkflow(container).run({
        input: { data: [{ name: 'Default', type: 'default' }] },
      })
      shippingProfile = sp[0]
    }

    const fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: 'Livrare România',
      type: 'shipping',
      service_zones: [{ name: 'România', geo_zones: [{ country_code: 'ro', type: 'country' }] }],
    })
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: 'Curier standard (Sameday)',
          price_type: 'flat',
          provider_id: 'manual_manual',
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: { label: 'Standard', description: 'Livrare în 1–3 zile', code: 'standard' },
          prices: [{ currency_code: 'ron', amount: 19.9 }, { region_id: regionId, amount: 19.9 }],
          rules: [
            { attribute: 'enabled_in_store', value: 'true', operator: 'eq' },
            { attribute: 'is_return', value: 'false', operator: 'eq' },
          ],
        },
      ],
    })
    logger.info('  ＋ stock location + manual fulfillment + standard shipping (RON 19.90)')
  }

  // ── Categories (organized by problem solved) ──────────────────────────────--
  const categoryNames = ['Greu de adormit', 'Treziri nocturne', 'Somn neodihnitor', 'Ritm dat peste cap']
  const { data: existingCats } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'name'],
  })
  const catByName = new Map(existingCats.map((c: any) => [c.name, c.id]))
  const toCreate = categoryNames.filter((n) => !catByName.has(n))
  if (toCreate.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: toCreate.map((name) => ({ name, is_active: true })) },
    })
    result.forEach((c: any) => catByName.set(c.name, c.id))
    logger.info(`  ＋ categories: ${toCreate.join(', ')}`)
  }

  // ── Products (Somnium demo SKUs, pillar-tagged) ───────────────────────────--
  // Prices are in RON major units (Medusa v2 stores decimal amounts, not bani).
  const products = [
    { title: 'Supliment Somneo — melatonină & plante', handle: 'somneo-supliment', category: 'Greu de adormit', price: 79, desc: 'Formulă cu melatonină și plante calmante, pentru o adormire mai ușoară.' },
    { title: 'Mască de somn premium', handle: 'masca-de-somn', category: 'Somn neodihnitor', price: 49, desc: 'Întuneric total, materiale moi — pentru un somn mai profund.' },
    { title: 'Ceai de seară — relaxare', handle: 'ceai-de-seara', category: 'Greu de adormit', price: 35, desc: 'Amestec de plante pentru ritualul de seară, fără cofeină.' },
    { title: 'Dopuri de urechi pentru somn', handle: 'dopuri-urechi', category: 'Treziri nocturne', price: 29, desc: 'Reduc zgomotul nocturn fără disconfort.' },
    { title: 'Lampă de trezire — răsărit simulat', handle: 'lampa-trezire', category: 'Ritm dat peste cap', price: 199, desc: 'Simulează răsăritul pentru o trezire mai naturală și un ritm circadian stabil.' },
    { title: 'Magneziu glicinat — somn & relaxare', handle: 'magneziu-glicinat', category: 'Somn neodihnitor', price: 59, desc: 'Magneziu ușor asimilabil, pentru relaxare musculară și nervoasă.' },
  ]
  const { data: existingProducts } = await query.graph({ entity: 'product', fields: ['id', 'handle'] })
  const existingHandles = new Set(existingProducts.map((p: any) => p.handle))
  const newProducts = products.filter((p) => !existingHandles.has(p.handle))

  if (newProducts.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: newProducts.map((p) => ({
          title: p.title,
          handle: p.handle,
          description: p.desc,
          status: 'published' as any,
          category_ids: catByName.get(p.category) ? [catByName.get(p.category) as string] : [],
          sales_channels: [{ id: salesChannel.id }],
          shipping_profile_id: undefined,
          metadata: { pillar: 'somnium' },
          options: [{ title: 'Variantă', values: ['Standard'] }],
          variants: [
            {
              title: 'Standard',
              sku: p.handle.toUpperCase().replace(/-/g, '_'),
              manage_inventory: true,
              prices: [{ amount: p.price, currency_code: 'ron' }],
              options: { Variantă: 'Standard' },
            },
          ],
        })),
      },
    })
    logger.info(`  ＋ products: ${newProducts.map((p) => p.handle).join(', ')}`)

    // Inventory levels at the stock location
    const { data: variants } = await query.graph({
      entity: 'product_variant',
      fields: ['id', 'inventory_items.inventory_item_id'],
    })
    const levels: any[] = []
    for (const v of variants as any[]) {
      for (const ii of v.inventory_items ?? []) {
        levels.push({ inventory_item_id: ii.inventory_item_id, location_id: stockLocationId, stocked_quantity: 100 })
      }
    }
    if (levels.length) {
      await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } }).catch(() => {})
    }
  }

  logger.info('✔ Catalog seed complete')
}
