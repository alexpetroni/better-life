// Legal page content (Romanian). Treated as long-form content (RO-first, like
// articles) rather than UI strings; English / CMS management can follow. Each
// page is a list of paragraphs; "## " prefixes a heading.
export const LEGAL_SLUGS = ['terms', 'privacy', 'returns', 'shipping', 'contact', 'anpc'] as const
export type LegalSlug = (typeof LEGAL_SLUGS)[number]

export const legal: Record<LegalSlug, string[]> = {
  terms: [
    'Acești termeni guvernează utilizarea site-ului și achizițiile din magazinul Somnium, operat de Zenyth.',
    '## Comenzi și prețuri',
    'Prețurile sunt afișate în lei (RON) și includ TVA. Ne rezervăm dreptul de a corecta erori evidente de preț înainte de expediere.',
    '## Răspundere',
    'Conținutul educativ de pe site nu reprezintă sfat medical. Pentru probleme de sănătate, consultă un specialist.',
    'Pentru întrebări legate de comenzi, scrie-ne la contact@betterlife.ro.',
  ],
  privacy: [
    'Confidențialitatea ta este importantă. Această politică explică ce date colectăm și cum le folosim, conform GDPR.',
    '## Ce date colectăm',
    'Adresa de email (când o oferi), răspunsurile la testul de screening (date sensibile, tratate ca atare), datele de comandă și livrare, și etichete de comportament pentru recomandări.',
    '## Consimțământ',
    'Cererem consimțământ separat pentru livrarea rezultatelor și pentru marketing. Îți poți retrage consimțământul oricând.',
    '## Drepturile tale',
    'Ai dreptul de acces, rectificare și ștergere. Ștergerea unui profil elimină și răspunsurile la test și înregistrările de consimțământ. Scrie-ne la contact@betterlife.ro.',
  ],
  returns: [
    'Ai dreptul să returnezi produsele în termen de 14 zile de la primire, conform legislației în vigoare.',
    '## Cum returnezi',
    'Anunță-ne la contact@betterlife.ro, apoi expediază produsul în starea originală. Rambursarea se face în termen de 14 zile de la primirea returului.',
    '## Excepții',
    'Produsele sigilate din motive de igienă, desigilate după livrare, nu pot fi returnate.',
  ],
  shipping: [
    'Livrăm în toată România prin curier (Sameday).',
    '## Costuri și termene',
    'Tariful standard este afișat la finalizarea comenzii. Livrarea durează de obicei 1–3 zile lucrătoare.',
    'Vei primi numărul AWB pe email când coletul este expediat.',
  ],
  contact: [
    'Suntem aici pentru orice întrebare.',
    '## Date de contact',
    'Email: contact@betterlife.ro',
    'Operator: Zenyth. Pentru solicitări privind datele personale, folosește același email.',
  ],
  anpc: [
    'Conform legislației, îți punem la dispoziție mijloacele de soluționare a litigiilor.',
    '## ANPC',
    'Autoritatea Națională pentru Protecția Consumatorilor: anpc.ro',
    '## Soluționarea online a litigiilor (SOL)',
    'Platforma SOL a Comisiei Europene: ec.europa.eu/consumers/odr',
  ],
}
