import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import type { Canvas } from "fabric";
import { MediaLayerMenu } from "./MediaLayerMenu";
import { createPortal } from "react-dom";
import {
  Copy, PaintRoller, Clipboard, CopyPlus, Trash2, Layers, AlignStartVertical,
  MoveHorizontal, Hexagon, MessageCircle, LockKeyhole, Link, Clock, Accessibility,
  Wallpaper, Palette, Download, Search, Info, ChevronRight, Crown,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuEntry {
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  submenu?: boolean;
  divider?: boolean;
  muted?: boolean;
  premium?: boolean;
  action?: "copy" | "paste" | "delete" | "layers";
}

const entries: MenuEntry[] = [
  { label: "Copiar", icon: Copy, shortcut: "Ctrl+C", action: "copy" },
  { label: "Copiar estilo", icon: PaintRoller, submenu: true },
  { label: "Colar", icon: Clipboard, shortcut: "Ctrl+V", action: "paste" },
  { label: "Duplicar", icon: CopyPlus, shortcut: "Ctrl+D" },
  { label: "Excluir", icon: Trash2, shortcut: "DELETE", action: "delete" },
  { label: "Camada", icon: Layers, submenu: true, divider: true, action: "layers" },
  { label: "Alinhar à página", icon: AlignStartVertical, submenu: true },
  { label: "Redimensionar a tela de acordo com a seleção", icon: MoveHorizontal, premium: true, divider: true },
  { label: "Criar componente", icon: Hexagon, shortcut: "Ctrl+Alt+K" },
  { label: "Comentar", icon: MessageCircle, shortcut: "Ctrl+Alt+N" },
  { label: "Bloquear", icon: LockKeyhole, submenu: true },
  { label: "Adicionar link", icon: Link, shortcut: "Ctrl+K" },
  { label: "Mostrar a duração do elemento", icon: Clock },
  { label: "Texto alternativo", icon: Accessibility },
  { label: "Definir imagem como plano de fundo", icon: Wallpaper, divider: true },
  { label: "Aplicar cores à página", icon: Palette },
  { label: "Seleção para download", icon: Download },
  { label: "Ver itens parecidos", icon: Search, muted: true },
  { label: "Informações", icon: Info },
];

export interface MediaContextMenuProps extends ComponentProps<"div"> {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  canDelete: boolean;
  canvas: Canvas | null;
}

/** Only explicitly requested actions are enabled. */
export function MediaContextMenu({ x, y, onClose, onCopy, onPaste, onDelete, canDelete, canvas, className, ...props }: MediaContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [layerAnchor, setLayerAnchor] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const position = () => {
      const rect = menu.getBoundingClientRect();
      menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`;
      menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`;
    };
    position();
    setLayerAnchor(null);
    menu.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({ preventScroll: true });
    window.addEventListener("resize", onClose);
    return () => window.removeEventListener("resize", onClose);
  }, [x, y, onClose]);

  return createPortal(
    <div
      {...props}
      ref={ref}
      role="menu"
      aria-label="Menu de imagem ou vídeo"
      className={cn("media-context-menu fixed z-[100] max-h-[calc(100dvh-16px)] w-[428px] max-w-[calc(100vw-16px)] overflow-y-auto rounded-lg border border-context-border bg-card p-1.5 text-card-foreground", className)}
      onMouseDown={event => event.stopPropagation()}
      onContextMenu={event => { event.preventDefault(); event.stopPropagation(); }}
      onKeyDown={event => {
        if (event.key === "Escape" || event.key === "Tab") { onClose(); return; }
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
        const current = items.findIndex(item => item === document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
          : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
      }}
    >
      {entries.map(({ label, icon: Icon, shortcut, submenu, divider, muted, premium, action }) => (
        <div key={label} className={cn(divider && "mt-1 border-t border-context-border pt-1")}>
          <Button
            variant="ghost"
            role="menuitem"
            aria-disabled={!action || (action === "delete" && !canDelete)}
            aria-haspopup={action === "layers" ? "menu" : undefined}
            aria-expanded={action === "layers" ? Boolean(layerAnchor) : undefined}
            onClick={action ? event => {
              if (action === "layers") {
                const rect = event.currentTarget.getBoundingClientRect();
                setLayerAnchor(previous => previous ? null : { x: rect.right + 8, y: rect.top });
                return;
              }
              if (action === "delete" && !canDelete) return;
              if (action === "copy") onCopy();
              else if (action === "paste") onPaste();
              else onDelete();
              onClose();
            } : undefined}
            className={cn("h-[34px] w-full justify-start gap-2.5 rounded px-2 text-left text-sm font-normal text-card-foreground hover:bg-context-hover hover:text-card-foreground focus-visible:bg-context-hover [&_svg]:size-5", muted && "text-context-muted")}
          >
            <Icon aria-hidden="true" />
            <span className="min-w-0 flex-1 whitespace-normal leading-tight">{label}</span>
            {shortcut && <span className="shrink-0 rounded bg-context-hover px-2 py-1 text-[11px] leading-none">{shortcut}</span>}
            {submenu && <ChevronRight aria-hidden="true" className="!size-4" />}
            {premium && <Crown aria-hidden="true" className="!size-3 text-context-muted" />}
          </Button>
        </div>
      ))}
      {layerAnchor && <MediaLayerMenu x={layerAnchor.x} y={layerAnchor.y} canvas={canvas} onClose={onClose} />}
    </div>, document.body,
  );
}