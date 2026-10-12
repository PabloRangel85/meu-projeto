import { describe, expect, it, vi } from "vitest";

import { calculateRoofArea, isRoofPolygonComplete, type RoofVertex } from "../domain/roof-measurement";

const vertices: RoofVertex[] = [
  { lat: -25.43, lng: -49.27 },
  { lat: -25.4301, lng: -49.27 },
  { lat: -25.4301, lng: -49.2701 },
];

describe("roof measurement", () => {
  it("requires at least three vertices before closing a polygon", () => {
    expect(isRoofPolygonComplete(vertices.slice(0, 2))).toBe(false);
    expect(isRoofPolygonComplete(vertices)).toBe(true);
  });

  it("does not calculate an incomplete polygon", () => {
    const calculateArea = vi.fn(() => 25);

    expect(calculateRoofArea(vertices.slice(0, 2), calculateArea)).toBeNull();
    expect(calculateArea).not.toHaveBeenCalled();
  });

  it("returns the spherical area for a complete polygon", () => {
    const calculateArea = vi.fn(() => 25.75);

    expect(calculateRoofArea(vertices, calculateArea)).toBe(25.75);
    expect(calculateArea).toHaveBeenCalledWith(vertices);
  });

  it("rejects a degenerate or invalid measured area", () => {
    expect(calculateRoofArea(vertices, () => 0)).toBeNull();
    expect(calculateRoofArea(vertices, () => Number.NaN)).toBeNull();
  });
});