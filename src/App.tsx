import { useState } from 'react'
import { SceneView } from './scene/SceneView'
import { ldhModule } from './data/modules/ldh'
import { SequenceStrip } from './ui/SequenceStrip'

type Lang = 'uz' | 'en'

export default function App() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lang, setLang] = useState<Lang>('uz')
  const [showSeq, setShowSeq] = useState(false)
  const [descOpen, setDescOpen] = useState(true)
  const scene = ldhModule.scenes[sceneIdx]
  const canShowSeq = scene.pdbId === '1I10'

  return (
    <div className="dark fixed inset-0 overflow-hidden bg-background text-foreground">
      <SceneView pdbId={scene.pdbId} spec={scene.spec} />

      {/* Yupqa header: chapda ketma-ketlik, o'rtada sarlavha, o'ngda til — hech
          qaysi bo'sh joyga "suzib" turmaydi, hammasi bitta qatorda. */}
      <div className="glass absolute inset-x-2 top-2 flex h-11 items-center justify-between gap-2 rounded-full px-2 sm:inset-x-4 sm:top-4">
        <div className="w-16 sm:w-20">
          {canShowSeq && (
            <button
              onClick={() => setShowSeq((v) => !v)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium sm:text-xs ${showSeq ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {lang === 'uz' ? 'AA' : 'Seq'}
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-xs font-medium sm:text-sm">{ldhModule.title[lang]}</div>
          <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
            PDB {scene.pdbId} {scene.spec.schematic ? `· ${lang === 'uz' ? 'SXEMATIK' : 'SCHEMATIC'}` : ''}
          </div>
        </div>

        <div className="flex w-16 justify-end sm:w-20">
          <button
            onClick={() => setLang((l) => (l === 'uz' ? 'en' : 'uz'))}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground sm:text-xs"
          >
            {lang === 'uz' ? 'EN' : 'UZ'}
          </button>
        </div>
      </div>

      {canShowSeq && showSeq && (
        <div className="absolute top-14 right-2 left-2 sm:top-20 sm:right-auto sm:left-4">
          <SequenceStrip lang={lang} onClose={() => setShowSeq(false)} />
        </div>
      )}

      {/* Pastki dok: tab'lar + yig'iladigan tavsif — tuzilmani to'smasligi
          uchun tavsif matni default yopiq, sarlavhaga bosilsa ochiladi. */}
      <div className="absolute inset-x-2 bottom-2 flex flex-col items-center gap-1.5 sm:inset-x-4 sm:bottom-4">
        <div className="glass w-full max-w-md overflow-hidden rounded-2xl">
          <button
            onClick={() => setDescOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-xs font-semibold sm:text-sm"
          >
            <span className="truncate">{scene.label[lang]}</span>
            <span className="shrink-0 text-muted-foreground">{descOpen ? '−' : '+'}</span>
          </button>
          {descOpen && (
            <p className="max-h-24 overflow-y-auto px-4 pb-3 text-[11px] leading-relaxed text-muted-foreground sm:max-h-32 sm:text-xs">
              {scene.description[lang]}
            </p>
          )}
        </div>

        <div className="glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1">
          {ldhModule.scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSceneIdx(i)}
              className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-xs ${
                i === sceneIdx ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
