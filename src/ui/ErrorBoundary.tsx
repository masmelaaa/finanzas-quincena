import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Red de seguridad: si algo revienta al renderizar, en vez de dejar la pantalla
 * en blanco/congelada (obligando a forzar el cierre), muestra una pantalla de
 * recuperación. Los datos siguen intactos en localStorage.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-full bg-bg text-ink flex flex-col items-center justify-center px-8 text-center gap-3">
        <p className="text-5xl mb-2">😵</p>
        <h1 className="text-[20px] font-bold">Algo salió mal</h1>
        <p className="text-[14px] text-ink3">
          Tus datos están a salvo — no se perdió nada. Intenta recargar la app.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-6 py-3 rounded-2xl bg-accent text-white font-semibold text-[15px]"
        >
          Recargar
        </button>
        <details className="mt-4 text-left w-full max-w-sm">
          <summary className="text-[12px] text-ink3">Detalle técnico</summary>
          <pre className="text-[10px] text-ink3 whitespace-pre-wrap mt-1">
            {String(this.state.error?.stack ?? this.state.error)}
          </pre>
        </details>
      </div>
    );
  }
}
