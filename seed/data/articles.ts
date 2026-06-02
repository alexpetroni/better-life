import { fromText } from '../lib/lexical'

export interface SeedArticle {
  slug: string
  title: string
  excerpt: string
  pillarSlug: string
  author: string
  publishedAt: string // fixed ISO date — deterministic seeds
  profileTags?: string[]
  heroImageUrl?: string
  body: ReturnType<typeof fromText>
  seo?: { metaTitle?: string; metaDescription?: string }
}

// Initial article set. Expanded to 15–20 Somnium articles in build step 10.
// Two pillars are represented so the cross-pillar feed is real.
export const articles: SeedArticle[] = [
  {
    slug: 'ce-se-intampla-in-creier-cand-dormi',
    title: 'Ce se întâmplă în creier când dormi',
    excerpt:
      'Somnul nu e o pauză, ci una dintre cele mai active perioade ale creierului. Iată ce se petrece în fiecare etapă.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-01-12T08:00:00.000Z',
    profileTags: ['hyperarousal', 'conditioned'],
    body: fromText(`Mulți oameni cred că somnul este o oprire — un fel de "off" până dimineața. În realitate, creierul trece prin cicluri intense de activitate, fiecare cu un rol bine definit.

## Cele patru etape ale somnului

Un ciclu de somn durează aproximativ 90 de minute și se repetă de 4–6 ori pe noapte. Trecem prin somn ușor, somn profund și somn REM.

- Somnul ușor: tranziția, când corpul începe să se relaxeze.
- Somnul profund: refacerea fizică, consolidarea sistemului imunitar.
- Somnul REM: visele, procesarea emoțiilor și a memoriei.

## De ce contează fiecare etapă

Somnul profund domină prima parte a nopții, iar REM-ul a doua. De aceea, o trezire la 4 dimineața afectează mai ales REM-ul — partea legată de echilibrul emoțional.

Înțelegerea acestor etape e primul pas către un somn mai bun: nu cantitatea brută de ore contează, ci cât de complet parcurgi ciclurile.`),
    seo: {
      metaTitle: 'Ce se întâmplă în creier când dormi · Somnium',
      metaDescription:
        'Etapele somnului explicate simplu: somn ușor, profund și REM, și de ce contează fiecare pentru sănătatea ta.',
    },
  },
  {
    slug: 'mintea-care-nu-se-opreste-noaptea',
    title: 'Mintea care nu se oprește noaptea',
    excerpt:
      'Gândurile care aleargă la culcare nu sunt o problemă de voință. Sunt un sistem nervos rămas în alertă — și se poate liniști.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-02-03T08:00:00.000Z',
    profileTags: ['hyperarousal'],
    body: fromText(`Te întinzi în pat, stingi lumina și — brusc — mintea pornește. Liste, griji, conversații rederulate. Cu cât încerci mai mult să adormi, cu atât ești mai treaz.

## De ce se întâmplă

Acesta este hiperarousalul: sistemul nervos rămâne în modul "pornit". Efortul de a adormi devine el însuși o sursă de activare.

## Ce poți face diseară

- Notează grijile pe hârtie cu o oră înainte de culcare.
- Dacă nu adormi în 20 de minute, ridică-te și fă ceva plictisitor la lumină slabă.
- Folosește respirația 4–7–8 pentru a coborî nivelul de alertă.

Soluția nu e să te forțezi mai tare, ci să-i dai creierului semnalul că e în siguranță să se oprească.`),
    seo: {
      metaTitle: 'Mintea care nu se oprește noaptea · Somnium',
      metaDescription:
        'Gândurile care aleargă la culcare: ce este hiperarousalul și trei lucruri pe care le poți face în seara asta.',
    },
  },
  {
    slug: 'miscarea-care-imbunatateste-somnul',
    title: 'Mișcarea care îți îmbunătățește somnul',
    excerpt:
      'Nu orice tip de mișcare, la orice oră, ajută somnul. Iată ce spune cercetarea despre momentul și intensitatea potrivite.',
    pillarSlug: 'better-body',
    author: 'Echipa Better Body',
    publishedAt: '2026-02-18T08:00:00.000Z',
    // Cross-pillar bridge: a Better Body article that also serves sleep profiles.
    profileTags: ['sedentary', 'behavioral'],
    body: fromText(`Mișcarea regulată este unul dintre cele mai puternice instrumente pentru un somn mai bun. Dar detaliile contează: ce fel de mișcare, cât de intens și la ce oră.

## Momentul potrivit

Exercițiile intense cu mai puțin de o oră înainte de culcare pot întârzia adormirea, pentru că ridică temperatura corpului și nivelul de activare. Dimineața sau după-amiaza sunt ideale.

## Tipul potrivit

- Cardio moderat: îmbunătățește somnul profund.
- Antrenamentul de forță: ajută recuperarea și calitatea somnului.
- Mișcarea blândă seara (stretching, yoga ușoară): reduce tensiunea fizică.

Corpul și somnul fac parte din același sistem. Când unul se mișcă bine, celălalt se odihnește mai bine.`),
    seo: {
      metaTitle: 'Mișcarea care îți îmbunătățește somnul · Better Body',
      metaDescription:
        'Tipul, intensitatea și momentul mișcării care chiar ajută somnul — pe înțelesul tău.',
    },
  },
  {
    slug: 'recuperarea-nu-e-lene',
    title: 'Recuperarea nu e lene',
    excerpt:
      'Progresul nu se întâmplă în timpul efortului, ci în pauzele dintre eforturi. De ce recuperarea e parte din antrenament.',
    pillarSlug: 'better-body',
    author: 'Echipa Better Body',
    publishedAt: '2026-03-09T08:00:00.000Z',
    // Cross-pillar bridge: recovery for over-reachers + sleep "tension" profile.
    profileTags: ['overreached', 'tension'],
    body: fromText(`Există un mit tenace: că mai mult efort înseamnă întotdeauna rezultate mai bune. În realitate, corpul se adaptează și se întărește în timpul recuperării, nu al efortului.

## Ce înseamnă recuperarea reală

- Somn suficient — acolo are loc cea mai mare parte a refacerii.
- Zile de odihnă planificate, nu improvizate.
- Hidratare și alimentație care susțin refacerea.

## Semnele subrecuperării

Oboseală persistentă, somn agitat, iritabilitate și stagnare. Dacă le recunoști, răspunsul nu e mai mult efort, ci mai multă odihnă.

Recuperarea nu este opusul progresului. Este condiția lui.`),
    seo: {
      metaTitle: 'Recuperarea nu e lene · Better Body',
      metaDescription:
        'De ce recuperarea face parte din antrenament și cum recunoști semnele subrecuperării.',
    },
  },
  {
    slug: 'ce-este-de-fapt-insomnia',
    title: 'Ce este, de fapt, insomnia',
    excerpt:
      'Insomnia nu înseamnă pur și simplu „nu dorm". Este un tipar care se învață — și care se poate dezvăța.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-09-08T08:00:00.000Z',
    profileTags: ['conditioned', 'hyperarousal'],
    body: fromText(`Aproape toți avem nopți proaste. Insomnia începe atunci când nopțile proaste se transformă într-un tipar care se susține singur, chiar și după ce stresul inițial a trecut.

## Trei forme frecvente

- Dificultatea de a adormi seara.
- Trezirile repetate în timpul nopții.
- Trezirea prea devreme, fără să mai poți reveni la somn.

## De ce se autoîntreține

Creierul învață asocieri. Dacă patul devine locul unde te frămânți și aștepți somnul, el ajunge să declanșeze starea de alertă în loc de relaxare. Astfel, problema inițială dispare, dar tiparul rămâne.

Vestea bună este că, exact pentru că este învățat, acest tipar poate fi și dezvățat. Nu prin efort, ci prin reconstruirea relației dintre tine și somn.`),
    seo: {
      metaTitle: 'Ce este, de fapt, insomnia · Somnium',
      metaDescription:
        'Insomnia ca tipar învățat: cele trei forme frecvente și de ce se autoîntreține chiar și după ce stresul a trecut.',
    },
  },
  {
    slug: 'igiena-somnului-ce-conteaza-cu-adevarat',
    title: 'Igiena somnului: ce contează cu adevărat',
    excerpt:
      'Sfaturile despre igiena somnului sunt multe și contradictorii. Iată cele câteva care chiar fac diferența.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-09-22T08:00:00.000Z',
    profileTags: ['behavioral'],
    body: fromText(`Igiena somnului a devenit o listă infinită de reguli. În realitate, doar câteva obiceiuri au un efect consistent, iar restul sunt detalii minore.

## Cele câteva care contează

- Ore de trezire constante, inclusiv în weekend.
- Expunere la lumină naturală în prima parte a zilei.
- Un interval de relaxare înainte de culcare, fără ecrane intense.
- Un dormitor răcoros, întunecat și liniștit.

## Capcana perfecționismului

Paradoxal, dacă transformi igiena somnului într-o listă strictă pe care trebuie să o bifezi perfect, presiunea în sine îți poate strica somnul. Scopul nu este o rutină ireproșabilă, ci câteva ancore pe care le poți susține relaxat, seară după seară.

Alege două sau trei lucruri și fă-le constant. Constanța bate intensitatea.`),
    seo: {
      metaTitle: 'Igiena somnului: ce contează cu adevărat · Somnium',
      metaDescription:
        'Dincolo de lista infinită de reguli, câteva obiceiuri simple fac diferența reală pentru somn.',
    },
  },
  {
    slug: 'ritmul-circadian-ceasul-tau-interior',
    title: 'Ritmul circadian: ceasul tău interior',
    excerpt:
      'Corpul tău are un ceas care nu se uită la oră, ci la lumină. Când îl înțelegi, somnul devine mult mai previzibil.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-10-06T08:00:00.000Z',
    profileTags: ['behavioral'],
    body: fromText(`Fiecare celulă din corp urmează un ritm de aproximativ 24 de ore. Acest ceas intern decide când ești alert, când îți scade energia și când devii somnoros.

## Lumina este dirijorul

Ceasul circadian se reglează în primul rând după lumină. Lumina puternică dimineața îi spune creierului că ziua a început; întunericul seara declanșează producția de melatonină.

## Cum îl susții

- Ieși afară la lumină naturală în prima oră după trezire.
- Diminuează luminile cu una–două ore înainte de culcare.
- Păstrează ore de masă și de mișcare relativ constante.

Când mâncăm, ne mișcăm și ne expunem la lumină haotic, ceasul intern se desincronizează, iar somnul devine fragil. Reglându-l blând, îi redai corpului un ritm pe care se poate baza.`),
    seo: {
      metaTitle: 'Ritmul circadian: ceasul tău interior · Somnium',
      metaDescription:
        'Cum funcționează ceasul circadian, de ce lumina îl dirijează și cum îl poți susține zilnic.',
    },
  },
  {
    slug: 'puiul-de-somn-aliat-sau-sabotor',
    title: 'Puiul de somn: aliat sau sabotor',
    excerpt:
      'Un somn scurt în timpul zilei poate fi o resursă reală — sau exact motivul pentru care nu adormi seara.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-10-20T08:00:00.000Z',
    profileTags: ['behavioral'],
    body: fromText(`Puiul de somn are o reputație împărțită. Pentru unii este o gură de aer; pentru alții, un obicei care sabotează noaptea. Diferența stă în durată și moment.

## Cum tragi un pui de somn bun

- Ține-l scurt: 10–20 de minute sunt suficiente pentru un reset.
- Fă-l devreme în după-amiază, nu spre seară.
- Evită-l complet dacă te lupți cu insomnia.

## De ce contează durata

Un pui de somn scurt te ține în somnul ușor și te trezești limpede. Dacă depășești 30 de minute, intri în somn profund, iar trezirea aduce acea senzație de amețeală și greutate.

Pentru cei care dorm bine noaptea, puiul de somn este un instrument. Pentru cei cu insomnie, el consumă din „presiunea de somn" de care au nevoie seara — și de aceea e mai bine evitat.`),
    seo: {
      metaTitle: 'Puiul de somn: aliat sau sabotor · Somnium',
      metaDescription:
        'Când ajută și când sabotează puiul de somn: durata, momentul și de ce contează presiunea de somn.',
    },
  },
  {
    slug: 'cafeaua-alcoolul-si-somnul',
    title: 'Cafeaua, alcoolul și somnul',
    excerpt:
      'Două dintre cele mai iubite obiceiuri ale noastre îți modelează somnul mai mult decât crezi. Iată cum.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-11-03T08:00:00.000Z',
    profileTags: ['behavioral', 'hyperarousal'],
    body: fromText(`Cafeaua de la prânz și paharul de vin de seara par inofensive. În realitate, amândouă lasă urme în arhitectura somnului din noaptea respectivă.

## Cofeina rămâne mai mult decât crezi

Cofeina are un timp de înjumătățire de aproximativ 5–6 ore. O cafea la ora 16:00 înseamnă că jumătate din ea încă circulă prin corp la culcare, menținând creierul ușor în alertă.

## Alcoolul te adoarme, dar nu te odihnește

- Te ajută să adormi mai repede, da.
- Dar fragmentează somnul în a doua parte a nopții.
- Suprimă somnul REM, esențial pentru echilibrul emoțional.

Nu este vorba despre renunțare totală, ci despre conștientizare. Mută-ți ultima cafea spre prânz și lasă câteva ore între ultimul pahar și somn — corpul îți va mulțumi dimineața.`),
    seo: {
      metaTitle: 'Cafeaua, alcoolul și somnul · Somnium',
      metaDescription:
        'Cum afectează cofeina și alcoolul arhitectura somnului și câteva ajustări simple de orar.',
    },
  },
  {
    slug: 'ecranele-si-lumina-albastra-seara',
    title: 'Ecranele și lumina albastră seara',
    excerpt:
      'Problema cu telefonul înainte de culcare nu este doar lumina lui. Este ce face el cu mintea ta.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-11-17T08:00:00.000Z',
    profileTags: ['hyperarousal', 'behavioral'],
    body: fromText(`Toată lumea vorbește despre lumina albastră a ecranelor. Dar problema reală a telefonului în pat este adesea conținutul, nu doar fotonii.

## Două efecte, nu unul

- Lumina: ecranele luminoase pot întârzia producția de melatonină.
- Activarea mentală: știri, mesaje, scroll nesfârșit — toate țin creierul în alertă.

## Ce poți schimba

Reducerea luminozității și modul „noapte" ajută puțin. Dar cel mai mare câștig vine din a-i da minții o pauză de stimulare cu 30–60 de minute înainte de culcare.

Încearcă să muți telefonul în afara dormitorului și să îl înlocuiești cu ceva liniștitor: o carte pe hârtie, muzică blândă, câteva întinderi. Nu ecranul în sine e dușmanul, ci starea de alertă pe care o întreține exact când ai nevoie de calm.`),
    seo: {
      metaTitle: 'Ecranele și lumina albastră seara · Somnium',
      metaDescription:
        'De ce telefonul în pat strică somnul mai mult prin activarea mentală decât prin lumina albastră.',
    },
  },
  {
    slug: 'somnul-si-stresul-un-cerc-care-se-poate-rupe',
    title: 'Somnul și stresul: un cerc care se poate rupe',
    excerpt:
      'Stresul strică somnul, iar somnul prost amplifică stresul. Vestea bună: cercul poate fi rupt din ambele capete.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-12-01T08:00:00.000Z',
    profileTags: ['hyperarousal', 'tension'],
    body: fromText(`Stresul și somnul sunt prinse într-o buclă. O zi tensionată duce la o noapte agitată, iar o noapte proastă te face mai vulnerabil la stres a doua zi.

## De ce se hrănesc reciproc

Stresul ridică nivelul de cortizol și menține corpul în alertă. Somnul insuficient, la rândul lui, reduce capacitatea creierului de a regla emoțiile, astfel încât totul pare mai amenințător.

## Unde poți interveni

- Coboară activarea seara: respirație lentă, lumină slabă, ritualuri previzibile.
- Lasă grijile pe hârtie, ca să nu le porți în pat.
- Tratează somnul ca pe o prioritate, nu ca pe ce rămâne la final.

Nu trebuie să elimini stresul ca să dormi mai bine. E suficient să întrerupi bucla într-un punct — iar somnul devine adesea cel mai accesibil loc de început.`),
    seo: {
      metaTitle: 'Somnul și stresul: un cerc care se poate rupe · Somnium',
      metaDescription:
        'Cum se alimentează reciproc stresul și somnul prost și unde poți întrerupe bucla.',
    },
  },
  {
    slug: 'cum-iti-amenajezi-dormitorul-pentru-somn',
    title: 'Cum îți amenajezi dormitorul pentru somn',
    excerpt:
      'Mediul în care dormi trimite semnale constante creierului. Câteva ajustări simple îl pot face un aliat.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2025-12-15T08:00:00.000Z',
    profileTags: ['conditioned', 'behavioral'],
    body: fromText(`Dormitorul nu este doar locul unde dormi — este un set de semnale pe care creierul le citește în fiecare seară. Cu cât aceste semnale sunt mai clare, cu atât adormi mai ușor.

## Cei trei piloni ai unui dormitor bun

- Întuneric: chiar și o lumină slabă poate perturba melatonina. Draperii groase sau o mască ajută.
- Răcoare: o temperatură ușor scăzută favorizează somnul profund.
- Liniște: dopuri pentru urechi sau un zgomot constant maschează sunetele bruște.

## Patul ca semnal

Folosește patul doar pentru somn și intimitate. Când lucrezi, mănânci sau te uiți la seriale în pat, creierul învață că acolo e loc de activitate, nu de odihnă.

Nu ai nevoie de un dormitor perfect, ci de unul care spune limpede corpului tău: aici e în siguranță să te oprești.`),
    seo: {
      metaTitle: 'Cum îți amenajezi dormitorul pentru somn · Somnium',
      metaDescription:
        'Întuneric, răcoare, liniște și un pat folosit doar pentru somn: cum devine dormitorul un aliat.',
    },
  },
  {
    slug: 'trezirea-la-3-dimineata',
    title: 'De ce te trezești la 3 dimineața',
    excerpt:
      'Trezirea în miezul nopții e mai normală decât crezi. Ce o transformă într-o problemă este ce faci în acele minute.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-01-05T08:00:00.000Z',
    profileTags: ['hyperarousal', 'conditioned'],
    body: fromText(`Te trezești la 3 dimineața, treaz de-a binelea, și începi să te întrebi de ce. Vestea liniștitoare: trezirile scurte în timpul nopții fac parte din somnul normal.

## Ce e firesc și ce nu

Toți ne trezim de mai multe ori pe noapte, între ciclurile de somn. De obicei nici nu ne amintim. Problema apare când ne trezim complet și începem să ne frământăm.

## Ce să faci când se întâmplă

- Nu te uita la ceas; calculul orelor pierdute crește anxietatea.
- Dacă nu adormi în 15–20 de minute, ridică-te și fă ceva liniștitor la lumină slabă.
- Întoarce-te în pat doar când simți din nou somnolența.

Spirala se naște din panica trezirii, nu din trezirea în sine. Când o tratezi ca pe ceva normal și nu lupți cu ea, ea își pierde puterea.`),
    seo: {
      metaTitle: 'De ce te trezești la 3 dimineața · Somnium',
      metaDescription:
        'Trezirile nocturne sunt normale: cum eviți spirala anxietății și revii la somn fără să te lupți cu el.',
    },
  },
  {
    slug: 'mituri-despre-somn-pe-care-le-credem',
    title: 'Mituri despre somn pe care le credem',
    excerpt:
      'Multe „adevăruri" despre somn sunt de fapt mituri care ne fac mai mult rău. Hai să le clarificăm.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-01-26T08:00:00.000Z',
    profileTags: ['behavioral'],
    body: fromText(`În jurul somnului s-au strâns o mulțime de convingeri repetate atât de des încât par adevărate. Unele dintre ele ne strică, de fapt, somnul.

## Trei mituri frecvente

- „Toți avem nevoie de fix 8 ore." Nevoia variază; unii funcționează bine cu 7, alții cu 9.
- „Dacă nu dorm, trebuie să rămân mai mult în pat." De fapt, statul treaz în pat slăbește legătura dintre pat și somn.
- „O noapte proastă îmi distruge ziua." Corpul compensează surprinzător de bine ocazional.

## De ce contează

Miturile creează presiune. Dacă crezi că o noapte de șapte ore e un eșec, anxietatea care urmează e mai dăunătoare decât cele șaizeci de minute lipsă.

Renunțarea la așteptările rigide e adesea primul pas spre un somn mai relaxat. Somnul prosperă acolo unde dispare presiunea.`),
    seo: {
      metaTitle: 'Mituri despre somn pe care le credem · Somnium',
      metaDescription:
        'Trei mituri frecvente despre somn și de ce așteptările rigide fac adesea mai mult rău decât bine.',
    },
  },
  {
    slug: 'munca-in-ture-si-somnul',
    title: 'Munca în ture și somnul',
    excerpt:
      'Când programul tău se bate cap în cap cu ceasul intern, somnul devine o provocare reală. Iată cum o poți gestiona.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-02-16T08:00:00.000Z',
    profileTags: ['behavioral', 'tension'],
    body: fromText(`Munca în ture cere corpului să fie treaz când ceasul intern vrea să doarmă și să doarmă când lumina spune că e zi. Este una dintre cele mai grele situații pentru somn.

## Strategii care ajută

- Întunecă bine dormitorul ziua, cu draperii opace sau o mască.
- Poartă ochelari de soare pe drumul spre casă dimineața, ca să reduci semnalul de „zi".
- Păstrează un orar de somn cât mai constant, chiar și în zilele libere.

## Protejează somnul ca pe un program

Spune-le celor din jur când dormi și tratează acel interval ca pe o tură de muncă: telefon silențios, ușă închisă, fără întreruperi.

Nu poți păcăli complet ceasul biologic, dar îl poți ajuta să se adapteze. Cu lumină gestionată inteligent și un mediu protejat, somnul de zi devine mult mai odihnitor.`),
    seo: {
      metaTitle: 'Munca în ture și somnul · Somnium',
      metaDescription:
        'Cum gestionezi somnul când lucrezi în ture: lumină, orar constant și un dormitor protejat ziua.',
    },
  },
  {
    slug: 'somnul-pe-masura-ce-imbatranim',
    title: 'Somnul pe măsură ce îmbătrânim',
    excerpt:
      'Somnul se schimbă odată cu vârsta, dar nevoia de odihnă bună rămâne. Ce e normal și ce merită atenție.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-03-16T08:00:00.000Z',
    profileTags: ['conditioned'],
    body: fromText(`Mulți oameni cred că, odată cu vârsta, au nevoie de mai puțin somn. De fapt, nevoia rămâne aproape aceeași; ceea ce se schimbă este modul în care dormim.

## Ce este firesc

- Somnul profund scade treptat, iar somnul devine mai ușor.
- Tindem să adormim și să ne trezim mai devreme.
- Trezirile nocturne devin mai frecvente.

## Ce merită atenție

Oboseala constantă, somnolența excesivă în timpul zilei sau o schimbare bruscă a tiparului nu sunt o parte inevitabilă a îmbătrânirii. Ele merită observate, nu acceptate ca atare.

Vârsta aduce o nouă relație cu somnul, nu sfârșitul lui. Lumina naturală în timpul zilei, mișcarea și un ritm constant rămân la fel de valoroase la 70 de ani ca la 30.`),
    seo: {
      metaTitle: 'Somnul pe măsură ce îmbătrânim · Somnium',
      metaDescription:
        'Cum se schimbă somnul cu vârsta, ce este firesc și ce semne merită observate.',
    },
  },
  {
    slug: 'ritualul-de-seara-care-pregateste-somnul',
    title: 'Ritualul de seară care pregătește somnul',
    excerpt:
      'Somnul bun nu începe în pat, ci cu o oră înainte. Un ritual simplu îi spune creierului că urmează odihna.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-04-06T08:00:00.000Z',
    profileTags: ['conditioned', 'behavioral'],
    body: fromText(`Ne așteptăm să trecem instant de la o zi agitată la somn, ca și cum am apăsa un buton. Creierul însă are nevoie de o rampă de coborâre, nu de o frână bruscă.

## La ce folosește un ritual

Repetate seară de seară, aceleași gesturi devin semnale. Creierul învață că, după ele, urmează somnul — și începe să se relaxeze din timp.

## Un ritual simplu

- Diminuează luminile cu o oră înainte de culcare.
- Alege o activitate liniștitoare: lectură, întinderi ușoare, un ceai cald.
- Pune deoparte ecranele și grijile zilei.

Nu contează ce anume incluzi, ci constanța. Un ritual de zece minute, repetat în fiecare seară, valorează mai mult decât o oră de relaxare făcută din când în când. Previzibilitatea este cea care liniștește.`),
    seo: {
      metaTitle: 'Ritualul de seară care pregătește somnul · Somnium',
      metaDescription:
        'De ce creierul are nevoie de o rampă de coborâre seara și cum construiești un ritual simplu și constant.',
    },
  },
  {
    slug: 'de-cat-somn-ai-nevoie-cu-adevarat',
    title: 'De cât somn ai nevoie cu adevărat',
    excerpt:
      'Numărul magic de ore variază de la om la om. Iată cum afli de cât somn ai nevoie tu, nu media statistică.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-04-27T08:00:00.000Z',
    profileTags: ['behavioral', 'conditioned'],
    body: fromText(`„Opt ore" a devenit o regulă universală. În realitate, nevoia de somn este personală și variază în jurul acestei medii, în funcție de genetică, vârstă și stil de viață.

## Cum îți dai seama

Nu te uita doar la cronometru, ci la cum te simți. Întreabă-te:

- Te trezești în general odihnit, fără alarmă, după câteva zile de orar constant?
- Treci prin după-amiază fără să te prăbușești de oboseală?
- Adormi într-un interval rezonabil, fără să te lupți?

## Cantitate versus calitate

Șapte ore de somn neîntrerupt pot fi mai odihnitoare decât nouă ore fragmentate. Concentrează-te pe a parcurge cicluri complete, nu pe a atinge un număr.

Cel mai bun indicator nu e o cifră, ci felul în care funcționezi ziua. Ascultă acel semnal mai mult decât orice recomandare generală.`),
    seo: {
      metaTitle: 'De cât somn ai nevoie cu adevărat · Somnium',
      metaDescription:
        'Dincolo de regula celor opt ore: cum afli nevoia ta personală de somn după cum te simți ziua.',
    },
  },
  {
    slug: 'respiratia-care-te-ajuta-sa-adormi',
    title: 'Respirația care te ajută să adormi',
    excerpt:
      'Câteva minute de respirație conștientă pot coborî nivelul de alertă și pregăti corpul pentru somn.',
    pillarSlug: 'somnium',
    author: 'Echipa Somnium',
    publishedAt: '2026-05-18T08:00:00.000Z',
    profileTags: ['hyperarousal', 'tension'],
    body: fromText(`Când mintea aleargă și corpul rămâne încordat, respirația este una dintre puținele pârghii pe care le ai la îndemână, oriunde și oricând. Modul în care respiri vorbește direct cu sistemul nervos.

## De ce funcționează

Expirațiile lungi activează sistemul nervos parasimpatic, cel responsabil cu relaxarea. Astfel, ritmul cardiac scade, iar corpul primește semnalul că poate coborî din alertă.

## O tehnică simplă

- Inspiră lent pe nas, numărând până la patru.
- Ține aerul scurt, numărând până la șapte.
- Expiră complet pe gură, numărând până la opt.
- Repetă de câteva ori, fără să forțezi.

Nu te concentra pe a adormi, ci doar pe respirație. Paradoxal, renunțarea la efortul de a adormi este exact ce permite somnului să vină. Respirația lentă îți oferă un loc liniștit unde să aștepți.`),
    seo: {
      metaTitle: 'Respirația care te ajută să adormi · Somnium',
      metaDescription:
        'De ce expirațiile lungi calmează sistemul nervos și o tehnică simplă de respirație pentru seară.',
    },
  },
  {
    slug: 'bazele-unei-alimentatii-care-iti-da-energie',
    title: 'Bazele unei alimentații care îți dă energie',
    excerpt:
      'Energia stabilă pe parcursul zilei ține mai mult de cum mănânci decât de cât. Câteva principii simple.',
    pillarSlug: 'better-body',
    author: 'Echipa Better Body',
    publishedAt: '2025-10-13T08:00:00.000Z',
    profileTags: ['depleted'],
    body: fromText(`Mâncarea nu este doar combustibil; este informația pe baza căreia corpul își reglează energia, dispoziția și concentrarea. Vestea bună e că principiile de bază sunt simple.

## Câteva principii care țin

- Include proteine și fibre la fiecare masă, pentru sațietate stabilă.
- Combină carbohidrații cu grăsimi sau proteine, ca să eviți vârfurile bruște de energie.
- Mănâncă regulat, fără să sari peste mese până ajungi flămând și epuizat.

## Energia este o curbă, nu un vârf

Mesele bogate în zahăr rapid dau un impuls scurt, urmat de o cădere. O farfurie echilibrată întreține energia ca o flacără constantă, nu ca un foc de paie.

Nu ai nevoie de o dietă complicată. Ai nevoie de mese echilibrate, luate cu regularitate, care să-ți susțină corpul în loc să-l zguduie. Restul sunt detalii.`),
    seo: {
      metaTitle: 'Bazele unei alimentații care îți dă energie · Better Body',
      metaDescription:
        'Cum susții energia stabilă pe parcursul zilei prin mese echilibrate și câteva principii simple.',
    },
  },
  {
    slug: 'postura-si-energia-zilnica',
    title: 'Postura și energia zilnică',
    excerpt:
      'Felul în care stai îți afectează respirația, energia și starea de spirit. Mici ajustări, efect mare.',
    pillarSlug: 'better-body',
    author: 'Echipa Better Body',
    publishedAt: '2025-12-08T08:00:00.000Z',
    profileTags: ['sedentary'],
    body: fromText(`Petrecem ore întregi aplecați peste birou sau telefon, fără să observăm. Postura nu ține doar de estetică — ea influențează cât de ușor respiri și câtă energie ai.

## Cum te afectează

Când stai cocoșat, cutia toracică se comprimă, iar respirația devine mai superficială. Mai puțin oxigen înseamnă, în timp, mai puțină energie și mai multă tensiune în gât și umeri.

## Ajustări simple

- Ridică ecranul la nivelul ochilor, ca să nu cobori capul.
- Schimbă-ți poziția des; nicio postură nu e bună ore în șir.
- Fă pauze scurte de mișcare la fiecare oră de stat jos.

Cheia nu este o postură „perfectă" ținută rigid, ci mișcarea. Cel mai sănătos lucru pentru corp e să-ți schimbi poziția regulat și să te ridici des. Corpul a fost făcut să se miște, nu să stea înghețat într-o singură formă.`),
    seo: {
      metaTitle: 'Postura și energia zilnică · Better Body',
      metaDescription:
        'Cum îți afectează postura respirația și energia și ce ajustări simple poți face la birou.',
    },
  },
  {
    slug: 'consecventa-bate-intensitatea',
    title: 'De ce te plafonezi: consecvența bate intensitatea',
    excerpt:
      'Antrenamentele „totul sau nimic" se sting repede. Progresul real vine din ce repeți des, nu din ce faci o dată cu toată forța.',
    pillarSlug: 'better-body',
    author: 'Echipa Better Body',
    publishedAt: '2026-04-06T08:00:00.000Z',
    profileTags: ['inconsistent'],
    body: fromText(`Mulți pornesc în forță: program ambițios, antrenamente lungi, reguli stricte. Două săptămâni mai târziu, motivația scade și totul se oprește. Nu e o problemă de voință — e o problemă de doză.

## Capcana intensității

Când începi prea tare, fiecare ședință cere mult timp și multă energie. E ușor să ratezi una, apoi două, iar pauza devine abandon. Intensitatea mare e fragilă: depinde de zile perfecte.

## Ce funcționează în schimb

- Alege o doză pe care o poți repeta chiar și într-o zi proastă: 15 minute, nu 90.
- Leagă mișcarea de un obicei deja existent (după cafeaua de dimineață, înainte de duș).
- Numără zilele active, nu performanțele. Frecvența construiește identitatea de „om care se mișcă".

## Mai puțin, dar mereu

Un antrenament moderat făcut de patru ori pe săptămână bate, în timp, un antrenament epuizant făcut o dată. Corpul răspunde la repetiție, nu la eroism. Începe mic, păstrează ritmul — și lasă consecvența să facă treaba grea.`),
    seo: {
      metaTitle: 'Consecvența bate intensitatea · Better Body',
      metaDescription:
        'De ce antrenamentele „totul sau nimic" se sting și cum construiești un ritm care rămâne.',
    },
  },
  {
    slug: 'energie-dupa-amiaza-fara-cofeina',
    title: 'Energie după-amiaza, fără încă o cafea',
    excerpt:
      'Căderea de la ora 15:00 nu se rezolvă cu mai multă cofeină. Trei pârghii care chiar funcționează: lumină, mișcare, mâncare.',
    pillarSlug: 'better-body',
    author: 'Echipa Better Body',
    publishedAt: '2026-04-27T08:00:00.000Z',
    // Cross-pillar bridge: afternoon energy ties into evening sleep (Somnium).
    profileTags: ['depleted', 'conditioned'],
    body: fromText(`Pe la mijlocul după-amiezii apare căderea: ochii grei, mintea înceață, mâna care se întinde după încă o cafea. Cofeina târzie ajută pe moment, dar îți fură somnul de seară — și mâine o iei de la capăt, mai obosit.

## De ce cazi la ora 15:00

Este în parte ritmul tău circadian natural, în parte efectul mesei de prânz și al puținei mișcări. Nu e un semn că ai nevoie de mai multă cofeină, ci că ai nevoie de alți stimuli.

## Trei pârghii fără cofeină

- Lumină: ieși 5–10 minute afară sau stai lângă o fereastră. Lumina naturală resetează vigilența.
- Mișcare: o plimbare scurtă sau câteva minute de urcat scările repornesc circulația mai bine decât o cafea.
- Mâncare: un prânz echilibrat (proteine + fibre) evită vârful și căderea de zahăr.

## Lasă seara în pace

Dacă tot ai nevoie de un impuls, oprește cofeina după ora 14:00 — altfel o plătești noaptea. Energia de după-amiază și somnul de seară fac parte din același ritm: când îl respecți, amândouă se îmbunătățesc. (Mai multe despre asta în pilonul Somnium.)`),
    seo: {
      metaTitle: 'Energie după-amiaza, fără încă o cafea · Better Body',
      metaDescription:
        'Cum treci de căderea de după-amiază fără cofeină în plus: lumină, mișcare și mese echilibrate.',
    },
  },
]
