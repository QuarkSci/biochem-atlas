// Render qatlami interfeysi. Bugungi adapter (Mol3DRenderer, 3Dmol.js) ham,
// kelajakdagi adapter (ThreeRenderer, pipeline'dan pishirilgan GLB ribbon)
// ham shu interfeysga mos keladi — UI/store/i18n bu tafsilotni bilmaydi.

export type StyleKind = 'cartoon' | 'stick' | 'sphere' | 'surface' | 'line'

export interface ResidueSelector {
  chain?: string | string[]
  /** PDB fayl qoldiq raqamlashi (UniProt emas — CLAUDE.md 5-bo'lim). */
  resi?: number | number[]
  resn?: string | string[]
  hetflag?: boolean
}

export interface StyleSpec {
  select: ResidueSelector
  style: StyleKind
  /** Rang: hex ('#4a9') yoki 3Dmol color scheme nomi (masalan 'chain', 'ss'). */
  color?: string
  /** cartoon uchun ikkilamchi struktura bo'yicha rang. */
  colorscheme?: string
  opacity?: number
}

export interface LabelSpec {
  select: ResidueSelector
  text: string
  /** Rang (hex), sukut — style qatlamnikiga mos oq/och rang. */
  color?: string
}

export interface SceneSpec {
  id: string
  /** Har biri alohida style qatlami — tartib muhim (keyingisi avvalgisi ustiga). */
  layers: StyleSpec[]
  /** 3D fazoda qoldiq nomi bilan yopishtiriladigan yorliqlar (taqdimot uchun). */
  labels?: LabelSpec[]
  /** Kamera shu tanlovga qarab kadrlanadi; bo'sh bo'lsa butun struktura. */
  zoomTo?: ResidueSelector
  /** Haqiqiy struktura emas — sxematik (5-sahna, geterotetramerlar). */
  schematic?: boolean
}

export interface AtomClickInfo {
  chain: string
  resi: number
  resn: string
}

export interface StructureRenderer {
  /** PDB matnini (yoki bir nechta faylni, model sifatida) yuklaydi. */
  load(id: string, pdbText: string): Promise<void>
  applyScene(spec: SceneSpec): void
  /** Strukturaning istalgan atomiga bosilganda chaqiriladi (masalan, tetramerda bitta zanjirni tanlash). */
  onAtomClick(cb: (info: AtomClickInfo) => void): void
  spin(on: boolean): void
  resize(): void
  dispose(): void
}
