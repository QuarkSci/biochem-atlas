# Biochem Atlas — loyiha holati (Claude uchun qo'llanma)

> Yangi chatda ishni davom ettirish uchun shu faylni to'liq o'qing, keyin
> `PLAN.md`. Foydalanuvchi (MuhammadYusuf) o'zbek tilida yozadi, javoblar
> o'zbek tilida. Kod izohlari ingliz tilida. **Effort past — bu 7 fandan
> birining 6 mustaqil ishidan bittasi uchun, professional ko'rinsa kifoya,
> ortiqcha vaqt sarflamang.**
>
> Yaratilgan: 2026-09-27. Oxirgi yangilanish: 2026-09-28.
> Holat: **Faza 0 va Faza 1 tugadi.** LDH moduli — 6 sahna, uz/en kontent,
> 3D yorliqlar, aminokislotalar ketma-ketligi paneli, tetramerda zanjirga
> bosib yaqinlashish. Hammasi brauzerda (375×812 va 1440×900) tasdiqlangan,
> git toza, 6 ta commit. **Keyingi: Faza 2 — GitHub repo + Pages deploy +
> QR** (pastga qarang, 0-bo'lim 5-band).

## 0. YANGI SESSIYADA BIRINCHI QADAMLAR

1. Shu faylni to'liq o'qing, keyin `PLAN.md` (bosqichlar jadvali, xavflar,
   tugallanganlik mezoni — qisqa).
2. Holatni tekshiring: `git status` toza bo'lishi kerak, `git log --oneline`
   oxirgi commit "Fishka: tetramerda zanjirga bosish…" yoki undan keyingisi.
3. `npm install` (agar `node_modules` yo'q bo'lsa).
4. PDB fayllari `public/structures/1I10.pdb` va `1I0Z.pdb` diskda bormi
   tekshiring (gitignore'da, commit qilinmagan). Yo'q bo'lsa:
   ```bash
   bash pipeline/fetch.sh      # RCSB'dan data/raw/ ga (internet kerak)
   python3 pipeline/prepare.py  # data/raw/ dan public/structures/ ga tayyorlaydi
   ```
5. Dev server: `npm run dev` → **http://localhost:3021** (falcon 3017,
   neuro 3019 band — shular bilan to'qnashmasin). `preview_start` vositasi
   boshqa loyiha konfiguratsiyasini o'qib qolishi mumkin — shunda
   `npm run dev`ni fonda Bash bilan ishga tushirib `navigate` bilan oching.
6. Tekshiruv: agar foydalanuvchi brauzer pane'da o'zi ishlab turgan bo'lsa
   (masalan, viewport o'zi o'zgarib tursa) — pane'ni band qilmang, buning
   o'rniga headless ishlating:
   ```bash
   node scripts/shot.mjs /tmp/out.png --w 1000 --h 700 --wait 3000 \
     --setup "document.querySelectorAll('button').forEach(b=>{if(b.textContent.includes('Klinik')) b.click()})"
   ```
   (bu loyihaning `shot.mjs`si neuro-atlas'nikidan farqli — global store yo'q,
   shunchaki `networkidle0` + sobit kutish.)
7. Har commit oldidan: `npx tsc -p tsconfig.app.json --noEmit && npm run
   build && rm -rf dist`. Commit xabari o'zbekcha, batafsil (nima va NEGA),
   `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` bilan.
8. Har bosqich oxirida shu faylning holat qatorini (yuqorida) va `PLAN.md`
   jadvalini yangilang.

## 1. Loyiha nima

**Biochem Atlas** — biokimyo molekulalarining interaktiv 3D exploreri.
falcon-atlas va neuro-atlas'ning uchinchi aka-ukasi: umumiy dizayn tili
(Liquid Glass CSS), lekin **UI/store arxitekturasi mustaqil** — quyida
2-bo'limda nega tushuntirilgan.

Maqsad ikki tomonlama:
1. **O'qish uchun** — TDTU biokimyo mavzularini mexanizm darajasida
   ko'rsatish (TMI taqdimotlariga QR bilan ulanadi).
2. **Text-to-Code prototipi uchun** — modul = JSON ma'lumot fayli, dvigatel
   uni o'qib interaktiv 3D sahna chiqaradi.

Papka: `/Users/apple/Documents/Loyihalar/biochem-atlas`
Repo (hali yaratilmagan — Faza 2 ishi): `QuarkSci/biochem-atlas`
Pages (hali yo'q): `https://quarksci.github.io/biochem-atlas/` —
`VITE_BASE=/biochem-atlas/` (`.github/workflows/deploy.yml`da tayyor,
repo nomidan avtomatik oladi).

## 2. Stek va arxitektura qarori — REJADAN FARQ

Boshlang'ich reja neuro-atlas'ning `src/ui`, `src/store`, `src/i18n`
papkalarini to'liq ko'chirib olish edi. **Bu qilinmadi**: ular
neuro-atlasning `@/data` (Part/Layer/atlas-xos tuzilma) va zustand store'iga
chuqur bog'liq — LDH kabi molekula-markazli, kam sondagi sahnali modul
uchun mos kelmaydi (moslashtirish ko'chirishdan qimmatroq bo'lardi).
Buning o'rniga **`src/App.tsx` nolldan, yupqa va o'z holatini o'zi
boshqaradigan qilib yozildi** (`useState` — sceneIdx, lang, showSeq,
focusChain; store/zustand yo'q). Neuro'dan faqat quyidagilar ko'chirildi
o'zgarishsiz: `src/index.css` (Liquid Glass), `tsconfig*.json`,
`vite.config.ts` (port→3021), `.github/workflows/deploy.yml`,
`components.json`, `scripts/shot.mjs` (keyinchalik soddalashtirildi —
pastga qarang).

### Render qatlami — StructureRenderer interfeysi

Muammo: Three.js `PDBLoader` faqat atom-shar/bog'-tayoqcha beradi, LDH
tetrameri ~10&nbsp;000 atom — oqsil uchun ribbon/cartoon kerak (ikkilamchi
struktura hisoblash + spline geometriya). Yechim: render dvigatelini
interfeys ortiga yashirish — `src/scene/renderer.ts`:

```ts
export interface StructureRenderer {
  load(id: string, pdbText: string): Promise<void>
  applyScene(spec: SceneSpec): void
  onAtomClick(cb: (info: AtomClickInfo) => void): void   // zanjirga bosish uchun
  spin(on: boolean): void
  resize(): void
  dispose(): void
}
```

`SceneSpec` = `{id, layers[] (select+style+color+opacity), labels?
(3D suzuvchi yorliqlar), zoomTo?, schematic?}`. **Faqat `Mol3DRenderer.ts`
3Dmol.js tipini biladi** — hech qayerda boshqa faylga sizib chiqmagan
(dynamic import + `any` bilan izolyatsiya). Kelajakda `ThreeRenderer`
(pipeline'dan pishirilgan GLB ribbon, Faza 3) shu interfeysni implement
qilib, faqat bitta faylni almashtiradi.

**1-adapter (hozir, ishlaydi): `Mol3DRenderer`** — 3Dmol.js. Cartoon,
stick, faol markaz tanlash, 3D yorliqlar (`addLabel`), klik hodisalari
(`setClickable`) — hammasi ishlatilgan.

## 3. Hozirgi fayl tuzilmasi (haqiqiy, reja emas)

```
biochem-atlas/
  pipeline/
    fetch.sh              — 1I10.pdb, 1I0Z.pdb, 1I0Z.pdb1 RCSB'dan → data/raw/
    prepare.py             — data/raw/ → public/structures/ (1I0Z uchun
                              2-MODEL biologik assambleyani C,D zanjir
                              sifatida birlashtiradi, pastga qarang)
    README.md
  data/raw/                — .pdb xom fayllar (GITIGNORE'da)
  public/structures/        — Mol3DRenderer fetch qiladigan fayllar (GITIGNORE'da)
  src/
    data/
      types.ts             — Module, ModuleScene, L10nText
      modules/ldh.ts        — LDH moduli: 6 sahna + kontent + CHAIN_A_SEQUENCE +
                               ACTIVE_SITE_INFO (bitta manba — 3D yorliqlar VA
                               ketma-ketlik panelidagi ranglar shu yerdan)
    scene/
      renderer.ts            — StructureRenderer/SceneSpec/LabelSpec interfeysi
      Mol3DRenderer.ts        — 3Dmol adapteri (yagona joy — 3Dmol tipi bilinadi)
      MoleculeScene.ts        — yupqa boshqaruv qatlami
      SceneView.tsx           — React ko'prigi (fetch + mount + click passthrough)
    ui/
      SequenceStrip.tsx       — aminokislotalar ketma-ketligi paneli
    App.tsx                   — butun UI shu yerda: header, sahna tab'lari,
                                 yig'iladigan tavsif, til almashtirish,
                                 zanjir-fokus mantiqi
    index.css                 — neuro'dan o'zgarishsiz (Liquid Glass)
    main.tsx
  scripts/shot.mjs            — headless screenshot (soddalashtirilgan, __atlas'siz)
  .claude/launch.json         — port 3021
  index.html
  CLAUDE.md, PLAN.md, README.md
```

`src/ui`, `src/i18n`, `src/store`, `src/components` (neuro'dan) —
**YO'Q**, ataylab (yuqoriga qarang). `src/lib/utils.ts` bor (shadcn'ning
`cn()` helper'i, `components.json` uchun).

## 4. Ikki qattiq cheklov (2026-09-27 da tekshirilgan)

1. **RCSB sandbox'lardan bloklangan.** Cloud konteynerdan ham, Cowork VM'dan
   ham `https://files.rcsb.org` → HTTP 403 (proxy). Foydalanuvchining o'z
   mac terminalida ishlaydi — shuning uchun `pipeline/fetch.sh` **qo'lda**
   ishga tushiriladi (Claude Code sessiyasidan esa to'g'ridan-to'g'ri
   `curl -A "Mozilla/5.0"` ishlaydi — Bash tool orqali sinovdan o'tgan).
2. **Headless screenshot Cowork VM'da ishlamaydi** — chromium yo'q. Claude
   Code'da mahalliy Chrome + puppeteer-core bilan muammosiz.

## 5. 1-MODUL: LDH (laktatdegidrogenaza) — TO'LIQ TAYYOR

### PDB strukturalari — tasdiqlangan (2026-09-27, RCSB'da to'g'ridan-to'g'ri)

- **1I10** — HUMAN MUSCLE L-LACTATE DEHYDROGENASE M CHAIN (LDHA, UniProt
  P00338), NADH+oksamat ternar kompleks, 2.30&nbsp;Å. Asimmetrik birlikda
  ALLAQACHON 2 ta to'liq tetramer: A,B,C,D va E,F,G,H (identity transform).
- **1I0Z** — HUMAN HEART L-LACTATE DEHYDROGENASE H CHAIN (LDHB, UniProt
  P07195), xuddi shu 2001 maqoladan (Read et al., *Proteins* 43:175-185),
  xuddi shu ligandlar, 2.10&nbsp;Å. Faylda faqat A,B — `pipeline/prepare.py`
  ikkinchi MODEL'ni C,D deb qayta nomlab bitta strukturaga birlashtiradi
  (3Dmol `addModel` ko'p-MODEL faylning faqat birinchi freymini
  ko'rsatadi — `addModelsAsFrames` esa ularni animatsiya freymi deb
  hisoblaydi, bir vaqtda emas).

**PDB fayl raqamlashi UniProt'dan −1 siljigan** (boshlang'ich Met
kesilgan). Barcha `SceneSpec` qoldiq tanlovlari **PDB fayl raqamlashida**
(`src/data/modules/ldh.ts`dagi `ACTIVE_SITE_RESI`/`ACTIVE_SITE_INFO`).

**Faol markaz qoldiqlari (tekshirilgan — UniProt FT jadvali + PDB
koordinatalaridan hisoblangan masofalar bilan):**

| PDB # | UniProt # | Rol | Masofa OXM'gacha |
|---|---|---|---|
| His192 | His193 | proton qabul qiluvchi (ACT_SITE) | 2.90 Å |
| Arg105 | Arg106 | substrat karboksilini ushlaydi | 2.89 Å |
| Arg168 | Arg169 | substrat karboksilini ushlaydi | 2.72 Å |
| Thr247 | Thr248 | substrat bilan bog'lanadi | 2.72 Å |
| Asp165 | Asp166 | His192'ni yo'naltiradi (H-bog' 2.64 Å) | 5.71 Å (bilvosita) |

(Eslatma: bir necha eski qoralamada "Asp168" deb yozilgan edi — pozitsiya
168 aslida Ala, xato edi. To'g'risi jadvaldagidek Asp165/166.)

### 6 sahna (`src/data/modules/ldh.ts`, hammasi ishlaydi, brauzerda tekshirilgan)

| # | id | pdbId | Nima ko'rsatadi |
|---|---|---|---|
| 1 | `quaternary` | 1I10 | Tetramer, zanjir bo'yicha rang. **Bosiladi** → zanjirga yaqinlashadi |
| 2 | `subunit` | 1I10 | Zanjir A, ikkilamchi struktura rangi (`ssPyMol`) |
| 3 | `active-site` | 1I10 | 5 qoldiq + oksamat, rangli stick + **3D yorliqlar** |
| 4 | `cofactor` | 1I10 | NADH atom darajasida + **3D yorliq** |
| 5 | `isoenzymes` | 1I10 | `schematic:true` — 5 izoferment haqida matn (haqiqiy struktura yo'q, UI'da sxematik yorliq) |
| 6 | `clinical` | 1I0Z | H4 tetramer (LDH1), "flip" tushunchasi. **Bosiladi** → zanjirga yaqinlashadi |

### 2 ta interaktiv "fishka" (foydalanuvchi so'ragan, oddiy statik ko'rinishdan farqi)

1. **3D suzuvchi yorliqlar** — `active-site` va `cofactor` sahnalarida
   qoldiq nomlari (`His192`, `NADH (kofaktor)`, ...) to'g'ridan-to'g'ri
   strukturada ko'rinadi (`SceneSpec.labels`, 3Dmol `addLabel`, CA atom
   pozitsiyasiga yopishtirilgan).
2. **Zanjirga bosib yaqinlashish** — `quaternary`/`clinical` sahnalarida
   istalgan zanjirga bosilsa (`StructureRenderer.onAtomClick`), o'sha zanjir
   ajratiladi (qolganlari xiralashadi, kamera yaqinlashadi, tavsif matni
   "Zanjir X — subbirliklar bir xil..." ga almashadi), "← Barchasi" bilan
   qaytariladi. `App.tsx`da `useMemo` bilan hisoblanadi — aks holda til
   almashtirish kabi bog'liq bo'lmagan re-renderlar kamerani qayta
   kadrlab, foydalanuvchi burgan burchakni yo'qotardi.
3. **Aminokislotalar ketma-ketligi paneli** (`AA` tugmasi, header'da) —
   LDHA to'liq 331 qoldiqli ketma-ketligi, PDB raqamlash, faol markaz
   qoldiqlari 3D bilan BIR XIL rangda ajratilgan (`ACTIVE_SITE_INFO` —
   bitta manba, ikkalasi hech qachon bir-biridan ajralib qolmaydi).

### UI layout (2026-09-28 qayta ishlangan — birinchi versiya box'lar
strukturani to'sib, til tugmasi noqulay joyda edi)

Bitta yupqa header (chap: `AA`/ketma-ketlik, o'rta: sarlavha, o'ng: til) +
pastki dokda yig'iladigan tavsif (default ochiq, sarlavhaga bosilsa
yopiladi, `max-h-24/32` — struktura endi to'liq ko'rinadi) + sahna tab'lari.
Ketma-ketlik paneli header ostida, o'z × tugmasi bilan. Mobil (375×812) va
desktop (1440×900)da tekshirilgan.

### Manbalar

`ldhModule.sources`: PDB 1I10/1I0Z (Read et al. 2001, DOI bilan), Lehninger
8-nashr 15-bob, Harper's Illustrated Biochemistry.

## 6. 3Dmol.js — topilgan tafsilotlar (keyingi modulda ham kerak bo'ladi)

- `createViewer`ning `backgroundColor`'i 8-xonali hex (`#00000000`, alpha
  bilan) QABUL QILMAYDI — "color not found" xatosi, bo'sh ekran. Loyiha
  `--background`iga mos opaque hex bering (`#0c1015`).
- `addModelsAsFrames` MODEL/ENDMDL yo'q oddiy fayllar bilan hech narsa
  chizmaydi (xatosiz). Yagona model uchun `addModel(text,'pdb')`.
  `addModelsAsFrames` faqat animatsiya freymlari uchun (bir vaqtda emas,
  ketma-ket) — ko'p-MODEL faylni BITTA struktura sifatida ko'rsatish uchun
  fayl darajasida oldindan birlashtirish kerak (`pipeline/prepare.py`).
- `chain` selektor MASSIV (`['A','B']`) ishlaydi, vergul-satr (`'A,B'`)
  ISHLAMAYDI (0 atom).
- React StrictMode effect'ni 2 marta chaqiradi — ikkinchi 3Dmol canvas
  birinchisi ustiga qo'shiladi (`createViewer` konteynerni tozalamaydi).
  Tuzatish: `Mol3DRenderer.create()`/`dispose()`da `el.innerHTML = ''`.
- `colorscheme` ikkilamchi struktura uchun `'ssPyMOL'` EMAS —
  `'ssPyMol'` (kichik `l`, 3Dmol'ning `$3Dmol.ssColors.pyMol` nomiga mos).
  Xato yozilsa xatosiz, faqat kulrang render qiladi.
- Yorliq pozitsiyasi uchun `getModel().selectedAtoms(sel)`dan CA atomini
  (yo'q bo'lsa birinchi atomni) tanlab, uning x/y/z'iga `addLabel`.
- Klik: `viewer.setClickable({}, true, (atom)=>{...})` — `load()` ichida,
  model qo'shilgandan keyin, bir marta chaqiriladi.
- Brauzer pane'da foydalanuvchi bir vaqtda ishlayotgan bo'lsa (viewport
  o'zi o'zgarib tursa, koordinata-based klik boshqa joyga tushishi mumkin)
  — pane'ni band qilmang, `scripts/shot.mjs` bilan headless tekshiring.

## 7. Keyingi modullar (Faza 3+, IELTS'dan keyin)

| Modul | Nega qiziq | Strukturalar |
|---|---|---|
| Gemoglobin allosteriyasi | T→R morfing, Bohr effekti, 2,3-BPG, o'roqsimon anemiya | deoxy (T) va oxy (R) — ID'larni tasdiqlash kerak |
| Na+/K+-ATFaza | Biomembranalar, E1/E2 konformatsiyalari | ID tasdiqlash kerak |
| ATF-sintaza | Rotor mexanizmi | ID tasdiqlash kerak |
| Serin proteaza | Katalitik triada | ID tasdiqlash kerak |

Ikkinchi modul ~20 daqiqa olishi kerak (faqat JSON — LDH'da qurilgan
`SceneSpec`/`ACTIVE_SITE_INFO`/`SequenceStrip` naqshi qayta ishlatiladi).
Agar ancha ko'proq vaqt olsa — arxitektura xato, to'xtab qayta ko'rib
chiqing. **Har doim: yangi modul strukturasi uchun PDB ID'larni RCSB'da
tasdiqlashdan boshlang — xotiradan yozilgan ID'larga ishonmang.**

## 8. Ishlash uslubi

- **"Perfektlik vaqtdan ustun"** — lekin bu loyihada **"effort past, pro
  ko'rinsa bo'ldi"** ustunroq ko'rsatma (foydalanuvchi 2026-09-27/28 da
  ikki marta takrorladi). Muvozanat: ishlaydigan, screenshot bilan
  tasdiqlangan, lekin haddan tashqari pardozlanmagan.
- **Har vizual o'zgarish HAQIQIY brauzerda (yoki headless) tasdiqlanadi.**
- Commit'dan oldin: `npx tsc -p tsconfig.app.json --noEmit` va
  `npm run build` — ikkalasi toza, keyin `rm -rf dist`.
- Commit xabarlari o'zbek tilida: nima o'zgargani va NEGA (foydalanuvchi
  fikri/talabi bo'lsa — o'sha ham).
- Mobil (375×812) va desktop (1440×900) ikkalasida tekshiring — bitta
  o'lchamda yaxshi ko'ringan layout ikkinchisida to'qnashishi mumkin
  (2026-09-28 da bo'lgani kabi).
