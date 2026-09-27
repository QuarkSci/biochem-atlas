# Biochem Atlas — loyiha holati (Claude uchun qo'llanma)

> Bu fayl loyihaning **to'liq boshlang'ich konteksti**. Kod hali yozilmagan —
> bu reja + qarorlar + kontent. Foydalanuvchi (MuhammadYusuf) o'zbek tilida
> yozadi, javoblar o'zbek tilida. Kod izohlari ingliz tilida.
>
> Yaratilgan: 2026-09-27 (chat sessiyasida, kod yozilmasdan oldin).
> Holat: **PDB ID'lar tasdiqlandi (2026-09-27), Faza 0 boshlandi.**

## 0. YANGI SESSIYADA BIRINCHI QADAMLAR (shu tartibda)

1. Shu faylni to'liq o'qing, keyin `PLAN.md`.
2. `~/Documents/Loyihalar/neuro-atlas/CLAUDE.md` ni ham o'qing — bu loyiha
   uning skeletidan ko'chiriladi, konvensiyalar o'sha yerda.
3. Faza 0 hali bajarilmagan bo'lsa (`package.json` yo'q) — 3-bo'limdagi
   "Faza 0 retsepti"dan boshlang.
4. PDB fayllari `data/raw/` da bormi tekshiring. Yo'q bo'lsa:
   `bash pipeline/fetch.sh` (internet kerak, foydalanuvchining o'z
   terminalida ishlaydi).
5. Dev server: `npm run dev` → http://localhost:3021 (**3021**; falcon 3017,
   neuro 3019 band).

## 1. Loyiha nima

**Biochem Atlas** — biokimyo molekulalarining interaktiv 3D exploreri.
falcon-atlas va neuro-atlas'ning uchinchi aka-ukasi: bir xil stek, bir xil
UI tizimi, bir xil ishlash uslubi.

Maqsad ikki tomonlama:
1. **O'qish uchun** — TDTU biokimyo mavzularini mexanizm darajasida ko'rsatish
   (TMI taqdimotlariga QR bilan ulanadi).
2. **Text-to-Code prototipi uchun** — modul = JSON ma'lumot fayli, dvigatel
   uni o'qib interaktiv 3D sahna chiqaradi. Ya'ni "matn kiradi, interaktiv
   vizualizatsiya chiqadi" g'oyasining ishlaydigan namunasi.

Papka: `/Users/apple/Documents/Loyihalar/biochem-atlas`
Repo (yaratilishi kerak): `QuarkSci/biochem-atlas`
Pages: `https://quarksci.github.io/biochem-atlas/` — `VITE_BASE=/biochem-atlas/`

## 2. Stek va asosiy arxitektura qarori

Stek neuro-atlas'dan **o'zgarmagan holda** ko'chadi:
Vite 8 + React 19 + TS (strict) + Three.js 0.186 (xom, r3f EMAS) +
Tailwind 4 + shadcn (minimal) + zustand 5 + lucide-react + Liquid Glass CSS.

### Render qatlami — ENG MUHIM QAROR

Muammo: Three.js `PDBLoader` faqat atom-shar va bog'-tayoqcha beradi.
LDH tetrameri ~10 000 atom — atom darajasida ko'rish mumkin emas. Oqsil
uchun **ribbon/cartoon** kerak, u esa ikkilamchi strukturani hisoblab
(DSSP/P-SEA), spline bo'ylab geometriya qurishni talab qiladi.

Yechim: render qatlamini interfeys ortiga yashirish.

```ts
// src/scene/renderer.ts
export interface StructureRenderer {
  load(id: string, source: ArrayBuffer | string): Promise<void>
  applyScene(spec: SceneSpec): void          // select + style + color + camera
  pick(x: number, y: number): PartId | null
  snapshot(state: AtlasState): void          // zustand store bilan bog'lanish
  dispose(): void
}
```

**1-adapter (hozir): `Mol3DRenderer`** — 3Dmol.js. Cartoon, surface, faol
markaz tanlash tayyor. O'z canvas'ini boshqaradi. Bu hiyla emas: 3Dmol
aynan molekulyar struktura uchun yozilgan, RCSB sayti ham Mol* ishlatadi.

**2-adapter (IELTS'dan keyin): `ThreeRenderer`** — `pipeline/` ribbon
mesh'ni oldindan pishirib GLB qiladi (biotite: ikkilamchi struktura →
spline → GLB), `MoleculeScene` uni neuro-atlas'dagi miya mesh'lari kabi
yuklaydi. Stek 100% toza bo'ladi.

**Interfeys shu bosqichda to'g'ri qo'yilsa, ikkinchi adapterga o'tish faqat
bitta faylni almashtirish bo'ladi** — UI, store, i18n, kontent tegilmaydi.
Interfeys qo'yilmasa, keyin hammasi qayta yoziladi. Shuning uchun Faza 0'da
`renderer.ts` interfeysi kod yozishdan OLDIN yoziladi.

## 3. Papka tuzilmasi (reja) va Faza 0 retsepti

```
biochem-atlas/
  pipeline/
    fetch.sh              — PDB fayllarni RCSB'dan yuklaydi → data/raw/
    README.md             — retsept, URL'lar, tekshirilgan sana
  data/raw/               — .pdb fayllar (GITIGNORE'da)
  public/structures/      — ishlov berilgan fayllar (GITIGNORE'da)
  src/
    data/
      types.ts            — Module, SceneSpec, Selection, Part, L10n
      modules/ldh.ts      — 1-modul: LDH (5-bo'limga qarang)
      content/ldh.uz.ts   — uz matnlar
      content/ldh.en.ts   — en matnlar
      index.ts            — MODULES ro'yxati
    scene/
      renderer.ts         — StructureRenderer interfeysi (BIRINCHI YOZILADI)
      Mol3DRenderer.ts    — 3Dmol adapteri
      MoleculeScene.ts    — sahna boshqaruvi (neuro BrainScene'ga o'xshash)
      SceneView.tsx       — React ko'prigi, store bilan snapshot()
      materials.ts, PointerTap.ts — neuro'dan ko'chiriladi
    ui/                   — neuro-atlas'dan TO'LIQ ko'chiriladi
    i18n/                 — neuro'dan ko'chiriladi, matnlar almashtiriladi
    store/useAtlas.ts     — neuro'dan, rejimlar moslashtiriladi
    index.css             — neuro'dan O'ZGARMAGAN holda (Liquid Glass)
  scripts/shot.mjs        — neuro'dan ko'chiriladi
  .claude/launch.json     — port 3021
  CLAUDE.md, PLAN.md, README.md
```

### Faza 0 retsepti (~40 daqiqa)

1. `cp -r` bilan neuro-atlas'dan ko'chirish: `src/ui`, `src/i18n`,
   `src/store`, `src/index.css`, `src/lib`, `src/components`,
   `scripts/shot.mjs`, `tsconfig*.json`, `vite.config.ts` (port → 3021,
   base → `/biochem-atlas/`), `.github/workflows/deploy.yml`,
   `components.json`, `.gitignore` (+ `data/raw/`, `public/structures/`).
2. `package.json` — neuro'dan, nomi `biochem-atlas`, `three-mesh-bvh` olib
   tashlanadi, `3dmol` qo'shiladi. `npm install`.
3. `src/scene/renderer.ts` — interfeysni YOZING (kod yozishdan oldin).
4. `bash pipeline/fetch.sh` — PDB olinadi.
5. `Mol3DRenderer` + `MoleculeScene` + `SceneView` — bitta struktura ekranda
   aylanib turishi kifoya. Sahnalar hali yo'q.
6. **Brauzerda screenshot bilan tasdiqlang** (11-bo'lim qoidasi).

## 4. Ikki qattiq cheklov (2026-09-27 da tekshirilgan)

1. **RCSB sandbox'lardan bloklangan.** Cloud konteynerdan ham, Cowork'ning
   izolyatsiyalangan VM'idan ham `https://files.rcsb.org` → HTTP 403 (proxy).
   Sizning o'z mac terminalingizda esa ishlaydi. Shuning uchun PDB olish
   `pipeline/fetch.sh` orqali, **foydalanuvchi qo'li bilan** bajariladi —
   neuro-atlas'da `data/raw/` bilan aynan shunday qilingan.
   Zaxira yo'l: sahifa runtime'da RCSB'dan ham olishi mumkin (internet bor
   joyda), lekin auditoriyada internetga tayanmaslik kerak.
2. **Headless screenshot Cowork VM'da ishlamaydi** — chromium yo'q.
   Claude Code'da mahalliy Puppeteer bilan ishlaydi, muammo yo'q.

## 5. 1-MODUL: LDH (laktatdegidrogenaza)

### PDB strukturalari — TASDIQLANDI (2026-09-27, RCSB'da to'g'ridan-to'g'ri tekshirilgan)

- **1I10** — HUMAN MUSCLE L-LACTATE DEHYDROGENASE M CHAIN (LDHA, UniProt
  P00338), ternar kompleks NADH+oksamat bilan, 2.30 Å. Asimmetrik birlikda
  ZUDLAB 2 ta to'liq tetramer bor: A,B,C,D va E,F,G,H (identity transform —
  simmetriya kerak emas, to'g'ridan-to'g'ri shu 4 zanjirni tanlash kifoya).
- **1I0Z** — HUMAN HEART L-LACTATE DEHYDROGENASE H CHAIN (LDHB, UniProt
  P07195), xuddi shu maqoladan (Read et al. 2001, *Proteins* 43:175-185),
  xuddi shu NADH+oksamat ligandlari bilan, 2.10 Å. Faylda faqat A,B zanjir
  bor — to'liq tetramer uchun kristallografik 2-marta simmetriya kerak;
  RCSB'ning `1I0Z.pdb1` (biologik assambleya) fayli buni 2 ta MODEL sifatida
  beradi (har birida A,B) — 3Dmol multi-model sifatida yuklaydi yoki
  pipeline'da zanjirlar C,D deb qayta nomlanib bitta modelga birlashtiriladi.

**MUHIM: PDB fayl raqamlashi UniProt'dan −1 siljigan** (boshlang'ich Met
olib tashlangan). Sahna spetsifikatsiyalarida (`SceneSpec` qoldiq tanlovi)
**PDB fayl raqamlashi** ishlatiladi, UniProt emas.

**Faol markaz qoldiqlari (1I10, PDB fayl raqamlashi, tekshirilgan —
UniProt FT jadvali + PDB koordinatalaridan hisoblangan masofalar):**

| Qoldiq (PDB #) | UniProt # | Rol | Masofa OXM ligandigacha |
|---|---|---|---|
| His192 | His193 | proton qabul qiluvchi (ACT_SITE) | 2.90 Å |
| Arg105 | Arg106 | substrat karboksilini ushlaydi | 2.89 Å |
| Arg168 | Arg169 | substrat karboksilini ushlaydi | 2.72 Å |
| Thr247 | Thr248 | substrat bilan bog'lanadi | 2.72 Å |
| **Asp165** | **Asp166** | His192'ni yo'naltiradi (H-bog' 2.64 Å) | 5.71 Å (bilvosita) |

**TUZATISH:** avvalgi qoralamada "Asp168" deb yozilgan edi — bu XATO edi
(pozitsiya 168 aslida Ala). To'g'risi **Asp165** (PDB #) / **Asp166**
(UniProt #), His192 imidazoliga 2.64 Å'da H-bog' bilan bog'langan holda
tekshirilgan (klassik LDH katalitik dyad geometriyasi).

### Sahnalar

| # | id | Tanlov / uslub | Nima ko'rsatadi |
|---|---|---|---|
| 1 | `quaternary` | 4 zanjir, cartoon, zanjir bo'yicha rang | To'rtlamchi struktura — tetramer |
| 2 | `subunit` | Zanjir A, cartoon, ikkilamchi struktura bo'yicha rang | Rossmann burmasi, NAD-bog'lovchi domen |
| 3 | `active-site` | His193, Arg106, Arg169, Asp168, Thr248 — stick; atrof surface | Faol markaz geometriyasi |
| 4 | `cofactor` | NADH (HETATM) — sphere; atrof cartoon shaffof | Kofaktor qanday o'tiradi |
| 5 | `isoenzymes` | **SXEMATIK** — H/M kombinatsiyalari | 5 izoferment |
| 6 | `clinical` | LDH1 va LDH5 yonma-yon | To'qima taqsimoti → infarkt "flip" |

**Qoldiq raqamlari (His193, Arg106, Asp168, Arg169, Thr248) turga va
izoformaga qarab siljiydi.** Tanlangan PDB yozuvining SEQRES'iga solishtirib
tekshiring — dogfish/cho'chqa M4 LDH adabiyotida His195, Arg171, Arg109 deb
uchraydi. Noto'g'ri qoldiqni ajratib ko'rsatish — eng ko'rinadigan xato.

**5-sahna haqida halol ogohlantirish:** geteroтetramerlar (LDH2, LDH3, LDH4)
uchun PDB'da struktura YO'Q — faqat gomotetramerlar kristallangan. Ya'ni
5-sahna real struktura emas, sxematik. Modulda `schematic: true` bilan
belgilanadi va UI'da "sxematik" yorlig'i ko'rinadi. Buni yashirish — butun
loyihaning ilmiy ishonchliligini yo'qotish.

### Kontent (uz) — Inspector matnlari uchun xomaki

- **Tetramer.** LDH to'rt subbirlikdan iborat. Ikki xil subbirlik bor:
  H (LDHB geni) va M (LDHA geni). To'rtta o'rinni ikki xil subbirlik bilan
  to'ldirsak beshta kombinatsiya chiqadi — beshta izoferment.
- **Rossmann burmasi.** Har bir subbirlikda NAD(H) bog'lovchi domen —
  beta-varaq va alfa-spiral navbatlashuvidan iborat klassik burma. Bu burma
  degidrogenazalarning umumiy belgisi.
- **Faol markaz.** His — proton beruvchi/qabul qiluvchi; Arg qoldiqlari
  substratning karboksil va karbonil guruhlarini ushlab turadi; Asp His'ni
  to'g'ri yo'naltiradi. Reaksiya: piruvat + NADH -> laktat + NAD+.
- **Izofermentlar.** Yurakda, eritrotsitda va buyrakda H ustun (LDH1 ko'p);
  jigar va skelet muskulida M ustun (LDH5 ko'p). Fetal to'qimalarda M ustun,
  keyin har organ o'z spektrini shakllantiradi — ontogenez.
- **Klinik.** Normada qonda LDH2 > LDH1. Miokard infarktida nisbat teskari
  bo'ladi ("flip"), chunki yurakda H-subbirlik ustun. Hozirgi standart
  marker troponin (ferment emas) — LDH izofermentlari tarixiy ahamiyatga
  ega, lekin izoferment tushunchasining eng yaxshi misoli.
- **Kinetika.** Izofermentlarning Km'i farq qiladi — shuning uchun bir
  reaksiyani katalizlashiga qaramay, har biri o'z to'qimasining ehtiyojiga
  moslashgan.

Manbalar (`sources`): PDB yozuvi + Lehninger 8-nashr + Harper's.
Har bir yozuvda `sources` maydoni bo'lishi SHART (neuro-atlas qoidasi).

## 6. Keyingi modullar (IELTS'dan keyin)

| Modul | Nega qiziq | Strukturalar |
|---|---|---|
| Gemoglobin allosteriyasi | T→R morfing kooperativlikni ko'z bilan ko'rsatadi; Bohr effekti, 2,3-BPG, o'roqsimon anemiya | deoxy (T) va oxy (R) — ID'larni tasdiqlash kerak |
| Na+/K+-ATFaza | Biomembranalar mavzusi, E1/E2 konformatsiyalari | ID'larni tasdiqlash kerak |
| ATF-sintaza | Rotor mexanizmi — eng ta'sirli animatsiya | ID'larni tasdiqlash kerak |
| Serin proteaza | Katalitik triada, mexanizm atom darajasida | ID'larni tasdiqlash kerak |

Ikkinchi modul 2 soat emas, ~20 daqiqa olishi kerak — agar dvigatel
to'g'ri qurilgan bo'lsa, faqat JSON yoziladi. Agar ikkinchi modul yana
bir necha soat olsa — arxitektura xato, to'xtab qayta ko'rib chiqing.

## 7. Ishlash uslubi (falcon/neuro'dan meros)

- **"Perfektlik vaqtdan ustun"** — foydalanuvchining so'zma-so'z talabi.
- **Har vizual o'zgarish HAQIQIY brauzerda screenshot bilan tasdiqlanadi.**
  Faraz qilib "ishlaydi" deb yozmaslik.
- Commit'dan oldin: `npx tsc -p tsconfig.app.json --noEmit` va
  `npm run build` — ikkalasi toza o'tishi shart.
- `rm -rf dist` — har doim commit'dan oldin.
- Commit xabarlari o'zbek tilida, batafsil: nima o'zgargani va NEGA.
- Screenshot olishdan oldin fresh reload (`?v=N`), Vite HMR eski instance
  saqlab qolishi mumkin.
