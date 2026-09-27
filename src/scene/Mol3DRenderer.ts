// 3Dmol.js adapteri. 3Dmol tiplari faqat shu faylda ko'rinadi — StructureRenderer
// interfeysi orqasidan tashqariga chiqmaydi (renderer.ts).
import type { LabelSpec, ResidueSelector, SceneSpec, StructureRenderer, StyleSpec } from './renderer'

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
  private el: HTMLElement

  private constructor(el: HTMLElement, viewer: GLViewer) {
    this.el = el
    this.viewer = viewer
  }

  static async create(el: HTMLElement): Promise<Mol3DRenderer> {
    // React StrictMode dev rejimida effect ikki marta ishga tushadi — eski
    // canvas konteynerda qolib ketmasligi uchun tozalab boshlaymiz.
    el.innerHTML = ''
    const $3Dmol = await import('3dmol')
    const viewer = $3Dmol.createViewer(el, { backgroundColor: '#0c1015' })
    return new Mol3DRenderer(el, viewer)
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
    this.viewer.removeAllLabels()
    for (const layer of spec.layers) {
      this.viewer.setStyle(toSelector(layer.select), toStyle(layer))
    }
    for (const label of spec.labels ?? []) this.addResidueLabel(label)
    if (spec.zoomTo) this.viewer.zoomTo(toSelector(spec.zoomTo))
    else this.viewer.zoomTo()
    this.viewer.render()
  }

  private addResidueLabel(label: LabelSpec): void {
    if (!this.viewer) return
    const atoms = this.viewer.getModel().selectedAtoms(toSelector(label.select))
    if (atoms.length === 0) return
    const anchor = atoms.find((a: any) => a.atom === 'CA') ?? atoms[0]
    this.viewer.addLabel(label.text, {
      position: { x: anchor.x, y: anchor.y, z: anchor.z },
      backgroundColor: '#0c1015',
      backgroundOpacity: 0.7,
      fontColor: label.color ?? '#ffffff',
      fontSize: 13,
      borderThickness: 0,
    })
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
    this.el.innerHTML = ''
  }
}
