import type { Hotspot, Module, ModuleScene } from '@/data/types'

// Faol markaz qoldiqlari — PDB fayl raqamlashi (UniProt'dan -1 siljigan,
// CLAUDE.md 5-bo'lim). Chain A, 1I10 (LDHA/M-zanjir).
export const ACTIVE_SITE_RESI = [192, 105, 168, 247, 165, 137]

// Har bir faol markaz qoldig'i uchun: 3D'dagi rang bilan bir xil (stick
// rangi), ketma-ketlik panelida ham shu rang bilan ajratiladi.
export const ACTIVE_SITE_INFO: Record<number, { name: string; color: string }> = {
  192: { name: 'His192', color: '#ffcc00' },
  165: { name: 'Asp165', color: '#a78bfa' },
  105: { name: 'Arg105', color: '#ffa94d' },
  168: { name: 'Arg168', color: '#4fd1c5' },
  247: { name: 'Thr247', color: '#4fd1c5' },
  137: { name: 'Asn137', color: '#4fd1c5' },
}

// Mobil "qopqoq" ilmoq. 1I10 HELIX/SHEET yozuvlariga ko'ra chain A da 93 va
// 104 orasida na spiral, na varaq bor — ya'ni bu bo'lak haqiqatan ham
// erkin ilmoq, va Arg105 uning oxirida o'tiradi.
export const LOOP_RESI = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107]
export const LOOP_COLOR = '#ffa94d'

// UniProt P00338 (LDHA) to'liq ketma-ketligi, Met1 bilan. PDB fayl
// raqamlashi UniProt'dan -1 siljigan (Met1 kesilgan): PDB qoldiq N —
// shu satrning N-indeksidagi harf (0-based), ya'ni CHAIN_A_SEQUENCE[N].
export const CHAIN_A_SEQUENCE =
  'MATLKDQLIYNLLKEEQTPQNKITVVGVGAVGMACAISILMKDLADELALVDVIEDKLKG' +
  'EMMDLQHGSLFLRTPKIVSGKDYNVTANSKLVIITAGARQQEGESRLNLVQRNVNIFKFI' +
  'IPNVVKYSPNCKLLIVSNPVDILTYVAWKISGFPKNRVIGSGCNLDSARFRYLMGERLGV' +
  'HPLSCHGWVLGEHGDSSVPVWSGMNVAGVSLKTLHPDLGTDKDKEQWKEVHKQVVESAYE' +
  'VIKLKGYTSWAIGLSVADLAESIMKNLRRVHPVSTMIKGLYGIKDDVFLSVPCILGQNGI' +
  'SDLVKVTLTSEEEARLKKSADTLWGIQKELQF'

const CHAINS = ['A', 'B', 'C', 'D']

// Zanjir ranglari qo'lda beriladi (3Dmol'ning 'chain' sxemasi emas): lenta va
// yuza AYNAN bir xil rangda bo'lishi kerak, aks holda yuza lentadan boshqa
// rangda chiqib, molekula loyqa ko'rinadi.
const CHAIN_COLORS: Record<string, string> = { A: '#5b8ff9', B: '#4ecb8f', C: '#f2c14e', D: '#ef7a6d' }
const chainCartoon = CHAINS.map((c) => ({ select: { chain: c }, style: 'cartoon' as const, color: CHAIN_COLORS[c] }))
const chainSurface = CHAINS.map((c) => ({ select: { chain: c }, kind: 'VDW' as const, color: CHAIN_COLORS[c], opacity: 0.32 }))

const SRC_READ =
  'Read J.A. et al. (2001) "Structural basis for altered activity of M- and H-isozyme forms of human lactate dehydrogenase." Proteins 43:175-185 — PDB 1I10, 1I0Z'
const SRC_UNIPROT = 'UniProt P00338 (LDHA) va P07195 (LDHB) — faol markaz va bog\'lanish joylari jadvali'
const SRC_LEHNINGER = 'Lehninger Principles of Biochemistry, 8-nashr, 14–15-boblar (Glikoliz, NAD-bog\'liq degidrogenazalar)'
const SRC_HARPER = "Harper's Illustrated Biochemistry, 32-nashr — LDH izofermentlari va laktat metabolizmi"

const scenes: ModuleScene[] = [
  {
    id: 'quaternary',
    pdbIds: ['1I10'],
    label: { uz: "To'rtlamchi struktura", en: 'Quaternary structure' },
    spec: {
      id: 'ldh-quaternary',
      layers: [
        ...chainCartoon,
        // Sahnaning O'QITADIGAN nuqtasi — "4 ta mustaqil faol markaz" degan
        // gap faqat o'sha to'rttasi KO'RINSA tushunarli bo'ladi: har zanjirdagi
        // substrat + kofaktor yorqin shar bo'lib lentadan ajralib turadi.
        { select: { chain: CHAINS, resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.62 },
        { select: { chain: CHAINS, resn: 'NAI', hetflag: true }, style: 'stick', color: '#ffffff', radius: 0.2 },
      ],
      // Lentaning ustidagi shaffof yuza — molekula "quruq tasma" emas,
      // hajmli jism bo'lib ko'rinadi (hujayrada u aynan shunday bo'shliqni
      // egallaydi). VDW eng tez tur, tetramer uchun ~1-2 s.
      surfaces: chainSurface,
      labels: [
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Faol markaz 1', color: '#ff7aa8' },
        { select: { chain: 'B', resn: 'OXM', hetflag: true }, text: 'Faol markaz 2', color: '#ff7aa8' },
        { select: { chain: 'C', resn: 'OXM', hetflag: true }, text: 'Faol markaz 3', color: '#ff7aa8' },
        { select: { chain: 'D', resn: 'OXM', hetflag: true }, text: 'Faol markaz 4', color: '#ff7aa8' },
      ],
      zoomTo: { chain: CHAINS },
    },
    description: {
      uz: "LDH — 4 ta subbirlikdan iborat tetramer, ~144 kDa. Pushti sharlar — to'rtta faol markaz (har birida substrat va oq tayoqcha bilan NADH ko'rsatilgan): molekula bir vaqtda 4 ta reaksiyani katalizlay oladi, va ular bir-biriga bog'liq emas — LDH allosterik ferment EMAS (gemoglobindan asosiy farqi shu). Diqqat qiling: markazlar yuzada emas, ikki domen orasidagi chuqur yoriqda joylashgan. Yarim shaffof qobiq — van der Waals yuzasi: hujayra ichida ferment aynan shu hajmni egallaydi. Zanjirga bosib, uni yaqinlashtirish mumkin.",
      en: 'LDH is a tetramer of four subunits, ~144 kDa. The pink spheres are the four active sites (each with its substrate, and NADH drawn as white sticks): the molecule catalyses four reactions at once, and they are independent of one another — LDH is NOT an allosteric enzyme, which is its main contrast with haemoglobin. Note that the sites are not on the surface but deep in the cleft between the two domains. The translucent shell is the van der Waals surface: the volume the enzyme actually occupies in the cell. Tap a chain to zoom into it.',
    },
  },
  {
    id: 'subunit',
    pdbIds: ['1I10'],
    label: { uz: 'Bitta subbirlik', en: 'Single subunit' },
    spec: {
      id: 'ldh-subunit',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', colorscheme: 'ssPyMol' },
        { select: { chain: 'A', resn: ['NAI', 'OXM'], hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.16 },
      ],
      surfaces: [{ select: { chain: 'A' }, kind: 'VDW', color: '#7f8ca3', opacity: 0.2 }],
      zoomTo: { chain: 'A' },
    },
    description: {
      uz: "Bitta zanjir ikkita domenga bo'linadi: N-terminal Rossmann burmasi (NAD(H) kofaktorni bog'laydi — beta-varaq va alfa-spiral navbatlashuvidan iborat klassik motif, ko'plab degidrogenazalarda uchraydi) va C-terminal domen (substrat bog'lash va tetramerlanish uchun). Rang ikkilamchi strukturani ko'rsatadi: qizil — alfa-spiral, sariq — beta-varaq, oq — ilmoq. Ikki domen orasidagi yoriqda kofaktor va substrat (element ranglarida) o'tiradi — faol markaz aynan shu yoriqning tubida.",
      en: 'A single chain has two domains: the N-terminal Rossmann fold (binds the NAD(H) cofactor — the classic alternating beta-sheet/alpha-helix motif shared by many dehydrogenases) and the C-terminal domain (substrate binding and tetramerization). Color shows secondary structure: red helices, yellow sheets, white loops. The cofactor and substrate (element colors) sit in the cleft between the two domains — the active site is at the bottom of that cleft.',
    },
  },
  {
    id: 'active-site',
    pdbIds: ['1I10'],
    label: { uz: 'Faol markaz', en: 'Active site' },
    spec: {
      id: 'ldh-active-site',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', color: '#8892a6', opacity: 0.16 },
        { select: { chain: 'A' }, style: 'line', color: '#4a5468' },
        { select: { chain: 'A', resi: 192 }, style: 'stick', color: '#ffcc00', radius: 0.17 },
        { select: { chain: 'A', resi: 165 }, style: 'stick', color: '#a78bfa', radius: 0.17 },
        { select: { chain: 'A', resi: 105 }, style: 'stick', color: '#ffa94d', radius: 0.17 },
        { select: { chain: 'A', resi: [168, 247, 137] }, style: 'stick', color: '#4fd1c5', radius: 0.17 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'stick', color: '#ff2d78', radius: 0.2 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.32 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.13 },
      ],
      labels: [
        { select: { chain: 'A', resi: 192 }, text: 'His192', color: '#ffcc00' },
        { select: { chain: 'A', resi: 165 }, text: 'Asp165', color: '#a78bfa' },
        { select: { chain: 'A', resi: 105 }, text: 'Arg105', color: '#ffa94d' },
        { select: { chain: 'A', resi: 168 }, text: 'Arg168', color: '#4fd1c5' },
        { select: { chain: 'A', resi: 247 }, text: 'Thr247', color: '#4fd1c5' },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Oksamat', color: '#ff2d78' },
      ],
      zoomTo: { chain: 'A', resi: ACTIVE_SITE_RESI },
    },
    description: {
      uz: "Faol markaz geometriyasi — oksamat (piruvatning reaksiyaga kirmaydigan o'xshashi) atrofida. His192 (sariq) — proton beruvchi/qabul qiluvchi. Asp165 (binafsha) His192 imidazolini ushlab, uni to'g'ri tautomerda va yuqori pKa'da saqlaydi (H-bog' 2.64 Å — shu strukturada o'lchandi). Arg105 (to'q sariq) mobil ilmoq ustida keladi va substratning karbonil kislorodini qutblaydi. Arg168, Thr247, Asn137 (moviy) substratni ushlab, uni bitta yo'nalishda qotiradi — shuning uchun mahsulot faqat L-laktat. Reaksiya: piruvat + NADH + H⁺ ⇌ L-laktat + NAD⁺.",
      en: 'Active-site geometry around oxamate (a non-reactive mimic of pyruvate). His192 (yellow) is the proton donor/acceptor. Asp165 (purple) holds the His192 imidazole in the right tautomer and raises its pKa (H-bond at 2.64 Å, measured in this structure). Arg105 (orange) rides in on the mobile loop and polarizes the substrate carbonyl oxygen. Arg168, Thr247 and Asn137 (teal) clamp the substrate in a single orientation — which is why the product is exclusively L-lactate. Reaction: pyruvate + NADH + H⁺ ⇌ L-lactate + NAD⁺.',
    },
  },
  {
    id: 'cofactor',
    pdbIds: ['1I10'],
    label: { uz: 'Kofaktor (NADH)', en: 'Cofactor (NADH)' },
    spec: {
      id: 'ldh-cofactor',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', color: '#3f7f6a', opacity: 0.22 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.18 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'sphere', colorscheme: 'Jmol', radius: 0.34 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'stick', color: '#ff2d78', radius: 0.18 },
      ],
      surfaces: [{ select: { chain: 'A' }, kind: 'VDW', color: '#2f6a58', opacity: 0.16 }],
      labels: [
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, text: 'NADH', color: '#9ae6b4' },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Oksamat', color: '#ff2d78' },
      ],
      zoomTo: { chain: 'A', resn: 'NAI', hetflag: true },
    },
    description: {
      uz: "NADH (PDB'da NAI kodi bilan) Rossmann burmasining ichiga cho'kkan holda o'tiradi — adenin va nikotinamid uchlari ikki tomonga cho'ziladi, o'rtada ikki fosfat. Atomlar element rangida: kulrang — uglerod, qizil — kislorod, moviy — azot, to'q sariq — fosfor. Nikotinamid halqasi faol markazga, substratga ~3,5 Å masofada joylashadi: aynan shu halqaning C4 uglerodidagi hidrid ion (H⁻) piruvatning karbonil uglerodiga o'tib, laktat hosil qiladi.",
      en: "NADH (ligand code NAI) sits nestled inside the Rossmann fold, its adenine and nicotinamide ends extending outward with the two phosphates between them. Atoms are in element colors: grey carbon, red oxygen, blue nitrogen, orange phosphorus. The nicotinamide ring reaches into the active site, ~3.5 Å from the substrate: the hydride (H⁻) on its C4 carbon is what transfers to pyruvate's carbonyl carbon to make lactate.",
    },
  },
  {
    id: 'isoenzymes',
    pdbIds: ['1I10'],
    label: { uz: 'Izofermentlar', en: 'Isoenzymes' },
    spec: {
      id: 'ldh-isoenzymes',
      schematic: true,
      // Bu sahnada zanjir ranglari "kim qaysi o'rinni egallagani"ni bildiradi,
      // shuning uchun to'rtta alohida rang EMAS: ikkitasi H (moviy), ikkitasi
      // M (to'q sariq) — ya'ni ko'rinayotgani LDH3 (H2M2) ning sxemasi.
      layers: [
        { select: { chain: ['A', 'B'] }, style: 'cartoon', color: '#2b6cb0' },
        { select: { chain: ['C', 'D'] }, style: 'cartoon', color: '#d69e2e' },
        { select: { chain: CHAINS, resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.55 },
      ],
      surfaces: [
        { select: { chain: ['A', 'B'] }, kind: 'VDW', color: '#2b6cb0', opacity: 0.3 },
        { select: { chain: ['C', 'D'] }, kind: 'VDW', color: '#d69e2e', opacity: 0.3 },
      ],
      labels: [
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'H (LDHB)', color: '#90cdf4' },
        { select: { chain: 'B', resn: 'OXM', hetflag: true }, text: 'H (LDHB)', color: '#90cdf4' },
        { select: { chain: 'C', resn: 'OXM', hetflag: true }, text: 'M (LDHA)', color: '#f6d365' },
        { select: { chain: 'D', resn: 'OXM', hetflag: true }, text: 'M (LDHA)', color: '#f6d365' },
      ],
      zoomTo: { chain: CHAINS },
    },
    description: {
      uz: "SXEMATIK: ko'rinayotgani — LDH3 (H2M2) ning sxemasi. Ikki moviy o'rin H (LDHB), ikki sariq o'rin M (LDHA). To'rtta o'rin ikki xil subbirlik bilan to'ldirilsa 5 ta kombinatsiya chiqadi: LDH1 (H4 — yurak, eritrotsit), LDH2 (H3M1 — RES), LDH3 (H2M2 — o'pka), LDH4 (H1M3 — buyrak, plasenta), LDH5 (M4 — jigar, skelet mushagi). Nega aralasha oladi: ikkala subbirlik bir xil burmaga ega, shuning uchun istalgan o'rinni egallay oladi. DIQQAT — geterotetramerlar kristallanmagan, bu yerda haqiqiy M4 strukturasi ranglar bilan belgilangan, geometriya sxematik. Beshtasining to'liq jadvali 'Izoferment' chipida.",
      en: 'SCHEMATIC: what you see is a diagram of LDH3 (H2M2). The two blue positions are H (LDHB), the two gold ones M (LDHA). Filling four positions with two subunit types gives five combinations: LDH1 (H4 — heart, red cells), LDH2 (H3M1 — RES), LDH3 (H2M2 — lung), LDH4 (H1M3 — kidney, placenta), LDH5 (M4 — liver, skeletal muscle). They can mix because both subunits share the same fold and can take any position. NOTE — the heterotetramers have never been crystallized; this is the real M4 structure with the positions colour-coded, so the geometry is schematic. The full table of all five is on the "Isoenzyme" chip.',
    },
  },
  {
    id: 'clinical',
    // Yagona sahna ikkita HAQIQIY strukturani yonma-yon qo'yadi: chapda M4
    // (1I10, LDH5), o'ngda H4 (1I0Z, LDH1). "LDH1 va LDH5" sarlavhasi shunda
    // rostga aylanadi — avval faqat bittasi ko'rinib turardi.
    pdbIds: ['1I10', '1I0Z'],
    label: { uz: 'Klinik: LDH1 va LDH5', en: 'Clinical: LDH1 vs LDH5' },
    spec: {
      id: 'ldh-clinical',
      layers: [
        { select: { model: 0, chain: CHAINS }, style: 'cartoon', color: '#d69e2e' },
        { select: { model: 1, chain: CHAINS }, style: 'cartoon', color: '#2b6cb0' },
        { select: { model: 0, chain: CHAINS, resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.55 },
        { select: { model: 1, chain: CHAINS, resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.55 },
      ],
      surfaces: [
        { select: { model: 0, chain: CHAINS }, kind: 'VDW', color: '#d69e2e', opacity: 0.28 },
        { select: { model: 1, chain: CHAINS }, kind: 'VDW', color: '#2b6cb0', opacity: 0.28 },
      ],
      labels: [
        { select: { model: 0, chain: 'A', resn: 'OXM', hetflag: true }, text: 'LDH5 · M4 · jigar, mushak', color: '#f6d365' },
        { select: { model: 1, chain: 'A', resn: 'OXM', hetflag: true }, text: 'LDH1 · H4 · yurak, eritrotsit', color: '#90cdf4' },
      ],
      zoomTo: {},
    },
    description: {
      uz: "Ikkala gomotetramer yonma-yon, ikkalasi ham HAQIQIY struktura: chapda sariq — LDH5 (M4, LDHA geni, PDB 1I10, jigar va skelet mushagi), o'ngda moviy — LDH1 (H4, LDHB geni, PDB 1I0Z, yurak va eritrotsit). Umumiy shakli deyarli bir xil (~75% ayniyat, bir xil burma) — farq faol markaz atrofidagi bir necha qoldiqda: H ning piruvatga Km si past va u piruvat ortiqchasida o'zini tormozlaydi (laktat → piruvat, aerob), M esa yuqori piruvatga chidaydi (piruvat → laktat, anaerob). KLINIKA: normada zardobda LDH2 > LDH1; miokard infarktida H-boy izofermentlar qonga chiqib nisbatni teskarilaydi (LDH1 > LDH2 — \"flip\", 12–24 soatda, 2–3 kunda cho'qqi). Bugun troponin ustun, lekin umumiy LDH hamon ishlatiladi: gemoliz, o'sma lizis sindromi, limfoma va melanomada prognoz.",
      en: 'Both homotetramers side by side, both real structures: on the left in gold, LDH5 (M4, LDHA gene, PDB 1I10, liver and skeletal muscle); on the right in blue, LDH1 (H4, LDHB gene, PDB 1I0Z, heart and red cells). The overall shape is nearly identical (~75% identity, same fold) — the difference lies in a few residues around the active site: H has a low Km for pyruvate and is inhibited by excess pyruvate (lactate → pyruvate, aerobic), while M tolerates high pyruvate (pyruvate → lactate, anaerobic). CLINICALLY: serum normally has LDH2 > LDH1; in myocardial infarction H-rich isoenzymes enter the blood and invert the ratio (LDH1 > LDH2 — the flip, at 12–24 h, peaking at 2–3 days). Troponin has replaced it, but total LDH is still used: haemolysis, tumour lysis syndrome, and prognosis in lymphoma and melanoma.',
    },
  },
]

const hotspots: Hotspot[] = [
  {
    id: 'loop',
    short: { uz: 'Mobil ilmoq', en: 'Mobile loop' },
    label: { uz: "Mobil ilmoq (qopqoq), 96–107", en: 'Mobile loop (the lid), 96–107' },
    pdbIds: ['1I10'],
    chem: 'loop',
    resi: LOOP_RESI,
    spec: {
      id: 'hs-loop',
      layers: [
        // Kontekst saqlanadi: butun subbirlik ko'rinib turadi, ilmoq esa uning
        // ustida qalin va yorqin — "qaysi joyi bukiladi" degan savolga javob
        // faqat shu ikkisi BIRGA ko'rinsa beriladi.
        { select: { chain: 'A' }, style: 'cartoon', color: '#7f8ca3', opacity: 0.42 },
        { select: { chain: 'A', resi: LOOP_RESI }, style: 'cartoon', color: LOOP_COLOR },
        { select: { chain: 'A', resi: 105 }, style: 'stick', color: '#ffd8a8', radius: 0.22 },
        { select: { chain: 'A', resi: 192 }, style: 'stick', color: '#ffcc00', radius: 0.18 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.42 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.14 },
      ],
      labels: [
        { select: { chain: 'A', resi: 101 }, text: 'Ilmoq 96–107', color: LOOP_COLOR },
        { select: { chain: 'A', resi: 105 }, text: 'Arg105', color: '#ffd8a8' },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Substrat', color: '#ff2d78' },
      ],
      zoomTo: { chain: 'A' },
    },
    role: {
      uz: "Bu — fermentning bukiladigan joyi. Substrat markazga kirgach, 96–107 qoldiqlardan iborat ilmoq markaz ustiga yopiladi va uchini ~10 Å ga siljitadi. Yopilish uchta ish qiladi: (1) Arg105 ilmoq bilan birga ichkariga kiradi va substratning karbonil kislorodini qutblab, o'tish holatidagi manfiy zaryadni barqarorlashtiradi; (2) suv faol markazdan siqib chiqariladi — endi proton tasodifiy suvga emas, faqat His192 ga bora oladi; (3) nikotinamid halqasi bilan substrat 3–4 Å ga yaqinlashadi, hidrid uzatish shundagina mumkin. Muhim nuqta: LDH da reaksiya tezligini cheklovchi qadam — kimyoning o'zi emas, aynan shu ilmoqning yopilib-ochilishi.",
      en: 'This is the enzyme’s hinge. Once substrate enters, the loop formed by residues 96–107 folds over the site, moving its tip by ~10 Å. Closure does three things: (1) Arg105 rides in with the loop and polarizes the substrate carbonyl oxygen, stabilizing the negative charge of the transition state; (2) water is squeezed out of the site, so a proton can only go to His192, not to a random water; (3) substrate and nicotinamide come within 3–4 Å, which is the only distance at which hydride transfer works. Key point: in LDH the rate-limiting step is this loop opening and closing, not the chemistry itself.',
    },
    pathology: [
      {
        name: { uz: '"Strukturasi bor, faoliyati yo\'q" mutatsiyalar', en: 'Structure-intact, activity-dead mutations' },
        text: {
          uz: "Ilmoqdagi yoki uning ilgagidagi almashinuv fermentning umumiy shaklini buzmaydi — oqsil normal yig'iladi, immunologik tahlilda miqdori ham normal chiqadi, lekin aylanish tezligi keskin tushadi. Shuning uchun LDH tanqisligini faqat oqsil miqdori bilan emas, faollik (U/L) bilan o'lchash kerak.",
          en: 'A substitution in the loop or its hinge does not disturb the overall fold — the protein assembles normally and immunoassays report normal amounts — yet turnover collapses. This is why LDH deficiency must be measured as activity (U/L), not as protein quantity.',
        },
      },
      {
        name: { uz: 'Onkologiya: dori nishoni', en: 'Oncology: a drug target' },
        text: {
          uz: "O'sma hujayralari kislorod yetarli bo'lsa ham glikolizga suyanadi (Varburg effekti) va buning uchun LDHA ni kuchaytiradi. LDHA ning zamonaviy ingibitorlari faol markazga emas, aynan shu ilmoq yopiladigan qo'shni cho'ntakka bog'lanadi va ilmoqni ochiq holda qulflaydi — ferment substratni bog'laydi, lekin katalizlay olmaydi.",
          en: 'Tumour cells lean on glycolysis even when oxygen is plentiful (the Warburg effect) and upregulate LDHA to do it. Modern LDHA inhibitors bind not the active site but the adjacent pocket the loop closes into, locking the loop open — the enzyme still binds substrate but can no longer catalyse.',
        },
      },
    ],
    sources: [SRC_READ, SRC_LEHNINGER],
  },
  {
    id: 'catalysis',
    short: { uz: 'His192–Asp165', en: 'His192–Asp165' },
    label: { uz: 'Katalitik juftlik: His192 va Asp165', en: 'Catalytic pair: His192 and Asp165' },
    pdbIds: ['1I10'],
    chem: 'his-asp',
    resi: [192, 165],
    spec: {
      id: 'hs-catalysis',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', color: '#8892a6', opacity: 0.12 },
        { select: { chain: 'A', resi: 192 }, style: 'stick', color: '#ffcc00', radius: 0.22 },
        { select: { chain: 'A', resi: 192 }, style: 'sphere', color: '#ffcc00', radius: 0.3 },
        { select: { chain: 'A', resi: 165 }, style: 'stick', color: '#a78bfa', radius: 0.22 },
        { select: { chain: 'A', resi: 165 }, style: 'sphere', color: '#a78bfa', radius: 0.3 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'stick', color: '#ff2d78', radius: 0.2 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.12 },
      ],
      labels: [
        { select: { chain: 'A', resi: 192 }, text: 'His192', color: '#ffcc00' },
        { select: { chain: 'A', resi: 165 }, text: 'Asp165', color: '#a78bfa' },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Substrat', color: '#ff2d78' },
      ],
      zoomTo: { chain: 'A', resi: [192, 165] },
    },
    role: {
      uz: "Reaksiyaga kirishadigan asosiy qism. His192 imidazol halqasi protonni beradi yoki qaytarib oladi: piruvat → laktat yo'nalishida protonlangan His192 karbonil kislorodiga H⁺ uzatadi (aynan shu payt NADH hidridni uglerodga beradi), teskari yo'nalishda esa laktatning OH guruhidan protonni tortib oladi. Asp165 karboksili His192 ning Nδ1 azoti bilan 2,64 Å masofada vodorod bog'i hosil qiladi — bu ikki narsani ta'minlaydi: imidazol faqat kerakli tautomerda turadi va uning pKa si ko'tarilib, fiziologik pH da protonlangan holatda bo'lish imkoni paydo bo'ladi. Aspartat bo'lmasa, gistidin bo'lsa ham kataliz yo'q.",
      en: 'The business end of the reaction. The His192 imidazole donates or takes back a proton: in the pyruvate → lactate direction, protonated His192 hands H⁺ to the carbonyl oxygen exactly as NADH delivers the hydride to the carbon; in reverse, it pulls the proton off the lactate hydroxyl. The Asp165 carboxylate hydrogen-bonds the His192 Nδ1 at 2.64 Å, which does two things: it locks the imidazole in the productive tautomer, and it raises its pKa so the ring can actually be protonated at physiological pH. Without the aspartate there is no catalysis, histidine or not.',
    },
    pathology: [
      {
        name: { uz: 'LDHA tanqisligi — glikogenoz XI tip (OMIM 612933)', en: 'LDHA deficiency — glycogen storage disease XI (OMIM 612933)' },
        text: {
          uz: "M-subbirlik yetishmasa, skelet mushagi anaerob ish paytida piruvatni laktatga aylantira olmaydi va NAD⁺ ni tiklay olmaydi — glikoliz to'xtaydi. Klinikasi: og'ir jismoniy yuklamaga chidamsizlik, mushak og'rig'i va kramplar, rabdomioliz va mioglobinuriya (siydik qoramtir), eritematoz/pustulyoz teri toshmasi; tug'ruqda bachadonning qattiqlashuvi tasvirlangan. Diagnostik kalit — ishemik yuklama sinovida laktat KO'TARILMAYDI (piruvat esa ko'tariladi), bu McArdle kasalligidan (u yerda ikkalasi ham ko'tarilmaydi) farqlashda ishlatiladi.",
          en: 'Without the M subunit, skeletal muscle cannot convert pyruvate to lactate during anaerobic work and cannot regenerate NAD⁺ — glycolysis stalls. Clinically: exercise intolerance, myalgia and cramps, rhabdomyolysis with myoglobinuria (dark urine), and an erythematous/pustular skin eruption; uterine stiffness in labour has been described. The diagnostic key is the ischaemic exercise test, where lactate does NOT rise (while pyruvate does) — used to separate it from McArdle disease, where neither rises.',
        },
      },
      {
        name: { uz: 'LDHB tanqisligi (OMIM 614128)', en: 'LDHB deficiency (OMIM 614128)' },
        text: {
          uz: "H-subbirlik yetishmasligi — deyarli har doim simptomsiz, tasodifan topiladi: umumiy zardob LDH past, izoferment elektroforezida LDH1 va LDH2 fraksiyalari yo'q. Klinik ahamiyati bitta — bunday bemorda LDH yuqori bo'lishi kutiladigan holatlarda (gemoliz, infarkt) tahlil yolg'on-normal chiqadi.",
          en: 'Loss of the H subunit is almost always asymptomatic and found by accident: low total serum LDH with the LDH1 and LDH2 bands missing on isoenzyme electrophoresis. Its one clinical consequence is that in such a patient, conditions that should raise LDH (haemolysis, infarction) give a falsely normal result.',
        },
      },
    ],
    sources: [SRC_READ, SRC_UNIPROT, SRC_HARPER],
  },
  {
    id: 'hydride',
    short: { uz: 'Hidrid uzatish', en: 'Hydride transfer' },
    label: { uz: "Hidrid uzatish: NADH nikotinamid halqasi", en: 'Hydride transfer: the NADH nicotinamide ring' },
    pdbIds: ['1I10'],
    chem: 'reaction',
    resi: [],
    spec: {
      id: 'hs-hydride',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', color: '#3f7f6a', opacity: 0.12 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.2 },
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'sphere', colorscheme: 'Jmol', radius: 0.36 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'stick', color: '#ff2d78', radius: 0.22 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.4 },
        { select: { chain: 'A', resi: 192 }, style: 'stick', color: '#ffcc00', radius: 0.18 },
      ],
      labels: [
        { select: { chain: 'A', resn: 'NAI', hetflag: true }, text: 'NADH', color: '#9ae6b4' },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Substrat', color: '#ff2d78' },
        { select: { chain: 'A', resi: 192 }, text: 'His192', color: '#ffcc00' },
      ],
      zoomTo: { chain: 'A', resn: ['OXM', 'NAI'], hetflag: true },
    },
    role: {
      uz: "Reaksiyaning o'zi shu yerda sodir bo'ladi. NADH ning nikotinamid halqasidagi C4 uglerodi \"ortiqcha\" vodorodni hidrid (H⁻ — proton + 2 elektron) sifatida olib yuradi. U piruvatning C2 karbonil uglerodiga uzatiladi; ayni vaqtda His192 kislorodga H⁺ beradi. Ikki uzatish bir qadamda, bir vaqtda ketadi — erkin H⁻ hech qachon mavjud bo'lmaydi. Nikotinamid halqasi hidridni yo'qotgach aromatik piridiniy (NAD⁺) ga aylanadi — aynan shu aromatiklikning tiklanishi reaksiyani energetik jihatdan tortadi. LDH A-tomon (pro-R) xos: hidrid halqaning faqat bitta yuzidan uzatiladi, shuning uchun mahsulot faqat L-laktat.",
      en: 'This is where the reaction itself happens. The C4 carbon of the NADH nicotinamide ring carries the "extra" hydrogen as a hydride (H⁻ — a proton plus two electrons). It transfers to the C2 carbonyl carbon of pyruvate while His192 simultaneously hands H⁺ to the oxygen. Both transfers happen in one concerted step — a free H⁻ never exists. Having lost the hydride, the nicotinamide ring becomes the aromatic pyridinium of NAD⁺, and regaining that aromaticity is what pulls the reaction energetically. LDH is A-side (pro-R) specific: the hydride leaves from only one face of the ring, which is why the product is exclusively L-lactate.',
    },
    pathology: [
      {
        name: { uz: 'Laktatatsidoz (A tip) — gipoksiya va shok', en: 'Lactic acidosis (type A) — hypoxia and shock' },
        text: {
          uz: "Kislorod yetishmasa mitoxondriya NADH ni oksidlay olmaydi, NADH/NAD⁺ nisbati keskin ko'tariladi va LDH reaksiyani to'xtovsiz o'ngga (laktat tomonga) haydaydi — bu glikolizni davom ettirish uchun NAD⁺ ni tiklashning yagona yo'li. Natijada laktat > 4 mmol/L, anion tirqishi kengaygan metabolik atsidoz. Sepsis, shok, ishemiya, og'ir anemiya — klassik sabablari.",
          en: 'Without oxygen the mitochondria cannot reoxidize NADH, the NADH/NAD⁺ ratio climbs, and LDH drives the reaction relentlessly to the right — the only way to regenerate NAD⁺ and keep glycolysis running. The result is lactate > 4 mmol/L with a wide anion-gap metabolic acidosis. Sepsis, shock, ischaemia and severe anaemia are the classic causes.',
        },
      },
      {
        name: { uz: 'Etanol: gipoglikemiya va laktatatsidoz', en: 'Ethanol: hypoglycaemia and lactic acidosis' },
        text: {
          uz: "Alkogol- va aldegiddegidrogenaza etanolni oksidlab, jigarda juda ko'p NADH hosil qiladi. Ko'tarilgan NADH/NAD⁺ nisbati piruvatni laktatga, oksaloatsetatni malatga suradi — glyukoneogenez uchun ikkala boshlang'ich modda ham yo'qoladi. Shuning uchun ochqorin holda ko'p ichgan bemorda och qolish gipoglikemiyasi + laktatatsidoz + ketoz birga uchraydi.",
          en: 'Alcohol and aldehyde dehydrogenase oxidize ethanol and generate a large NADH load in the liver. The raised NADH/NAD⁺ ratio pushes pyruvate to lactate and oxaloacetate to malate — removing both starting materials for gluconeogenesis. That is why a fasting patient after heavy drinking presents with hypoglycaemia, lactic acidosis and ketosis together.',
        },
      },
      {
        name: { uz: 'Metformin va B tip laktatatsidoz', en: 'Metformin and type B lactic acidosis' },
        text: {
          uz: "Metformin mitoxondriyaning I kompleksini tormozlaydi — NADH oksidlanishi sekinlashadi va yana o'sha NADH to'planishi yuz beradi, lekin kislorod yetarli bo'lsa ham (shuning uchun \"B tip\": to'qima gipoksiyasisiz). Buyrak yetishmovchiligida preparat to'planadi va xavf keskin oshadi — shuning uchun GFR pastida metformin taqiqlanadi.",
          en: 'Metformin inhibits mitochondrial complex I, slowing NADH oxidation and producing the same NADH build-up even when oxygen is adequate (hence "type B": no tissue hypoxia). In renal failure the drug accumulates and the risk rises sharply — which is why metformin is contraindicated at low GFR.',
        },
      },
    ],
    sources: [SRC_LEHNINGER, SRC_HARPER],
  },
  {
    id: 'clamp',
    short: { uz: 'Substrat ushlagichi', en: 'Substrate clamp' },
    label: { uz: 'Substrat ushlagichi: Arg168, Thr247, Asn137', en: 'Substrate clamp: Arg168, Thr247, Asn137' },
    pdbIds: ['1I10'],
    chem: 'arg-clamp',
    resi: [168, 247, 137],
    spec: {
      id: 'hs-clamp',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', color: '#8892a6', opacity: 0.12 },
        { select: { chain: 'A', resi: [168, 247, 137] }, style: 'stick', color: '#4fd1c5', radius: 0.22 },
        { select: { chain: 'A', resi: [168, 247, 137] }, style: 'sphere', color: '#4fd1c5', radius: 0.3 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'stick', color: '#ff2d78', radius: 0.22 },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.4 },
        { select: { chain: 'A', resi: 105 }, style: 'stick', color: '#ffa94d', radius: 0.16 },
      ],
      labels: [
        { select: { chain: 'A', resi: 168 }, text: 'Arg168', color: '#4fd1c5' },
        { select: { chain: 'A', resi: 247 }, text: 'Thr247', color: '#4fd1c5' },
        { select: { chain: 'A', resi: 137 }, text: 'Asn137', color: '#4fd1c5' },
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Oksamat', color: '#ff2d78' },
      ],
      zoomTo: { chain: 'A', resi: [168, 247, 137, 105] },
    },
    role: {
      uz: "Ferment nima uchun aynan piruvatni tanlashini va nima uchun mahsulot faqat L-laktat bo'lishini shu qism hal qiladi. Arg168 ning guanidiniy guruhi substratning karboksilati bilan ikki tishli tuz ko'prigini hosil qiladi (ikki N–H ikki kislorodga) — bu manfiy zaryadli 2-okso kislotani tanlab oladi. Thr247 gidroksili o'sha karboksilatga qo'shimcha vodorod bog'i beradi, Asn137 esa C2 kislorodini ushlaydi. Uchtasi birgalikda substratni bitta yo'nalishda qotiradi: C2 uglerod nikotinamid halqasiga faqat bir yuzi bilan qaraydi. Hidrid faqat shu tomondan kelgani uchun hosil bo'ladigan yangi kiral markaz har doim S (L) konfiguratsiyada bo'ladi — D-laktat hech qachon chiqmaydi.",
      en: 'This part decides why the enzyme picks pyruvate and why the product is only ever L-lactate. The Arg168 guanidinium makes a bidentate salt bridge to the substrate carboxylate (two N–H to two oxygens), selecting for a negatively charged 2-oxo acid. The Thr247 hydroxyl adds a further hydrogen bond to that carboxylate, and Asn137 holds the C2 oxygen. Together they freeze the substrate in one orientation, with the C2 carbon presenting a single face to the nicotinamide ring. Because the hydride can only arrive from that face, the new chiral centre is always S (L) — D-lactate is never produced.',
    },
    pathology: [
      {
        name: { uz: 'Oksamat: ushlagich ishlaganini isbotlaydi', en: 'Oxamate: proof the clamp works' },
        text: {
          uz: "Bu strukturada ushlagichda o'tirgan modda piruvat emas — oksamat (piruvatning metil guruhi NH₂ ga almashtirilgan o'xshashi). U aynan o'sha karboksilat bilan bog'lanadi, lekin qaytarilmaydi — shuning uchun raqobatli ingibitor va kristallografiyada reaksiyani \"to'xtatib turish\" uchun ishlatiladi. Shu tamoyildan kelib chiqib, LDHA ga qarshi o'smaga qarshi birikmalar ishlab chiqilmoqda.",
          en: 'The molecule sitting in the clamp in this structure is not pyruvate but oxamate — pyruvate with its methyl replaced by NH₂. It binds through the same carboxylate contacts but cannot be reduced, making it a competitive inhibitor and the standard way to freeze the reaction for crystallography. The same principle underlies anti-tumour LDHA inhibitors in development.',
        },
      },
      {
        name: { uz: 'D-laktat atsidozi', en: 'D-lactic acidosis' },
        text: {
          uz: "Inson LDH si faqat L-laktat bilan ishlaydi — ushlagich D-izomerni to'g'ri joylashtira olmaydi. Qisqa ichak sindromi yoki bariatrik operatsiyadan keyin so'rilmagan uglevodlarni yo'g'on ichak bakteriyalari bijg'itib, D-laktat hosil qiladi. Odam uni deyarli parchalay olmaydi: nevrologik simptomlar (chalkashlik, dizartriya, ataksiya) + anion tirqishi kengaygan atsidoz paydo bo'ladi, LEKIN oddiy laborator \"laktat\" tahlili (u L-laktatni o'lchaydi) NORMAL chiqadi. Klassik tuzoq.",
          en: 'Human LDH works only on L-lactate — the clamp cannot seat the D isomer correctly. After short bowel syndrome or bariatric surgery, colonic bacteria ferment unabsorbed carbohydrate into D-lactate, which humans can barely metabolize: neurological symptoms (confusion, dysarthria, ataxia) with a wide anion-gap acidosis, BUT a normal routine lactate assay, because that assay measures L-lactate. A classic trap.',
        },
      },
    ],
    sources: [SRC_READ, SRC_UNIPROT, SRC_HARPER],
  },
  {
    id: 'isoform',
    short: { uz: 'Izoferment', en: 'Isoenzyme' },
    label: { uz: 'Subbirlik chegarasi va izofermentlar', en: 'Subunit interface and isoenzymes' },
    pdbIds: ['1I10'],
    chem: 'isoenzymes',
    // Tetramerning o'zi emas, uning BITTA JUFTLIGI (A va B) — chegara yuzasi
    // faqat shunda ko'rinadi. To'liq tetramer "Izofermentlar" sahnasida.
    spec: {
      id: 'hs-isoform',
      layers: [
        { select: { chain: 'A' }, style: 'cartoon', color: '#2b6cb0' },
        { select: { chain: 'B' }, style: 'cartoon', color: '#d69e2e' },
        { select: { chain: ['C', 'D'] }, style: 'cartoon', color: '#39414f', opacity: 0.25 },
        { select: { chain: ['A', 'B'], resn: 'OXM', hetflag: true }, style: 'sphere', color: '#ff2d78', radius: 0.55 },
      ],
      surfaces: [
        { select: { chain: 'A' }, kind: 'VDW', color: '#2b6cb0', opacity: 0.34 },
        { select: { chain: 'B' }, kind: 'VDW', color: '#d69e2e', opacity: 0.34 },
      ],
      labels: [
        { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'H yoki M — o\'rin bir xil', color: '#90cdf4' },
        { select: { chain: 'B', resn: 'OXM', hetflag: true }, text: 'qo\'shni subbirlik', color: '#f6d365' },
      ],
      zoomTo: { chain: ['A', 'B'] },
    },
    role: {
      uz: "LDHA (M) va LDHB (H) subbirliklari 75% ga o'xshash va bir xil burmaga ega — shuning uchun ular bir tetramerda erkin aralasha oladi va 5 ta izoferment hosil bo'ladi. Farq faol markazning tashqi qatlamidagi bir necha qoldiqda: H-subbirlikning piruvatga Km si past va u piruvat ortiqchasida o'zini tormozlaydi, shuning uchun reaksiyani laktat → piruvat tomonga (aerob yurak uchun yoqilg'i) olib boradi; M-subbirlik yuqori piruvat konsentratsiyasiga chidaydi va piruvat → laktat tomonga ishlaydi (anaerob mushak). Ya'ni bitta reaksiya, lekin to'qimaga qarab qaysi tomonga ketishi tanlanadi.",
      en: 'The LDHA (M) and LDHB (H) subunits are ~75% identical and share the same fold, so they mix freely within one tetramer, giving five isoenzymes. The difference lies in a few residues on the outer shell of the active site: the H subunit has a low Km for pyruvate and is inhibited by excess pyruvate, so it runs lactate → pyruvate (fuel for the aerobic heart); the M subunit tolerates high pyruvate and runs pyruvate → lactate (anaerobic muscle). One reaction, but which way it goes is set by the tissue.',
    },
    pathology: [
      {
        name: { uz: 'Miokard infarkti — LDH "flip"', en: 'Myocardial infarction — the LDH flip' },
        text: {
          uz: "Normada zardobda LDH2 > LDH1. Yurak mushagi nekrozga uchraganda H-boy izofermentlar qonga chiqadi va nisbat teskarilanadi: LDH1 > LDH2. 12–24 soatda paydo bo'ladi, 2–3 kunda cho'qqiga chiqadi, 7–10 kun saqlanadi — shuning uchun kech kelgan bemorda foydali edi. Bugun troponin I/T undan sezgirroq va tezroq, LDH flip amaliyotdan chiqqan, lekin izoferment mantig'ining eng yaxshi misoli bo'lib qolgan.",
          en: 'Normally LDH2 > LDH1 in serum. When cardiac muscle necroses, H-rich isoenzymes enter the blood and the ratio inverts: LDH1 > LDH2. It appears at 12–24 h, peaks at 2–3 days and persists for 7–10 days, which made it useful in late-presenting patients. Troponin I/T is now more sensitive and faster, and the LDH flip has left practice — but it remains the best illustration of isoenzyme logic.',
        },
      },
      {
        name: { uz: 'Gemoliz va o\'sma lizis sindromi', en: 'Haemolysis and tumour lysis syndrome' },
        text: {
          uz: "Eritrotsitlar LDH ga juda boy (LDH1/LDH2). Ular parchalanganda umumiy LDH keskin ko'tariladi — intravaskulyar gemoliz uchun LDH↑ + gaptoglobin↓ + bilvosita bilirubin↑ klassik uchlik. O'sma lizis sindromida ham xuddi shu: LDH↑, K⁺↑, fosfat↑, urat↑, Ca²⁺↓. Diqqat: qon olishda gemoliz bo'lsa (yomon venepunksiya) LDH yolg'on yuqori chiqadi.",
          en: 'Red cells are very rich in LDH (LDH1/LDH2). When they lyse, total LDH rises sharply — LDH↑ with haptoglobin↓ and indirect bilirubin↑ is the classic triad of intravascular haemolysis. Tumour lysis syndrome does the same: LDH↑, K⁺↑, phosphate↑, urate↑, Ca²⁺↓. Note: in-vitro haemolysis from a difficult venepuncture gives a falsely high LDH.',
        },
      },
      {
        name: { uz: 'Onkologiya: Varburg effekti va prognoz', en: 'Oncology: the Warburg effect and prognosis' },
        text: {
          uz: "O'sma hujayrasi kislorod bor bo'lsa ham glikolizga suyanadi va HIF-1α hamda MYC orqali LDHA ni kuchaytiradi — bu unga tez o'sish uchun NAD⁺ va qurilish materiali beradi, ajralgan laktat esa atrof muhitni kislotalantirib, immun hujayralarni bo'g'adi. Amaliy natija: yuqori zardob LDH melanoma, limfoma va boshqa bir qator o'smalarda mustaqil yomon prognostik omil bo'lib, bosqichlash tizimlariga kiritilgan.",
          en: 'A tumour cell leans on glycolysis even with oxygen present and upregulates LDHA through HIF-1α and MYC — giving it NAD⁺ and building blocks for rapid growth, while the exported lactate acidifies the microenvironment and suppresses immune cells. Practically: high serum LDH is an independent adverse prognostic factor in melanoma, lymphoma and several other tumours, and is built into their staging systems.',
        },
      },
    ],
    sources: [SRC_READ, SRC_HARPER],
  },
]

export const ldhModule: Module = {
  id: 'ldh',
  title: { uz: 'Laktatdegidrogenaza', en: 'Lactate dehydrogenase' },
  subtitle: { uz: 'LDH · EC 1.1.1.27', en: 'LDH · EC 1.1.1.27' },
  sources: [
    `PDB 1I10, 1I0Z — ${SRC_READ}. DOI: 10.1002/1097-0134(20010501)43:2<175::aid-prot1029>3.0.co;2-#`,
    SRC_UNIPROT,
    SRC_LEHNINGER,
    SRC_HARPER,
  ],
  scenes,
  hotspots,
}
