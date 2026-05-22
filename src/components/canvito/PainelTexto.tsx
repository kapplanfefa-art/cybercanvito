import { Crown, Search, Sparkles, Type, ChevronRight } from "lucide-react";
import { memo, useCallback, useState, useMemo } from "react";
import { useEditor } from "./editor-context";
import { WORD_FONTS } from "./fonts-library";
import { toast } from "sonner";

type TextPreset = "caixa" | "titulo" | "subtitulo" | "corpo";

const TEXT_PRESETS: Record<TextPreset, { label: string; log: string; fontSize: number; fontWeight: string }> = {
  caixa: { label: "Adicionar uma caixa de texto", log: "CAIXA DE TEXTO", fontSize: 56, fontWeight: "500" },
  titulo: { label: "Inserir um título", log: "TÍTULO", fontSize: 88, fontWeight: "800" },
  subtitulo: { label: "Inserir um subtítulo", log: "SUBTÍTULO", fontSize: 52, fontWeight: "700" },
  corpo: { label: "Inserir um pouquinho de texto", log: "TEXTO", fontSize: 30, fontWeight: "400" },
};

export const PainelTexto = memo(function PainelTexto() {
  const { addText } = useEditor();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllFonts, setShowAllFonts] = useState(false);

  const filteredFonts = useMemo(() => {
    if (!searchQuery) return WORD_FONTS;
    return WORD_FONTS.filter(font => 
      font.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddTextToCanvas = useCallback((type: TextPreset) => {
    const preset = TEXT_PRESETS[type];
    addText(preset.label === "Adicionar uma caixa de texto" ? "Sua caixa de texto" : preset.label, {
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight
    });
  }, [addText]);

  return (
    <div className="flex flex-col gap-4 p-3">
      {showAllFonts ? (
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setShowAllFonts(false)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-panel-foreground"
          >
            ← Voltar
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Pesquisar fontes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-secondary/70 pl-10 pr-3 text-sm text-panel-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredFonts.map((font) => (
              <button
                key={font}
                onClick={() => addText(font, { fontFamily: font, fontSize: 48 })}
                className="group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-secondary/80 border border-transparent hover:border-border"
              >
                <span style={{ fontFamily: font }} className="text-lg text-panel-foreground truncate">
                  {font}
                </span>
                <Type className="h-3 w-3 opacity-0 group-hover:opacity-40" />
              </button>
            ))}
            {filteredFonts.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">Nenhuma fonte encontrada</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Busque fontes e combinações"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-secondary/70 pl-10 pr-3 text-sm text-panel-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <button
            onClick={() => handleAddTextToCanvas("caixa")}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--neon-violet)] px-4 py-3 text-sm font-bold text-primary-foreground shadow-neon transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Type className="h-4 w-4" strokeWidth={2.4} />
            Adicionar uma caixa de texto
          </button>

          <button
            onClick={() => toast("Disponível na versão Pro")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 py-3 text-sm font-semibold text-panel-foreground transition-colors hover:border-[var(--neon-pink)]/70 hover:bg-secondary/70"
          >
            <Sparkles className="h-4 w-4 text-[var(--neon-pink)]" />
            Texto Mágico
            <Crown className="h-4 w-4 text-[var(--neon-pink)]" />
          </button>

          <section className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Fontes do Word</h3>
              <button 
                onClick={() => setShowAllFonts(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-accent hover:underline"
              >
                Ver tudo <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {WORD_FONTS.slice(0, 5).map(font => (
                <button
                  key={font}
                  onClick={() => addText(font, { fontFamily: font, fontSize: 48 })}
                  className="flex w-full items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-2 text-left transition-colors hover:border-accent hover:bg-secondary/70"
                >
                  <span style={{ fontFamily: font }} className="text-base text-panel-foreground">
                    {font}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2 pt-1">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Estilos padrão</h3>
            <button
              onClick={() => handleAddTextToCanvas("titulo")}
              className="rounded-lg border border-border bg-secondary/50 p-4 text-left text-2xl font-extrabold text-panel-foreground transition-all hover:border-accent hover:bg-secondary/80"
            >
              Inserir um título
            </button>
            <button
              onClick={() => handleAddTextToCanvas("subtitulo")}
              className="rounded-lg border border-border bg-secondary/50 p-4 text-left text-lg font-bold text-panel-foreground transition-all hover:border-accent hover:bg-secondary/80"
            >
              Inserir um subtítulo
            </button>
            <button
              onClick={() => handleAddTextToCanvas("corpo")}
              className="rounded-lg border border-border bg-secondary/50 p-4 text-left text-sm font-normal text-panel-foreground transition-all hover:border-accent hover:bg-secondary/80"
            >
              Inserir um pouquinho de texto
            </button>
          </section>
        </>
      )}
    </div>
  );
});