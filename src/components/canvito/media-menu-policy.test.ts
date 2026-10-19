import { describe, expect, it } from "vitest";
import { canRemoveMedia, pageContextMenu, pageHasMedia } from "./media-menu-policy";

const object = (type: string, isArtboard = false) => ({ isArtboard, isType: (expected: string) => type === expected });

describe("media removal scope", () => {
  it("allows removing selected images and video-backed images", () => {
    expect(canRemoveMedia(object("image"))).toBe(true);
  });
  it("never removes the page, text, or an absent selection", () => {
    expect(canRemoveMedia(null)).toBe(false);
    expect(canRemoveMedia(object("image", true))).toBe(false);
    expect(canRemoveMedia(object("text"))).toBe(false);
  });
});

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

describe("page context menu choice", () => {
  it("shows the page menu on a paper holding only the page itself", () => {
    expect(pageContextMenu([object("rect", true)])).toBe("page");
    expect(pageContextMenu([])).toBe("page");
  });
  it("shows the page menu when the paper holds text but no image or video", () => {
    expect(pageContextMenu([object("rect", true), object("text")])).toBe("page");
  });
  it("shows the media menu as soon as the paper holds an image or video", () => {
    expect(pageContextMenu([object("rect", true), object("image")])).toBe("media");
  });
});
