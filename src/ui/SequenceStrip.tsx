import { ACTIVE_SITE_INFO, CHAIN_A_SEQUENCE, LOOP_COLOR, LOOP_RESI } from '@/data/modules/ldh'

const ROW_LEN = 20
// PDB qoldiq N — CHAIN_A_SEQUENCE'ning N-indeksidagi harfi (Met1 kesilgan,
// CLAUDE.md 5-bo'lim: PDB raqamlash UniProt'dan -1 siljigan).
const LAST_RESIDUE = CHAIN_A_SEQUENCE.length - 1
const LOOP_SET = new Set(LOOP_RESI)

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
  onClose: () => void
}

export function SequenceStrip({ lang, onClose }: SequenceStripProps) {
  return (
    <div className="seq-panel glass">
      <div className="seq-head">
        <div>
          <strong>LDHA · {lang === 'uz' ? 'M-zanjir' : 'M chain'}</strong>
          <span>{lang === 'uz' ? 'PDB raqamlashi, 1–330' : 'PDB numbering, 1–330'}</span>
        </div>
        <button onClick={onClose} aria-label="close">
          ×
        </button>
      </div>
      <div className="seq-legend">
        <i style={{ background: '#ffcc00' }} />
        {lang === 'uz' ? 'faol markaz' : 'active site'}
        <i style={{ background: LOOP_COLOR }} />
        {lang === 'uz' ? 'mobil ilmoq' : 'mobile loop'}
      </div>
      <div className="seq-body">
        {rows().map((row) => (
          <div key={row.start} className="seq-row">
            <span className="seq-num">{row.start}</span>
            <span className="seq-letters">
              {row.residues.map(({ n, aa }) => {
                const info = ACTIVE_SITE_INFO[n]
                const inLoop = LOOP_SET.has(n)
                if (info)
                  return (
                    <span
                      key={n}
                      title={`${info.name}${lang === 'uz' ? ' — faol markaz' : ' — active site'}`}
                      className="seq-hit"
                      style={{ background: info.color }}
                    >
                      {aa}
                    </span>
                  )
                if (inLoop)
                  return (
                    <span
                      key={n}
                      title={lang === 'uz' ? 'mobil ilmoq 96–107' : 'mobile loop 96–107'}
                      className="seq-loop"
                      style={{ color: LOOP_COLOR }}
                    >
                      {aa}
                    </span>
                  )
                return <span key={n}>{aa}</span>
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
