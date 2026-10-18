interface PageMenuObject {
  isArtboard?: boolean;
  isType: (type: string) => boolean;
}

/** Menu scope belongs to the whole page, not just the object under the pointer. */
export function pageHasMedia(objects: readonly PageMenuObject[]): boolean {
  return objects.some(object => !object.isArtboard && object.isType("image"));
}