import * as THREE from "three"
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"
import { FontLoader } from "three/addons/loaders/FontLoader.js"

export type XyzCoord = {
  x: number;
  y: number;
  z: number;
}

export function generate3dText(message: string): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    // Scene
    const scene = new THREE.Scene()

    const loadingManager = new THREE.LoadingManager(() => {
      // Loading finished
    }, () => {
      // Loading in progress
    }, (error) => {
      console.error("Error loading", error)
    })

    // Reacts to light
    const material = new THREE.MeshStandardMaterial()
    material.color = new THREE.Color(0xff5555)

    /**
     * Fonts.
     * To convert to typeface: http://gero3.github.io/facetype.js/
     */
    const fontLoader = new FontLoader(loadingManager)
    fontLoader.load("fonts/helvetiker_regular.typeface.json", (font) => {
      const bevelThickness = 0.03
      const bevelSize = 0.02

      const textGeometry = new TextGeometry(message, {
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

      const text = new THREE.Mesh(textGeometry, material)
      text.rotation.x = -Math.PI * 0.5
      text.rotation.z = -Math.PI * 0.5
      scene.add(text)

      // Export to glTF
      const exporter = new GLTFExporter()
      exporter.parse(scene,
        (gltf) => { // onCompleted
          if (gltf instanceof ArrayBuffer) {
            resolve(gltf)
          } else {
            const output = JSON.stringify(gltf)
            const blob = new Blob([output], { type: "application/octet-stream" })
            resolve(blob.arrayBuffer())
          }
        },
        () => { // onError
        })
    })
  })
}
