// Better Body screening quiz — a lightweight movement/energy profiler. Same
// shape as the Somnium quiz; the matching LOGIC lives in code at
// apps/web/src/lib/server/quiz/matchers/better-body-movement.ts (same profile keys).
// Content + landing + quiz only — this pillar has no shop, so result CTAs point
// to the Better Body content, never a product.

export const betterBodyMovementQuiz = {
  slug: 'better-body-movement',
  title: 'Ce îți blochează energia?',
  hook: 'Te miști destul, dar tot ești obosit? Cauza nu e mereu cea evidentă. 5 întrebări, 30 de secunde.',
  pillarSlug: 'better-body',
  disclaimer:
    'Acest test are scop educativ și de orientare. Nu este un instrument de diagnostic și nu înlocuiește sfatul unui specialist. Dacă ai dureri sau probleme medicale, discută cu un medic înainte de a schimba nivelul de activitate.',
  resultDisclaimer:
    'Rezultatul este o orientare bazată pe răspunsurile tale, nu un diagnostic. Pentru probleme persistente de energie sau durere, consultă un specialist.',
  questions: [
    {
      key: 'daily_movement',
      text: 'Cât te miști într-o zi obișnuită?',
      type: 'single-select',
      displayVariant: 'card',
      columns: 2,
      options: [
        { value: 'mostly_sitting', label: 'Stau aproape toată ziua' },
        { value: 'light', label: 'Mă mai plimb, dar nimic structurat' },
        { value: 'active', label: 'Mă antrenez regulat' },
        { value: 'very_active', label: 'Mă antrenez intens, aproape zilnic' },
      ],
    },
    {
      key: 'energy_pattern',
      text: 'Cum îți este energia pe parcursul zilei?',
      type: 'single-select',
      displayVariant: 'list',
      options: [
        { value: 'steady', label: 'Constantă, mă țin bine' },
        { value: 'afternoon_crash', label: 'Cad rău după-amiaza' },
        { value: 'low_all_day', label: 'Scăzută aproape tot timpul' },
        { value: 'up_down', label: 'Pe valuri — sus, apoi jos' },
      ],
    },
    {
      key: 'routine',
      text: 'Cât de constantă e rutina ta de mișcare?',
      type: 'single-select',
      displayVariant: 'card',
      columns: 2,
      options: [
        { value: 'none', label: 'Nu am una' },
        { value: 'on_off', label: 'Pornesc în forță, apoi mă opresc' },
        { value: 'mostly_regular', label: 'Destul de constantă' },
        { value: 'very_regular', label: 'Foarte constantă, rar ratez' },
      ],
    },
    {
      key: 'recovery',
      text: 'Cum te odihnești după efort sau o zi grea?',
      type: 'single-select',
      displayVariant: 'list',
      options: [
        { value: 'good_recovery', label: 'Îmi planific odihna și o respect' },
        { value: 'some_rest', label: 'Mă odihnesc cât pot' },
        { value: 'push_through', label: 'Merg mai departe, nu prea mă opresc' },
        { value: 'rarely_rest', label: 'Aproape niciodată — mă simt vinovat când stau' },
      ],
    },
    {
      key: 'fuel',
      text: 'Cum mănânci pentru energie?',
      type: 'single-select',
      displayVariant: 'card',
      columns: 2,
      options: [
        { value: 'balanced_regular', label: 'Echilibrat și la ore regulate' },
        { value: 'mostly_balanced', label: 'În general bine' },
        { value: 'irregular', label: 'Neregulat, cum apuc' },
        { value: 'skip_meals', label: 'Sar peste mese des' },
      ],
    },
  ],
  profiles: [
    {
      key: 'sedentary',
      title: 'Corpul tău stă prea mult',
      description:
        'Ziua ta e construită în jurul statului jos, iar corpul a învățat să funcționeze pe „economic”. Nu e o problemă de voință — e o problemă de doză de mișcare. Vestea bună: nu ai nevoie de antrenamente lungi, ci de mai multă mișcare răspândită în zi.',
      tip: 'Pune-ți un memento la fiecare oră: ridică-te și mișcă-te 2–3 minute. Mișcarea scurtă și frecventă repornește energia mai bine decât o singură ședință lungă.',
      recommendations: [
        {
          title: 'Mișcare „de fundal”',
          body: 'Plimbări scurte după mese, scările în loc de lift, telefoane luate din picioare. Se adună mai mult decât crezi.',
        },
        {
          title: 'Start mic, dar zilnic',
          body: '10–15 minute de mers alert pe zi bat un antrenament intens făcut o dată pe săptămână.',
        },
      ],
      ctaLabel: 'Vezi articolele Better Body',
      ctaHref: '/pillars/better-body',
    },
    {
      key: 'depleted',
      title: 'Rămâi fără combustibil',
      description:
        'Energia ta scade pentru că alimentarea și ritmul nu o susțin. Mese sărite, neregulate sau dezechilibrate creează vârfuri și căderi. Corpul tău cere combustibil constant, nu impulsuri scurte.',
      tip: 'La următoarea masă, adaugă proteine și fibre. Țin energia stabilă ore în șir și previn căderea de după-amiază mai bine decât o cafea în plus.',
      recommendations: [
        {
          title: 'Mese regulate, echilibrate',
          body: 'Nu sări peste mese până ajungi epuizat. Proteine + fibre la fiecare masă pentru energie ca o flacără constantă.',
        },
        {
          title: 'Pârghii fără cofeină',
          body: 'Lumină naturală și o plimbare scurtă după-amiaza repornesc vigilența fără să-ți fure somnul de seară.',
        },
      ],
      ctaLabel: 'Vezi articolele Better Body',
      ctaHref: '/pillars/better-body',
    },
    {
      key: 'overreached',
      title: 'Faci prea mult, prea repede',
      description:
        'Te antrenezi serios, dar recuperarea nu ține pasul. Corpul se întărește în pauze, nu în efort — iar fără ele apar oboseala persistentă, stagnarea și riscul de accidentare. Mai mult efort nu e răspunsul; mai multă recuperare este.',
      tip: 'Planifică zile de odihnă în calendar, la fel de serios ca antrenamentele. Recuperarea programată, nu improvizată, e cea care aduce progresul.',
      recommendations: [
        {
          title: 'Recuperarea ca parte din plan',
          body: 'Zile de odihnă, somn suficient și hidratare. Refacerea e condiția progresului, nu opusul lui.',
        },
        {
          title: 'Ascultă semnele',
          body: 'Oboseală persistentă, somn agitat, iritabilitate — sunt semne de subrecuperare. Răspunsul e mai multă odihnă, nu mai mult efort.',
        },
      ],
      ctaLabel: 'Vezi articolele Better Body',
      ctaHref: '/pillars/better-body',
    },
    {
      key: 'inconsistent',
      title: 'Pornești în forță, apoi te oprești',
      description:
        'Motivația vine în valuri: începi ambițios, apoi viața intervine și totul se oprește. Nu îți lipsește voința — îți lipsește o doză sustenabilă. Progresul vine din ce repeți des, nu din ce faci o dată cu toată forța.',
      tip: 'Alege o doză pe care o poți repeta chiar și într-o zi proastă: 15 minute, nu 90. Leag-o de un obicei pe care îl ai deja, ca să se prindă.',
      recommendations: [
        {
          title: 'Consecvența bate intensitatea',
          body: 'Mai puțin, dar mereu. Numără zilele active, nu performanțele — frecvența construiește obiceiul.',
        },
        {
          title: 'Ancorează mișcarea',
          body: 'Leag-o de ceva existent (după cafea, înainte de duș), ca să nu depindă de motivație.',
        },
      ],
      ctaLabel: 'Vezi articolele Better Body',
      ctaHref: '/pillars/better-body',
    },
  ],
}
