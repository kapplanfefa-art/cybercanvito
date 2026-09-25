import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AgnesInput = z.object({
  prompt: z.string().min(1, "Descreva o que você quer gerar"),
  imageBase64: z.string().optional(),
});

type AgnesImageResponse = {
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string };
};

export const gerarImagemAgnes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AgnesInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["AGNES_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "Chave da Agnes AI não configurada no servidor." };
    }

    try {
      const body: Record<string, unknown> = {
        model: "agnes-image-2.1-flash",
        prompt: data.prompt,
      };
      if (data.imageBase64) {
        body.image = data.imageBase64;
      }

      const res = await fetch("https://apihub.agnes-ai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const json = (await res.json().catch(() => null)) as AgnesImageResponse | null;

      if (!res.ok) {
        const msg = json?.error?.message ?? `Agnes AI respondeu com status ${res.status}`;
        return { ok: false as const, error: msg };
      }

      const item = json?.data?.[0];
      const imageUrl = item?.url ?? (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);

      if (!imageUrl) {
        return { ok: false as const, error: "A Agnes AI não retornou nenhuma imagem." };
      }

      return { ok: true as const, imageUrl };
    } catch (err) {
      console.error("gerar-imagem-agnes error:", err);
      return { ok: false as const, error: "Falha ao conectar com a Agnes AI. Tente novamente." };
    }
  });
