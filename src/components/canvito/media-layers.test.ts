import { describe, expect, it } from "vitest";
import { layerDestination } from "./media-layers";

const paper = { isArtboard: true };
const a = { isArtboard: false };
const b = { isArtboard: false };
const c = { isArtboard: false };
const objects = [paper, a, b, c];
const isPaper = (object: typeof paper) => object.isArtboard;

describe("media layer order", () => {
  it("brings the selected image to the front", () => expect(layerDestination(objects, a, "front", isPaper)).toBe(3));
  it("moves the selected image one layer forward", () => expect(layerDestination(objects, a, "forward", isPaper)).toBe(2));
  it("moves the selected image one layer backward", () => expect(layerDestination(objects, c, "backward", isPaper)).toBe(2));
  it("sends media behind content but never behind the paper", () => expect(layerDestination(objects, c, "back", isPaper)).toBe(1));
  it("cannot reorder the paper", () => expect(layerDestination(objects, paper, "front", isPaper)).toBe(-1));
  it("keeps already backmost media above the paper", () => expect(layerDestination(objects, a, "backward", isPaper)).toBe(1));
});