import type { SceneSpec } from '@/scene/renderer'

export interface L10nText {
  uz: string
  en: string
}

export interface ModuleScene {
  id: string
  label: L10nText
  /** Qaysi PDB fayl yuklanadi (public/structures/<pdbId>.pdb). */
  pdbId: string
  spec: SceneSpec
  description: L10nText
}

export interface Module {
  id: string
  title: L10nText
  scenes: ModuleScene[]
  sources: string[]
}
