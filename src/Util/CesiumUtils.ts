import * as Cesium from "cesium"

export type LonLat = {
  longitude: number;
  latitude: number;
}

export function arePositionsIdentical(pos1: Cesium.Cartesian2, pos2: Cesium.Cartesian2): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

export function getCameraOrientation(camera: Cesium.Camera): Cesium.Quaternion {
  const cameraDirection = Cesium.Cartesian3.normalize(camera.directionWC, new Cesium.Cartesian3())
  const cameraUp = Cesium.Cartesian3.normalize(camera.upWC, new Cesium.Cartesian3())
  const cameraRight = Cesium.Cartesian3.cross(cameraDirection, cameraUp, new Cesium.Cartesian3())

  return Cesium.Quaternion.fromRotationMatrix(
    Cesium.Matrix3.fromColumnMajorArray([
      cameraRight.x, cameraDirection.x, cameraUp.x,
      cameraRight.y, cameraDirection.y, cameraUp.y,
      cameraRight.z, cameraDirection.z, cameraUp.z
    ])
  )
}

export function getCameraOrientation2(camera: Cesium.Camera): Cesium.Quaternion {
  const direction = camera.directionWC
  const up = camera.upWC
  const right = camera.rightWC

  // Manually constructing quaternion from camera's world-coordinate axes
  const w = Math.sqrt(1.0 + right.x + up.y + direction.z) / 2.0
  const w4 = 4.0 * w
  const x = (up.z - direction.y) / w4
  const y = (direction.x - right.z) / w4
  const z = (right.y - up.x) / w4

  return new Cesium.Quaternion(x, y, z, w)
}

export function getModelMatrix(scene: Cesium.Scene, entity: Cesium.Entity): Cesium.Matrix4 {
  const { primitives } = scene
  let entityPrimitive

  for (let i = 0; i < primitives.length; i++) {
    const primitive = primitives.get(i)

    // Identify the primitive associated with your entity
    if (primitive.id === entity) {
      entityPrimitive = primitive
      break
    }
  }

  return entityPrimitive?.modelMatrix
}

export function getModelOrientation(entity: Cesium.Entity) {
  const modelMatrix = entity.computeModelMatrix(Cesium.JulianDate.now())

  if (!Cesium.defined(modelMatrix)) {
    return
  }

  const rotationMatrix = Cesium.Matrix4.getRotation(modelMatrix, new Cesium.Matrix3())
  return Cesium.Quaternion.fromRotationMatrix(rotationMatrix)
}
