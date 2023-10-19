import * as THREE from "three"
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js"
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"
import { FontLoader } from "three/addons/loaders/FontLoader.js"

export function generate3DText(text: string): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    // Initialize Three.js scene
    const scene = new THREE.Scene()
    // TODO const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Add text geometry
    const loader = new FontLoader()
    loader.load("/public/fonts/Proxima Nova Regular.json", (font) => {
      const geometry = new TextGeometry(text, {
        font: font,
        size: 1,
        height: 0.2
      })

      const material = new THREE.MeshBasicMaterial({ color: 0xffffff }) // TODO: import from SCSS
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

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
