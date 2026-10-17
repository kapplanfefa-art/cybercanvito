import { describe, it, expect, vi } from "vitest";
import { applyTextStyle, readTextStyle, type FormattingTarget } from "./text-formatting";

function fixture() {
  const chars = Array.from({ length: 10 }, () => ({ fontSize: 56, fontFamily: "Arial", fontWeight: "normal" }));
  const target = {
    set: vi.fn(), removeStyle: vi.fn(), initDimensions: vi.fn(), setCoords: vi.fn(),
    setSelectionStyles: vi.fn((style, start, end) => {
      for (let i = start; i < end; i++) Object.assign(chars[i], style);
    }),
    getSelectionStyles: vi.fn((start, end) => chars.slice(start, end)),
  } satisfies FormattingTarget;
  return { target, chars };
}

describe("text formatting scope", () => {
  it.each([
    ["fontSize", 72], ["fontFamily", "Georgia"], ["fontWeight", "bold"],
  ] as const)("changes only selected characters for %s", (property, value) => {
    const { target, chars } = fixture();
    const original = structuredClone(chars);
    applyTextStyle(target, { start: 2, end: 6 }, property, value);
    expect(chars.slice(0, 2)).toEqual(original.slice(0, 2));
    expect(chars.slice(6)).toEqual(original.slice(6));
    expect(chars.slice(2, 6).every(char => char[property] === value)).toBe(true);
    expect(target.set).not.toHaveBeenCalledWith({ [property]: value });
  });
  it("updates the entire box without selection and removes previous inline size overrides", () => {
    const { target } = fixture();
    applyTextStyle(target, null, "fontSize", 80);
    expect(target.removeStyle).toHaveBeenCalledWith("fontSize");
    expect(target.set).toHaveBeenCalledWith({ fontSize: 80 });
    expect(target.setSelectionStyles).not.toHaveBeenCalled();
  });
  it("reads the changed selection size instead of remaining at the box's initial 56", () => {
    const { target } = fixture();
    applyTextStyle(target, { start: 2, end: 6 }, "fontSize", 72);
    expect(readTextStyle(target, { start: 2, end: 6 }).fontSize).toBe(72);
  });
});