// 3Dmol.js adapteri. 3Dmol tiplari faqat shu faylda ko'rinadi — StructureRenderer
// interfeysi orqasidan tashqariga chiqmaydi (renderer.ts).
import type {
  AtomClickInfo,
  LabelSpec,
  ResidueSelector,
  SceneSpec,
  StructureRenderer,
  StyleSpec,
  SurfaceSpec,
} from './renderer'

// 3Dmol paketida rasmiy TS tiplari yo'q — dynamic import + any bilan izolyatsiya.
type GLViewer = any
type Mol3D = any

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
      return { stick: spec.radius !== undefined ? { ...props, radius: spec.radius } : props }
    case 'sphere':
      return { sphere: spec.radius !== undefined ? { ...props, radius: spec.radius } : props }
    case 'line':
      return { line: props }
  }
}

export class Mol3DRenderer implements StructureRenderer {
  private viewer: GLViewer | null = null
  private mol: Mol3D
  private el: HTMLElement
  private clickCb: ((info: AtomClickInfo) => void) | null = null
  /** Eng oxirgi applyScene — sekin yuza hisobi tugaguncha sahna almashsa,
      eskisining natijasini chizmaslik uchun (race himoyasi). */
  private applyToken = 0

  private constructor(el: HTMLElement, viewer: GLViewer, mol: Mol3D) {
    this.el = el
    this.viewer = viewer
    this.mol = mol
  }

  static async create(el: HTMLElement): Promise<Mol3DRenderer> {
    // React StrictMode dev rejimida effect ikki marta ishga tushadi — eski
    // canvas konteynerda qolib ketmasligi uchun tozalab boshlaymiz.
    el.innerHTML = ''
    const $3Dmol = await import('3dmol')
    const viewer = $3Dmol.createViewer(el, { backgroundColor: '#0c1015' })
    return new Mol3DRenderer(el, viewer, $3Dmol)
  }

  async load(_id: string, pdbText: string): Promise<void> {
    if (!this.viewer) return
    this.viewer.clear()
    this.viewer.addModel(pdbText, 'pdb')
    this.viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
    this.viewer.setClickable({}, true, (atom: any) => {
      this.clickCb?.({ chain: atom.chain, resi: atom.resi, resn: atom.resn })
    })
    this.viewer.zoomTo()
    this.viewer.render()
  }

  onAtomClick(cb: (info: AtomClickInfo) => void): void {
    this.clickCb = cb
  }

  async applyScene(spec: SceneSpec): Promise<void> {
    if (!this.viewer) return
    const token = ++this.applyToken
    this.viewer.removeAllSurfaces()
    this.viewer.setStyle({}, {})
    this.viewer.removeAllLabels()
    // 3Dmol'da setStyle tanlangan atomlarning uslubini ALMASHTIRADI, qo'shmaydi
    // — shuning uchun bir xil tanlovga qaratilgan qatlamlar (masalan stick +
    // sphere) bitta chaqiruvda birlashtirilishi kerak, aks holda faqat
    // oxirgisi ko'rinadi (avval shu xato bo'lgan: NADH'ning tayoqchalari
    // sharlar ostida yo'qolgan edi).
    const merged = new Map<string, { sel: Record<string, unknown>; style: Record<string, unknown> }>()
    for (const layer of spec.layers) {
      const sel = toSelector(layer.select)
      const key = JSON.stringify(sel)
      const entry = merged.get(key) ?? { sel, style: {} }
      Object.assign(entry.style, toStyle(layer))
      merged.set(key, entry)
    }
    for (const { sel, style } of merged.values()) this.viewer.setStyle(sel, style)
    for (const label of spec.labels ?? []) this.addResidueLabel(label)
    if (spec.zoomTo) this.viewer.zoomTo(toSelector(spec.zoomTo))
    else this.viewer.zoomTo()
    // Lenta darhol ko'rinsin; yuza (sekundlar oladi) keyin ustiga qo'shiladi.
    this.viewer.render()

    for (const surface of spec.surfaces ?? []) {
      await this.addSurface(surface)
      if (token !== this.applyToken || !this.viewer) return
    }
    if (spec.surfaces?.length) this.viewer.render()
  }

  private async addSurface(surface: SurfaceSpec): Promise<void> {
    if (!this.viewer) return
    const props: Record<string, unknown> = { opacity: surface.opacity ?? 0.7 }
    if (surface.color) props.color = surface.color
    if (surface.colorscheme) props.colorscheme = surface.colorscheme
    const type = this.mol.SurfaceType[surface.kind ?? 'VDW']
    // addSurface eski versiyalarda callback, yangilarida Promise qaytaradi —
    // Promise.resolve ikkalasini ham qoplaydi (callback holatida darhol tugaydi).
    await Promise.resolve(this.viewer.addSurface(type, props, toSelector(surface.select)))
  }

  private addResidueLabel(label: LabelSpec): void {
    if (!this.viewer) return
    const atoms = this.viewer.getModel().selectedAtoms(toSelector(label.select))
    if (atoms.length === 0) return
    const anchor = atoms.find((a: any) => a.atom === 'CA') ?? atoms[0]
    this.viewer.addLabel(label.text, {
      position: { x: anchor.x, y: anchor.y, z: anchor.z },
      backgroundColor: '#0c1015',
      backgroundOpacity: 0.72,
      fontColor: label.color ?? '#ffffff',
      fontSize: 12,
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
    this.applyToken++
    this.viewer?.clear()
    this.viewer = null
    this.el.innerHTML = ''
  }
}
