import { useState } from 'react'
import { SceneView } from './scene/SceneView'
import { ldhModule } from './data/modules/ldh'

type Lang = 'uz' | 'en'

export default function App() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [lang, setLang] = useState<Lang>('uz')
  const scene = ldhModule.scenes[sceneIdx]

  return (
    <div className="dark fixed inset-0 overflow-hidden bg-background text-foreground">
      <SceneView pdbId={scene.pdbId} spec={scene.spec} />

      <div className="glass pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-2 text-center">
        <div className="text-sm font-medium">{ldhModule.title[lang]}</div>
        <div className="text-xs text-muted-foreground">
          PDB {scene.pdbId} {scene.spec.schematic ? `· ${lang === 'uz' ? 'SXEMATIK' : 'SCHEMATIC'}` : ''}
        </div>
      </div>

      <button
        onClick={() => setLang((l) => (l === 'uz' ? 'en' : 'uz'))}
        className="glass absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-medium"
      >
        {lang === 'uz' ? 'EN' : 'UZ'}
      </button>

      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
        <div className="glass max-h-[26vh] w-[min(92vw,28rem)] overflow-y-auto rounded-2xl px-5 py-3 text-sm leading-relaxed">
          <div className="mb-1 font-semibold">{scene.label[lang]}</div>
          <p className="text-muted-foreground">{scene.description[lang]}</p>
        </div>

        <div className="glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1">
          {ldhModule.scenes.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSceneIdx(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
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
