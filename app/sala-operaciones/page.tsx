import Link from "next/link";

export default function SalaOperacionesPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-bold">Consola de operaciones</h1>
        <p className="mt-2 text-slate-600">
          La pantalla de demostración fue retirada. Usa las consolas conectadas a los servicios del backend.
        </p>
      </div>
      <nav aria-label="Consolas operativas" className="flex flex-wrap gap-4">
        <Link className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white" href="/operador">
          Consola PSAP
        </Link>
        <Link className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white" href="/despachador">
          Consola de despacho
        </Link>
      </nav>
    </main>
  );
}
