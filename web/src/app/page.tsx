import Link from "next/link";
import { contratoConfigurado } from "@/lib/contrato";

const EJEMPLOS = [
  { folio: "BOL-LP-001234", lugar: "Calacoto, La Paz" },
  { folio: "BOL-SC-009012", lugar: "Equipetrol, Santa Cruz" },
  { folio: "BOL-CB-007890", lugar: "Cala Cala, Cochabamba" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal-700">
        Registro DDRR · Base Sepolia
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        Verifica quién es el dueño{" "}
        <span className="text-teal-700">antes de pagar</span>
      </h1>
      <p className="mt-4 max-w-prose text-lg text-slate-600">
        Ingresa el folio real del título o escanea el QR del documento. La consulta es
        gratuita y no necesitas billetera.
      </p>

      <form action="/verify" className="mt-8 flex gap-2" role="search">
        <input
          name="folio"
          required
          placeholder="BOL-LP-001234"
          aria-label="Folio real"
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 font-mono text-sm
                     focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-teal-800 px-5 py-3 font-semibold text-white
                     hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Verificar
        </button>
      </form>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500">
          Títulos de ejemplo
        </h2>
        <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
          {EJEMPLOS.map((e) => (
            <li key={e.folio}>
              <Link
                href={`/verify/${e.folio}`}
                className="flex items-baseline justify-between gap-4 py-3 hover:bg-slate-100"
              >
                <span className="font-mono text-sm text-teal-800">{e.folio}</span>
                <span className="text-sm text-slate-500">{e.lugar}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {!contratoConfigurado && (
        <p className="mt-10 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Falta <code className="font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code> en{" "}
          <code className="font-mono">web/.env.local</code>. Despliega el contrato y pega
          la dirección que imprime el script.
        </p>
      )}

      <footer className="mt-16 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <Link href="/notario" className="font-medium text-teal-800 hover:underline">
          Panel de notario →
        </Link>
      </footer>
    </main>
  );
}
