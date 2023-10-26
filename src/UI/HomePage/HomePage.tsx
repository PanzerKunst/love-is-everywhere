import { Input } from "@mui/joy"
import * as Cesium from "cesium"
import { Cartesian3, Cartographic, Ion, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } from "cesium"
import { useEffect, useState } from "react"

import { LonLat } from "../../Util/CesiumUtils.ts"
import { generate3DText, generateOther3DText } from "../../Util/ThreeUtils.ts"

import "./HomePage.scss"

// eslint-disable-next-line max-len
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMDA5OGQ1OS1iNjI5LTQwMDktYTVlNi1hNmM2NTMxMGRjNDgiLCJpZCI6MTcyMTQxLCJpYXQiOjE2OTc0NjIwNzF9.v300Gmf2TvGxrxKGBYYCh4KuY-gPS0W2Zt4z3n-NCL4"

let viewer: Viewer
let mouseDownCoords: LonLat

const manhattanCoordinates: LonLat = {
  longitude: -73.985130,
  latitude: 40.758896
}

async function initCesium() {
  const cesiumContainer = document.getElementById("cesium-container")

  if (!cesiumContainer) {
    return
  }

  // This is only needed in development mode, because the component is mounted twice
  cesiumContainer.innerHTML = ""

  viewer = new Viewer(cesiumContainer, {
    // terrain: Terrain.fromWorldTerrain()
  })

  viewer.camera.setView({
    destination : Cesium.Cartesian3.fromDegrees(manhattanCoordinates.longitude, manhattanCoordinates.latitude, 50000)
  })

  // Initialize ScreenSpaceEventHandler
  const handler = new ScreenSpaceEventHandler(viewer.canvas)

  // Mouse click event listener
  handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
    const ray = viewer.camera.getPickRay(movement.position)
    const cartesian = ray && viewer.scene.globe.pick(ray, viewer.scene)

    if (cartesian) {
      const cartographic = Cartographic.fromCartesian(cartesian)

      mouseDownCoords = {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude)
      }

      console.log("mouseDownCoords", mouseDownCoords)
    }
  }, ScreenSpaceEventType.LEFT_CLICK)
}

function addDuckModel() {
  // Add the 3D model to the scene
  const entity = viewer.entities.add({
    name: "Duck",
    position: Cartesian3.fromDegrees(manhattanCoordinates.longitude, manhattanCoordinates.latitude, 300),
    model: {
      uri: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
      minimumPixelSize: 128,
      maximumScale: 20000
    }
  })
}

export default function HomePage() {
  useEffect(() => {
    initCesium()
    // addDuckModel()
    handleAddText("Hello World!")
  }, [])

  const [message, setMessage] = useState("")

  const handleAddText = async (message: string) => {
    const modelArrayBuffer = await generateOther3DText(message)
    const blob = new Blob([modelArrayBuffer], { type: "model/gltf-binary" })

    // TODO: remove
    console.log("mouseDownCoords", mouseDownCoords)

    viewer.entities.add({
      name: "3D Text",
      position: Cartesian3.fromDegrees(manhattanCoordinates.longitude, manhattanCoordinates.latitude, 500),
      model: {
        uri: URL.createObjectURL(blob),
        minimumPixelSize: 500,
        maximumScale: 20000
      }
    })
  }

  return (
    <main>
      <div id="cesium-container" />

      <Input
        id="message"
        value={message}
        placeholder="Enter love message"
        onChange={(event) => setMessage(event.target.value)}
      />

      <button onClick={handleAddText}>Add 3D Text</button>
    </main>
  )
}
