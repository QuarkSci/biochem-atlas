# Biochem Atlas

Biokimyo molekulalarining interaktiv 3D exploreri —
[falcon-atlas](https://quarksci.github.io/falcon-atlas/) va
[neuro-atlas](https://github.com/QuarkSci/neuro-atlas)ning uchinchi aka-ukasi.

**Jonli:** https://quarksci.github.io/biochem-atlas/

## 1-modul: laktatdegidrogenaza (LDH)

Inson LDH tetrameri (PDB **1I10** — mushak M-zanjiri, **1I0Z** — yurak
H-zanjiri, Read et al. 2001) — olti sahna va beshta "muhim qism":

- **6 sahna** — to'rtlamchi struktura (van der Waals yuzasi bilan), bitta
  subbirlik, faol markaz, NADH kofaktori, izofermentlar, klinik LDH1/LDH5.
- **5 muhim qism** — mobil ilmoq (96–107), katalitik juftlik His192–Asp165,
  hidrid uzatish, substrat ushlagichi (Arg168/Thr247/Asn137), subbirlik
  chegarasi. Har biri uchta narsani birga beradi: 3D ko'rinish, **2D
  kimyoviy tuzilma** va shu joy buzilganda kelib chiqadigan **patologiya**
  (LDHA tanqisligi/GSD XI, laktatatsidoz, D-laktat atsidozi, miokard
  infarktidagi "flip", Varburg effekti va boshqalar).
- **Ikki til** — o'zbekcha va inglizcha, har bir yozuvda manba.
- Aminokislotalar ketma-ketligi paneli, 3D yorliqlar, zanjirga bosib
  yaqinlashish.

## Boshlash

```bash
npm install
npm run dev                # http://localhost:3021
```

PDB fayllari (`public/structures/`) repoda bor — qayta yuklash shart emas.
Yangidan olish kerak bo'lsa:

```bash
bash pipeline/fetch.sh      # RCSB'dan data/raw/ ga
python3 pipeline/prepare.py # data/raw/ dan public/structures/ ga
```

## Manbalar va litsenziya

Strukturalar — RCSB PDB (ochiq ma'lumot). Ilmiy mazmun manbalari har bir
yozuvning `sources` maydonida: Read J.A. et al. (2001) *Proteins* 43:175-185,
UniProt P00338/P07195, Lehninger 8-nashr, Harper's Illustrated Biochemistry.

MuhammadYusuf Abdullaxo'jayev · Claude bilan birga.
