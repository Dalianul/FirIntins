/**
 * CMS Seed Script — FirIntins
 *
 * Creează tot conținutul inițial: categorii blog, FAQ, testimoniale,
 * pagini legale, setări site, navigație, footer și homepage.
 *
 * Rulează: pnpm --filter storefront seed:cms
 */

import { getPayload } from 'payload'
import config from '../payload.config.ts'

// ─── Lexical JSON helpers ─────────────────────────────────────────────────────

type LexNode = Record<string, unknown>

const ltext = (text: string, bold = false): LexNode => ({
  type: 'text',
  text,
  version: 1,
  ...(bold ? { format: 1 } : { format: 0 }),
})

const lpara = (...children: LexNode[]): LexNode => ({
  type: 'paragraph',
  version: 1,
  children: children.length ? children : [ltext('')],
  direction: 'ltr',
  format: '',
  indent: 0,
})

const lheading = (text: string, tag: 'h2' | 'h3' = 'h2'): LexNode => ({
  type: 'heading',
  tag,
  version: 1,
  children: [ltext(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
})

const lbullet = (items: string[]): LexNode => ({
  type: 'list',
  listType: 'bullet',
  version: 1,
  start: 1,
  tag: 'ul',
  direction: 'ltr',
  format: '',
  indent: 0,
  children: items.map((item, i) => ({
    type: 'listitem',
    version: 1,
    value: i + 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [ltext(item)],
  })),
})

const ldoc = (...children: LexNode[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children,
  },
})

// Shorthand: single paragraph richtext
const lsimple = (text: string) => ldoc(lpara(ltext(text)))

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function tryCreate<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const result = await fn()
    console.log(`  ✓ ${label}`)
    return result
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    // Payload v3 reports unique constraint violations as "field is invalid: slug"
    const isConflict =
      msg.includes('duplicate') ||
      msg.includes('unique') ||
      msg.includes('already exists') ||
      msg.includes('field is invalid')
    if (isConflict) {
      console.log(`  ~ ${label} (already exists, skipping)`)
    } else {
      console.warn(`  ✗ ${label}: ${msg}`)
    }
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 FirIntins CMS Seed\n')
  const payload = await getPayload({ config })

  // ── 1. Blog Categories ──────────────────────────────────────────────────────
  console.log('📂 Categorii blog...')

  const catGhiduri = await tryCreate('Ghiduri de pescuit', () =>
    payload.create({ collection: 'categories', data: { name: 'Ghiduri de pescuit', slug: 'ghiduri' } }),
  )
  const catTehnici = await tryCreate('Tehnici și metode', () =>
    payload.create({ collection: 'categories', data: { name: 'Tehnici și metode', slug: 'tehnici' } }),
  )
  const catEchipamente = await tryCreate('Echipamente și recenzii', () =>
    payload.create({ collection: 'categories', data: { name: 'Echipamente și recenzii', slug: 'echipamente' } }),
  )
  const catNoutati = await tryCreate('Noutăți', () =>
    payload.create({ collection: 'categories', data: { name: 'Noutăți', slug: 'noutati' } }),
  )
  const catMomeli = await tryCreate('Momeli și nădă', () =>
    payload.create({ collection: 'categories', data: { name: 'Momeli și nădă', slug: 'momeli' } }),
  )

  void catGhiduri; void catTehnici; void catEchipamente; void catNoutati; void catMomeli

  // ── 2. FAQs ─────────────────────────────────────────────────────────────────
  console.log('\n❓ Întrebări frecvente...')

  const faqData = [
    {
      question: 'Cât durează livrarea?',
      category: 'shipping' as const,
      answer: ldoc(
        lpara(ltext('Livrăm în '), ltext('1-3 zile lucrătoare', true), ltext(' prin curier rapid (Fan Courier, DPD sau Cargus). Vei primi un email cu numărul de tracking imediat ce coletul este preluat de curier.')),
      ),
    },
    {
      question: 'Pot returna un produs?',
      category: 'returns' as const,
      answer: ldoc(
        lpara(ltext('Da, ai '), ltext('30 de zile drept de retur', true), ltext(' de la data primirii coletului, conform legislației în vigoare. Produsul trebuie să fie nefolosit, în ambalajul original.')),
        lpara(ltext('Costurile de retur sunt suportate de cumpărător, cu excepția cazului în care produsul este defect sau a fost livrat greșit.')),
      ),
    },
    {
      question: 'Ce metode de plată acceptați?',
      category: 'general' as const,
      answer: ldoc(
        lpara(ltext('Acceptăm următoarele metode de plată:')),
        lbullet([
          'Card bancar (Visa, Mastercard) — plată securizată prin Stripe',
          'Transfer bancar — datele contului se trimit automat pe email',
          'Ramburs la livrare — plătești curorierului la primirea coletului',
        ]),
      ),
    },
    {
      question: 'Produsele au garanție?',
      category: 'products' as const,
      answer: ldoc(
        lpara(ltext('Da, toate produsele beneficiază de '), ltext('garanție producător', true), ltext(', în general 12 sau 24 de luni în funcție de brand și categorie.')),
        lpara(ltext('Garanția acoperă defectele de fabricație. Nu acoperă uzura normală sau deteriorările cauzate de utilizare necorespunzătoare.')),
      ),
    },
    {
      question: 'Oferiți consultanță pentru alegerea echipamentului?',
      category: 'general' as const,
      answer: ldoc(
        lpara(ltext('Absolut! Echipa noastră este formată din pescari pasionați care te pot ajuta să alegi echipamentul potrivit pentru stilul tău de pescuit.')),
        lpara(ltext('Ne poți contacta pe '), ltext('WhatsApp, email sau telefon', true), ltext(' în intervalul Luni–Vineri, 09:00–18:00.')),
      ),
    },
    {
      question: 'Livrați în afara României?',
      category: 'shipping' as const,
      answer: ldoc(
        lpara(ltext('Momentan livrăm '), ltext('doar în România', true), ltext('. Lucrăm la extinderea serviciului de livrare internațională — urmărește newsletterul pentru anunțuri.')),
      ),
    },
    {
      question: 'Cum pot urmări comanda mea?',
      category: 'shipping' as const,
      answer: ldoc(
        lpara(ltext('După expedierea coletului primești automat un email cu '), ltext('numărul de tracking', true), ltext(' și un link direct către pagina de urmărire a curierului.')),
        lpara(ltext('Poți urmări comanda și din contul tău, secțiunea '), ltext('Comenzile mele', true), ltext('.')),
      ),
    },
    {
      question: 'Sunt produsele originale, cu facturi de la distribuitor?',
      category: 'products' as const,
      answer: ldoc(
        lpara(ltext('Da, '), ltext('100% produse originale', true), ltext('. Lucrăm direct cu distribuitorii autorizați ai brandurilor pe care le comercializăm (Daiwa, Shimano, Fox, Korda, Nash și altele).')),
        lpara(ltext('Livrăm factură fiscală cu fiecare comandă.')),
      ),
    },
  ]

  const createdFaqs: number[] = []
  for (const faq of faqData) {
    const doc = await tryCreate(faq.question, () =>
      payload.create({ collection: 'faqs', data: faq }),
    )
    if (doc) createdFaqs.push(doc.id as number)
  }

  // ── 3. Testimoniale ──────────────────────────────────────────────────────────
  console.log('\n⭐ Testimoniale...')

  const testimonialData = [
    {
      author: 'Mihai Ionescu',
      role: 'Pescar din Brașov',
      rating: 5,
      quote: 'Am cumpărat o lansetă Daiwa Regal-X de la FirIntins și sunt absolut încântat. Livrare în 2 zile, ambalaj perfect și produsul exact ca în descriere. Cu siguranță o să revin!',
    },
    {
      author: 'Andrei Constantin',
      role: 'Pescar din București',
      rating: 5,
      quote: 'Cel mai bun magazin de pescuit online din România. Prețuri corecte, stoc variat și echipa de suport m-a ajutat să aleg mulineta potrivită pentru nevoile mele. Recomand cu toată încrederea!',
    },
    {
      author: 'Gheorghe Popa',
      role: 'Pescar din Cluj-Napoca',
      rating: 5,
      quote: 'Am returnat un produs din greșeală și procesul a fost extrem de simplu. Echipa FirIntins a rezolvat totul profesionist. Rar întâlnești un astfel de serviciu clienți în România.',
    },
    {
      author: 'Florin Marin',
      role: 'Pescar din Iași',
      rating: 5,
      quote: 'Comand de 2 ani din FirIntins și niciodată nu m-au dezamăgit. Produse originale, livrare rapidă și prețuri competitive. Magazinul meu preferat pentru echipamente de crap.',
    },
    {
      author: 'Cristian Dumitrescu',
      role: 'Pescar din Timișoara',
      rating: 4,
      quote: 'Produse de calitate și livrare promptă. Am primit și un mic ghid de utilizare pentru lanseta comandată — un gest mic dar apreciat. O să revin cu siguranță pentru sezonul următor.',
    },
  ]

  const createdTestimonials: number[] = []
  for (const t of testimonialData) {
    const doc = await tryCreate(t.author, () =>
      payload.create({ collection: 'testimonials', data: t }),
    )
    if (doc) createdTestimonials.push(doc.id as number)
  }

  // ── 4. Pagini legale ─────────────────────────────────────────────────────────
  console.log('\n📄 Pagini legale...')

  const pagesData = [
    {
      title: 'Politică de confidențialitate',
      slug: 'gdpr',
      showInFooter: true,
      _status: 'published',
      content: ldoc(
        lheading('Politică de confidențialitate'),
        lpara(ltext('Ultima actualizare: ianuarie 2026')),
        lpara(ltext('FirIntins SRL („noi", „magazinul") respectă confidențialitatea datelor tale personale și prelucrează datele cu caracter personal în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația română aplicabilă.')),
        lheading('Ce date colectăm', 'h2'),
        lbullet([
          'Date de identificare: nume, prenume',
          'Date de contact: adresă email, număr de telefon',
          'Adresă de livrare și facturare',
          'Date de plată (procesate securizat prin Stripe — noi nu stocăm datele cardului)',
          'Date de navigare: cookies tehnice și de analiză (cu consimțământul tău)',
        ]),
        lheading('De ce colectăm aceste date', 'h2'),
        lbullet([
          'Procesarea și livrarea comenzilor',
          'Comunicare legată de comenzi (confirmare, tracking, factură)',
          'Suport clienți',
          'Newsletter (doar dacă te-ai abonat explicit)',
          'Obligații legale (contabilitate, facturare)',
        ]),
        lheading('Drepturile tale', 'h2'),
        lpara(ltext('Conform GDPR, ai dreptul la: acces la date, rectificare, ștergere („dreptul de a fi uitat"), restricționarea prelucrării, portabilitate și opoziție. Poți exercita aceste drepturi contactându-ne la contact@firintins.ro.')),
        lheading('Retenția datelor', 'h2'),
        lpara(ltext('Datele aferente comenzilor sunt păstrate 5 ani conform legii contabilității. Datele pentru newsletter sunt păstrate până la dezabonare.')),
        lheading('Contact DPO', 'h2'),
        lpara(ltext('Pentru orice întrebare legată de prelucrarea datelor personale: contact@firintins.ro')),
      ),
    },
    {
      title: 'Termeni și condiții',
      slug: 'termeni-si-conditii',
      showInFooter: true,
      _status: 'published',
      content: ldoc(
        lheading('Termeni și condiții generale de utilizare'),
        lpara(ltext('Ultima actualizare: ianuarie 2026')),
        lpara(ltext('Prin utilizarea site-ului firintins.ro și plasarea unei comenzi, ești de acord cu prezentele Termeni și Condiții. Te rugăm să le citești cu atenție.')),
        lheading('Operatorul site-ului', 'h2'),
        lpara(ltext('FirIntins SRL, înregistrată în România, CUI: XXXXXXXX, J__/__/__, cu sediul la [adresa].')),
        lheading('Plasarea comenzilor', 'h2'),
        lpara(ltext('Orice comandă plasată pe site constituie o ofertă de cumpărare. Contractul se consideră încheiat la confirmarea comenzii prin email. Prețurile afișate includ TVA.')),
        lheading('Prețuri și plată', 'h2'),
        lbullet([
          'Toate prețurile sunt exprimate în lei (RON) și includ TVA',
          'Plata se poate face online cu cardul, prin transfer bancar sau ramburs',
          'Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă',
        ]),
        lheading('Livrare', 'h2'),
        lpara(ltext('Livrăm în România în 1-3 zile lucrătoare. Costul livrării este afișat în coș înainte de finalizarea comenzii. Livrare gratuită pentru comenzi peste [valoare] RON.')),
        lheading('Garanție și servicii post-vânzare', 'h2'),
        lpara(ltext('Toate produsele beneficiază de garanție conform legislației în vigoare (minimum 2 ani pentru produse noi). Garanția acoperă defectele de fabricație, nu deteriorările cauzate de utilizare necorespunzătoare.')),
        lheading('Limitarea răspunderii', 'h2'),
        lpara(ltext('FirIntins SRL nu este responsabilă pentru daune indirecte rezultate din utilizarea produselor comercializate. Răspunderea noastră este limitată la valoarea comenzii.')),
        lheading('Legislație aplicabilă', 'h2'),
        lpara(ltext('Prezentele T&C sunt guvernate de legislația română. Eventualele litigii se vor soluționa pe cale amiabilă sau prin instanțele competente din România.')),
      ),
    },
    {
      title: 'Politică de retur',
      slug: 'politica-de-retur',
      showInFooter: true,
      _status: 'published',
      content: ldoc(
        lheading('Politică de retur și returnare bani'),
        lpara(ltext('La FirIntins ne dorim ca tu să fii 100% mulțumit de achiziție. Dacă nu ești satisfăcut, returnarea este simplă și fără bătăi de cap.')),
        lheading('Dreptul de retragere (14 zile)', 'h2'),
        lpara(ltext('Conform OUG 34/2014, ai dreptul să te retragi dintr-un contract încheiat la distanță în termen de '), ltext('14 zile calendaristice', true), ltext(' de la primirea produsului, fără a da nicio explicație.')),
        lheading('Condiții retur', 'h2'),
        lbullet([
          'Produsul trebuie să fie în starea originală, nefolosit',
          'Ambalajul original trebuie să fie intact',
          'Toate accesoriile și documentele incluse trebuie returnate',
          'Produsele personalizate sau perisabile nu pot fi returnate',
        ]),
        lheading('Cum inițiezi un retur', 'h2'),
        lbullet([
          'Intră în contul tău → Comenzile mele → selectează comanda → Solicită retur',
          'Sau trimite email la contact@firintins.ro cu numărul comenzii',
          'Vei primi confirmarea și instrucțiunile de ambalare în max. 24h',
          'Trimite coletul la adresa indicată (costul returului este suportat de tine)',
        ]),
        lheading('Rambursarea banilor', 'h2'),
        lpara(ltext('Rambursarea se face în '), ltext('maximum 14 zile', true), ltext(' de la primirea produsului returnat și confirmarea stării acestuia. Banii revin pe același instrument de plată folosit la cumpărare.')),
        lheading('Produse defecte', 'h2'),
        lpara(ltext('Dacă ai primit un produs defect sau livrat greșit, contactează-ne în 48h de la primire. În acest caz, '), ltext('costul returului este suportat de noi', true), ltext(' și vei primi un înlocuitor sau rambursare completă.')),
      ),
    },
    {
      title: 'Metode de plată',
      slug: 'metode-de-plata',
      showInFooter: true,
      _status: 'published',
      content: ldoc(
        lheading('Metode de plată acceptate'),
        lpara(ltext('La FirIntins punem la dispoziție mai multe metode de plată pentru a-ți oferi maximum de flexibilitate.')),
        lheading('Card bancar (online)', 'h2'),
        lpara(ltext('Acceptăm carduri '), ltext('Visa și Mastercard', true), ltext(' (debit și credit). Plata este procesată securizat prin '), ltext('Stripe', true), ltext(' — unul dintre cele mai sigure procesatoare de plăți din lume. Datele cardului tău '), ltext('nu sunt stocate de noi', true), ltext('.')),
        lbullet([
          'Tranzacție securizată (SSL/TLS)',
          'Autentificare 3D Secure activă',
          'Rambursarea automată în caz de retur',
        ]),
        lheading('Transfer bancar', 'h2'),
        lpara(ltext('Poți plăti prin transfer bancar direct în contul nostru. Datele contului (IBAN, BIC, beneficiar) se trimit automat pe email după plasarea comenzii. Comanda se procesează după confirmarea plății (1-2 zile bancare).')),
        lheading('Ramburs la livrare', 'h2'),
        lpara(ltext('Plătești curorierului în numerar sau cu cardul (acolo unde curierul permite) la momentul livrării. Disponibil pentru comenzi de '), ltext('maximum 2.000 RON', true), ltext('.')),
        lpara(ltext('Notă: Pentru comenzile cu ramburs, o taxă suplimentară de 7 RON poate fi aplicată de curier.')),
        lheading('Securitate', 'h2'),
        lpara(ltext('Toate tranzacțiile online sunt protejate prin criptare SSL. Nu solicităm niciodată datele cardului prin email sau telefon. Dacă ai întrebări legate de siguranța plăților, contactează-ne la contact@firintins.ro.')),
      ),
    },
  ]

  for (const page of pagesData) {
    await tryCreate(page.title, () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload.create({ collection: 'pages', data: page as any }),
    )
  }

  // ── 5. Site Settings ─────────────────────────────────────────────────────────
  console.log('\n⚙️  Site Settings...')

  await tryCreate('Site Settings', async () => {
    const existing = await payload.findGlobal({ slug: 'site-settings' })
    // Only update if fields are empty
    if (!existing?.siteName) {
      return payload.updateGlobal({
        slug: 'site-settings',
        data: {
          siteName: 'FirIntins',
          phone: '+40 700 000 000',
          email: 'contact@firintins.ro',
          address: 'România',
          socialLinks: [
            { platform: 'facebook', url: 'https://facebook.com/firintins' },
            { platform: 'instagram', url: 'https://instagram.com/firintins' },
          ],
        },
      })
    }
    throw new Error('already exists')
  })

  // ── 6. Navigation ────────────────────────────────────────────────────────────
  console.log('\n🧭 Navigație...')

  await tryCreate('Navigation', async () => {
    const existing = await payload.findGlobal({ slug: 'navigation' })
    if (!existing?.items?.length) {
      return payload.updateGlobal({
        slug: 'navigation',
        data: {
          items: [
            { label: 'Produse', url: '/produse', newTab: false },
            { label: 'Categorii', url: '/categorii', newTab: false },
            { label: 'Oferte', url: '/oferte', newTab: false },
            { label: 'Blog', url: '/blog', newTab: false },
          ],
        },
      })
    }
    throw new Error('already exists')
  })

  // ── 7. Footer ────────────────────────────────────────────────────────────────
  console.log('\n🦶 Footer...')

  await tryCreate('Footer', async () => {
    const existing = await payload.findGlobal({ slug: 'footer' })
    if (!existing?.columns?.length) {
      return payload.updateGlobal({
        slug: 'footer',
        data: {
          showNewsletter: true,
          columns: [
            {
              heading: 'FirIntins',
              links: [
                { label: 'Toate produsele', url: '/produse' },
                { label: 'Oferte speciale', url: '/oferte' },
                { label: 'Blog pescuit', url: '/blog' },
              ],
            },
            {
              heading: 'Cont',
              links: [
                { label: 'Contul meu', url: '/cont' },
                { label: 'Comenzile mele', url: '/cont/comenzi' },
                { label: 'Lista de dorințe', url: '/cont/wishlist' },
              ],
            },
            {
              heading: 'Informații legale',
              links: [
                { label: 'Politică de confidențialitate', url: '/pagini/gdpr' },
                { label: 'Termeni și condiții', url: '/pagini/termeni-si-conditii' },
                { label: 'Politică de retur', url: '/pagini/politica-de-retur' },
                { label: 'Metode de plată', url: '/pagini/metode-de-plata' },
              ],
            },
          ],
        },
      })
    }
    throw new Error('already exists')
  })

  // ── 8. Homepage ──────────────────────────────────────────────────────────────
  console.log('\n🏠 Homepage...')

  // Always update homepage so product handles stay in sync with Medusa seed
  await payload.updateGlobal({
    slug: 'homepage',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      title: 'Homepage',
      _status: 'published',
      blocks: [
        // ── Hero ──────────────────────────────────────────────────────────────
        {
          blockType: 'hero',
          heading: 'Echipamente premium de pescuit la crap',
          subheading: 'Lansete, mulinete și accesorii de top pentru pescari pasionați din România',
          ctaLabel: 'Descoperă produsele',
          ctaUrl: '/produse',
          overlay: 'dark',
        },

        // ── Produse recomandate ───────────────────────────────────────────────
        {
          blockType: 'featuredProducts',
          heading: 'Produse recomandate',
          productHandles: [
            { handle: 'lanseta-crap-pro-36m' },
            { handle: 'mulineta-crap-elite-6000' },
            { handle: 'alarma-swinger-set4' },
            { handle: 'boilies-fishmeal-20mm-5kg' },
          ],
          layout: 'carousel',
        },

        // ── Oferte ───────────────────────────────────────────────────────────
        {
          blockType: 'offers',
          heading: 'Oferte speciale',
          offers: [
            {
              title: 'Lanseta Spod 3.6m',
              description: 'Lanseta spod dedicata nadairii la distanta — acum cu 20% reducere pana la epuizarea stocului.',
              badge: '-20%',
              ctaUrl: '/produse/lanseta-spod-360',
            },
            {
              title: 'Mulineta Baitrunner 4000',
              description: 'Mulineta baitrunner compacta la cel mai bun pret al sezonului. Stoc limitat.',
              badge: 'Oferta limitata',
              ctaUrl: '/produse/mulineta-baitrunner-4000',
            },
            {
              title: 'Boilies Fishmeal 5kg',
              description: 'Cel mai vandut boilies al nostru la pret promotional. Aroma de fishmeal imbatibila.',
              badge: 'Stoc limitat',
              ctaUrl: '/produse/boilies-fishmeal-20mm-5kg',
            },
          ],
        },

        // ── De ce FirIntins ───────────────────────────────────────────────────
        {
          blockType: 'featuresGrid',
          heading: 'De ce FirIntins?',
          items: [
            {
              icon: 'truck',
              title: 'Livrare rapidă',
              description: 'Colet la ușa ta în 1-3 zile lucrătoare prin curier rapid.',
            },
            {
              icon: 'shield',
              title: 'Produse 100% originale',
              description: 'Lucrăm direct cu distribuitorii autorizați ai celor mai mari branduri.',
            },
            {
              icon: 'star',
              title: 'Garanție producător',
              description: '12-24 luni garanție la toate produsele comercializate.',
            },
            {
              icon: 'fish',
              title: 'Consultanță personalizată',
              description: 'Echipa noastră de pescari te ajută să alegi echipamentul potrivit.',
            },
          ],
        },

        // ── Testimoniale ──────────────────────────────────────────────────────
        {
          blockType: 'testimonials',
          heading: 'Ce spun pescarii noștri',
          items: createdTestimonials,
        },

        // ── FAQ ───────────────────────────────────────────────────────────────
        {
          blockType: 'faq',
          heading: 'Întrebări frecvente',
          items: createdFaqs,
        },

        // ── Newsletter ────────────────────────────────────────────────────────
        {
          blockType: 'newsletter',
          heading: 'Fii primul care află',
          subheading: 'Abonează-te și primești oferte exclusive, sfaturi de la experți și noutăți despre echipamentele tale preferate. Fără spam — te dezabonezi oricând.',
          placeholder: 'Adresa ta de email',
          buttonLabel: 'Mă abonez gratuit',
          background: 'moss',
        },
      ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })
  console.log('  ✓ Homepage blocks')

  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complet!\n')
  console.log('📌 Notă: Postările de blog (Posts) nu au fost create automat')
  console.log('   deoarece necesită o imagine de copertă (cover image).')
  console.log('   Creează-le manual din Admin → Collections → Posts.\n')
  console.log('📌 Notă: Adaugă imaginea Hero și logo-ul din:')
  console.log('   Admin → Collections → Media → după care selectează-le în')
  console.log('   Homepage → bloc Hero → Background Image')
  console.log('   Site Settings → Logo\n')

  process.exit(0)
}

main().catch((err) => {
  console.error('\n❌ Seed eșuat:', err)
  process.exit(1)
})
