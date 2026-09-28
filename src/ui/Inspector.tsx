import { ChemStructure } from './ChemStructure'
import type { Hotspot, L10nText, ModuleScene } from '@/data/types'

type Lang = 'uz' | 'en'

const UI = {
  scene: { uz: 'SAHNA', en: 'SCENE' },
  hotspot: { uz: 'MUHIM QISM', en: 'KEY REGION' },
  chem: { uz: 'Kimyoviy tuzilma', en: 'Chemical structure' },
  role: { uz: 'Bu yerda nima bo\'ladi', en: 'What happens here' },
  pathology: { uz: 'Buzilsa — patologiya', en: 'When it fails — pathology' },
  sources: { uz: 'Manbalar', en: 'Sources' },
  back: { uz: '← Sahnaga qaytish', en: '← Back to the scene' },
  schematic: {
    uz: 'Sxematik: ko\'rinayotgan struktura faqat vizual kontekst, geterotetramerlarning haqiqiy geometriyasi emas.',
    en: 'Schematic: the structure shown is visual context only, not the real geometry of the heterotetramers.',
  },
  close: { uz: 'Yopish', en: 'Close' },
}

interface InspectorProps {
  lang: Lang
  scene: ModuleScene
  hotspot: Hotspot | null
  /** Zanjirga bosilganda — sahna tavsifi o'rniga ko'rsatiladigan matn. */
  focusText: L10nText | null
  focusChain: string | null
  /** Tanlangan "qarash usuli" izohi — sahna tavsifidan keyin qo'shiladi. */
  variantNote?: L10nText | null
  moduleSources: string[]
  onBack: () => void
  onClose: () => void
  open: boolean
}

export function Inspector({
  lang,
  scene,
  hotspot,
  focusText,
  focusChain,
  variantNote,
  moduleSources,
  onBack,
  onClose,
  open,
}: InspectorProps) {
  const title = hotspot ? hotspot.label[lang] : focusChain ? `${lang === 'uz' ? 'Zanjir' : 'Chain'} ${focusChain}` : scene.label[lang]
  const body = hotspot ? hotspot.role[lang] : (focusText ?? scene.description)[lang]
  const sources = hotspot?.sources ?? moduleSources

  return (
    <aside className={`inspector glass${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="detail-header">
        <div className="detail-accent" style={{ background: hotspot ? '#ffa94d' : 'var(--fa-accent)' }} />
        <div className="eyebrow">
          <span className="status-dot" />
          {hotspot ? UI.hotspot[lang] : UI.scene[lang]}
        </div>
        <h2 className="structure-title">{title}</h2>
        <button className="detail-close" onClick={onClose} aria-label={UI.close[lang]}>
          ×
        </button>
      </div>

      <div className="detail-scroll">
        {hotspot && (
          <section className="detail-section" style={{ marginTop: 0 }}>
            <h3>{UI.chem[lang]}</h3>
            <ChemStructure chem={hotspot.chem} lang={lang} />
          </section>
        )}

        <section className="detail-section" style={{ marginTop: hotspot ? 18 : 0 }}>
          {hotspot && <h3>{UI.role[lang]}</h3>}
          <p className="structure-description">{body}</p>
          {variantNote && <p className="variant-note">{variantNote[lang]}</p>}
        </section>

        {!hotspot && scene.spec.schematic && <div className="schematic-note">{UI.schematic[lang]}</div>}

        {hotspot && (
          <section className="detail-section">
            <h3>{UI.pathology[lang]}</h3>
            {hotspot.pathology.map((p) => (
              <article key={p.name.en} className="patho">
                <h4>{p.name[lang]}</h4>
                <p>{p.text[lang]}</p>
              </article>
            ))}
          </section>
        )}

        <section className="detail-section">
          <h3>{UI.sources[lang]}</h3>
          <ul className="source-list">
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </div>

      {hotspot && (
        <div className="detail-actions">
          <button className="secondary-action" onClick={onBack}>
            {UI.back[lang]}
          </button>
        </div>
      )}
    </aside>
  )
}
