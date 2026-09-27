// 3Dmol.js adapteri. 3Dmol tiplari faqat shu faylda ko'rinadi — StructureRenderer
// interfeysi orqasidan tashqariga chiqmaydi (renderer.ts).
import type { ResidueSelector, SceneSpec, StructureRenderer, StyleSpec } from './renderer'

// 3Dmol paketida rasmiy TS tiplari yo'q — dynamic import + any bilan izolyatsiya.
type GLViewer = any

function toSelector(sel: ResidueSelector): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (sel.chain) out.chain = sel.chain
  if (sel.resi !== undefined) out.resi = sel.resi
  if (sel.resn !== undefined) out.resn = sel.resn
  if (sel.hetflag !== undefined) out.hetflag = sel.hetflag
  return out
}

function toStyle(spec: StyleSpec): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  if (spec.color) props.color = spec.color
  if (spec.colorscheme) props.colorscheme = spec.colorscheme
  if (spec.opacity !== undefined) props.opacity = spec.opacity
  switch (spec.style) {
    case 'cartoon':
      return { cartoon: props }
    case 'stick':
      return { stick: props }
    case 'sphere':
      return { sphere: props }
    case 'surface':
      return { surface: props }
    case 'line':
      return { line: props }
  }
}

export class Mol3DRenderer implements StructureRenderer {
  private viewer: GLViewer | null = null

  private constructor(viewer: GLViewer) {
    this.viewer = viewer
  }

  static async create(el: HTMLElement): Promise<Mol3DRenderer> {
    const $3Dmol = await import('3dmol')
    const viewer = $3Dmol.createViewer(el, { backgroundColor: '#0c1015' })
    return new Mol3DRenderer(viewer)
  }

  async load(_id: string, pdbText: string): Promise<void> {
    if (!this.viewer) return
    this.viewer.clear()
    this.viewer.addModel(pdbText, 'pdb')
    this.viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
    this.viewer.zoomTo()
    this.viewer.render()
  }

  applyScene(spec: SceneSpec): void {
    if (!this.viewer) return
    this.viewer.setStyle({}, {})
    for (const layer of spec.layers) {
      this.viewer.setStyle(toSelector(layer.select), toStyle(layer))
    }
    if (spec.zoomTo) this.viewer.zoomTo(toSelector(spec.zoomTo))
    else this.viewer.zoomTo()
    this.viewer.render()
  }

  spin(on: boolean): void {
    this.viewer?.spin(on ? 'y' : false)
  }

  resize(): void {
    this.viewer?.resize()
  }

  dispose(): void {
    this.viewer?.clear()
    this.viewer = null
  }
}
