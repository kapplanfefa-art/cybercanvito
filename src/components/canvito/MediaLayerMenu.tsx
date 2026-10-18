import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpToLine, ArrowUp, ArrowDown, ArrowDownToLine, Layers, ChevronLeft, Image, Video } from "lucide-react";
import type { Canvas, FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { canMoveLayer, moveMediaLayer, type LayerCommand } from "./media-layers";

export interface MediaLayerMenuProps {
  x: number;
  y: number;
  canvas: Canvas | null;
  onClose: () => void;
}

const commands = [
  { label: "Trazer à frente", icon: ArrowUpToLine, command: "front", shortcut: "Ctrl+Alt+]" },
  { label: "Para frente", icon: ArrowUp, command: "forward", shortcut: "Ctrl+]" },
  { label: "Mover para trás", icon: ArrowDown, command: "backward", shortcut: "Ctrl+[" },
  { label: "Enviar para trás", icon: ArrowDownToLine, command: "back", shortcut: "Ctrl+Alt+[" },
] satisfies { label: string; icon: typeof ArrowUp; command: LayerCommand; shortcut: string }[];

export function MediaLayerMenu({ x, y, canvas, onClose }: MediaLayerMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [, refresh] = useState(0);
  const objects = (canvas?.getObjects() ?? []).filter(object => !(object as FabricObject & { isArtboard?: boolean }).isArtboard).reverse();
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const rect = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`;
    menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`;
    menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true });
  }, [x, y, showLayers]);

  return createPortal(
    <div ref={ref} role="menu" aria-label={showLayers ? "Camadas do papel" : "Ordem das camadas"}
      className="media-context-menu fixed z-[110] max-h-[calc(100dvh-16px)] w-72 max-w-[calc(100vw-16px)] overflow-y-auto rounded-lg border border-context-border bg-card p-2 text-card-foreground"
      onMouseDown={event => event.stopPropagation()} onContextMenu={event => event.preventDefault()}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.key === "Escape" || event.key === "ArrowLeft") { onClose(); return; }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
        const current = items.findIndex(item => item === document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }}>
      {showLayers && <>
        <Button variant="ghost" className="w-full justify-start" onClick={() => setShowLayers(false)}><ChevronLeft />Camadas</Button>
        {objects.map((object, index) => {
          const selected = canvas?.getActiveObject() === object;
          const element = object.isType("image") ? (object as FabricObject & { getElement: () => HTMLElement }).getElement() : null;
          const label = `${element?.tagName === "VIDEO" ? "Vídeo" : object.isType("image") ? "Imagem" : "Elemento"} ${objects.length - index}`;
          return <Button key={objects.length - index} variant="ghost" role="menuitem" aria-pressed={selected}
            className={cn("h-9 w-full justify-start", selected && "bg-context-hover")}
            onClick={() => { canvas?.setActiveObject(object); canvas?.requestRenderAll(); refresh(value => value + 1); }}>
            {element?.tagName === "VIDEO" ? <Video /> : <Image />}{label}
          </Button>;
        })}
        <div className="my-1 border-t border-context-border" />
      </>}
      {commands.map(({ label, icon: Icon, command, shortcut }) => <Button key={command} variant="ghost" role="menuitem"
        disabled={!canMoveLayer(canvas, command)}
        className="h-[34px] w-full justify-start gap-2 rounded px-2 text-sm font-normal hover:bg-context-hover hover:text-card-foreground"
        onClick={() => { moveMediaLayer(canvas, command); if (showLayers) refresh(value => value + 1); else onClose(); }}>
        <Icon className="size-5" /><span className="flex-1 text-left">{label}</span>
        <span className="rounded bg-context-hover px-2 py-1 text-[11px]">{shortcut}</span>
      </Button>)}
      {!showLayers && <div className="mt-1 border-t border-context-border pt-1">
        <Button variant="ghost" role="menuitem" className="h-[34px] w-full justify-start gap-2 text-sm font-normal" onClick={() => setShowLayers(true)}>
          <Layers className="size-5" /><span className="flex-1 text-left">Mostrar camadas</span>
        </Button>
      </div>}
    </div>, document.body,
  );
}