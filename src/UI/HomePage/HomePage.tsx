import * as Cesium from "cesium"
import GUI from "lil-gui"
import { useEffect } from "react"

import { getModelOrientation, LonLat } from "../../Util/CesiumUtils.ts"
import { generate3dText } from "../../Util/ThreeUtils.ts"

import "./HomePage.scss"

// eslint-disable-next-line max-len
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMDA5OGQ1OS1iNjI5LTQwMDktYTVlNi1hNmM2NTMxMGRjNDgiLCJpZCI6MTcyMTQxLCJpYXQiOjE2OTc0NjIwNzF9.v300Gmf2TvGxrxKGBYYCh4KuY-gPS0W2Zt4z3n-NCL4"

// Only necessary to avoid double-mount in dev mode
let hasMounted = false

let viewer: Cesium.Viewer
let mouseDownCoords: LonLat
// let cameraDirection: XyzCoord

// let cameraOrientation: Cesium.Quaternion
// let cameraUp: Cartesian3
// let cameraRight: Cartesian3

// eslint-disable-next-line no-unused-vars
const messagesCesiumEntities: Cesium.Entity[] = []

const manhattanCoordinates: LonLat = {
  longitude: -73.985130,
  latitude: 40.758896
}

let modelOrientationGroup: GUI

const gui = new GUI()

async function initCesium() {
  const cesiumContainer = document.getElementById("cesium-container")

  if (!cesiumContainer) {
    return
  }

  viewer = new Cesium.Viewer(cesiumContainer, {
    // terrain: Terrain.fromWorldTerrain()
  })

  const { scene, camera } = viewer

  camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(manhattanCoordinates.longitude, manhattanCoordinates.latitude, 50000)
  })

  console.log("Camera direction", {
    direction: { ...camera.direction },
    directionWC: { ...camera.directionWC }
  })

  // Initialize ScreenSpaceEventHandler
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

  // Mouse click event listener
  handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const ray = camera.getPickRay(movement.position)
    const cartesian = ray && scene.globe.pick(ray, scene)

    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)

      mouseDownCoords = {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude)
      }

      console.log("mouseDownCoords", mouseDownCoords)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  /* const cameraDirectionGroup = gui.addFolder("Camera direction")
  cameraDirectionGroup.open()

  cameraDirectionGroup.add(camera.direction, "x")
    .min(-Math.PI).max(Math.PI).step(0.01)

  cameraDirectionGroup.add(camera.direction, "y")
    .min(-Math.PI).max(Math.PI).step(0.01)

  cameraDirectionGroup.add(camera.direction, "z")
    .min(-Math.PI).max(Math.PI).step(0.01) */

  function addModelControl() {
    const entity = messagesCesiumEntities[0]

    modelOrientationGroup = gui.addFolder("Model orientation")
    modelOrientationGroup.open()

    const orientationQuaternion = { x: 0, y: 0, z: 0, w: 0 }

    modelOrientationGroup.add(orientationQuaternion, "x", -Math.PI, Math.PI).onChange((value: number) => {
      const currentOrientation = getModelOrientation(entity)

      if (!currentOrientation) {
        return
      }

      const newQuaternion = new Cesium.Quaternion(value, currentOrientation.y, currentOrientation.z, currentOrientation.w)
      entity.orientation = new Cesium.ConstantPositionProperty(newQuaternion)
    })

    modelOrientationGroup.add(orientationQuaternion, "y", -Math.PI, Math.PI).onChange((value: number) => {
      const currentOrientation = getModelOrientation(entity)

      if (!currentOrientation) {
        return
      }

      const newQuaternion = new Cesium.Quaternion(currentOrientation.x, value, currentOrientation.z, currentOrientation.w)
      entity.orientation = new Cesium.ConstantPositionProperty(newQuaternion)
    })

    modelOrientationGroup.add(orientationQuaternion, "z", -Math.PI, Math.PI).onChange((value: number) => {
      const currentOrientation = getModelOrientation(entity)

      if (!currentOrientation) {
        return
      }

      const newQuaternion = new Cesium.Quaternion(currentOrientation.x, currentOrientation.y, value, currentOrientation.w)
      entity.orientation = new Cesium.ConstantPositionProperty(newQuaternion)
    })

    modelOrientationGroup.add(orientationQuaternion, "w", -Math.PI, Math.PI).onChange((value: number) => {
      const currentOrientation = getModelOrientation(entity)

      if (!currentOrientation) {
        return
      }

      const newQuaternion = new Cesium.Quaternion(currentOrientation.x, currentOrientation.y, currentOrientation.z, value)
      entity.orientation = new Cesium.ConstantPositionProperty(newQuaternion)
    })

    console.log("Controls added")
  }


  camera.moveEnd.addEventListener(() => {
    console.log("Camera movement ended")

    if (!modelOrientationGroup) {
      addModelControl()
    }

    // const cameraDirectionWC = Cesium.Cartesian3.normalize(camera.directionWC, new Cesium.Cartesian3())

    console.log("Camera direction", {
      dx: { ...camera.directionWC }.x,
      dy: { ...camera.directionWC }.y,
      dz: { ...camera.directionWC }.z,
      ux: { ...camera.upWC }.x,
      yy: { ...camera.upWC }.y,
      uz: { ...camera.upWC }.z
    })

    /* const entity = messagesCesiumEntities[0]

    if (entity?.model) {
      const cameraPosition = camera.positionWC

      if (!entity.position) {
        return
      }

      const modelPosition = entity.position.getValue(cesiumNow)

      if (!modelPosition) {
        return
      }

      const direction = Cesium.Cartesian3.subtract(cameraPosition, modelPosition, new Cesium.Cartesian3())
      Cesium.Cartesian3.normalize(direction, direction)
      const rotationMatrix = Cesium.Transforms.rotationMatrixFromPositionVelocity(modelPosition, direction)
      const rot90 = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
      // Cesium.Matrix3.multiply(rotationMatrix, rot90, getModelMatrix(scene, entity))
    } */
  })

  /* scene.preUpdate.addEventListener(() => {
    const entity = messagesCesiumEntities[0]

    if (entity?.model) {
      entity.orientation = new Cesium.ConstantPositionProperty(getCameraOrientation(camera))
    }
  }) */
}

export default function HomePage() {
  useEffect(() => {
    if (hasMounted) {
      return
    }

    initCesium()
    handleAddText("Hello")

    hasMounted = true
  }, [])

  // const [message, setMessage] = useState("")

  const handleAddText = async (message: string) => {
    const modelArrayBuffer = await generate3dText(message)
    const blob = new Blob([modelArrayBuffer], { type: "model/gltf-binary" })

    // TODO: remove
    console.log("mouseDownCoords", mouseDownCoords)

    const entity = viewer.entities.add({
      name: "3D Text",
      position: Cesium.Cartesian3.fromDegrees(manhattanCoordinates.longitude, manhattanCoordinates.latitude, 500),
      // orientation: new Cesium.ConstantPositionProperty(getCameraOrientation(camera)),
      model: {
        uri: URL.createObjectURL(blob),
        minimumPixelSize: 500,
        maximumScale: 20000
      }
    })

    messagesCesiumEntities.push(entity)
  }

  return (
    <main>
      <div id="cesium-container"/>

      {/* <Input
        id="message"
        value={message}
        placeholder="Enter love message"
        onChange={(event) => setMessage(event.target.value)}
      /> */}

      {/* <button onClick={handleAddText}>Add 3D Text</button> */}
    </main>
  )
}
