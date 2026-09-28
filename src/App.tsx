import { useEffect, useMemo, useState } from 'react'
import { SceneView } from './scene/SceneView'
import { ldhModule } from './data/modules/ldh'
import { SequenceStrip } from './ui/SequenceStrip'
import { Inspector } from './ui/Inspector'
import type { AtomClickInfo, SceneSpec } from './scene/renderer'
import type { L10nText } from './data/types'

type Lang = 'uz' | 'en'

const FOCUS_TEXT = {
  uz: (chain: string) =>
    `Zanjir ${chain} yaqinlashtirildi — tetramerning 4 subbirligi bir xil (homotetramer), shuning uchun bu istalgan zanjirning ko'rinishi. To'liq domenlar uchun "Bitta subbirlik" sahnasiga o'ting.`,
  en: (chain: string) =>
    `Chain ${chain} zoomed in — all 4 subunits of the tetramer are identical (homotetramer), so this is what any chain looks like. See the "Single subunit" scene for full domain detail.`,
}

const UI = {
  hint: { uz: 'Zanjirga bosing', en: 'Tap a chain' },
  allChains: { uz: '← Barcha zanjirlar', en: '← All chains' },
  parts: { uz: 'Muhim qismlar', en: 'Key regions' },
  busy: { uz: 'Yuza hisoblanmoqda…', en: 'Computing surface…' },
  seq: { uz: 'Ketma-ketlik', en: 'Sequence' },
  spin: { uz: 'Aylanish', en: 'Spin' },
  info: { uz: "Ma'lumot", en: 'Details' },
}

export default function App() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lang, setLang] = useState<Lang>('uz')
  const [showSeq, setShowSeq] = useState(false)
  const [spin, setSpin] = useState(true)
  const [busy, setBusy] = useState(true)
  const [hotspotId, setHotspotId] = useState<string | null>(null)
  const [focusChain, setFocusChain] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 900)

  const scene = ldhModule.scenes[sceneIdx]
  const hotspot = ldhModule.hotspots.find((h) => h.id === hotspotId) ?? null
  const canShowSeq = !hotspot && scene.pdbId === '1I10'
  const chainOptions = !hotspot && Array.isArray(scene.spec.zoomTo?.chain) ? (scene.spec.zoomTo!.chain as string[]) : null

  useEffect(() => setFocusChain(null), [sceneIdx, hotspotId])

  function handleAtomClick(info: AtomClickInfo) {
    // Muhim qism qoldig'iga tegilsa — o'sha qismning kartasi ochiladi;
    // aks holda (tetramer sahnalarida) zanjir yaqinlashtiriladi.
    const hit = ldhModule.hotspots.find((h) => h.resi?.includes(info.resi))
    if (hit && !hotspot) {
      setHotspotId(hit.id)
      setPanelOpen(true)
      return
    }
    if (chainOptions?.includes(info.chain)) setFocusChain(info.chain)
  }

  function pickHotspot(id: string) {
    setHotspotId((prev) => (prev === id ? null : id))
    setPanelOpen(true)
  }

  function pickScene(i: number) {
    setHotspotId(null)
    setSceneIdx(i)
  }

  const displaySpec: SceneSpec = useMemo(() => {
    if (hotspot) return hotspot.spec
    if (chainOptions && focusChain)
      return {
        id: `${scene.spec.id}-focus-${focusChain}`,
        layers: [
          { select: { chain: chainOptions.filter((c) => c !== focusChain) }, style: 'cartoon', color: '#2a2f3a', opacity: 0.1 },
          { select: { chain: focusChain }, style: 'cartoon', colorscheme: 'ssPyMol' },
          { select: { chain: focusChain, resn: ['NAI', 'OXM'], hetflag: true }, style: 'stick', colorscheme: 'Jmol', radius: 0.16 },
        ],
        zoomTo: { chain: focusChain },
      }
    return scene.spec
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspot?.id, scene.spec, focusChain])

  const focusText: L10nText | null = focusChain
    ? { uz: FOCUS_TEXT.uz(focusChain), en: FOCUS_TEXT.en(focusChain) }
    : null
  const pdbId = hotspot ? hotspot.pdbId : scene.pdbId

  return (
    <div className="studio dark">
      <SceneView pdbId={pdbId} spec={displaySpec} spin={spin} onAtomClick={handleAtomClick} onBusy={setBusy} />
      <div className="vignette" />

      <div className="identity">
        <div className="identity-text">
          <h1>{ldhModule.title[lang]}</h1>
          <div className="identity-meta">
            {ldhModule.subtitle[lang]}
            <span>·</span>
            PDB {pdbId}
            {scene.spec.schematic && !hotspot ? <span>· {lang === 'uz' ? 'SXEMATIK' : 'SCHEMATIC'}</span> : null}
          </div>
        </div>
      </div>

      <div className="top-actions glass">
        <span className="top-title">{ldhModule.title[lang]}</span>
        <button
          className={`pill-icon${showSeq ? ' active' : ''}`}
          onClick={() => setShowSeq((v) => !v)}
          disabled={!canShowSeq}
          title={UI.seq[lang]}
        >
          AA
        </button>
        <button className={`pill-icon${spin ? ' active' : ''}`} onClick={() => setSpin((v) => !v)} title={UI.spin[lang]}>
          {spin ? '❙❙' : '▶'}
        </button>
        <button className={`pill-icon${panelOpen ? ' active' : ''}`} onClick={() => setPanelOpen((v) => !v)} title={UI.info[lang]}>
          ⓘ
        </button>
        <div className="pill-divider" />
        <div className="lang-toggle">
          <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>
            UZ
          </button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
            EN
          </button>
        </div>
      </div>

      {busy && <div className="scene-busy glass">{UI.busy[lang]}</div>}

      {chainOptions && (
        <div className="scene-hint">
          {focusChain ? (
            <button className="glass hint-pill" onClick={() => setFocusChain(null)}>
              {UI.allChains[lang]}
            </button>
          ) : (
            <div className="glass hint-pill muted">{UI.hint[lang]}</div>
          )}
        </div>
      )}

      {canShowSeq && showSeq && <SequenceStrip lang={lang} onClose={() => setShowSeq(false)} />}

      <Inspector
        lang={lang}
        scene={scene}
        hotspot={hotspot}
        focusText={focusText}
        focusChain={focusChain}
        moduleSources={ldhModule.sources}
        onBack={() => setHotspotId(null)}
        onClose={() => setPanelOpen(false)}
        open={panelOpen}
      />

      <div className="bottom-dock">
        <div className="hotspot-row glass">
          <span className="hotspot-lead">{UI.parts[lang]}</span>
          {ldhModule.hotspots.map((h) => (
            <button
              key={h.id}
              className={`hotspot-chip${hotspotId === h.id ? ' active' : ''}`}
              onClick={() => pickHotspot(h.id)}
            >
              {h.short[lang]}
            </button>
          ))}
        </div>

        <div className="mode-tabs glass">
          {ldhModule.scenes.map((s, i) => (
            <button
              key={s.id}
              className={`mode-tab${i === sceneIdx && !hotspot ? ' active' : ''}`}
              onClick={() => pickScene(i)}
            >
              {s.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="studio-credit">MuhammadYusuf Abdullaxo'jayev · with Claude</div>
    </div>
  )
}
