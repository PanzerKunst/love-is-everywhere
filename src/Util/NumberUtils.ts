export function handleNearlyZero(value: number, epsilon: number = 1e-10): number {
  return Math.abs(value) < epsilon ? 0 : value
}
