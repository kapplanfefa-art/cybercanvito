import { describe, expect, it } from "vitest";
import { isVideoUpload, mediaPickerAccept } from "./media-upload-policy";

describe("combined image or video picker", () => {
  it("accepts both images and videos from the same picker", () => {
    const accepted = mediaPickerAccept("media").split(", ");
    expect(accepted).toContain("image/png");
    expect(accepted).toContain("image/jpeg");
    expect(accepted).toContain("video/mp4");
    expect(accepted).toContain("video/webm");
  });
  it("inserts ordinary images as images", () => {
    expect(isVideoUpload("media", "image/png")).toBe(false);
    expect(isVideoUpload("media", "image/jpeg")).toBe(false);
  });
  it("inserts videos using the video player", () => {
    expect(isVideoUpload("media", "video/mp4")).toBe(true);
    expect(isVideoUpload("media", "video/webm")).toBe(true);
  });
  it("preserves the editor's animated GIF video handling", () => {
    expect(isVideoUpload("media", "image/gif")).toBe(true);
    expect(isVideoUpload("image", "image/png")).toBe(false);
    expect(isVideoUpload("video", "image/gif")).toBe(true);
  });
});