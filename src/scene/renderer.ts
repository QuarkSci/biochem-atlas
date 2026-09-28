// Render qatlami interfeysi. Bugungi adapter (Mol3DRenderer, 3Dmol.js) ham,
// kelajakdagi adapter (ThreeRenderer, pipeline'dan pishirilgan GLB ribbon)
// ham shu interfeysga mos keladi — UI/store/i18n bu tafsilotni bilmaydi.

export type StyleKind = 'cartoon' | 'stick' | 'sphere' | 'line'

export interface ResidueSelector {
  chain?: string | string[]
  /** PDB fayl qoldiq raqamlashi (UniProt emas — CLAUDE.md 5-bo'lim). */
  resi?: number | number[]
  resn?: string | string[]
  hetflag?: boolean
  /** Yonma-yon qo'yilgan strukturalardan qaysi biri (0 = birinchi pdbId). */
  model?: number
}

export interface StyleSpec {
  select: ResidueSelector
  style: StyleKind
  /** Rang: hex ('#4a9') yoki 3Dmol color scheme nomi (masalan 'chain', 'ss'). */
  color?: string
  /** cartoon uchun ikkilamchi struktura, stick/sphere uchun element bo'yicha rang. */
  colorscheme?: string
  opacity?: number
  /** stick uchun tayoqcha qalinligi, sphere uchun radius (Å). */
  radius?: number
}

/**
 * Molekulyar yuza — oqsilni "quruq lenta" emas, haqiqiy hajmli jism
 * sifatida ko'rsatadigan qatlam. 3Dmol buni `setStyle` bilan emas, alohida
 * `addSurface` bilan hisoblaydi (sekin — shuning uchun applyScene async).
 */
export interface SurfaceSpec {
  select: ResidueSelector
  /** VDW eng tez, SAS o'rtacha, MS (Connolly) eng silliq va eng sekin. */
  kind?: 'VDW' | 'SAS' | 'MS'
  color?: string
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
  /** Yuza qatlamlari (ixtiyoriy) — lentaning ustiga shaffof qobiq. */
  surfaces?: SurfaceSpec[]
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
  /**
   * Bir yoki bir nechta PDB matnini yuklaydi. Bir nechta berilsa ular X o'qi
   * bo'ylab YONMA-YON qo'yiladi (taqqoslash sahnalari uchun: M4 va H4).
   * Tanlovda `model: i` bilan murojaat qilinadi.
   */
  load(id: string, pdbTexts: string[]): Promise<void>
  /** Yuza hisoblanishi sekundlar olishi mumkin — shuning uchun Promise. */
  applyScene(spec: SceneSpec): Promise<void>
  /** Strukturaning istalgan atomiga bosilganda chaqiriladi (masalan, tetramerda bitta zanjirni tanlash). */
  onAtomClick(cb: (info: AtomClickInfo) => void): void
  spin(on: boolean): void
  resize(): void
  dispose(): void
}
