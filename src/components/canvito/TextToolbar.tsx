import { memo, useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  CaseSensitive,
  Minus,
  Plus,
  ChevronDown,
  Sparkles,
  Move,
  PlayCircle,
  Search,
} from "lucide-react";
import { useEditor } from "./editor-context";
import { WORD_FONTS } from "./fonts-library";
import { toast } from "sonner";

type TextLike = fabric.Textbox | fabric.IText | fabric.FabricText;

function isTextObject(obj: fabric.Object | null | undefined): obj is TextLike {
  if (!obj) return false;
  const t = (obj as fabric.Object).type;
  return t === "textbox" || t === "i-text" || t === "text" || t === "IText" || t === "Textbox";
}

const ALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
} as const;
type AlignKey = keyof typeof ALIGN_ICONS;

export const TextToolbar = memo(function TextToolbar() {
  const { activeCanvas } = useEditor();
  const [target, setTarget] = useState<TextLike | null>(null);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const [fontOpen, setFontOpen] = useState(false);
  const [alignOpen, setAlignOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");

  useEffect(() => {
    if (!activeCanvas) {
      setTarget(null);
      return;
    }
    const onSel = () => {
      const obj = activeCanvas.getActiveObject();
      setTarget(isTextObject(obj) ? (obj as TextLike) : null);
    };
    onSel();
    activeCanvas.on("selection:created", onSel);
    activeCanvas.on("selection:updated", onSel);
    activeCanvas.on("selection:cleared", onSel);
    activeCanvas.on("object:modified", rerender);
    return () => {
      activeCanvas.off("selection:created", onSel);
      activeCanvas.off("selection:updated", onSel);
      activeCanvas.off("selection:cleared", onSel);
      activeCanvas.off("object:modified", rerender);
    };
  }, [activeCanvas, rerender]);

  const apply = useCallback(
    (mutator: (t: TextLike) => void) => {
      if (!target || !activeCanvas) return;
      mutator(target);
      target.setCoords();
      activeCanvas.requestRenderAll();
      rerender();
    },
    [target, activeCanvas, rerender],
  );

  if (!target) return null;

  const fontFamily = (target.get("fontFamily") as string) || "Open Sans";
  const fontSize = Math.round((target.get("fontSize") as number) || 48);
  const fill = (target.get("fill") as string) || "#000000";
  const fontWeight = (target.get("fontWeight") as string | number) || "normal";
  const fontStyle = (target.get("fontStyle") as string) || "normal";
  const underline = Boolean(target.get("underline"));
  const linethrough = Boolean(target.get("linethrough"));
  const textAlign = ((target.get("textAlign") as string) || "left") as AlignKey;
  const opacity = (target.get("opacity") as number) ?? 1;

  const isBold = fontWeight === "bold" || Number(fontWeight) >= 600;
  const isItalic = fontStyle === "italic";

  const filteredFonts = WORD_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase()),
  );

  const setSize = (n: number) => apply((t) => t.set("fontSize", Math.max(6, Math.min(400, n))));

  const toggleCase = () => {
    const text = (target.get("text") as string) || "";
    const next = text === text.toUpperCase() ? text.toLowerCase() : text.toUpperCase();
    apply((t) => t.set("text", next));
  };

  const AlignIcon = ALIGN_ICONS[textAlign] ?? AlignLeft;

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-black/5 bg-white px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Font family */}
      <div className="relative">
        <button
          onClick={() => {
            setFontOpen((v) => !v);
            setAlignOpen(false);
            setColorOpen(false);
          }}
          className="flex h-9 min-w-[140px] items-center justify-between gap-2 rounded-md border border-black/10 bg-white px-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          style={{ fontFamily }}
        >
          <span className="truncate">{fontFamily}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
        {fontOpen && (
          <div className="absolute left-0 top-11 z-50 w-64 rounded-lg border border-black/10 bg-white p-2 shadow-xl">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                autoFocus
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                placeholder="Pesquisar fontes"
                className="h-8 w-full rounded-md border border-black/10 bg-neutral-50 pl-7 pr-2 text-xs text-neutral-800 outline-none focus:border-neutral-400"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredFonts.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    apply((t) => t.set("fontFamily", f));
                    setFontOpen(false);
                  }}
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-neutral-800 hover:bg-neutral-100 ${
                    f === fontFamily ? "bg-neutral-100 font-semibold" : ""
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
              {filteredFonts.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-neutral-500">Nenhuma fonte</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* Font size */}
      <div className="flex items-center gap-0.5 rounded-md border border-black/10">
        <button
          onClick={() => setSize(fontSize - 2)}
          className="flex h-9 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-100"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setSize(Number(e.target.value) || fontSize)}
          className="h-9 w-10 bg-transparent text-center text-sm font-medium text-neutral-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          onClick={() => setSize(fontSize + 2)}
          className="flex h-9 w-7 items-center justify-center text-neutral-700 hover:bg-neutral-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <Divider />

      {/* Color */}
      <div className="relative">
        <button
          onClick={() => {
            setColorOpen((v) => !v);
            setFontOpen(false);
            setAlignOpen(false);
          }}
          className="flex h-9 w-9 flex-col items-center justify-center rounded-md hover:bg-neutral-100"
          title="Cor do texto"
        >
          <span className="text-sm font-bold leading-none text-neutral-800">A</span>
          <span className="mt-0.5 h-1 w-5 rounded-sm" style={{ background: fill }} />
        </button>
        {colorOpen && (
          <div className="absolute left-0 top-11 z-50 rounded-lg border border-black/10 bg-white p-2 shadow-xl">
            <input
              type="color"
              value={typeof fill === "string" ? fill : "#000000"}
              onChange={(e) => apply((t) => t.set("fill", e.target.value))}
              className="h-10 w-32 cursor-pointer rounded border border-black/10 bg-transparent"
            />
          </div>
        )}
      </div>

      <ToolBtn active={isBold} onClick={() => apply((t) => t.set("fontWeight", isBold ? "normal" : "bold"))} title="Negrito">
        <Bold className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={isItalic} onClick={() => apply((t) => t.set("fontStyle", isItalic ? "normal" : "italic"))} title="Itálico">
        <Italic className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={underline} onClick={() => apply((t) => t.set("underline", !underline))} title="Sublinhado">
        <Underline className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn active={linethrough} onClick={() => apply((t) => t.set("linethrough", !linethrough))} title="Tachado">
        <Strikethrough className="h-4 w-4" />
      </ToolBtn>
      <ToolBtn onClick={toggleCase} title="Maiúsculas/Minúsculas">
        <CaseSensitive className="h-4 w-4" />
      </ToolBtn>

      <Divider />

      {/* Alignment */}
      <div className="relative">
        <button
          onClick={() => {
            setAlignOpen((v) => !v);
            setFontOpen(false);
            setColorOpen(false);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
          title="Alinhamento"
        >
          <AlignIcon className="h-4 w-4" />
        </button>
        {alignOpen && (
          <div className="absolute left-0 top-11 z-50 flex gap-0.5 rounded-lg border border-black/10 bg-white p-1 shadow-xl">
            {(Object.keys(ALIGN_ICONS) as AlignKey[]).map((k) => {
              const Icon = ALIGN_ICONS[k];
              return (
                <button
                  key={k}
                  onClick={() => {
                    apply((t) => t.set("textAlign", k));
                    setAlignOpen(false);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded text-neutral-700 hover:bg-neutral-100 ${
                    textAlign === k ? "bg-neutral-100" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ToolBtn onClick={() => toast("Listas em breve")} title="Lista">
        <List className="h-4 w-4" />
      </ToolBtn>

      {/* Line height */}
      <div className="flex items-center gap-1 rounded-md border border-black/10 px-1.5">
        <span className="text-[10px] font-bold uppercase text-neutral-500">LH</span>
        <input
          type="number"
          step={0.1}
          min={0.5}
          max={4}
          value={Number(((target.get("lineHeight") as number) ?? 1.16).toFixed(2))}
          onChange={(e) => apply((t) => t.set("lineHeight", Number(e.target.value) || 1))}
          className="h-9 w-12 bg-transparent text-center text-sm text-neutral-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-1 rounded-md border border-black/10 px-2">
        <span className="text-[10px] font-bold uppercase text-neutral-500">Op</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => apply((t) => t.set("opacity", Number(e.target.value)))}
          className="h-9 w-20 accent-neutral-800"
        />
      </div>

      <Divider />

      <ToolBtn onClick={() => toast("Efeitos em breve")} title="Efeitos">
        <Sparkles className="h-4 w-4" />
        <span className="ml-1 text-xs font-medium">Efeitos</span>
      </ToolBtn>
      <ToolBtn onClick={() => toast("Animações em breve")} title="Animar">
        <PlayCircle className="h-4 w-4" />
        <span className="ml-1 text-xs font-medium">Animar</span>
      </ToolBtn>
      <ToolBtn onClick={() => toast("Posição em breve")} title="Posição">
        <Move className="h-4 w-4" />
        <span className="ml-1 text-xs font-medium">Posição</span>
      </ToolBtn>
    </div>
  );
});

function Divider() {
  return <div className="mx-0.5 h-6 w-px bg-black/10" />;
}

function ToolBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 items-center justify-center rounded-md px-2 text-neutral-700 hover:bg-neutral-100 ${
        active ? "bg-neutral-200 text-neutral-900" : ""
      }`}
    >
      {children}
    </button>
  );
}
