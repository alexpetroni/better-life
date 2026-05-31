// Somnium screening quiz — migrated from the lightweight better-sleep v7
// "what keeps you awake" profile matcher, translated to Romanian and extended
// with per-profile recommendations. The matching LOGIC lives in code at
// apps/web/src/lib/server/quiz/matchers/somnium-sleep.ts (same profile keys).

export const somniumSleepQuiz = {
  slug: 'somnium-sleep',
  title: 'Ce te ține treaz?',
  hook: 'Nu adormi ușor? Cauza nu e mereu cea evidentă. 5 întrebări, 30 de secunde.',
  pillarSlug: 'somnium',
  disclaimer:
    'Acest test are scop educativ și de orientare. Nu este un instrument de diagnostic și nu înlocuiește consultul unui medic. Dacă ai probleme persistente de somn, discută cu un specialist.',
  resultDisclaimer:
    'Rezultatul este o orientare bazată pe răspunsurile tale, nu un diagnostic medical. Pentru probleme persistente, consultă un medic.',
  questions: [
    {
      key: 'time_to_sleep',
      text: 'Cât îți ia de obicei să adormi?',
      type: 'single-select',
      displayVariant: 'card',
      columns: 2,
      options: [
        { value: 'under_15', label: 'Sub 15 minute' },
        { value: '15_30', label: '15–30 de minute' },
        { value: '30_60', label: '30–60 de minute' },
        { value: 'over_60', label: 'Peste o oră' },
      ],
    },
    {
      key: 'bedtime_mind',
      text: 'Ce se întâmplă când închizi ochii?',
      type: 'single-select',
      displayVariant: 'list',
      options: [
        { value: 'blank', label: 'Mintea mi se liniștește' },
        { value: 'replay', label: 'Rederulez ziua sau planific mâine' },
        { value: 'racing', label: 'Gânduri pe care nu le pot opri' },
        { value: 'anxious', label: 'Grijă sau teamă că nu voi adormi' },
      ],
    },
    {
      key: 'body_at_bedtime',
      text: 'Cum se simte corpul tău în pat?',
      type: 'single-select',
      displayVariant: 'card',
      columns: 2,
      options: [
        { value: 'relaxed', label: 'Relaxat și confortabil' },
        { value: 'tense', label: 'Încordat — maxilar, umeri sau spate' },
        { value: 'restless', label: 'Agitat, simt nevoia să mișc picioarele' },
        { value: 'wired', label: 'Obosit fizic, dar „pe baterii”' },
      ],
    },
    {
      key: 'screen_before_bed',
      text: 'Ultimul lucru pe care îl faci înainte de somn?',
      type: 'single-select',
      displayVariant: 'card',
      columns: 2,
      options: [
        { value: 'phone', label: 'Stau pe telefon' },
        { value: 'tv', label: 'Mă uit la TV / streaming' },
        { value: 'read', label: 'Citesc o carte' },
        { value: 'nothing', label: 'Sting lumina și încerc să dorm' },
      ],
    },
    {
      key: 'sleep_worry',
      text: 'Cât de des îți faci griji că nu vei dormi bine?',
      type: 'single-select',
      displayVariant: 'list',
      options: [
        { value: 'never', label: 'Nu mă gândesc la asta' },
        { value: 'sometimes', label: 'În unele nopți' },
        { value: 'most', label: 'În majoritatea nopților' },
        { value: 'always', label: 'În fiecare noapte — e un cerc vicios' },
      ],
    },
  ],
  profiles: [
    {
      key: 'hyperarousal',
      title: 'Mintea ta nu te lasă să dormi',
      description:
        'Creierul tău rămâne în stare de alertă la culcare. Gândurile care aleargă și anxietatea de somn se hrănesc reciproc — cu cât încerci mai tare să adormi, cu atât ești mai treaz. Nu e o problemă de disciplină, ci un sistem nervos care rămâne „pornit” când ar trebui să se liniștească.',
      tip: 'Când gândurile încep să alerge, ridică-te din pat. Stai 10 minute într-un loc slab luminat și plictisitor, apoi revino. Asta rupe legătura pat–anxietate pe care creierul a construit-o.',
      recommendations: [
        {
          title: 'Fereastra de oprire a gândurilor',
          body: 'Cu 1–2 ore înainte de culcare, notează pe hârtie grijile și sarcinile de mâine. Le „predai” paginii, ca mintea să nu mai aibă nevoie să le țină.',
        },
        {
          title: 'Respirație 4–7–8',
          body: 'Inspiră 4 secunde, ține 7, expiră 8. Câteva cicluri activează sistemul nervos parasimpatic și scad nivelul de alertă.',
        },
      ],
      ctaLabel: 'Vezi cum funcționează Somnium',
      ctaHref: '/somnium',
    },
    {
      key: 'tension',
      title: 'Corpul tău încă duce stresul zilei',
      description:
        'Mușchii, maxilarul sau sistemul tău nervos încă poartă tensiunea zilei. Chiar și când mintea e calmă, corpul rămâne activat. Această tensiune fizică te ține într-o stare de somn ușor, în loc să te lase să cobori în odihnă profundă.',
      tip: 'Încearcă relaxarea musculară progresivă: încordează fiecare grup de mușchi 5 secunde, apoi eliberează. Pornește de la tălpi spre cap. Scade direct activarea fizică ce te ține treaz.',
      recommendations: [
        {
          title: 'Coborârea temperaturii',
          body: 'Un duș cald cu 60–90 de minute înainte de culcare ajută corpul să se răcească după, semnalând că e timpul de somn.',
        },
        {
          title: 'Eliberarea maxilarului și a umerilor',
          body: 'Înainte de culcare, relaxează conștient maxilarul și coboară umerii. Tensiunea cronică se ascunde adesea acolo.',
        },
      ],
      ctaLabel: 'Vezi cum funcționează Somnium',
      ctaHref: '/somnium',
    },
    {
      key: 'behavioral',
      title: 'Rutina de seară îți sabotează somnul',
      description:
        'Corpul tău ar putea dormi — obiceiurile stau în cale. Timpul pe ecran, lipsa unei relaxări treptate și conținutul stimulant îți țin creierul angajat exact până în clipa în care aștepți să se oprească. Distanța dintre „pornit” și „somn” e prea scurtă.',
      tip: 'Pune o alarmă cu 45 de minute înainte de culcare. Când sună, lasă telefonul la încărcat în altă cameră. Această singură schimbare influențează tot ce urmează.',
      recommendations: [
        {
          title: 'Pista de aterizare fără ecrane',
          body: 'Ultimele 45 de minute fără ecrane luminoase. Lumină caldă și o activitate liniștită îi dau creierului semnalul de încetinire.',
        },
        {
          title: 'Oră de trezire constantă',
          body: 'Trezește-te la aceeași oră, inclusiv în weekend. Ancorează ritmul circadian mai puternic decât ora de culcare.',
        },
      ],
      ctaLabel: 'Vezi cum funcționează Somnium',
      ctaHref: '/somnium',
    },
    {
      key: 'conditioned',
      title: 'Ți-ai antrenat creierul să se teamă de culcare',
      description:
        'Ai avut destule nopți proaste încât creierul tratează acum culcarea ca pe o amenințare. În clipa în care te întinzi, apare anxietatea că nu vei dormi — ceea ce aproape garantează că nu vei dormi. Se numește insomnie condiționată și este foarte des întâlnită.',
      tip: 'Du-te la culcare doar când ești cu adevărat somnoros — nu pentru că „e ora”. Dacă nu adormi în 20 de minute, ridică-te. Reconstruirea asocierii pat–somn este cea mai eficientă soluție pentru acest tipar.',
      recommendations: [
        {
          title: 'Controlul stimulului',
          body: 'Patul e doar pentru somn. Fără telefon, fără lucru, fără griji în pat — îi reînveți creierului că patul înseamnă somn.',
        },
        {
          title: 'Restricția blândă a somnului',
          body: 'Comprimă temporar timpul petrecut în pat pentru a crește presiunea de somn, apoi extinde-l treptat pe măsură ce somnul se consolidează.',
        },
      ],
      ctaLabel: 'Vezi cum funcționează Somnium',
      ctaHref: '/somnium',
    },
  ],
}
