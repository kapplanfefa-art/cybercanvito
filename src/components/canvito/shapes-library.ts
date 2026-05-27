import shape01Url from "@/assets/elements/shape-01.svg?url";
import shape02Url from "@/assets/elements/shape-02.svg?url";
import circuloUrl from "@/assets/elements/shape-circulo.svg?url";
import quadradoUrl from "@/assets/elements/shape-quadrado.svg?url";
import quadradoConcavoUrl from "@/assets/elements/shape-quadrado-concavo.svg?url";
import losangoUrl from "@/assets/elements/shape-losango.svg?url";
import trianguloUrl from "@/assets/elements/shape-triangulo.svg?url";
import trianguloBaixoUrl from "@/assets/elements/shape-triangulo-baixo.svg?url";
import setaDireitaUrl from "@/assets/elements/shape-seta-direita.svg?url";
import setaEsquerdaUrl from "@/assets/elements/shape-seta-esquerda.svg?url";
import bannerUrl from "@/assets/elements/shape-banner.svg?url";

export type ShapeAsset = {
  id: string;
  name: string;
  url: string;
};

export const SHAPES: ShapeAsset[] = [
  { id: "shape-01", name: "Forma 01", url: shape01Url },
  { id: "shape-02", name: "Forma 02", url: shape02Url },
  { id: "shape-circulo", name: "Círculo", url: circuloUrl },
  { id: "shape-quadrado", name: "Quadrado Preto", url: quadradoUrl },
  { id: "shape-quadrado-concavo", name: "Quadrado Côncavo", url: quadradoConcavoUrl },
  { id: "shape-losango", name: "Losango", url: losangoUrl },
  { id: "shape-triangulo", name: "Triângulo", url: trianguloUrl },
  { id: "shape-triangulo-baixo", name: "Triângulo para Baixo", url: trianguloBaixoUrl },
  { id: "shape-seta-direita", name: "Seta Direita", url: setaDireitaUrl },
  { id: "shape-seta-esquerda", name: "Seta Esquerda", url: setaEsquerdaUrl },
  { id: "shape-banner", name: "Banner", url: bannerUrl },
];
