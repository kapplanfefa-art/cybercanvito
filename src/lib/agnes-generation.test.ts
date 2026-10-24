import { describe, expect, it } from "vitest";
import { AgnesGenerationInput, agnesImageRequest } from "./agnes-generation";

describe("Agnes text generation", () => {
  it("sends the documented required image size and original model", () => {
    expect(agnesImageRequest("Um gato")).toEqual({
      model: "agnes-image-2.1-flash", prompt: "Um gato", size: "1K", return_base64: true,
    });
  });
  it("rejects image editing inputs instead of connecting generation to removal", () => {
    expect(AgnesGenerationInput.safeParse({ prompt: "Remover", imageBase64: "data:image/png;base64,abc" }).success).toBe(false);
  });
  it("rejects object removal masks", () => {
    expect(AgnesGenerationInput.safeParse({ prompt: "Remover", mask: "mask.png" }).success).toBe(false);
  });
  it("rejects whitespace-only prompts", () => {
    expect(AgnesGenerationInput.safeParse({ prompt: "   " }).success).toBe(false);
  });
});