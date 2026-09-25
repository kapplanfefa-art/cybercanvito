import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { gerarImagemAgnes } from "@/lib/agnes.functions";
import { useEditor } from "./editor-context";

export function AiEditModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const gerar = useServerFn(gerarImagemAgnes);
  const { addImageFromSource } = useEditor();

  const handleGenerate = useCallback(async () => {
    const text = prompt.trim();
    if (!text || loading) return;
    setLoading(true);
    setResultUrl(null);
    try {
      const res = await gerar({ data: { prompt: text } });
      if (res.ok) {
        setResultUrl(res.imageUrl);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Erro inesperado ao gerar a imagem.");
    } finally {
      setLoading(false);
    }
  }, [prompt, loading, gerar]);

  const handleAddToCanvas = useCallback(async () => {
    if (!resultUrl) return;
    try {
      await addImageFromSource(resultUrl, undefined, "ia-agnes.png", true);
      toast.success("Imagem adicionada ao canvas");
      onOpenChange(false);
      setResultUrl(null);
      setPrompt("");
    } catch {
      toast.error("Não foi possível adicionar a imagem ao canvas.");
    }
  }, [resultUrl, addImageFromSource, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[120] border-white/10 bg-[var(--panel)] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-4 w-4 text-[var(--neon-cyan)]" />
            Editar com IA
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Descreva a imagem que você quer criar com a IA Mágica.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex.: um gato astronauta em estilo cyberpunk neon..."
            rows={3}
            className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[var(--electric-blue)]"
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--electric-blue)] px-4 text-sm font-bold text-[var(--background)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Gerar imagem
              </>
            )}
          </button>

          {loading && (
            <div className="flex h-40 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <div className="flex flex-col items-center gap-2 text-white/60">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--neon-cyan)]" />
                <span className="text-xs">A IA está criando sua imagem...</span>
              </div>
            </div>
          )}

          {resultUrl && !loading && (
            <div className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-md border border-white/10 bg-white/5">
                <img src={resultUrl} alt="Imagem gerada por IA" className="max-h-64 w-full object-contain" />
              </div>
              <button
                onClick={handleAddToCanvas}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-[var(--background)] transition-all hover:scale-[1.02] active:scale-95"
              >
                Adicionar ao canvas
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
