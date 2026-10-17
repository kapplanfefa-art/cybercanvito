import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { Canvas, FabricText, IText, Textbox, TextStyleDeclaration } from "fabric";
import { applyTextStyle, readTextStyle, type CharacterProperty, type TextRange } from "./text-formatting";

type TextLike = FabricText | IText | Textbox;
function isEditable(target: TextLike): target is IText | Textbox {
  return "selectionStart" in target;
}

export function useTextFormatting(canvas: Canvas | null) {
  const [target, setTarget] = useState<TextLike | null>(null);
  const [, force] = useState(0);
  const rangeRef = useRef<TextRange | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const rerender = useCallback(() => force(n => n + 1), []);
  const capture = useCallback(() => {
    rangeRef.current = target && isEditable(target) && target.isEditing && target.selectionEnd > target.selectionStart
      ? { start: target.selectionStart, end: target.selectionEnd } : null;
  }, [target]);

  useEffect(() => {
    if (!canvas) { setTarget(null); rangeRef.current = null; return; }
    const onObjectSelection = () => {
      const object = canvas.getActiveObject();
      const text = object && "text" in object && "getSelectionStyles" in object ? object as TextLike : null;
      rangeRef.current = null;
      setTarget(text);
      rerender();
    };
    const onTextSelection = () => {
      capture();
      rerender();
    };
    const onExit = () => {
      // Moving focus into a toolbar input must not discard the saved range.
      if (!toolbarRef.current?.contains(document.activeElement)) rangeRef.current = null;
      rerender();
    };
    onObjectSelection();
    canvas.on("selection:created", onObjectSelection);
    canvas.on("selection:updated", onObjectSelection);
    canvas.on("selection:cleared", onObjectSelection);
    canvas.on("text:selection:changed", onTextSelection);
    canvas.on("text:editing:exited", onExit);
    canvas.on("text:changed", onTextSelection);
    canvas.on("object:modified", rerender);
    return () => {
      canvas.off("selection:created", onObjectSelection);
      canvas.off("selection:updated", onObjectSelection);
      canvas.off("selection:cleared", onObjectSelection);
      canvas.off("text:selection:changed", onTextSelection);
      canvas.off("text:editing:exited", onExit);
      canvas.off("text:changed", onTextSelection);
      canvas.off("object:modified", rerender);
    };
  }, [canvas, capture, rerender]);

  const onToolbarMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!toolbarRef.current?.contains(document.activeElement)) capture();
    // Buttons retain Fabric's editing focus; inputs still accept normal focus.
    if (event.target instanceof Element && event.target.closest("button")) event.preventDefault();
    event.stopPropagation();
  };
  const finish = useCallback(() => {
    if (!target || !canvas) return;
    canvas.requestRenderAll();
    if (isEditable(target) && target.isEditing) target.renderCursorOrSelection();
    canvas.fire("object:modified", { target });
    rerender();
  }, [canvas, target, rerender]);

  const apply = useCallback(<K extends CharacterProperty>(property: K, value: TextStyleDeclaration[K]) => {
    if (!target) return;
    applyTextStyle(target, rangeRef.current, property, value);
    finish();
  }, [target, finish]);

  const align = useCallback((value: string) => {
    if (!target || rangeRef.current) return;
    target.set("textAlign", value);
    finish();
  }, [target, finish]);

  const toggleCase = useCallback(() => {
    if (!target) return;
    const range = rangeRef.current;
    const start = range?.start ?? 0;
    const end = range?.end ?? target._text.length;
    const text = target._text.slice(start, end).join("");
    const next = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
    const oldStyles = target.getSelectionStyles(start, end, true);
    const chars = target.graphemeSplit(next);
    if (isEditable(target)) {
      target.insertChars(next, chars.map((_, i) => oldStyles[Math.min(i, oldStyles.length - 1)] ?? {}), start, end);
    } else {
      target.set("text", next);
    }
    if (range && isEditable(target)) {
      rangeRef.current = { start, end: start + chars.length };
      target.selectionStart = start;
      target.selectionEnd = start + chars.length;
    }
    target.initDimensions();
    target.setCoords();
    finish();
  }, [target, finish]);

  return { target, toolbarRef, onToolbarMouseDown, apply, align, toggleCase,
    selectedStyle: target ? readTextStyle(target, rangeRef.current) : {} };
}