import shape01Url from "@/assets/elements/shape-01.svg?url";
import shape02Url from "@/assets/elements/shape-02.svg?url";

export type ShapeAsset = {
  id: string;
  name: string;
  url: string;
};

export const SHAPES: ShapeAsset[] = [
  { id: "shape-01", name: "Forma 01", url: shape01Url },
  { id: "shape-02", name: "Forma 02", url: shape02Url },
];
