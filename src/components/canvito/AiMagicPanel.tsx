import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Image as ImageIcon, Loader2, Video, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { consultarVideoAgnes, criarVideoAgnes, gerarImagemAgnes } from "@/lib/agnes.functions";
import { useEditor } from "./editor-context";

type Mode = "imagem" | "video";

export function AiMagicPanel() {
  const [mode, setMode] = useState<Mode>("imagem");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const gerarImg = useServerFn(gerarImagemAgnes);
  const criarVid = useServerFn(criarVideoAgnes);
  const consultarVid = useServerFn(consultarVideoAgnes);
  const { addImageFromSource, addVideoFromSource } = useEditor();

  const run = useCallback(async () => {
    const text = (promptInputRef.current?.value ?? prompt).trim();
    if (loading) return;
    if (!text) {
      toast.error("Escreva uma descrição para gerar a imagem ou o vídeo.");
      promptInputRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      if (mode === "imagem") {
        setStatus("Criando sua imagem...");
        const res = await gerarImg({ data: { prompt: text } });
        if (!res.ok) return void toast.error(res.error);
        await addImageFromSource(res.imageUrl, undefined, "ia-agnes.png");
        toast.success("Imagem adicionada ao canvas");
      } else {
        setStatus("Enviando pedido do vídeo...");
        const created = await criarVid({ data: { prompt: text } });
        if (!created.ok) return void toast.error(created.error);
        setStatus("Gerando o vídeo (pode levar alguns minutos)...");
        for (let i = 0; i < 120; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const st = await consultarVid({ data: { videoId: created.videoId } });
          if (st.status === "failed") return void toast.error(st.error);
          if (st.status === "done") {
            await addVideoFromSource(st.videoUrl);
            toast.success("Vídeo adicionado ao canvas");
            return;
          }
        }
        toast.error("O vídeo demorou demais. Tente novamente.");
      }
    } catch {
      toast.error("Erro inesperado ao gerar com IA.");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }, [prompt, loading, mode, gerarImg, criarVid, consultarVid, addImageFromSource, addVideoFromSource]);

  const tab = (m: Mode, label: string, Icon: typeof Video) => (
    <button
      onClick={() => setMode(m)}
      disabled={loading}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold transition-all ${
        mode === m ? "bg-neon-glow text-white shadow-neon" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        {tab("imagem", "Imagem", ImageIcon)}
        {tab("video", "Vídeo", Video)}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Descrição
        </span>
        <textarea
          ref={promptInputRef}
          aria-label="Descrição para gerar"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={mode === "imagem" ? "Ex.: um gato astronauta neon cyberpunk..." : "Ex.: câmera voando sobre uma cidade neon à noite..."}
          rows={4}
          className="w-full resize-none rounded-lg border-2 border-electric-blue bg-card px-3 py-3 text-sm text-panel-foreground shadow-field outline-none placeholder:text-muted-foreground/70 focus:border-electric-blue"
        />
      </label>
      <button
        onClick={run}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[var(--neon-violet)] to-[var(--neon-pink)] text-sm font-bold text-white shadow-neon transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        {loading ? "Gerando..." : mode === "imagem" ? "Gerar imagem" : "Gerar vídeo"}
      </button>
      {loading && (
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-white/70">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--neon-cyan)]" /> {status}
        </div>
      )}
    </div>
  );
}
