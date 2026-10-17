import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canvito — Editor gráfico cyberpunk" },
      { property: "og:title", content: "Canvito — Editor gráfico cyberpunk" },
      { property: "og:description", content: "Crie, edite e exporte designs no Canvito com ferramentas de texto e IA mágica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content: "Canvito: editor gráfico com estética cyberpunk neon. Crie, edite e exporte designs com IA mágica.",
      },
    ],
  }),
  component: CanvitoApp,
});

function CanvitoApp() {
  const [ClientApp, setClientApp] = useState<ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;
    import("@/components/canvito/CanvitoClient").then((module) => {
      if (mounted) setClientApp(() => module.CanvitoClient);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ClientApp) {
    return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground" />;
  }

  return <ClientApp />;
}
