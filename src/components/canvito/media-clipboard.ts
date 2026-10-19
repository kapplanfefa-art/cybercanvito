import { FabricImage, util, type Canvas } from "fabric";

export interface MediaSnapshot {
  instantiate: () => Promise<FabricImage>;
}

// Fabric omits interaction settings from its default JSON serialization.
const selectionProperties = [
  "cornerColor", "cornerStrokeColor", "borderColor", "cornerSize", "touchCornerSize",
  "transparentCorners", "cornerStyle", "borderScaleFactor", "padding",
  "hasControls", "hasBorders", "lockScalingX", "lockScalingY", "lockRotation",
];

export function clipboardShortcut(
  event: Pick<KeyboardEvent, "key" | "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">,
  editing: boolean,
): "copy" | "paste" | null {
  if (editing || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return null;
  if (event.code === "KeyC" || event.key.toLowerCase() === "c") return "copy";
  if (event.code === "KeyV" || event.key.toLowerCase() === "v") return "paste";
  return null;
}

/** Freeze object properties at copy time; video copies get their own player. */
export async function snapshotMedia(source: FabricImage): Promise<MediaSnapshot> {
  const element = source.getElement();
  const controls = { ...source.controls };
  const visibility = Object.fromEntries(Object.keys(controls).map(key => [key, source.isControlVisible(key)]));
  const restoreControls = (image: FabricImage) => {
    image.controls = { ...controls };
    image.setControlsVisibility(visibility);
    return image;
  };
  if (element.tagName !== "VIDEO") {
    const frozen = await source.clone(selectionProperties);
    return { instantiate: async () => {
      const image = await frozen.clone(selectionProperties);
      return restoreControls(image);
    } };
  }
  const original = element as HTMLVideoElement;
  const src = original.currentSrc || original.src;
  const options = source.toObject(selectionProperties);
  const currentTime = original.currentTime;
  const crossOrigin = original.crossOrigin;
  return { instantiate: async () => {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    if (crossOrigin) video.crossOrigin = crossOrigin;
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timeout);
        video.onloadeddata = null;
        video.onerror = null;
        if (error) reject(error); else resolve();
      };
      const timeout = setTimeout(() => finish(new Error("O vídeo demorou demais para carregar.")), 20000);
      video.onloadeddata = () => finish();
      video.onerror = () => finish(new Error("Não foi possível colar o vídeo."));
      video.src = src;
    });
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    video.currentTime = currentTime;
    const image = new FabricImage(video, { objectCaching: false });
    const restored = await util.enlivenObjectEnlivables<Record<string, unknown>>(options);
    image.set({ ...options, ...restored, objectCaching: false });
    return restoreControls(image);
  } };
}

export function createMediaClipboard(makeSnapshot = snapshotMedia) {
  let snapshot: Promise<MediaSnapshot> | null = null;
  let offset = 0;
  return {
    hasContent: () => snapshot !== null,
    copy(source: FabricImage) {
      snapshot = makeSnapshot(source);
      // Handle rejection immediately even if the user never pastes.
      void snapshot.catch(() => {});
      offset = 0;
      return snapshot;
    },
    async paste(canvas: Canvas) {
      if (!snapshot) return null;
      const pending = snapshot;
      const displacement = (offset += 20);
      const image = await (await pending).instantiate();
      if (canvas.disposed || canvas.destroyed) return null;
      image.set({ left: image.left + displacement, top: image.top + displacement });
      canvas.add(image);
      image.setCoords();
      canvas.setActiveObject(image);
      canvas.requestRenderAll();
      const element = image.getElement();
      if (element.tagName === "VIDEO") {
        const video = element as HTMLVideoElement;
        void video.play().catch(() => {});
        const tick = () => {
          if (!image.canvas || canvas.disposed || canvas.destroyed) { video.pause(); return; }
          canvas.requestRenderAll();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      return image;
    },
  };
}