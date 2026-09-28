#!/usr/bin/env python3
"""data/raw/*.pdb larni public/structures/ ga tayyorlaydi.

1I10 — asimmetrik birlikda A-D va E-H, ya'ni IKKITA to'liq tetramer.
Ilovaga bittasi yetarli, shuning uchun faqat A-D saqlanadi. Bu uch ishni
qiladi: fayl ikki barobar kichrayadi, yuklanish tezlashadi, va eng muhimi —
strukturaning chegara qutisi (bbox) haqiqiy tetramerniki bo'ladi. Aks holda
"Klinik" sahnasida 1I10 va 1I0Z yonma-yon qo'yilganda ko'rinmaydigan E-H
zanjirlari joy egallab, ikkinchi struktura juda uzoqqa surilib ketardi.

1I0Z — asimmetrik birlik faqat A,B (yarim tetramer). Biologik assambleya
fayli (`1I0Z.pdb1`, RCSB'dan) buni 2 ta MODEL sifatida beradi (har birida
A,B). 3Dmol.js addModel() ko'p-MODEL faylning faqat birinchi freymini
ko'rsatadi (addModelsAsFrames esa ularni animatsiya freymlari deb hisoblab,
bir vaqtda emas, ketma-ket ko'rsatadi) — shuning uchun ikkinchi MODEL'ning
zanjirlarini C,D deb qayta nomlab, MODEL/ENDMDL o'rovisiz bitta struktura
sifatida birlashtiramiz.
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "public" / "structures"
OUT.mkdir(parents=True, exist_ok=True)


def merge_biological_assembly(src: Path, dst: Path, chain_remap: dict[str, str]) -> None:
    lines_out: list[str] = []
    model_num = 0
    with src.open() as f:
        for line in f:
            if line.startswith("MODEL"):
                model_num += 1
                continue
            if line.startswith("ENDMDL"):
                continue
            if line.startswith(("ATOM", "HETATM")) and model_num == 2:
                chain = line[21]
                new_chain = chain_remap.get(chain, chain)
                line = line[:21] + new_chain + line[22:]
            if line.startswith("END"):
                continue
            lines_out.append(line)
    lines_out.append("END\n")
    dst.write_text("".join(lines_out))


def keep_chains(src: Path, dst: Path, chains: set[str]) -> None:
    out: list[str] = []
    with src.open() as f:
        for line in f:
            if line.startswith(("ATOM", "HETATM", "TER", "ANISOU")):
                if line[21] not in chains:
                    continue
            elif line.startswith(("HELIX", "SHEET", "SSBOND", "LINK", "CISPEP", "SITE", "CONECT", "MASTER", "END")):
                # Ikkilamchi struktura yozuvlari 3Dmol'ning cartoon renderi uchun
                # kerak (ssPyMol rangi shulardan o'qiladi), lekin CONECT/MASTER
                # atom raqamlariga bog'liq — ularni tushirib qoldiramiz.
                if line.startswith(("CONECT", "MASTER", "END")):
                    continue
                if line.startswith("HELIX") and line[19] not in chains:
                    continue
                if line.startswith("SHEET") and line[21] not in chains:
                    continue
            out.append(line)
    out.append("END\n")
    dst.write_text("".join(out))


def main() -> None:
    keep_chains(RAW / "1I10.pdb", OUT / "1I10.pdb", {"A", "B", "C", "D"})
    merge_biological_assembly(RAW / "1I0Z_bio1.pdb", OUT / "1I0Z.pdb", {"A": "C", "B": "D"})
    print("tayyor:", list(OUT.iterdir()))


if __name__ == "__main__":
    main()
