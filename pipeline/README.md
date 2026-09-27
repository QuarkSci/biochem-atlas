# pipeline — ma'lumot manbalari

neuro-atlas'dagi `pipeline/` bilan bir xil g'oya: og'ir/tashqi ma'lumot
repoga kirmaydi (`.gitignore`), retsept shu yerda yoziladi.

## PDB strukturalari

```bash
bash pipeline/fetch.sh
```

→ `data/raw/*.pdb`

```bash
python3 pipeline/prepare.py
```

→ `public/structures/*.pdb` (1I0Z uchun 2-MODEL biologik assambleyani
C,D zanjir sifatida birlashtiradi — 3Dmol ko'p-MODEL faylning faqat
birinchi freymini ko'rsatadi, shuning uchun oldindan birlashtirish kerak).

**Nega qo'lda?** `files.rcsb.org` sandbox muhitlardan bloklangan
(Cowork VM va cloud konteynerdan HTTP 403 proxy — 2026-09-27 da
tekshirilgan). Foydalanuvchining o'z mac terminalida muammosiz ishlaydi.

**Zaxira yo'l:** ilova runtime'da ham RCSB'dan olishi mumkin
(`Mol3DRenderer` avval lokal `data/raw` dan, topmasa tarmoqdan).
Auditoriyada internetga tayanmaslik uchun lokal fayl afzal.

## Kelajakda: ribbon mesh (Faza 3)

Three.js adapteri uchun cartoon geometriyasi oldindan pishiriladi:

1. `biotite` bilan ikkilamchi strukturani annotatsiya qilish (P-SEA)
2. Ca atomlari bo'ylab spline → ribbon/tube geometriya
3. `trimesh` yoki `pygltflib` bilan GLB eksport → `public/structures/`

Shundan keyin `MoleculeScene` GLB'ni neuro-atlas'dagi miya mesh'lari
kabi yuklaydi va 3Dmol bog'liqligi olib tashlanadi.
