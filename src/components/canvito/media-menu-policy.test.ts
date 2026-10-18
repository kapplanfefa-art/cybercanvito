import { describe, expect, it } from "vitest";
import { pageHasMedia } from "./media-menu-policy";

const object = (type: string, isArtboard = false) => ({ isArtboard, isType: (expected: string) => type === expected });

describe("page media menu scope", () => {
  it("opens anywhere on a page containing an image, regardless of the clicked target", () => {
    expect(pageHasMedia([object("rect", true), object("image"), object("text")])).toBe(true);
  });
  it("opens for videos represented by Fabric images", () => {
    expect(pageHasMedia([object("image")])).toBe(true);
  });
  it("remains available after repeated copy and paste operations", () => {
    const objects = [object("image")];
    expect(pageHasMedia(objects)).toBe(true);
    objects.push(object("image"));
    expect(pageHasMedia(objects)).toBe(true);
  });
  it("keeps the empty page menu when the page has no media", () => {
    expect(pageHasMedia([])).toBe(false);
    expect(pageHasMedia([object("rect", true), object("text")])).toBe(false);
  });
});