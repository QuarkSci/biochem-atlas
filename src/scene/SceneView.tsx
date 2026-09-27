import { useEffect, useRef } from 'react'
import { MoleculeScene } from './MoleculeScene'

interface SceneViewProps {
  /** data/raw/<pdbId>.pdb dan public/structures/<pdbId>.pdb ga nusxalanadi (Vite public). */
  pdbId: string
  spin?: boolean
}

export function SceneView({ pdbId, spin = true }: SceneViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<MoleculeScene | null>(null)

  useEffect(() => {
    let cancelled = false
    let scene: MoleculeScene | null = null

    async function setup() {
      if (!containerRef.current) return
      scene = await MoleculeScene.mount(containerRef.current)
      if (cancelled) {
        scene.dispose()
        return
      }
      sceneRef.current = scene
      const res = await fetch(`${import.meta.env.BASE_URL}structures/${pdbId}.pdb`)
      const pdbText = await res.text()
      if (cancelled) return
      await scene.load(pdbId, pdbText)
      scene.setSpin(spin)
    }

    setup()
    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdbId])

  useEffect(() => {
    sceneRef.current?.setSpin(spin)
  }, [spin])

  useEffect(() => {
    const onResize = () => sceneRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return <div ref={containerRef} className="absolute inset-0" />
}
