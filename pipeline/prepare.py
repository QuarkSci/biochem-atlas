#!/usr/bin/env python3
"""data/raw/*.pdb larni public/structures/ ga tayyorlaydi.

1I10 — o'zgarishsiz nusxalanadi (asimmetrik birlikda A-D, E-H — ikkita
to'liq tetramer, simmetriya kerak emas).

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


def main() -> None:
    shutil.copy(RAW / "1I10.pdb", OUT / "1I10.pdb")
    merge_biological_assembly(RAW / "1I0Z_bio1.pdb", OUT / "1I0Z.pdb", {"A": "C", "B": "D"})
    print("tayyor:", list(OUT.iterdir()))


if __name__ == "__main__":
    main()
