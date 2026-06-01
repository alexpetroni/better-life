import type { PageServerLoad } from './$types'
import { listProducts, listCategories } from '$lib/server/medusa'

export const load: PageServerLoad = async ({ url }) => {
  const categoryId = url.searchParams.get('cat') || undefined
  const [products, categories] = await Promise.all([listProducts({ categoryId }), listCategories()])
  return { products, categories, activeCat: categoryId ?? null }
}
