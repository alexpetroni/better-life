// Romanian copy for worker-sent transactional emails. The worker is a backend
// service (paraglide is the frontend i18n tool), so email strings live here,
// centralized. English is added later, alongside the web app's English.
export const ro = {
  orderConfirmation: {
    subject: (n: string | number) => `Comanda ta Somnium #${n}`,
    heading: 'Comandă confirmată',
    greeting: 'Salut,',
    intro: 'Îți mulțumim pentru comandă! Mai jos găsești detaliile. Vei primi un email când expediem coletul.',
    orderLabel: 'Comanda',
    itemsLabel: 'Produse',
    totalLabel: 'Total',
    footer: 'Acest email este o confirmare a comenzii tale Somnium.',
    brand: 'Somnium',
  },
}
