import { fromText } from '../lib/lexical'

// Narrative pages for the Better Life portal. CMS-authored (editable without a
// deploy); seeded here so the demo has the story out of the box. Calm,
// no-overclaim voice — wellness, not medical promises.

export interface SeedPage {
  slug: string
  title: string
  body: ReturnType<typeof fromText>
  seo?: { metaTitle?: string; metaDescription?: string }
}

export const pages: SeedPage[] = [
  {
    slug: 'about',
    title: 'Despre Better Life',
    body: fromText(`Better Life by Zenyth este o platformă de wellness construită pe piloni — domenii ale vieții care contează cu adevărat pentru starea ta de bine: somnul, corpul, mintea și obiceiurile.

## Cum gândim

Pornim de la somn, prin Somnium, și creștem pas cu pas. Fiecare pilon aduce conținut bazat pe dovezi, un test scurt de screening care îți arată tiparul tău și recomandări concrete pe care le poți aplica chiar azi.

## De ce piloni

Viața nu se împarte în categorii separate — somnul îți afectează energia, mișcarea îți afectează somnul. De aceea pilonii se leagă între ei: un singur profil al tău, o singură poveste, mai multe unghiuri.

Nu vindem soluții miracol. Oferim claritate și pași mici, repetabili, care chiar fac diferența în timp.`),
    seo: {
      metaTitle: 'Despre Better Life',
      metaDescription:
        'Better Life by Zenyth — wellness construit pe piloni: somn, corp, minte. Conținut bazat pe dovezi și pași concreți.',
    },
  },
  {
    slug: 'mission',
    title: 'Misiunea noastră',
    body: fromText(`Credem că o viață mai bună nu vine din transformări dramatice, ci din înțelegere și din pași mici, repetați.

## Ce ne propunem

Să facem știința stării de bine accesibilă: pe înțelesul tău, fără jargon și fără promisiuni exagerate. Vrem să-ți dăm instrumente cu care să te înțelegi mai bine și să te schimbi în ritmul tău.

## Cum măsurăm succesul

Nu prin cât timp petreci pe platformă, ci prin cât de util îți este ce iei de aici. Un singur obicei schimbat în bine contează mai mult decât o sută de articole citite.`),
    seo: {
      metaTitle: 'Misiunea Better Life',
      metaDescription:
        'Facem știința stării de bine accesibilă — pași mici, repetați, fără promisiuni exagerate.',
    },
  },
  {
    slug: 'philosophy',
    title: 'Filozofia noastră',
    body: fromText(`Câteva principii ne ghidează în tot ce construim.

## Dovezi, nu modă

Recomandăm doar ce are bază în cercetare și o spunem pe înțelesul tău. Când ceva nu e clar sau dovezile sunt slabe, o spunem deschis.

## Consecvența bate intensitatea

Schimbările mici, susținute, conduc la rezultate reale. Preferăm un pas pe care îl poți repeta în locul unui plan perfect pe care îl abandonezi.

## Respect pentru datele tale

Îți cerem doar ce e necesar și folosim datele doar în scopurile pe care le-ai aprobat. Te poți dezabona oricând.

## Fără promisiuni medicale

Oferim informații educative despre stil de viață. Nu înlocuim consultul unui specialist — iar când ai o problemă persistentă, te încurajăm să-l cauți.`),
    seo: {
      metaTitle: 'Filozofia Better Life',
      metaDescription:
        'Principiile Better Life: dovezi pe înțelesul tău, consecvență, respect pentru date, fără promisiuni medicale.',
    },
  },
]
