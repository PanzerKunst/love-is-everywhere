import {
  BillboardCollection,
  Cartesian2,
  Cartesian3,
  defined,
  HorizontalOrigin,
  Ion,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  Viewer
} from "cesium"
import { useEffect } from "react"

import { arePositionsIdentical } from "../../Util/CesiumUtils.ts"

import "./HomePage.scss"

// eslint-disable-next-line max-len
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmMDA5OGQ1OS1iNjI5LTQwMDktYTVlNi1hNmM2NTMxMGRjNDgiLCJpZCI6MTcyMTQxLCJpYXQiOjE2OTc0NjIwNzF9.v300Gmf2TvGxrxKGBYYCh4KuY-gPS0W2Zt4z3n-NCL4"

// Helper function to convert text to a Data URL (an image)
function textToImage(text: string): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  // Set the font and measure the text width
  // const fontSizePx = 100
  /* ctx.font = "30px Arial"
  const textMetrics = ctx.measureText(text)

  // Resize the canvas to fit the text
  canvas.width = textMetrics.width
  // canvas.height = 50  // height based on the font size and your preference

  // Draw the red background
  ctx.fillStyle = "red"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw the white text
  ctx.fillStyle = "white"
  ctx.fillText(text, 0, 40) // The y-coordinate is adjusted to position the text correctly */

  const fontSizePx = 30
  ctx.font = `${fontSizePx}px Proxima Nova`
  ctx.fillStyle = "#fff" // TODO: import from SCSS
  ctx.fillText(text, 0, fontSizePx)

  // Draw the red background
  ctx.fillStyle = "red"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "#fff"
  ctx.fillText(text, 0, fontSizePx)

  return canvas.toDataURL()
}

async function initCesium() {
  const cesiumContainer = document.getElementById("cesium-container")

  if (!cesiumContainer) {
    return
  }

  // This is only needed in development mode, because the component is mounted twice
  cesiumContainer.innerHTML = ""

  const viewer = new Viewer(cesiumContainer, {
    // terrain: Terrain.fromWorldTerrain()
  })

  // Create BillboardCollection to store Billboards
  const billboards = viewer.scene.primitives.add(new BillboardCollection()) as BillboardCollection

  // Helper function to create a Billboard
  const createBillboard = (position: Cartesian3, text: string) => {
    billboards.add({
      position: position,
      image: textToImage(text),
      horizontalOrigin: HorizontalOrigin.LEFT,
      verticalOrigin: VerticalOrigin.TOP,
    })

    /* viewer.entities.add({
      position,
      label: {
        text: text,
        font: "24px Helvetica",
        fillColor: Color.WHITE,
        // outlineColor: Color.BLACK,
        // outlineWidth: 1,
        style: LabelStyle.FILL,
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.CENTER,
        // scaleByDistance: new NearFarScalar(1.5e2, 1.5, 8.0e6, 0.0),
        eyeOffset: new Cartesian3(0.0, 0.0, -2.0),  // Closer to the viewer
      },
      billboard: {
        image: textBgImage(),
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.CENTER,
        eyeOffset: new Cartesian3(0.0, 0.0, -1.0),  // Further away from the viewer
      },
    }) */
  }

  // Initialize ScreenSpaceEventHandler
  const handler = new ScreenSpaceEventHandler(viewer.canvas)

  let mouseDownCoordsPosition: Cartesian2

  let selectedBillboard: any // eslint-disable-line @typescript-eslint/no-explicit-any

  // Mouse down event listener
  handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
    mouseDownCoordsPosition = movement.position

    const pickedObject = viewer.scene.pick(mouseDownCoordsPosition)

    // TODO: remove
    console.log("pickedObject", pickedObject)
    console.log("billboards", billboards)

    if (defined(pickedObject) && pickedObject.id === billboards) {
      selectedBillboard = pickedObject
    }
  }, ScreenSpaceEventType.LEFT_DOWN)

  // Mouse up event listener
  handler.setInputAction((movement: ScreenSpaceEventHandler.PositionedEvent) => {
    const mouseUpPosition = movement.position

    if (arePositionsIdentical(mouseDownCoordsPosition, mouseUpPosition)) {
      const cartesian = viewer.camera.pickEllipsoid(mouseUpPosition, viewer.scene.globe.ellipsoid)
      if (cartesian) {
        const text = prompt("Your love message:")
        if (text) {
          createBillboard(cartesian, text)
        }
      }
    }
    selectedBillboard = undefined
  }, ScreenSpaceEventType.LEFT_UP)

  // Mouse move event listener
  handler.setInputAction((movement: ScreenSpaceEventHandler.MotionEvent) => {
    if (selectedBillboard) {
      const ray = viewer.camera.getPickRay(movement.endPosition)
      const cartesian = ray && viewer.scene.globe.pick(ray, viewer.scene)
      if (cartesian && selectedBillboard) {
        selectedBillboard.primitive.position = cartesian
      }
    }
  }, ScreenSpaceEventType.MOUSE_MOVE)
}

export default function HomePage() {
  useEffect(() => {
    initCesium()
  }, [])

  return (
    <div id="cesium-container"></div>
  )
}
