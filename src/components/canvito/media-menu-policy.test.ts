import { describe, expect, it } from "vitest";
import { canRemoveMedia, deletionShortcut, pageContextMenu, pageHasMedia } from "./media-menu-policy";

const object = (type: string, isArtboard = false) => ({ isArtboard, isType: (expected: string) => type === expected });

describe("deletion shortcut", () => {
  it("deletes selected image and video-backed image with Delete", () => {
    expect(deletionShortcut("Delete", object("image"), false)).toBe(true);
  });
  it("preserves Backspace deletion of selected objects", () => {
    expect(deletionShortcut("Backspace", object("image"), false)).toBe(true);
  });
  it("never deletes the paper or a page with no selection", () => {
    expect(deletionShortcut("Delete", object("rect", true), false)).toBe(false);
    expect(deletionShortcut("Delete", null, false)).toBe(false);
  });
  it("leaves Delete to the input while typing", () => {
    expect(deletionShortcut("Delete", object("image"), true)).toBe(false);
  });
  it("leaves Delete to Fabric during text editing", () => {
    expect(deletionShortcut("Delete", { ...object("text"), isEditing: true }, false)).toBe(false);
  });
  it("does not delete for unrelated keys", () => {
    expect(deletionShortcut("Enter", object("image"), false)).toBe(false);
  });
});

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
  it("uses only the clicked paper's contents, not media on another paper", () => {
    const mediaPage = [object("rect", true), object("image")];
    const emptyPage = [object("rect", true)];
    expect(pageContextMenu(mediaPage)).toBe("media");
    expect(pageContextMenu(emptyPage)).toBe("page");
  });
  it("returns the media menu on every reopening until the last media is removed", () => {
    const paper = [object("rect", true), object("image")];
    for (let reopening = 0; reopening < 3; reopening += 1) {
      expect(pageContextMenu(paper)).toBe("media");
    }
    paper.pop();
    expect(pageContextMenu(paper)).toBe("page");
  });
});
