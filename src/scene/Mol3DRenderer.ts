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
  if (sel.model !== undefined) out.model = sel.model
  return out
}

/** PDB koordinata ustunlari (0-indeksli): x 30–38, y 38–46, z 46–54. */
const X0 = 30

function isCoordLine(line: string): boolean {
  return line.startsWith('ATOM') || line.startsWith('HETATM')
}

interface Box {
  min: [number, number, number]
  max: [number, number, number]
}

function bbox(pdbText: string): Box {
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (const line of pdbText.split('\n')) {
    if (!isCoordLine(line) || line.length < X0 + 24) continue
    for (let k = 0; k < 3; k++) {
      const v = parseFloat(line.slice(X0 + k * 8, X0 + k * 8 + 8))
      if (Number.isNaN(v)) continue
      if (v < min[k]) min[k] = v
      if (v > max[k]) max[k] = v
    }
  }
  return { min, max }
}

/**
 * Strukturani ko'chiradi — PDB matnining o'zida, chunki 3Dmol'da modelni
 * ishonchli ko'chiradigan ommaviy API yo'q, matn ustunini qayta yozish esa
 * bir xil ishlaydi va tekshirish oson.
 */
function translate(pdbText: string, d: [number, number, number]): string {
  return pdbText
    .split('\n')
    .map((line) => {
      if (!isCoordLine(line) || line.length < X0 + 24) return line
      let out = line
      for (let k = 0; k < 3; k++) {
        const a = X0 + k * 8
        const v = parseFloat(line.slice(a, a + 8))
        if (Number.isNaN(v)) return line
        out = out.slice(0, a) + (v + d[k]).toFixed(3).padStart(8) + out.slice(a + 8)
      }
      return out
    })
    .join('\n')
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
  /** Shu viewer konteynerga qo'shgan tugunlar — dispose faqat shularni oladi. */
  private ownNodes: ChildNode[] = []
  private wheelHandler: ((ev: WheelEvent) => void) | null = null
  /** Eng oxirgi applyScene — sekin yuza hisobi tugaguncha sahna almashsa,
      eskisining natijasini chizmaslik uchun (race himoyasi). */
  private applyToken = 0

  private constructor(el: HTMLElement, viewer: GLViewer, mol: Mol3D) {
    this.el = el
    this.viewer = viewer
    this.mol = mol
  }

  static async create(el: HTMLElement): Promise<Mol3DRenderer> {
    const $3Dmol = await import('3dmol')
    // Konteynerni TOZALAMAYMIZ va dispose'da ham tozalamaymiz — faqat shu
    // viewer o'zi qo'shgan tugunlarni olib tashlaymiz. Sababi StrictMode:
    // effect ikki marta ishga tushadi, birinchi mount'ning Promise'i esa
    // ikkinchisi canvas yaratgandan KEYIN qaytishi mumkin; o'shanda
    // birinchisining dispose'i `el.innerHTML = ''` bilan ikkinchisining
    // canvas'ini ham o'chirib yuborardi va sahna butunlay bo'sh qolardi.
    const before = new Set(Array.from(el.childNodes))
    const viewer = $3Dmol.createViewer(el, { backgroundColor: '#0c1015' })
    const renderer = new Mol3DRenderer(el, viewer, $3Dmol)
    renderer.ownNodes = Array.from(el.childNodes).filter((n) => !before.has(n))
    renderer.installWheelZoom()
    return renderer
  }

  /**
   * 3Dmol'ning o'z g'ildirak ishlovchisi bitta hodisada kameraning to'liq
   * masofasining ~150% igacha siljitadi — Mac trackpad'da (bir imoda o'nlab
   * hodisa) bu "bir chimdimda molekula ichiga kirib ketish" degani. Hodisani
   * CAPTURE fazasida ushlab, 3Dmol'gacha yetkazmaymiz va o'rniga har
   * hodisada ko'pi bilan ~20% masshtab beramiz.
   */
  private installWheelZoom(): void {
    this.wheelHandler = (ev: WheelEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      if (!this.viewer) return
      // deltaMode 1 = qator (Firefox), 2 = sahifa — pikselga keltiramiz.
      const px = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaMode === 2 ? ev.deltaY * 400 : ev.deltaY
      const clamped = Math.max(-120, Math.min(120, px))
      this.viewer.zoom(Math.exp(-clamped * 0.0018))
    }
    this.el.addEventListener('wheel', this.wheelHandler, { capture: true, passive: false })
  }

  async load(_id: string, pdbTexts: string[]): Promise<void> {
    if (!this.viewer) return
    this.viewer.clear()
    // Bir nechta struktura berilsa ularni X bo'ylab yonma-yon tizamiz. Y va Z
    // bo'yicha markazlari TENGLASHTIRILADI — aks holda har kristall o'z
    // freymida turgani uchun biri kameradan uzoqroqda qolib, perspektivada
    // kichikroq ko'rinadi va taqqoslash yolg'on chiqadi.
    const GAP = 22
    const boxes = pdbTexts.map(bbox)
    const widths = boxes.map((b) => b.max[0] - b.min[0])
    const total = widths.reduce((a, w) => a + w, 0) + GAP * (widths.length - 1)
    let left = -total / 2
    pdbTexts.forEach((text, i) => {
      const b = boxes[i]
      const c = [0, 1, 2].map((k) => (b.min[k] + b.max[k]) / 2) as [number, number, number]
      const targetCx = left + widths[i] / 2
      left += widths[i] + GAP
      const shifted =
        pdbTexts.length === 1 ? text : translate(text, [targetCx - c[0], -c[1], -c[2]])
      this.viewer.addModel(shifted, 'pdb')
    })
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
    // getModel() faqat OXIRGI modelni beradi — yonma-yon sahnalarda birinchi
    // strukturaning yorliqlari yo'qolardi. viewer.selectedAtoms hammasini oladi.
    const atoms = this.viewer.selectedAtoms(toSelector(label.select))
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
    if (this.wheelHandler) this.el.removeEventListener('wheel', this.wheelHandler, { capture: true })
    this.wheelHandler = null
    for (const node of this.ownNodes) node.remove()
    this.ownNodes = []
  }
}
