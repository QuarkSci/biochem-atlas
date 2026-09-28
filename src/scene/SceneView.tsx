import { useEffect, useRef } from 'react'
import { MoleculeScene } from './MoleculeScene'
import type { AtomClickInfo, SceneSpec } from './renderer'

interface SceneViewProps {
  /** public/structures/<pdbId>.pdb dan yuklanadi. */
  pdbId: string
  spec: SceneSpec
  spin?: boolean
  onAtomClick?: (info: AtomClickInfo) => void
  /** Yuklash yoki yuza hisobi davom etayotganda true (UI spinner uchun). */
  onBusy?: (busy: boolean) => void
}

export function SceneView({ pdbId, spec, spin = true, onAtomClick, onBusy }: SceneViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<MoleculeScene | null>(null)
  const loadedPdbRef = useRef<string | null>(null)
  const onAtomClickRef = useRef(onAtomClick)
  onAtomClickRef.current = onAtomClick
  const onBusyRef = useRef(onBusy)
  onBusyRef.current = onBusy

  useEffect(() => {
    let cancelled = false
    let scene: MoleculeScene | null = null

    async function setup() {
      if (!containerRef.current) return
      onBusyRef.current?.(true)
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
      scene.onAtomClick((info) => onAtomClickRef.current?.(info))
      await scene.applyScene(spec)
      scene.setSpin(spin)
      if (!cancelled) onBusyRef.current?.(false)
    }

    setup()
    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
      loadedPdbRef.current = null
    }
    // pdbId o'zgarganda struktura qayta yuklanadi; spec/spin/onAtomClick
    // o'zgarishi quyidagi alohida effektlarda yoki ref orqali, qayta
    // yuklamasdan qo'llanadi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdbId])

  useEffect(() => {
    if (loadedPdbRef.current !== pdbId) return
    let cancelled = false
    onBusyRef.current?.(true)
    sceneRef.current?.applyScene(spec).finally(() => {
      if (!cancelled) onBusyRef.current?.(false)
    })
    return () => {
      cancelled = true
    }
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

  return <div ref={containerRef} className="scene absolute inset-0" />
}
