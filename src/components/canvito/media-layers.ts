import type { Canvas, FabricObject } from "fabric";

export type LayerCommand = "front" | "forward" | "backward" | "back";
type LayerObject = FabricObject & { isArtboard?: boolean };

/** Fabric stores the backmost object first; the paper is never a layer target. */
export function layerDestination<T>(objects: readonly T[], target: T, command: LayerCommand, isPaper: (object: T) => boolean): number {
  const content = objects.filter(object => !isPaper(object));
  const index = content.indexOf(target);
  if (index < 0) return -1;
  const next = command === "front" ? content.length - 1 : command === "back" ? 0
    : Math.max(0, Math.min(content.length - 1, index + (command === "forward" ? 1 : -1)));
  const neighbor = content[next];
  return neighbor === undefined ? -1 : objects.indexOf(neighbor);
}

export function canMoveLayer(canvas: Canvas | null, command: LayerCommand): boolean {
  const target = canvas?.getActiveObject();
  if (!canvas || !target || !target.isType("image")) return false;
  const objects = canvas.getObjects() as LayerObject[];
  const next = layerDestination<LayerObject>(objects, target, command, object => Boolean(object.isArtboard));
  return next >= 0 && next !== objects.indexOf(target);
}

export function moveMediaLayer(canvas: Canvas | null, command: LayerCommand): void {
  if (!canvas || !canMoveLayer(canvas, command)) return;
  const target = canvas.getActiveObject();
  if (!target) return;
  const objects = canvas.getObjects() as LayerObject[];
  const next = layerDestination<LayerObject>(objects, target, command, object => Boolean(object.isArtboard));
  // The existing undo stack restores saved snapshots: capture the order before changing it.
  canvas.fire("object:modified", { target });
  canvas.moveObjectTo(target, next);
  objects.filter(object => object.isArtboard).forEach(object => canvas.sendObjectToBack(object));
  canvas.requestRenderAll();
}