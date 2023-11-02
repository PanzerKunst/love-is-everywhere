import * as THREE from "three"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"

export function render3dText() {
  // Scene
  const scene = new THREE.Scene()

  const loadingManager = new THREE.LoadingManager(() => {
    // Loading finished
  }, () => {
    // Loading in progress
  }, (error) => {
    console.error("Error loading", error)
  })

  /**
   * Textures
   */
  const textureLoader = new THREE.TextureLoader(loadingManager) // Can load multiple textures

  // Tons of other matcaps: https://github.com/nidorx/matcaps
  const matcapTexture = textureLoader.load("textures/matcaps/4.png")

  /**
   * Fonts.
   * To convert to typeface: http://gero3.github.io/facetype.js/
   */
  const fontLoader = new FontLoader(loadingManager)
  fontLoader.load("fonts/helvetiker_regular.typeface.json", (font) => {
    const bevelThickness = 0.03
    const bevelSize = 0.02

    const textGeometry = new TextGeometry("Hello three.js", {
      font,
      size: 0.5,
      height: 0.2,
      curveSegments: 3,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelOffset: 0,
      bevelSegments: 2
    })

    /**
     * Centering the geometry
     */
    textGeometry.center()

    // Gives the illusion that the object is illuminated
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

    const text = new THREE.Mesh(textGeometry, material)
    text.rotation.x = - Math.PI * 0.5
    scene.add(text)
  })
}
