# Biochem Atlas — loyiha holati (Claude uchun qo'llanma)

> Yangi chatda ishni davom ettirish uchun shu faylni to'liq o'qing, keyin
> `PLAN.md`. Foydalanuvchi (MuhammadYusuf) o'zbek tilida yozadi, javoblar
> o'zbek tilida. Kod izohlari ingliz tilida. **Effort past — bu 7 fandan
> birining 6 mustaqil ishidan bittasi uchun, professional ko'rinsa kifoya,
> ortiqcha vaqt sarflamang.**
>
> Yaratilgan: 2026-09-27. Oxirgi yangilanish: 2026-09-28 (kechqurun).
> Holat: **Faza 0, 1 tugadi; Faza 2 deyarli tugadi.**
> **JONLI: https://quarksci.github.io/biochem-atlas/** — repo
> `QuarkSci/biochem-atlas` (ochiq), Pages `build_type=workflow`,
> `.github/workflows/deploy.yml` master'ga push'da ishlaydi (~40 s).
> QR kod: `public/qr.png` va `public/qr.svg` (saytda ham:
> `.../biochem-atlas/qr.png`).
> LDH moduli — 6 sahna + **5 ta "muhim qism"** (2D kimyoviy tuzilma +
> patologiya), molekulyar yuza, uz/en kontent, 3D yorliqlar, ketma-ketlik
> paneli, zanjirga bosib yaqinlashish. Dizayn neuro-atlas vokabulyariga
> o'tkazildi (9-bo'lim). Brauzerda (390×844 va 1440×900) va JONLI saytda
> tasdiqlangan. **Qolgan yagona band: internet yo'q holat uchun zaxira
> video** (PLAN.md 4-bo'lim).

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
Repo: **https://github.com/QuarkSci/biochem-atlas** (ochiq, `master`).
Pages: **https://quarksci.github.io/biochem-atlas/** — `VITE_BASE` ni
workflow repo nomidan avtomatik oladi. `gh` sessiyada **QuarkSci**
akkaunti bilan kirgan.

**MUHIM:** `public/structures/` endi **gitignore'da EMAS** — 1I10.pdb va
1I0Z.pdb (2.7 MB, RCSB ochiq ma'lumoti) repoda. Aks holda Pages'da
molekula yuklanmay, bo'sh ekran qolardi va CI ni RCSB'ga bog'lab qo'yish
kerak bo'lardi (4-bo'limdagi 403 muammosi).

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
| Arg105 | Arg106 | **mobil ilmoq ustida keladi**, karbonil kislorodini qutblaydi | 2.89 Å |
| Arg168 | Arg169 | substrat karboksilini ushlaydi | 2.72 Å |
| Thr247 | Thr248 | karboksilatga H-bog' | 2.72 Å |
| Asn137 | Asn138 | C2 kislorodini ushlaydi | — |
| Asp165 | Asp166 | His192'ni yo'naltiradi (H-bog' 2.64 Å) | 5.71 Å (bilvosita) |

(Eslatma: bir necha eski qoralamada "Asp168" deb yozilgan edi — pozitsiya
168 aslida Ala, xato edi. To'g'risi jadvaldagidek Asp165/166.)

### 6 sahna (`src/data/modules/ldh.ts`, hammasi ishlaydi, brauzerda tekshirilgan)

| # | id | pdbId | Nima ko'rsatadi |
|---|---|---|---|
| 1 | `quaternary` | 1I10 | Tetramer + yuza + **4 ta faol markaz** shar bilan. **Bosiladi** → zanjirga yaqinlashadi |
| 2 | `subunit` | 1I10 | Zanjir A, ikkilamchi struktura rangi (`ssPyMol`) |
| 3 | `active-site` | 1I10 | 5 qoldiq + oksamat, rangli stick + **3D yorliqlar** |
| 4 | `cofactor` | 1I10 | NADH atom darajasida + **3D yorliq** |
| 5 | `isoenzymes` | 1I10 | `schematic:true` — 2 moviy (H) + 2 sariq (M) = LDH3 sxemasi |
| 6 | `clinical` | **1I10 + 1I0Z** | Ikki struktura YONMA-YON: M4 (LDH5) va H4 (LDH1) |

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


## 9. Dizayn va "muhim qismlar" (2026-09-28 kechqurun qayta ishlash)

Foydalanuvchi uchta muammo ko'rsatdi va uchalasi ham tuzatildi.

### 9.1 3D "quruq" ko'rinardi → yuza + element ranglari

- `SceneSpec.surfaces` qo'shildi. 3Dmol'da yuza `setStyle` bilan EMAS,
  alohida `addSurface(type, style, sel)` bilan hisoblanadi va sekundlar
  oladi — shuning uchun `StructureRenderer.applyScene` endi
  `Promise<void>` qaytaradi, `SceneView` esa `onBusy` bilan UI'ga spinner
  ko'rsatadi. `applyToken` — sahna almashsa eski yuza chizilmasligi uchun.
- Zanjir ranglari 3Dmol'ning `'chain'` sxemasidan **qo'lda berilgan
  ranglarga** o'tkazildi (`CHAIN_COLORS` `ldh.ts`da): lenta va yuza aynan
  bir xil rangda bo'lmasa molekula loyqa/iflos ko'rinadi.
- Ligandlar (NADH = NAI, oksamat = OXM) `colorscheme: 'Jmol'` bilan —
  element ranglari, stick + sphere.

### 9.2 XATO: 3Dmol setStyle ALMASHTIRADI, qo'shmaydi

Bir xil selektorga ikki qatlam yozilsa (masalan `stick` va keyin `sphere`)
faqat OXIRGISI ko'rinadi — NADH tayoqchalari sharlar ostida yo'qolgan edi.
`Mol3DRenderer.applyScene` endi selektor JSON'i bo'yicha qatlamlarni
`Map`da birlashtiradi va har selektor uchun `setStyle`ni BIR MARTA
chaqiradi. Yangi qatlam yozganda buni yodda tuting.

### 9.3 "Muhim qismlar" (Hotspot) — modulning asosiy yangiligi

`types.ts`dagi `Hotspot`: `{short, label, pdbId, spec, chem, role,
pathology[], resi?, sources?}`. Beshtasi: `loop` (mobil ilmoq 96–107),
`catalysis` (His192–Asp165), `hydride` (NADH nikotinamid), `clamp`
(Arg168/Thr247/Asn137), `isoform` (subbirlik chegarasi). Har biri 3D
ko'rinish + 2D kimyoviy tuzilma + patologiya beradi. 3D'da `resi` dagi
qoldiqqa bosilsa ham o'sha karta ochiladi (`App.handleAtomClick`).

### 9.4 2D kimyoviy tuzilmalar — `src/ui/ChemStructure.tsx`

Beshta SVG qo'lda yozilgan (kutubxona YO'Q — kerak bo'lgani 5 ta chizma,
lekin har biri izohlangan bo'lishi kerak; SMILES'dan avtomatik rasm buni
bermaydi). Chizma bosilsa kattalashadi.

**Tuzoq:** kattalashtirish oynasi `createPortal` bilan `document.body` ga
chiqariladi. Portal SHART — `.inspector.glass` da `backdrop-filter` bor,
u `position: fixed` uchun containing block yaratadi va portalsiz oyna
panel ichida qamalib qoladi (avval shunday bo'lgan).

### 9.5 FAKT TUZATILDI: Arg105 ning roli

Yuqoridagi 5-bo'limdagi jadvalda Arg105 "substrat karboksilini ushlaydi"
deb yozilgan edi — **noto'g'ri**. Karboksilatni **Arg168 va Thr247**
ushlaydi (Asn137 esa C2 kislorodini). **Arg105** mobil ilmoq ustida keladi
va karbonil kislorodini qutblab, o'tish holatini barqarorlashtiradi
(klassik adabiyotdagi it-baliq LDH sidagi Arg109). `ACTIVE_SITE_INFO` da
Arg105 endi alohida rangda (`#ffa94d`, ilmoq rangi), Asn137 qo'shildi.

Mobil ilmoqning 96–107 ekani **1I10 ning o'z HELIX/SHEET yozuvlaridan**
tekshirildi: chain A da 93 va 104 orasida na spiral, na varaq bor.

### 9.6 Dizayn — neuro-atlas vokabulyari

Birinchi versiyada qutilar matnga nisbatan juda katta edi va pastki
tavsif qutisida matn `max-h` bilan chegara chizig'ida qirqilib qolardi.
Endi neuro-atlas'ning O'Z CSS klasslari ishlatiladi (ular `index.css` da
allaqachon bor edi, lekin ishlatilmayotgan edi): `.studio`, `.vignette`,
`.identity`, `.top-actions` + `.pill-icon` + `.lang-toggle`,
`.bottom-dock` + `.mode-tabs`, va eng muhimi — o'ngdagi **`.inspector`**
(`.detail-header` / `.detail-scroll` / `.detail-section`). Matn endi hech
qachon qirqilmaydi, u skroll qilinadigan joyda.

Faqat shu loyihaga xos yangi klasslar `index.css` oxirida
"Biochem Atlas" bo'limida: `.hotspot-row`/`.hotspot-chip`, `.chem-frame`/
`.chem-svg`/`.chem-note`/`.chem-lightbox`, `.patho`, `.source-list`,
`.seq-*`, `.scene-busy`, `.scene-hint`, `.detail-close`, `.top-title`.

Qo'shimcha tugmalar: aylanishni to'xtatish (▶/❙❙), panelni yopish/ochish (ⓘ).


## 10. 2026-09-28 (kech): sahnalar bir-biridan farqlanishi, zoom, bo'sh sahna

Foydalanuvchi e'tirozi: to'rtlamchi struktura, izofermentlar va klinik
sahnalar BIR XIL ko'rinardi (uchalasi ham `chainCartoon` + `chainSurface`),
zoom esa juda tez edi.

### 10.1 Qoida: har sahna o'z savoliga javob bersin

Bir xil `layers` ni bir nechta sahnada qayta ishlatish — ko'rinishda
takrorlanish demak. Endi: quaternary = 4 ta faol markaz sharlari (sahnaning
gapi ko'rinadi), isoenzymes = 2 moviy + 2 sariq (LDH3 sxemasi), clinical =
ikkita struktura yonma-yon.

### 10.2 Ko'p-modelli sahna (yonma-yon taqqoslash)

`ModuleScene.pdbIds: string[]`, `ResidueSelector.model?: number`,
`StructureRenderer.load(id, pdbTexts[])`. Modellar PDB MATNINING O'ZIDA
ko'chiriladi (3Dmol'da modelni ishonchli ko'chiradigan ommaviy API yo'q):
X bo'ylab tiziladi, **Y va Z markazlari tenglashtiriladi**. Oxirgisi shart —
har kristall o'z freymida turadi, tenglashtirilmasa biri kameradan uzoqroqda
qolib perspektivada kichikroq ko'rinadi va taqqoslash yolg'on chiqadi.

Yorliqlar uchun `viewer.getModel()` EMAS, `viewer.selectedAtoms()` —
getModel() faqat oxirgi modelni beradi.

### 10.3 Zoom tezligi

3Dmol'ning `_handleMouseScroll` i bitta hodisada kamera masofasining
~150% igacha siljitadi. Mac trackpad bir imoda o'nlab hodisa yuboradi →
molekula ichiga kirib ketasiz. Yechim (`installWheelZoom`): `wheel` ni
konteynerda CAPTURE fazasida ushlab `stopPropagation` qilamiz (shunda
3Dmol'ning canvas'dagi listeneri umuman chaqirilmaydi) va o'rniga
`viewer.zoom(exp(-clamp(deltaY) * 0.0018))` — hodisaga ko'pi bilan ~20%.

### 10.4 XATO: sahna butunlay bo'sh qolardi (canvas umuman yo'q)

React StrictMode effectni ikki marta chaqiradi. Birinchi mount'ning
`Promise`i ikkinchisi canvas yaratgandan KEYIN qaytishi mumkin; o'shanda
birinchisining `dispose()` idagi `el.innerHTML = ''` ikkinchisining
canvas'ini ham o'chirib yuborardi. Endi har viewer `createViewer` dan keyin
O'ZI qo'shgan tugunlarni eslab qoladi va `dispose()` faqat shularni olib
tashlaydi; `create()` konteynerni tozalamaydi.

**Muhim saboq:** bu xatoni headless screenshot YASHIRDI — dasturiy WebGL
bilan natija oyna o'lchamiga qarab goh chiqib, goh chiqmasdi. Shubhali
bo'lsa HAQIQIY brauzerda (browser pane, GPU bilan) tekshiring.

### 10.5 1I10 endi faqat A-D zanjirlari

Asimmetrik birlikda ikkita bir xil tetramer bor edi (A-D, E-H).
`pipeline/prepare.py` endi faqat A-D ni saqlaydi: fayl 1.8 MB → 0.98 MB,
va strukturaning bbox'i haqiqiy tetramerniki bo'ladi (yonma-yon qo'yishda
ko'rinmaydigan E-H joy egallab turardi).
