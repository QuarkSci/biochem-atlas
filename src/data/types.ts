import type { SceneSpec } from '@/scene/renderer'

export interface L10nText {
  uz: string
  en: string
}

export interface ModuleScene {
  id: string
  label: L10nText
  /**
   * Qaysi PDB fayl(lar) yuklanadi (public/structures/<id>.pdb). Bir nechta
   * bo'lsa ular yonma-yon qo'yiladi va tanlovda `model: 0|1` bilan ajratiladi.
   */
  pdbIds: string[]
  spec: SceneSpec
  description: L10nText
}

/** 2D kimyoviy tuzilma chizmasining kaliti (`src/ui/ChemStructure.tsx`). */
export type ChemKey = 'reaction' | 'his-asp' | 'arg-clamp' | 'loop' | 'isoenzymes'

export interface Pathology {
  name: L10nText
  text: L10nText
}

/**
 * "Muhim qism" — molekulaning o'qitishga arziydigan aniq bir joyi
 * (reaksiyaga kirishadigan markaz, bukiladigan ilmoq, subbirlik chegarasi).
 * Har biri uchta narsani birga beradi: 3D ko'rinish, 2D kimyoviy tuzilma va
 * shu joy buzilganda kelib chiqadigan kasalliklar.
 */
export interface Hotspot {
  id: string
  /** Pastki chipda ko'rinadigan qisqa nom. */
  short: L10nText
  label: L10nText
  pdbIds: string[]
  spec: SceneSpec
  chem: ChemKey
  /** Bu joyda kimyoviy jihatdan nima sodir bo'ladi. */
  role: L10nText
  pathology: Pathology[]
  /** Shu qoldiqlarning biriga 3D'da bosilsa, aynan shu hotspot ochiladi. */
  resi?: number[]
  sources?: string[]
}

export interface Module {
  id: string
  title: L10nText
  subtitle: L10nText
  scenes: ModuleScene[]
  hotspots: Hotspot[]
  sources: string[]
}
