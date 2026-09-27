import { useEffect, useRef } from 'react'
import { MoleculeScene } from './MoleculeScene'
import type { SceneSpec } from './renderer'

interface SceneViewProps {
  /** public/structures/<pdbId>.pdb dan yuklanadi. */
  pdbId: string
  spec: SceneSpec
  spin?: boolean
}

export function SceneView({ pdbId, spec, spin = true }: SceneViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<MoleculeScene | null>(null)
  const loadedPdbRef = useRef<string | null>(null)

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
      loadedPdbRef.current = pdbId
      scene.applyScene(spec)
      scene.setSpin(spin)
    }

    setup()
    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
      loadedPdbRef.current = null
    }
    // pdbId o'zgarganda struktura qayta yuklanadi; spec/spin o'zgarishi
    // quyidagi alohida effektlarda, qayta yuklamasdan qo'llanadi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdbId])

  useEffect(() => {
    if (loadedPdbRef.current === pdbId) sceneRef.current?.applyScene(spec)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec])

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
