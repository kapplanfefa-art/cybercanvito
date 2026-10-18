import { describe, expect, it, vi } from "vitest";
import type { Canvas, FabricImage } from "fabric";
import { createMediaClipboard } from "./media-clipboard";

function fixture() {
  const copies: object[] = [];
  const instantiate = vi.fn(async () => {
    const image = { left: 100, top: 200, set: vi.fn(), setCoords: vi.fn(),
      getElement: () => ({ tagName: "IMG" }) };
    copies.push(image);
    return image as unknown as FabricImage;
  });
  const snapshot = vi.fn(async () => ({ instantiate }));
  const canvas = { add: vi.fn(), setActiveObject: vi.fn(), requestRenderAll: vi.fn(), disposed: false };
  return { clipboard: createMediaClipboard(snapshot), snapshot, instantiate, canvas, copies };
}

describe("media copy and paste", () => {
  it("does not insert anything when copying", async () => {
    const f = fixture();
    const source = {} as FabricImage;
    await f.clipboard.copy(source);
    expect(f.snapshot).toHaveBeenCalledWith(source);
    expect(f.canvas.add).not.toHaveBeenCalled();
  });
  it("pastes independent selected copies with successive offsets", async () => {
    const f = fixture();
    await f.clipboard.copy({} as FabricImage);
    const first = await f.clipboard.paste(f.canvas as unknown as Canvas);
    const second = await f.clipboard.paste(f.canvas as unknown as Canvas);
    expect(first).not.toBe(second);
    expect(first?.set).toHaveBeenCalledWith({ left: 120, top: 220 });
    expect(second?.set).toHaveBeenCalledWith({ left: 140, top: 240 });
    expect(f.canvas.add).toHaveBeenCalledTimes(2);
    expect(f.canvas.setActiveObject).toHaveBeenLastCalledWith(second);
  });
  it("does not paste before copying", async () => {
    const f = fixture();
    expect(await f.clipboard.paste(f.canvas as unknown as Canvas)).toBeNull();
    expect(f.canvas.add).not.toHaveBeenCalled();
  });
});