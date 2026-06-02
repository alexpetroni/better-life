// Romanian copy for the worker's marketing nurture sequences. Like email-copy.ts
// (transactional), the worker is a backend service so its strings live here,
// centralized, Romanian-only (English i18n is a later phase). Wellness framing
// only — no medical claims.

export const BRAND = 'Somnium'
export const ACCENT = '#4F46E5'

// Profile-matched line for the +1d nurture tip. Keys mirror the somnium-sleep
// quiz profiles; UNKNOWN falls back to the generic line.
const PROFILE_TIPS: Record<string, string> = {
  hyperarousal:
    'Mintea ta pare să rămână „pornită” seara. Încearcă 10 minute de respirație lentă (4 secunde inspir, 6 expir) cu o oră înainte de culcare — semnalează corpului că ziua s-a încheiat.',
  tension:
    'Tensiunea fizică îți întârzie somnul. Un duș cald urmat de o cameră răcoroasă (18–20°C) ajută mușchii să se relaxeze și grăbește adormirea.',
  behavioral:
    'Rutina contează mai mult decât durata. Culcă-te și trezește-te la aceeași oră, inclusiv în weekend — ritmul constant îți reglează ceasul intern.',
  conditioned:
    'Dacă patul a devenit locul în care „te lupți” cu somnul, folosește-l doar pentru somn. Dacă nu adormi în 20 de minute, ridică-te și revino când simți din nou somnul.',
}

export const copy = {
  greeting: 'Salut,',
  unsubscribeLabel: 'Dezabonează-te de la aceste emailuri',
  footer: 'Primești acest email pentru că ți-ai exprimat acordul pentru comunicări Somnium.',

  // ── A. Profile nurture ──────────────────────────────────────────────────--
  nurtureTip: (profileKey: string | null) => ({
    heading: 'Un prim pas pentru un somn mai bun',
    paragraphs: [
      profileKey && PROFILE_TIPS[profileKey]
        ? PROFILE_TIPS[profileKey]
        : 'Cel mai simplu început: o oră de culcare constantă. Corpul tău învață ritmul și adormi mai ușor în câteva zile.',
      'Mâine îți trimitem câteva detalii despre cum se leagă asta de rezultatul tău.',
    ],
  }),
  nurtureProduct: () => ({
    heading: 'Sprijin potrivit profilului tău',
    paragraphs: [
      'Pe baza rezultatului testului tău, am pregătit o selecție de produse Somnium care susțin exact tiparul tău de somn.',
      'Descoperă-le în magazin și alege ce ți se potrivește.',
    ],
    cta: { label: 'Vezi recomandările', path: '/somnium/shop' },
  }),
  nurtureReengage: () => ({
    heading: 'Cum a mers până acum?',
    paragraphs: [
      'Au trecut câteva zile de la testul tău. Schimbările mici, repetate, fac diferența — iar noi suntem aici cu resurse pentru fiecare pas.',
      'Reia testul oricând vrei să-ți actualizezi profilul.',
    ],
    cta: { label: 'Reia testul', path: '/screening' },
  }),

  // ── B. Abandoned cart ───────────────────────────────────────────────────--
  cartRecovery1: () => ({
    heading: 'Ți-a rămas ceva în coș',
    paragraphs: [
      'Ai produse pregătite pentru comandă. Le-am păstrat în coșul tău, ca să poți finaliza când ești gata.',
    ],
    cta: { label: 'Finalizează comanda', path: '/cart' },
  }),
  cartRecovery2: () => ({
    heading: 'Mai ești interesat?',
    paragraphs: [
      'Coșul tău încă te așteaptă. Dacă ai întrebări despre produse sau livrare, scrie-ne — îți răspundem cu plăcere.',
    ],
    cta: { label: 'Revino la coș', path: '/cart' },
  }),

  // ── C. Post-purchase education ──────────────────────────────────────────--
  postPurchaseEducation: (products: string[]) => ({
    heading: 'Cum profiți la maximum de comanda ta',
    paragraphs: [
      products.length
        ? `Comanda ta (${products.join(', ')}) e pe drum. Iată cum să integrezi produsele în rutina ta de seară pentru rezultate constante.`
        : 'Comanda ta e pe drum. Iată cum să integrezi produsele în rutina ta de seară pentru rezultate constante.',
      'Folosește-le la aceeași oră în fiecare seară — consecvența contează mai mult decât intensitatea.',
    ],
    cta: { label: 'Vezi contul tău', path: '/account' },
  }),
  postPurchaseReview: (products: string[]) => ({
    heading: 'Cum ți s-a părut?',
    paragraphs: [
      products.length
        ? `Sperăm că ${products.join(', ')} te ajută să dormi mai bine. Părerea ta ajută alți oameni cu un tipar de somn similar.`
        : 'Sperăm că produsele te ajută să dormi mai bine. Părerea ta ajută alți oameni cu un tipar de somn similar.',
      'Lasă o recenzie — durează un minut.',
    ],
    cta: { label: 'Lasă o recenzie', path: '/account' },
  }),

  // ── D. Re-engagement ────────────────────────────────────────────────────--
  reengagement: () => ({
    heading: 'A trecut ceva timp',
    paragraphs: [
      'Nu ne-am mai auzit de o vreme. Am adăugat resurse noi despre somn și produse care s-ar putea potrivi profilului tău.',
      'Dacă vrei un punct de plecare proaspăt, reia testul.',
    ],
    cta: { label: 'Reia testul', path: '/screening' },
  }),
}
