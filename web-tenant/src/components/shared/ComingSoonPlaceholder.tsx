import { Hammer } from "lucide-react";

export function ComingSoonPlaceholder() {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Hammer className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">Próximamente</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Esta sección estará disponible en una próxima versión.
      </p>
    </div>
  );
}
