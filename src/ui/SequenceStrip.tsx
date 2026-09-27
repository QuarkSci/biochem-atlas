import { ACTIVE_SITE_INFO, CHAIN_A_SEQUENCE } from '@/data/modules/ldh'

const ROW_LEN = 30
// PDB qoldiq N — CHAIN_A_SEQUENCE'ning N-indeksidagi harfi (Met1 kesilgan,
// CLAUDE.md 5-bo'lim: PDB raqamlash UniProt'dan -1 siljigan).
const LAST_RESIDUE = CHAIN_A_SEQUENCE.length - 1

function rows(): { start: number; residues: { n: number; aa: string }[] }[] {
  const out: { start: number; residues: { n: number; aa: string }[] }[] = []
  for (let start = 1; start <= LAST_RESIDUE; start += ROW_LEN) {
    const end = Math.min(start + ROW_LEN - 1, LAST_RESIDUE)
    const residues = []
    for (let n = start; n <= end; n++) residues.push({ n, aa: CHAIN_A_SEQUENCE[n] })
    out.push({ start, residues })
  }
  return out
}

interface SequenceStripProps {
  lang: 'uz' | 'en'
}

export function SequenceStrip({ lang }: SequenceStripProps) {
  return (
    <div className="glass max-h-[40vh] w-[min(92vw,32rem)] overflow-y-auto rounded-2xl px-4 py-3">
      <div className="mb-2 text-xs text-muted-foreground">
        {lang === 'uz'
          ? "LDHA (M-zanjir) aminokislotalar ketma-ketligi — PDB raqamlash, faol markaz qoldiqlari ajratilgan"
          : 'LDHA (M subunit) amino acid sequence — PDB numbering, active-site residues highlighted'}
      </div>
      <div className="space-y-1 font-mono text-[11px] leading-relaxed">
        {rows().map((row) => (
          <div key={row.start} className="flex gap-2">
            <span className="w-8 shrink-0 text-right text-muted-foreground/60 select-none">{row.start}</span>
            <span className="tracking-wide">
              {row.residues.map(({ n, aa }) => {
                const info = ACTIVE_SITE_INFO[n]
                return (
                  <span
                    key={n}
                    title={info ? `${info.name}${lang === 'uz' ? ' — faol markaz' : ' — active site'}` : `${aa}${n}`}
                    style={info ? { color: '#0c1015', background: info.color } : undefined}
                    className={info ? 'rounded-[2px] px-0.5 font-bold' : 'text-foreground/80'}
                  >
                    {aa}
                  </span>
                )
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
