import { Mol3DRenderer } from './Mol3DRenderer'
import type { AtomClickInfo, SceneSpec, StructureRenderer } from './renderer'

/**
 * Sahna boshqaruvi — neuro-atlas'dagi BrainScene'ga o'xshash rol, lekin
 * bugungi renderer (3Dmol) o'z canvas'ini o'zi boshqaradi, shuning uchun
 * bu klass yupqa: yuklash + StructureRenderer orqali sahna spetsifikatsiyasi.
 */
export class MoleculeScene {
  private renderer: StructureRenderer | null = null

  static async mount(el: HTMLElement): Promise<MoleculeScene> {
    const scene = new MoleculeScene()
    scene.renderer = await Mol3DRenderer.create(el)
    return scene
  }

  async load(id: string, pdbTexts: string[]) {
    await this.renderer?.load(id, pdbTexts)
  }

  async applyScene(spec: SceneSpec) {
    await this.renderer?.applyScene(spec)
  }

  onAtomClick(cb: (info: AtomClickInfo) => void) {
    this.renderer?.onAtomClick(cb)
  }

  setSpin(on: boolean) {
    this.renderer?.spin(on)
  }

  resize() {
    this.renderer?.resize()
  }

  dispose() {
    this.setSpin(false)
    this.renderer?.dispose()
  }
}
