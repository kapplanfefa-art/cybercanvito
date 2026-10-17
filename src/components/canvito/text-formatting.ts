import type { FabricText, TextStyleDeclaration } from "fabric";

export interface TextRange { start: number; end: number }
export type CharacterProperty = keyof TextStyleDeclaration;
export type FormattingTarget = Pick<FabricText,
  "set" | "removeStyle" | "setSelectionStyles" | "getSelectionStyles" | "initDimensions" | "setCoords"
>;

/** Ranges use Fabric's grapheme indexes, not JavaScript string offsets. */
export function applyTextStyle<K extends CharacterProperty>(
  target: FormattingTarget, range: TextRange | null, property: K, value: TextStyleDeclaration[K],
): void {
  if (range && range.end > range.start) {
    target.setSelectionStyles({ [property]: value }, range.start, range.end);
  } else {
    // Inline overrides otherwise win over the box's new base value.
    target.removeStyle(property);
    target.set({ [property]: value });
  }
  target.set("dirty", true);
  target.initDimensions();
  target.setCoords();
}

export function readTextStyle(target: FormattingTarget, range: TextRange | null): Partial<TextStyleDeclaration> {
  return range ? target.getSelectionStyles(range.start, range.start + 1, true)[0] ?? {} : {};
}