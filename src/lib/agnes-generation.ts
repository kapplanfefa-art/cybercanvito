import { z } from "zod";

// Generation accepts text only: existing images and removal masks are not inputs.
export const AgnesGenerationInput = z.object({
  prompt: z.string().trim().min(1, "Descreva o que você quer gerar"),
}).strict();

export function agnesImageRequest(prompt: string) {
  return {
    model: "agnes-image-2.5-flash",
    prompt: AgnesGenerationInput.parse({ prompt }).prompt,
    size: "1K",
    return_base64: true,
  };
}