#!/usr/bin/env bash
# Biochem Atlas — PDB strukturalarini RCSB'dan yuklaydi.
#
# MUHIM: bu skript foydalanuvchining O'Z terminalida ishlaydi.
# Sandbox muhitlardan (Cowork VM, cloud konteyner) files.rcsb.org
# bloklangan (HTTP 403 proxy) — 2026-09-27 da tekshirilgan.
#
# Ishlatish:  bash pipeline/fetch.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAW="$ROOT/data/raw"
mkdir -p "$RAW"

# ---------------------------------------------------------------------------
# ID'lar RCSB'da 2026-09-27 da tasdiqlangan (CLAUDE.md 5-bo'lim):
#   1I10 — HUMAN MUSCLE LDH M CHAIN (LDHA), NADH+oksamat, homotetramer
#          A,B,C,D asimmetrik birlikda to'liq (simmetriya kerak emas).
#   1I0Z — HUMAN HEART LDH H CHAIN (LDHB), xuddi shu maqoladan
#          (Read et al. 2001, Proteins 43:175-185), xuddi shu ligandlar.
#          Faylda faqat A,B bor — to'liq tetramer uchun .pdb1 (biologik
#          assambleya, 2 MODEL) ishlatiladi.
# ---------------------------------------------------------------------------
declare -A FILES=(
  ["1I10.pdb"]="https://files.rcsb.org/download/1I10.pdb"
  ["1I0Z.pdb"]="https://files.rcsb.org/download/1I0Z.pdb"
  ["1I0Z_bio1.pdb"]="https://files.rcsb.org/download/1I0Z.pdb1"
)

for name in "${!FILES[@]}"; do
  out="$RAW/$name"
  if [[ -s "$out" ]]; then
    echo "skip  $name (bor: $(wc -c < "$out") bayt)"
    continue
  fi
  echo "olish $name ..."
  if curl -fsSL -A "Mozilla/5.0" -o "$out" "${FILES[$name]}"; then
    echo "  ok  $name — $(wc -c < "$out") bayt"
  else
    rm -f "$out"
    echo "  XATO $name — internet bormi?" >&2
    exit 1
  fi
done

echo
echo "Tayyor. Fayllar: $RAW"
ls -la "$RAW"
