import { memo, useEffect, useState } from "react";
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
import { useTextFormatting } from "./use-text-formatting";
import { Button } from "@/components/ui/button";

const ALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
} as const;
type AlignKey = keyof typeof ALIGN_ICONS;

export const TextToolbar = memo(function TextToolbar() {
  const { activeCanvas } = useEditor();
  const { target, toolbarRef: wrapRef, onToolbarMouseDown, apply, align, toggleCase, selectedStyle } = useTextFormatting(activeCanvas);

  const [fontOpen, setFontOpen] = useState(false);
  const [alignOpen, setAlignOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");

  // Close popovers on outside click
  useEffect(() => {
    if (!fontOpen && !alignOpen && !colorOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFontOpen(false);
        setAlignOpen(false);
        setColorOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [fontOpen, alignOpen, colorOpen]);

  if (!target) return null;

  const fontFamily = ((selectedStyle.fontFamily ?? target.get("fontFamily")) as string) || "Open Sans";
  const fontSize = Math.round(((selectedStyle.fontSize ?? target.get("fontSize")) as number) || 48);
  const fill = ((selectedStyle.fill ?? target.get("fill")) as string) || "#000000";
  const fontWeight = ((selectedStyle.fontWeight ?? target.get("fontWeight")) as string | number) || "normal";
  const fontStyle = ((selectedStyle.fontStyle ?? target.get("fontStyle")) as string) || "normal";
  const underline = Boolean((selectedStyle.underline ?? target.get("underline")));
  const linethrough = Boolean((selectedStyle.linethrough ?? target.get("linethrough")));
  const textAlign = ((target.get("textAlign") as string) || "left") as AlignKey;

  const isBold = fontWeight === "bold" || Number(fontWeight) >= 600;
  const isItalic = fontStyle === "italic";

  const filteredFonts = WORD_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase()),
  );

  const setSize = (n: number) => apply("fontSize", Math.max(6, Math.min(400, n)));

  const AlignIcon = ALIGN_ICONS[textAlign] ?? AlignLeft;

  return (
    <div
      ref={wrapRef}
      onMouseDown={onToolbarMouseDown}
      className="pointer-events-auto relative z-30 mx-auto mt-2 flex h-9 w-fit max-w-[95%] items-center gap-0.5 rounded-lg border border-[var(--neon-violet)]/40 bg-[oklch(0.18_0.04_280)]/90 px-1.5 text-[oklch(0.95_0.01_280)] shadow-[0_0_20px_oklch(0.55_0.28_295/0.35),0_8px_24px_oklch(0.1_0.04_280/0.5)] backdrop-blur-md"
    >
      {/* Font family */}
      <div className="relative">
        <Button variant="ghost"
          onClick={() => {
            setFontOpen((v) => !v);
            setAlignOpen(false);
            setColorOpen(false);
          }}
          className="flex h-7 min-w-[110px] max-w-[140px] items-center justify-between gap-1.5 rounded-md border border-[var(--neon-violet)]/30 bg-[oklch(0.22_0.06_285)] px-2 text-xs font-medium text-[oklch(0.95_0.01_280)] hover:border-[var(--electric-blue)]/60 hover:bg-[oklch(0.26_0.07_285)]"
          style={{ fontFamily }}
        >
          <span className="truncate">{fontFamily}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
        </Button>
        {fontOpen && (
          <div className="absolute left-0 top-9 z-50 w-64 rounded-lg border border-[var(--neon-violet)]/40 bg-[oklch(0.18_0.04_280)]/95 p-2 shadow-[0_10px_30px_oklch(0.55_0.28_295/0.35)] backdrop-blur-md">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[oklch(0.75_0.04_285)]" />
              <input
                autoFocus
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                placeholder="Pesquisar fontes"
                className="h-8 w-full rounded-md border border-[var(--neon-violet)]/30 bg-[oklch(0.22_0.06_285)] pl-7 pr-2 text-xs text-[oklch(0.95_0.01_280)] outline-none placeholder:text-[oklch(0.6_0.04_285)] focus:border-[var(--electric-blue)]"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredFonts.map((f) => (
                <Button variant="ghost"
                  key={f}
                  onClick={() => {
                    apply("fontFamily", f);
                    setFontOpen(false);
                  }}
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-[oklch(0.92_0.01_280)] hover:bg-[var(--neon-violet)]/20 hover:text-[var(--neon-violet)] ${
                    f === fontFamily ? "bg-[var(--neon-violet)]/15 text-[var(--neon-violet)]" : ""
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </Button>
              ))}
              {filteredFonts.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-[oklch(0.6_0.04_285)]">Nenhuma fonte</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* Font size */}
      <div className="flex h-7 items-center rounded-md border border-[var(--neon-violet)]/30 bg-[oklch(0.22_0.06_285)]">
        <Button variant="ghost"
          aria-label="Diminuir tamanho da fonte"
          onClick={() => setSize(fontSize - 2)}
          className="flex h-7 w-6 items-center justify-center text-[oklch(0.85_0.02_280)] hover:text-[var(--electric-blue)]"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <input
          type="number"
          aria-label="Tamanho da fonte"
          value={fontSize}
          onChange={(e) => setSize(Number(e.target.value) || fontSize)}
          className="h-7 w-9 bg-transparent text-center text-xs font-medium text-[oklch(0.95_0.01_280)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button variant="ghost"
          aria-label="Aumentar tamanho da fonte"
          onClick={() => setSize(fontSize + 2)}
          className="flex h-7 w-6 items-center justify-center text-[oklch(0.85_0.02_280)] hover:text-[var(--electric-blue)]"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Divider />

      {/* Color */}
      <div className="relative">
        <Button variant="ghost"
          size="icon"
          aria-label="Cor do texto"
          onClick={() => {
            setColorOpen((v) => !v);
            setFontOpen(false);
            setAlignOpen(false);
          }}
          className="flex h-7 w-7 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md p-0 text-foreground hover:bg-neon-violet/15"
          title="Cor do texto"
        >
          <span aria-hidden="true" className="shrink-0 text-base font-medium leading-none">A</span>
          <span aria-hidden="true" className="text-color-spectrum block h-1 w-5 shrink-0 rounded-full" />
        </Button>
        {colorOpen && (
          <div className="absolute left-0 top-9 z-50 rounded-lg border border-[var(--neon-violet)]/40 bg-[oklch(0.18_0.04_280)]/95 p-2 shadow-[0_10px_30px_oklch(0.55_0.28_295/0.35)] backdrop-blur-md">
            <input
              type="color"
              value={typeof fill === "string" ? fill : "#000000"}
              onChange={(e) => apply("fill", e.target.value)}
              className="h-9 w-28 cursor-pointer rounded border border-[var(--neon-violet)]/30 bg-transparent"
            />
          </div>
        )}
      </div>

      <ToolBtn active={isBold} onClick={() => apply("fontWeight", isBold ? "normal" : "bold")} title="Negrito">
        <Bold className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn active={isItalic} onClick={() => apply("fontStyle", isItalic ? "normal" : "italic")} title="Itálico">
        <Italic className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn active={underline} onClick={() => apply("underline", !underline)} title="Sublinhado">
        <Underline className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn active={linethrough} onClick={() => apply("linethrough", !linethrough)} title="Tachado">
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolBtn>
      <ToolBtn onClick={toggleCase} title="Maiúsculas/Minúsculas">
        <CaseSensitive className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      {/* Alignment */}
      <div className="relative">
        <Button variant="ghost"
          onClick={() => {
            setAlignOpen((v) => !v);
            setFontOpen(false);
            setColorOpen(false);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--neon-violet)]/15"
          title="Alinhamento"
        >
          <AlignIcon className="h-3.5 w-3.5" />
        </Button>
        {alignOpen && (
          <div className="absolute left-0 top-9 z-50 flex gap-0.5 rounded-lg border border-[var(--neon-violet)]/40 bg-[oklch(0.18_0.04_280)]/95 p-1 shadow-[0_10px_30px_oklch(0.55_0.28_295/0.35)] backdrop-blur-md">
            {(Object.keys(ALIGN_ICONS) as AlignKey[]).map((k) => {
              const Icon = ALIGN_ICONS[k];
              return (
                <Button variant="ghost"
                  key={k}
                  onClick={() => {
                    align(k);
                    setAlignOpen(false);
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded text-[oklch(0.92_0.01_280)] hover:bg-[var(--neon-violet)]/20 hover:text-[var(--neon-violet)] ${
                    textAlign === k ? "bg-[var(--neon-violet)]/15 text-[var(--neon-violet)]" : ""
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <ToolBtn onClick={() => toast("Listas em breve")} title="Lista">
        <List className="h-3.5 w-3.5" />
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={() => toast("Efeitos em breve")} title="Efeitos">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="ml-1 text-[11px] font-medium">Efeitos</span>
      </ToolBtn>
      <ToolBtn onClick={() => toast("Animações em breve")} title="Animar">
        <PlayCircle className="h-3.5 w-3.5" />
        <span className="ml-1 text-[11px] font-medium">Animar</span>
      </ToolBtn>
      <ToolBtn onClick={() => toast("Posição em breve")} title="Posição">
        <Move className="h-3.5 w-3.5" />
        <span className="ml-1 text-[11px] font-medium">Posição</span>
      </ToolBtn>
    </div>
  );
});

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-[var(--neon-violet)]/25" />;
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
    <Button variant="ghost"
      onClick={onClick}
      title={title}
      className={`flex h-7 items-center justify-center rounded-md px-1.5 text-[oklch(0.92_0.01_280)] transition-colors hover:bg-[var(--neon-violet)]/15 hover:text-[var(--neon-violet)] ${
        active ? "bg-[var(--neon-violet)]/20 text-[var(--neon-violet)] shadow-[0_0_10px_oklch(0.55_0.28_295/0.4)]" : ""
      }`}
    >
      {children}
    </Button>
  );
}
