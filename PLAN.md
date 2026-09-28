# Biochem Atlas — reja

## 1. Maqsad

Biokimyo molekulalarining interaktiv 3D exploreri. Modul = JSON ma'lumot
fayli; dvigatel uni o'qib sahnalar chiqaradi. Ikki tomonlama foyda:
o'qish (TMI taqdimotlariga QR bilan) va Text-to-Code prototipi.

## 2. Bosqichlar

| Faza | Ish | Baho | Holat |
|---|---|---|---|
| 0 | Skelet neuro-atlas'dan, `StructureRenderer` interfeysi, `pipeline/fetch.sh`, bitta struktura ekranda | 40 daq | ✅ |
| 1 | LDH moduli: 6 sahna + uz/en kontent + `sources` + Inspector | 1.5 soat | ✅ |
| 2 | CLAUDE.md yangilash, GitHub repo + Pages deploy, QR, offline zaxira video | 40 daq | 🟡 |
| 3 | `ThreeRenderer` adapteri (pipeline → GLB ribbon) | ~1 kun | ⬜ |
| 4 | 2-modul: gemoglobin allosteriyasi (T→R morfing) | ~2 soat | ⬜ |
| 5 | 3–4-modullar: Na+/K+-ATFaza, ATF-sintaza | — | ⬜ |

Faza 0–2 ≈ 3 soat, uch o'tirishga bo'linadi.

**Vaqt konteksti:** IELTS 2026-10-11. IELTS'gacha faqat Faza 0–2 (bitta
modul, tugallangan holda). Faza 3+ imtihondan keyin. Uchta modulni birga
boshlash — ikkisi yarim qoladi va IELTS'dan ham vaqt yeydi.

## 3. Xavflar

| Xavf | Ta'sir | Chora |
|---|---|---|
| PDB ID'lari xato (xotiradan yozilgan, tasdiqlanmagan) | Butun modul noto'g'ri | Faza 0'da RCSB'da tasdiqlash — birinchi qadam |
| Qoldiq raqamlari (His193 va h.k.) izoformaga qarab siljiydi | Faol markazda noto'g'ri qoldiq ajratiladi — eng ko'rinadigan xato | SEQRES bilan solishtirish |
| 3Dmol adapteri interfeysdan "sizib chiqadi" | Three.js'ga o'tish qayta yozishga aylanadi | `renderer.ts` kod yozishdan OLDIN; 3Dmol tipi hech qayerda interfeysdan tashqarida ko'rinmasin |
| Geteroтetramerlar uchun struktura yo'q | 5-sahna sxematik — yashirilsa ishonchlilik ketadi | `schematic: true` + UI yorlig'i |
| Bundle hajmi (3Dmol ~1.5 MB) | Sekin yuklanish | Dynamic import, faqat modul ochilganda |
| Loyiha IELTS vaqtini yeydi | Imtihon bali tushadi | Faza 2'dan keyin TO'XTASH, 11-oktabrgacha ochmaslik |

## 4. Tugallanganlik mezoni (Faza 2 oxirida)

- [x] 6 sahna ishlaydi, o'tish silliq
- [x] uz/en ikkalasi to'liq, har yozuvda `sources`
- [x] `npx tsc --noEmit` va `npm run build` toza
- [x] Brauzerda screenshot bilan tasdiqlangan (375×812 va 1440×900)
- [x] GitHub Pages'da jonli, QR ishlaydi (2026-09-28)
- [ ] Internet yo'q holat uchun zaxira video tayyor

Bonus (rejada yo'q edi, foydalanuvchi so'ragan): 3D suzuvchi yorliqlar,
aminokislotalar ketma-ketligi paneli, tetramerda zanjirga bosib
yaqinlashish, **5 ta "muhim qism" — 2D kimyoviy tuzilma + patologiya**,
**molekulyar yuza (surface)**, **dizayn neuro-atlas vokabulyariga
o'tkazildi** — batafsil `CLAUDE.md` 5 va 9-bo'limlar.
