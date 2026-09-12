import Link from "next/link";
import { isAddress, type Address } from "viem";
import {
  publicClient,
  registroAbi,
  contratoAddress,
  contratoConfigurado,
  deployBlock,
  acortar,
  urlIpfs,
  fecha,
} from "@/lib/contrato";

// Siempre lee estado fresco de la cadena: tras un traspaso notarial,
// recargar tiene que mostrar al dueño nuevo.
export const dynamic = "force-dynamic";

type Consulta =
  | { estado: "error"; mensaje: string }
  | { estado: "inexistente" }
  | {
      estado: "ok";
      tokenId: bigint;
      propietario: Address;
      direccion: string;
      cid: string;
      emitidoEn: bigint;
      traspasos: number;
    };

async function consultar(folio: string): Promise<Consulta> {
  if (!contratoConfigurado) {
    return { estado: "error", mensaje: "El contrato aún no está configurado." };
  }
  try {
    const [existe, tokenId, propietario, direccion, cid, emitidoEn] =
      await publicClient.readContract({
        address: contratoAddress,
        abi: registroAbi,
        functionName: "consultarPorFolio",
        args: [folio],
      });

    if (!existe) return { estado: "inexistente" };

    let traspasos = 0;
    try {
      const logs = await publicClient.getContractEvents({
        address: contratoAddress,
        abi: registroAbi,
        eventName: "TituloTransferido",
        args: { tokenId },
        fromBlock: deployBlock,
        toBlock: "latest",
      });
      traspasos = logs.length;
    } catch {
      traspasos = -1; // el RPC no dio los logs; no es motivo para romper la página
    }

    return {
      estado: "ok",
      tokenId,
      propietario,
      direccion,
      cid,
      emitidoEn,
      traspasos,
    };
  } catch {
    return {
      estado: "error",
      mensaje: "No se pudo consultar la cadena. Revisa el RPC e intenta de nuevo.",
    };
  }
}

export default async function VerificarPage({
  params,
  searchParams,
}: {
  params: Promise<{ folio: string }>;
  searchParams: Promise<{ vendedor?: string }>;
}) {
  const { folio: crudo } = await params;
  const { vendedor } = await searchParams;
  const folio = decodeURIComponent(crudo);

  const r = await consultar(folio);
  const vendedorValido = vendedor && isAddress(vendedor) ? vendedor : null;

  // El escenario del fraude: el QR declara un vendedor que no es el titular.
  const impostor =
    r.estado === "ok" &&
    vendedorValido !== null &&
    vendedorValido.toLowerCase() !== r.propietario.toLowerCase();

  const alarma = r.estado === "inexistente" || impostor;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-teal-700"
      >
        ← Registro DDRR
      </Link>

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-slate-500">
        Folio real
      </p>
      <h1 className="font-mono text-2xl font-semibold tracking-tight break-all sm:text-3xl">
        {folio}
      </h1>

      {r.estado === "error" && (
        <Panel tono="neutro" titulo="No se pudo verificar">
          <p className="text-sm text-slate-600">{r.mensaje}</p>
        </Panel>
      )}

      {r.estado === "inexistente" && (
        <Panel tono="alarma" titulo="Este título no existe en el registro">
          <p className="text-sm">
            Ningún notario autorizado ha emitido un título con este folio. Un documento en
            papel que diga lo contrario no está respaldado.
          </p>
          <Accion>No firmes. No pagues.</Accion>
        </Panel>
      )}

      {r.estado === "ok" && impostor && (
        <Panel tono="alarma" titulo="El vendedor NO es el titular">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <Fila k="Titular real" v={acortar(r.propietario)} mono />
            <Fila k="Wallet vendedor" v={acortar(vendedorValido)} mono />
            <Fila k="Coincide" v="NO" mono />
          </dl>
          <Accion>No firmes. No pagues.</Accion>
        </Panel>
      )}

      {r.estado === "ok" && !impostor && (
        <Panel tono="ok" titulo="Título verificado">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <Fila k="Titular actual" v={acortar(r.propietario)} mono />
            <Fila k="Dirección" v={r.direccion || "—"} />
            <Fila k="Emitido" v={fecha(r.emitidoEn)} />
            <Fila
              k="Traspasos"
              v={
                r.traspasos < 0
                  ? "no disponible"
                  : `${r.traspasos} · todos notariales`
              }
            />
            <Fila k="Token" v={`#${r.tokenId}`} mono />
          </dl>
          {r.cid && (
            <a
              href={urlIpfs(r.cid)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-mono text-xs text-teal-800 underline underline-offset-2 hover:text-teal-600"
            >
              Ver testimonio en IPFS ↗
            </a>
          )}
          {vendedorValido && (
            <p className="mt-4 border-t border-emerald-200 pt-3 text-sm text-emerald-900">
              La billetera del vendedor coincide con el titular registrado.
            </p>
          )}
        </Panel>
      )}

      <p className="mt-8 text-sm text-slate-500">
        Consulta leída directamente de Avalanche Fuji. Gratuita, sin billetera y sin
        intermediarios.
      </p>

      {alarma && (
        <p className="mt-2 text-sm text-slate-500">
          Esta capa no reemplaza a Derechos Reales: verifica contra los títulos que los
          notarios autorizados ya emitieron aquí.
        </p>
      )}
    </main>
  );
}

function Panel({
  tono,
  titulo,
  children,
}: {
  tono: "ok" | "alarma" | "neutro";
  titulo: string;
  children: React.ReactNode;
}) {
  const estilos = {
    ok: "border-t-4 border-t-emerald-600 border-emerald-200 bg-emerald-50 text-emerald-950",
    alarma: "border-t-4 border-t-red-600 border-red-200 bg-red-50 text-red-950",
    neutro: "border-t-4 border-t-slate-400 border-slate-200 bg-white text-slate-900",
  }[tono];

  const punto = {
    ok: "bg-emerald-600",
    alarma: "bg-red-600",
    neutro: "bg-slate-400",
  }[tono];

  return (
    <section className={`mt-6 rounded-md border p-6 shadow-sm ${estilos}`}>
      <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-balance">
        <span className={`size-2.5 shrink-0 rounded-full ${punto}`} aria-hidden="true" />
        {titulo}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Fila({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <>
      <dt className="font-mono text-[11px] tracking-[0.1em] whitespace-nowrap uppercase opacity-60">
        {k}
      </dt>
      <dd className={mono ? "font-mono text-xs break-all" : "text-sm"}>{v}</dd>
    </>
  );
}

function Accion({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 border-t border-red-200 pt-3 font-semibold">{children}</p>
  );
}
