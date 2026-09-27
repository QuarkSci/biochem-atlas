import { SceneView } from './scene/SceneView'

export default function App() {
  return (
    <div className="dark fixed inset-0 overflow-hidden bg-background text-foreground">
      <SceneView pdbId="1I10" />
      <div className="glass pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 text-center">
        <div className="text-sm font-medium">Laktatdegidrogenaza (LDH) — inson mushak M-zanjiri</div>
        <div className="text-xs text-muted-foreground">PDB 1I10 · Faza 0 — bitta struktura</div>
      </div>
    </div>
  )
}
