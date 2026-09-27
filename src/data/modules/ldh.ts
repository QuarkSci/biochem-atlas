import type { Module } from '@/data/types'

// Faol markaz qoldiqlari — PDB fayl raqamlashi (UniProt'dan -1 siljigan,
// CLAUDE.md 5-bo'lim). Chain A, 1I10 (LDHA/M-zanjir).
export const ACTIVE_SITE_RESI = [192, 105, 168, 247, 165]

// Har bir faol markaz qoldig'i uchun: 3D'dagi rang bilan bir xil (stick
// rangi), ketma-ketlik panelida ham shu rang bilan ajratiladi.
export const ACTIVE_SITE_INFO: Record<number, { name: string; color: string }> = {
  192: { name: 'His192', color: '#ffcc00' },
  105: { name: 'Arg105', color: '#4fd1c5' },
  168: { name: 'Arg168', color: '#4fd1c5' },
  247: { name: 'Thr247', color: '#f97066' },
  165: { name: 'Asp165', color: '#a78bfa' },
}

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

export const ldhModule: Module = {
  id: 'ldh',
  title: { uz: 'Laktatdegidrogenaza (LDH)', en: 'Lactate dehydrogenase (LDH)' },
  sources: [
    'PDB 1I10, 1I0Z — Read J.A. et al. (2001) "Structural basis for altered activity of M- and H-isozyme forms of human lactate dehydrogenase." Proteins 43:175-185. DOI: 10.1002/1097-0134(20010501)43:2<175::aid-prot1029>3.0.co;2-#',
    'Lehninger Principles of Biochemistry, 8-nashr, 15-bob (Glikoliz)',
    "Harper's Illustrated Biochemistry, LDH izofermentlari bo'limi",
  ],
  scenes: [
    {
      id: 'quaternary',
      pdbId: '1I10',
      label: { uz: "To'rtlamchi struktura", en: 'Quaternary structure' },
      spec: {
        id: 'ldh-quaternary',
        layers: [{ select: { chain: ['A', 'B', 'C', 'D'] }, style: 'cartoon', colorscheme: 'chain' }],
        zoomTo: { chain: ['A', 'B', 'C', 'D'] },
      },
      description: {
        uz: 'LDH — 4 ta subbirlikdan iborat tetramer. Har bir subbirlik mustaqil faol markazga ega, ya\'ni molekula bir vaqtda 4 ta reaksiyani katalizlay oladi. Subbirliklar orasidagi aloqa (zanjirlar bir-biriga tegib turishi) fermentning barqarorligini ta\'minlaydi. Bu yerda ko\'rinayotgan — inson mushak LDH (M-zanjir, LDHA geni) tetrameri, har bir zanjir alohida rangda.',
        en: 'LDH is a tetramer of 4 subunits. Each subunit has its own independent active site — the molecule can catalyze 4 reactions simultaneously. Inter-subunit contacts stabilize the quaternary fold. Shown here: the human muscle LDH (M subunit, LDHA gene) tetramer, each chain in a different color.',
      },
    },
    {
      id: 'subunit',
      pdbId: '1I10',
      label: { uz: 'Bitta subbirlik', en: 'Single subunit' },
      spec: {
        id: 'ldh-subunit',
        layers: [{ select: { chain: 'A' }, style: 'cartoon', colorscheme: 'ssPyMol' }],
        zoomTo: { chain: 'A' },
      },
      description: {
        uz: "Bitta zanjir ikkita domenga bo'linadi: N-terminal Rossmann burmasi (NAD(H) kofaktorni bog'laydi — beta-varaq va alfa-spiral navbatlashuvidan iborat klassik motif, ko'plab degidrogenazalarda uchraydi) va C-terminal domen (substrat bog'lash va tetramerlanish uchun). Rang ikkilamchi strukturani ko'rsatadi: spiral va varaqlar.",
        en: 'A single chain has two domains: the N-terminal Rossmann fold (binds the NAD(H) cofactor — the classic alternating beta-sheet/alpha-helix motif shared by many dehydrogenases) and the C-terminal domain (substrate binding and tetramerization). Color shows secondary structure: helices and sheets.',
      },
    },
    {
      id: 'active-site',
      pdbId: '1I10',
      label: { uz: 'Faol markaz', en: 'Active site' },
      spec: {
        id: 'ldh-active-site',
        layers: [
          { select: { chain: 'A' }, style: 'cartoon', color: '#8892a6', opacity: 0.18 },
          { select: { chain: 'A', resi: 192 }, style: 'stick', color: '#ffcc00' },
          { select: { chain: 'A', resi: [105, 168] }, style: 'stick', color: '#4fd1c5' },
          { select: { chain: 'A', resi: 247 }, style: 'stick', color: '#f97066' },
          { select: { chain: 'A', resi: 165 }, style: 'stick', color: '#a78bfa' },
          { select: { chain: 'A', resn: 'OXM', hetflag: true }, style: 'stick', color: '#ff2d78' },
        ],
        labels: [
          { select: { chain: 'A', resi: 192 }, text: 'His192', color: '#ffcc00' },
          { select: { chain: 'A', resi: 105 }, text: 'Arg105', color: '#4fd1c5' },
          { select: { chain: 'A', resi: 168 }, text: 'Arg168', color: '#4fd1c5' },
          { select: { chain: 'A', resi: 247 }, text: 'Thr247', color: '#f97066' },
          { select: { chain: 'A', resi: 165 }, text: 'Asp165', color: '#a78bfa' },
          { select: { chain: 'A', resn: 'OXM', hetflag: true }, text: 'Oksamat (substrat)', color: '#ff2d78' },
        ],
        zoomTo: { chain: 'A', resi: ACTIVE_SITE_RESI },
      },
      description: {
        uz: "Faol markaz geometriyasi (oksamat — substrat o'xshashi bilan, sariq/moviy/qizil/binafsha tayoqchalar): His192 (sariq) — proton qabul qiluvchi/beruvchi, piruvat↔laktat aylanishida kalit rol; Arg105 va Arg168 (moviy-yashil) — substratning karboksil guruhini ushlab turadi; Thr247 (qizil) — substrat bilan bog'lanadi; Asp165 (binafsha) — His192 imidazolini to'g'ri yo'naltiradi (H-bog' 2.64 Å — ushbu strukturada o'lchab tasdiqlangan). Reaksiya: piruvat + NADH + H⁺ ⇌ laktat + NAD⁺.",
        en: 'Active site geometry (oxamate — a substrate mimic — with yellow/teal/red/purple sticks): His192 (yellow) — proton acceptor/donor, key to the pyruvate↔lactate interconversion; Arg105 and Arg168 (teal) — clamp the substrate carboxylate; Thr247 (red) — substrate contact; Asp165 (purple) — orients the His192 imidazole (H-bond at 2.64 Å, measured directly in this structure). Reaction: pyruvate + NADH + H⁺ ⇌ lactate + NAD⁺.',
      },
    },
    {
      id: 'cofactor',
      pdbId: '1I10',
      label: { uz: 'Kofaktor (NADH)', en: 'Cofactor (NADH)' },
      spec: {
        id: 'ldh-cofactor',
        layers: [
          { select: { chain: 'A' }, style: 'cartoon', color: '#4fa385', opacity: 0.28 },
          { select: { chain: 'A', resn: 'NAI', hetflag: true }, style: 'stick' },
        ],
        labels: [{ select: { chain: 'A', resn: 'NAI', hetflag: true }, text: 'NADH (kofaktor)' }],
        zoomTo: { chain: 'A', resn: 'NAI', hetflag: true },
      },
      description: {
        uz: "NADH (rasmda NAI kodi bilan) Rossmann burmasining ichiga cho'kkan holda o'tiradi — adenin va nikotinamid uchlari ikki tomonga cho'ziladi. Nikotinamid halqasi faol markazga, substratga yaqin joylashadi: aynan shu halqadagi hidrid ion (H⁻) piruvatning karbonil uglerodiga o'tib, laktat hosil qiladi.",
        en: "NADH (shown under its ligand code NAI) sits nestled inside the Rossmann fold, its adenine and nicotinamide ends extending outward. The nicotinamide ring reaches into the active site next to the substrate: the hydride ion (H⁻) it carries transfers to pyruvate's carbonyl carbon, forming lactate.",
      },
    },
    {
      id: 'isoenzymes',
      pdbId: '1I10',
      label: { uz: 'Izofermentlar', en: 'Isoenzymes' },
      spec: {
        id: 'ldh-isoenzymes',
        schematic: true,
        layers: [{ select: { chain: ['A', 'B', 'C', 'D'] }, style: 'cartoon', colorscheme: 'chain' }],
        zoomTo: { chain: ['A', 'B', 'C', 'D'] },
      },
      description: {
        uz: "SXEMATIK: to'rtta o'rin ikki xil subbirlik (H — LDHB, M — LDHA) bilan to'ldirilsa, 5 ta kombinatsiya chiqadi — LDH1 (H4), LDH2 (H3M1), LDH3 (H2M2), LDH4 (H1M3), LDH5 (M4). PDB'da faqat gomotetramerlar (H4 va M4) kristallangan — geterotetramerlar uchun haqiqiy struktura yo'q, shuning uchun bu yerda ko'rinayotgan M4 faqat vizual kontekst, aralash izofermentlarning haqiqiy geometriyasi emas.",
        en: 'SCHEMATIC: filling the four positions with two subunit types (H = LDHB, M = LDHA) gives 5 combinations — LDH1 (H4), LDH2 (H3M1), LDH3 (H2M2), LDH4 (H1M3), LDH5 (M4). Only the homotetramers (H4 and M4) have been crystallized — no real structure exists for the heterotetramers, so the M4 shown here is visual context only, not the actual geometry of the mixed isoenzymes.',
      },
    },
    {
      id: 'clinical',
      pdbId: '1I0Z',
      label: { uz: 'Klinik: LDH1 va LDH5', en: 'Clinical: LDH1 vs LDH5' },
      spec: {
        id: 'ldh-clinical',
        layers: [{ select: { chain: ['A', 'B', 'C', 'D'] }, style: 'cartoon', colorscheme: 'chain' }],
        zoomTo: { chain: ['A', 'B', 'C', 'D'] },
      },
      description: {
        uz: "Bu — LDH1 (H4, yurak/eritrotsit tipidagi tetramer, LDHB geni). Normada qonda LDH2 (H3M1) > LDH1. Miokard infarktida yurak hujayralari yorilib, H-boy izofermentlar qon oqimiga chiqadi — natijada LDH1 > LDH2 bo'lib qoladi (\"flip\" belgisi). Hozirgi standart marker troponin bo'lsa-da, bu \"flip\" izoferment tushunchasining klassik namunasi hisoblanadi.",
        en: 'This is LDH1 (H4, the heart/erythrocyte-type tetramer, LDHB gene). Normally LDH2 (H3M1) > LDH1 in serum. In myocardial infarction, ruptured cardiac cells release H-rich isoenzymes into the bloodstream, flipping the ratio so LDH1 > LDH2 (the classic "flip" sign). Troponin is the modern standard marker, but this flip remains the textbook example of isoenzyme diagnostics.',
      },
    },
  ],
}
