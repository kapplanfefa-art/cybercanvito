import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import {
  CopyPlus, FilePlus2, MessageCircle, MoveHorizontal,
  Hash, Video, ImagePlus, ChevronRight, Crown, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageMenuEntry {
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  submenu?: boolean;
  divider?: boolean;
  premium?: boolean;
  action?: "duplicate" | "add-media" | "add-page" | "resize-page";
}

/** Page-level options shown while the paper holds no image and no video. */
const entries: PageMenuEntry[] = [
  { label: "Adicionar imagem ou vídeo", icon: ImagePlus, action: "add-media" },
  { label: "Duplicar página", icon: CopyPlus, shortcut: "Ctrl+D", action: "duplicate" },
  { label: "Adicionar página", icon: FilePlus2, shortcut: "Ctrl+Enter", divider: true, action: "add-page" },
  { label: "Comentar", icon: MessageCircle, shortcut: "Ctrl+Alt+N", divider: true },
  { label: "Redimensionar página", icon: MoveHorizontal, premium: true, divider: true, action: "resize-page" },
  { label: "Guias", icon: Hash, submenu: true },
  { label: "Editar como vídeo", icon: Video },
];

export interface PageContextMenuProps extends ComponentProps<"div"> {
  x: number;
  y: number;
  onClose: () => void;
  onDuplicatePage?: () => void;
  onAddMedia: () => void;
  onAddPage: () => void;
  onResizePage: () => void;
}

/** Only explicitly requested actions are enabled; every other entry stays inert. */
export function PageContextMenu({ x, y, onClose, onDuplicatePage, onAddMedia, onAddPage, onResizePage, className, ...props }: PageContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const position = () => {
      const rect = menu.getBoundingClientRect();
      menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - rect.width - 8))}px`;
      menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - rect.height - 8))}px`;
    };
    position();
    menu.querySelector<HTMLButtonElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus({ preventScroll: true });
    window.addEventListener("resize", onClose);
    return () => window.removeEventListener("resize", onClose);
  }, [x, y, onClose]);

  return createPortal(
    <div
      {...props}
      ref={ref}
      role="menu"
      aria-label="Menu da página"
      className={cn("media-context-menu fixed z-[100] max-h-[calc(100dvh-16px)] w-[320px] max-w-[calc(100vw-16px)] overflow-y-auto rounded-2xl border border-border bg-card p-1.5 text-card-foreground shadow-lg", className)}
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
      {entries.map(({ label, icon: Icon, shortcut, submenu, divider, premium, action }) => (
        <div key={label} className={cn(divider && "mt-1 border-t border-border pt-1")}>
          <Button
            variant="ghost"
            role="menuitem"
            aria-disabled={!action}
            onClick={action ? () => {
              onClose();
              if (action === "add-media") onAddMedia();
              else if (action === "add-page") onAddPage();
              else if (action === "resize-page") onResizePage();
              else onDuplicatePage?.();
            } : undefined}
            className={cn("h-9 w-full justify-start gap-2 rounded-lg px-2 text-left text-sm font-normal text-card-foreground hover:bg-context-hover hover:text-card-foreground focus-visible:bg-context-hover [&_svg]:size-5")}
          >
            <Icon aria-hidden="true" />
            <span className="min-w-0 flex-1 whitespace-normal leading-tight">{label}</span>
            {shortcut && <span className="shrink-0 rounded-md bg-context-hover px-2 py-1 text-[11px] leading-none text-context-muted">{shortcut}</span>}
            {submenu && <ChevronRight aria-hidden="true" className="!size-4" />}
            {premium && <Crown aria-hidden="true" className="!size-3 text-context-muted" />}
          </Button>
        </div>
      ))}
    </div>, document.body,
  );
}
