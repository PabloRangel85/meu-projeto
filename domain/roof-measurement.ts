export type RoofVertex = {
  lat: number;
  lng: number;
};

export function isRoofPolygonComplete(vertices: readonly RoofVertex[]): boolean {
  return vertices.length >= 3;
}

export function calculateRoofArea(
  vertices: readonly RoofVertex[],
  calculateSphericalArea: (vertices: readonly RoofVertex[]) => number,
): number | null {
  if (!isRoofPolygonComplete(vertices)) return null;

  const area = calculateSphericalArea(vertices);
  return Number.isFinite(area) && area > 0 ? area : null;
}