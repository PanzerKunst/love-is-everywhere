import { Cartesian2 } from "cesium"

export type LonLat = {
  longitude: number;
  latitude: number;
}

export function arePositionsIdentical(pos1: Cartesian2, pos2: Cartesian2): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y
}
