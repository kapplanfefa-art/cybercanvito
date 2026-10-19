interface PageMenuObject {
  isArtboard?: boolean;
  isType: (type: string) => boolean;
}

/** Menu scope belongs to the whole page, not just the object under the pointer. */
export function pageHasMedia(objects: readonly PageMenuObject[]): boolean {
  return objects.some(object => !object.isArtboard && object.isType("image"));
}

export function canRemoveMedia(object: PageMenuObject | null | undefined): boolean {
  return Boolean(object && !object.isArtboard && object.isType("image"));
}

export type PageMenuKind = "media" | "page";

/** A paper with media keeps the media menu; an empty one gets the page menu. */
export function pageContextMenu(objects: readonly PageMenuObject[]): PageMenuKind {
  return pageHasMedia(objects) ? "media" : "page";
}