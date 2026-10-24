import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AgnesGenerationInput, agnesImageRequest } from "./agnes-generation";

const API_ROOT = "https://apihub.agnes-ai.com";

type AgnesImageResponse = {
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string };
};

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export const gerarImagemAgnes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AgnesGenerationInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["AGNES_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: "Chave da Agnes AI não configurada no servidor." };
    }

    try {
      const body = agnesImageRequest(data.prompt);

      const res = await fetch(`${API_ROOT}/v1/images/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });

      const json = (await res.json().catch(() => null)) as AgnesImageResponse | null;
      if (!res.ok) {
        return { ok: false as const, error: json?.error?.message ?? `Agnes AI respondeu com status ${res.status}` };
      }

      const item = json?.data?.[0];
      if (item?.b64_json) {
        return { ok: true as const, imageUrl: `data:image/png;base64,${item.b64_json}` };
      }
      if (!item?.url) {
        return { ok: false as const, error: "A Agnes AI não retornou nenhuma imagem." };
      }

      // Download on the server so the browser gets a data URL (avoids CORS blocking the canvas).
      try {
        const imgRes = await fetch(item.url);
        if (imgRes.ok) {
          const type = imgRes.headers.get("content-type") ?? "image/png";
          const b64 = toBase64(await imgRes.arrayBuffer());
          return { ok: true as const, imageUrl: `data:${type};base64,${b64}` };
        }
      } catch (e) {
        console.error("agnes image download failed:", e);
      }
      return { ok: true as const, imageUrl: item.url };
    } catch (err) {
      console.error("gerar-imagem-agnes error:", err);
      return { ok: false as const, error: "Falha ao conectar com a Agnes AI. Tente novamente." };
    }
  });

// ---------- Vídeo ----------

function findVideoUrl(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof v === "string" && /^https?:\/\//.test(v) && (/video|url/i.test(k) || /\.(mp4|webm|mov)/i.test(v))) {
      return v;
    }
    if (v && typeof v === "object") {
      const inner = findVideoUrl(v);
      if (inner) return inner;
    }
  }
  return null;
}

export const criarVideoAgnes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ prompt: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["AGNES_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Chave da Agnes AI não configurada no servidor." };
    try {
      const res = await fetch(`${API_ROOT}/v1/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "agnes-video-2.5",
          prompt: data.prompt,
          mode: "text",
          seconds: "5",
          size: "720P",
          aspect_ratio: "16:9",
        }),
      });
      const json = (await res.json().catch(() => null)) as Record<string, any> | null;
      if (!res.ok) {
        return { ok: false as const, error: json?.error?.message ?? json?.message ?? `Agnes AI respondeu com status ${res.status}` };
      }
      const videoId = json?.video_id ?? json?.id ?? json?.task_id ?? json?.data?.video_id;
      if (!videoId) return { ok: false as const, error: "A Agnes AI não retornou o ID do vídeo." };
      return { ok: true as const, videoId: String(videoId) };
    } catch (err) {
      console.error("criar-video-agnes error:", err);
      return { ok: false as const, error: "Falha ao conectar com a Agnes AI." };
    }
  });

export const consultarVideoAgnes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ videoId: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["AGNES_API_KEY"];
    if (!apiKey) return { status: "failed" as const, error: "Chave da Agnes AI não configurada." };
    try {
      const res = await fetch(`${API_ROOT}/agnesapi?video_id=${encodeURIComponent(data.videoId)}&model_name=agnes-video-2.5`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const json = (await res.json().catch(() => null)) as Record<string, any> | null;
      if (!res.ok) {
        return { status: "failed" as const, error: json?.error?.message ?? `Status ${res.status}` };
      }
      const status = String(json?.status ?? json?.data?.status ?? "").toLowerCase();
      if (["failed", "error", "cancelled"].includes(status)) {
        return { status: "failed" as const, error: json?.error?.message ?? "A geração do vídeo falhou." };
      }
      const url = findVideoUrl(json);
      if (["succeeded", "success", "completed", "done"].includes(status) || url) {
        if (!url) return { status: "failed" as const, error: "Vídeo pronto, mas sem link de download." };
        return { status: "done" as const, videoUrl: url };
      }
      return { status: "pending" as const };
    } catch (err) {
      console.error("consultar-video-agnes error:", err);
      return { status: "pending" as const };
    }
  });
