import type { TextStyleDeclaration } from "fabric";

export interface TextRange { start: number; end: number }
export type CharacterProperty = keyof TextStyleDeclaration;
export interface FormattingTarget {
  set(key: string | Record<string, unknown>, value?: unknown): unknown;
  removeStyle(property: CharacterProperty): void;
  setSelectionStyles(style: object, start: number, end: number): unknown;
  getSelectionStyles(start: number, end: number, complete?: boolean): TextStyleDeclaration[];
  initDimensions(): void;
  setCoords(): void;
}

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