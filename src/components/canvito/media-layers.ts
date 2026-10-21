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

function getNextContentOrder(objects: LayerObject[], selected: Set<LayerObject>, command: LayerCommand) {
  const content = objects.filter(object => !object.isArtboard);
  const next = [...content];

  if (command === "front") {
    return [...content.filter(object => !selected.has(object)), ...content.filter(object => selected.has(object))];
  }
  if (command === "back") {
    return [...content.filter(object => selected.has(object)), ...content.filter(object => !selected.has(object))];
  }
  if (command === "forward") {
    for (let index = next.length - 2; index >= 0; index--) {
      if (selected.has(next[index]) && !selected.has(next[index + 1])) {
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
      }
    }
    return next;
  }
  for (let index = 1; index < next.length; index++) {
    if (selected.has(next[index]) && !selected.has(next[index - 1])) {
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
    }
  }
  return next;
}

function getSelectedMedia(canvas: Canvas): LayerObject[] {
  const activeObjects = canvas.getActiveObjects();
  const selected = activeObjects.length ? activeObjects : [canvas.getActiveObject()].filter(Boolean);
  return selected.filter((object): object is LayerObject =>
    Boolean(object && object.isType("image") && !(object as LayerObject).isArtboard),
  );
}

export function canMoveLayer(canvas: Canvas | null, command: LayerCommand): boolean {
  if (!canvas) return false;
  const objects = canvas.getObjects() as LayerObject[];
  const selected = new Set(getSelectedMedia(canvas));
  if (!selected.size) return false;
  const current = objects.filter(object => !object.isArtboard);
  const next = getNextContentOrder(objects, selected, command);
  return next.some((object, index) => object !== current[index]);
}

export function moveMediaLayer(canvas: Canvas | null, command: LayerCommand): void {
  if (!canvas || !canMoveLayer(canvas, command)) return;
  const objects = canvas.getObjects() as LayerObject[];
  const selected = new Set(getSelectedMedia(canvas));
  const next = getNextContentOrder(objects, selected, command);
  const target = canvas.getActiveObject();
  if (!target) return;

  // Save the pre-change order for the existing undo stack.
  canvas.fire("object:modified", { target });
  const artboardCount = objects.filter(object => object.isArtboard).length;
  next.forEach((object, index) => canvas.moveObjectTo(object, artboardCount + index));
  objects.filter(object => object.isArtboard).forEach(object => canvas.sendObjectToBack(object));
  canvas.requestRenderAll();
}