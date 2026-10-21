export type MediaPickerMode = "image" | "video" | "media";

const imageAccept = "image/png, image/jpeg, image/jpg, image/webp";
const videoAccept = "video/mp4, video/webm, video/quicktime, image/gif";

export function mediaPickerAccept(mode: MediaPickerMode): string {
  return mode === "media" ? `${imageAccept}, ${videoAccept}` : mode === "video" ? videoAccept : imageAccept;
}

export function isVideoUpload(mode: MediaPickerMode, mimeType: string): boolean {
  return mode === "video" || (mode === "media" && (mimeType.startsWith("video/") || mimeType === "image/gif"));
}