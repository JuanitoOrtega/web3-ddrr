"use client";

import { useState } from "react";
import Link from "next/link";
import { avalancheFuji } from "wagmi/chains";
import {
  useAccount,
  useDisconnect,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { isAddress, type Address } from "viem";
import { registroAbi, contratoAddress, acortar } from "@/lib/contrato";
import { BotonesConectar } from "@/components/conectar";
import { TITULOS } from "../titulos/datos";

/** Comprador de la demo: la billetera del notario hace de contraparte.
 *  Es editable, pero viene puesto para no teclear direcciones en el escenario. */
const COMPRADOR_DEMO = "0x8168ED937C3d5665349eA33B9a1543042eF705a6";

export default function VenderPage() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [comprador, setComprador] = useState(COMPRADOR_DEMO);

  const redIncorrecta = isConnected && chainId !== avalancheFuji.id;

  // Un notario SÍ puede mover títulos: es su función. Si quien mira esta página
  // lo es, la venta directa no sería rechazada — se ejecutaría.
  const { data: esNotario } = useReadContract({
    address: contratoAddress,
    abi: registroAbi,
    functionName: "esNotario",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  // El intento vive AQUÍ, no dentro de la tarjeta: al confirmar en la billetera
  // la ventana pierde el foco, la lista se recarga y una tarjeta desmontada se
  // llevaría consigo el resultado que la demo necesita mostrar.
  const {
    writeContract,
    data: hash,
    isPending,
    error: errorEnvio,
    reset,
  } = useWriteContract();

  const {
    data: recibo,
    isLoading: minando,
    error: errorRecibo,
  } = useWaitForTransactionReceipt({ hash });

  const revertida = recibo?.status === "reverted";
  const rechazado = Boolean(errorEnvio || errorRecibo || revertida);

  const { data: consultas } = useReadContracts({
    contracts: TITULOS.map((t) => ({
      address: contratoAddress,
      abi: registroAbi,
      functionName: "consultarPorFolio" as const,
      args: [t.folio] as const,
    })),
    query: { enabled: isConnected },
  });

  const mios = TITULOS.map((t, i) => {
    const r = consultas?.[i];
    if (r?.status !== "success") return null;
    const [existe, tokenId, propietario] = r.result as readonly [
      boolean,
      bigint,
      Address,
      string,
      string,
      bigint,
    ];
    if (!existe || !address) return null;
    if (propietario.toLowerCase() !== address.toLowerCase()) return null;
    return { ...t, tokenId };
  }).filter((x) => x !== null);

  const ocupado = isPending || minando;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-teal-700"
      >
        ← Registro DDRR
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Mis propiedades</h1>
      <p className="mt-2 max-w-prose text-slate-600">
        Los títulos registrados a nombre de tu billetera.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-4">
        {isConnected ? (
          <>
            <span className="font-mono text-sm">{acortar(address)}</span>
            <button
              onClick={() => disconnect()}
              className="ml-auto text-sm text-slate-500 underline hover:text-slate-900"
            >
              Desconectar
            </button>
          </>
        ) : (
          <BotonesConectar />
        )}
      </div>

      {redIncorrecta && (
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Estás en otra red.{" "}
          <button
            onClick={() => switchChain({ chainId: avalancheFuji.id })}
            className="font-semibold underline"
          >
            Cambiar a Avalanche Fuji
          </button>
        </p>
      )}

      {isConnected && !redIncorrecta && (
        <>
          {esNotario && (
            <div className="mt-6 rounded-md border-t-4 border-amber-500 border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-900">
                Esta billetera está autorizada como notaría
              </p>
              <p className="mt-1.5 text-sm text-amber-900">
                Un notario sí puede mover títulos: es su función. Desde aquí la venta
                directa <strong>no sería rechazada, se ejecutaría</strong>. El botón queda
                bloqueado para que no ocurra por descuido.
              </p>
              <p className="mt-1.5 text-sm text-amber-900/80">
                El contrato distingue funciones, no personas.
              </p>
            </div>
          )}

          {rechazado && (
            <Rechazo
              error={errorEnvio ?? errorRecibo}
              hash={hash}
              onReset={reset}
            />
          )}

          <label className="mt-6 grid gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-slate-500">
              Billetera del comprador
            </span>
            <input
              value={comprador}
              onChange={(e) => setComprador(e.target.value.trim())}
              className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm
                         focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            />
          </label>

          {mios.length === 0 ? (
            <p className="mt-6 rounded-md border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Esta billetera no figura como titular de ninguna propiedad.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {mios.map((t) => (
                <section
                  key={t.folio}
                  className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="font-mono text-lg font-semibold">{t.folio}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{t.ubicacion}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    Token #{t.tokenId.toString()}
                  </p>

                  <button
                    onClick={() => {
                      reset();
                      writeContract({
                        address: contratoAddress,
                        abi: registroAbi,
                        functionName: "transferFrom",
                        args: [address as Address, comprador as Address, t.tokenId],
                      });
                    }}
                    disabled={!isAddress(comprador) || ocupado || Boolean(esNotario)}
                    className="mt-4 w-full rounded-md bg-slate-800 px-4 py-2.5 font-semibold text-white
                               hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {esNotario
                      ? "Bloqueado: eres notario"
                      : isPending
                        ? "Confirma en la billetera…"
                        : minando
                          ? "Enviando…"
                          : "Vender directamente al comprador"}
                  </button>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

/** El contrato revierte con TransferenciaNoAutorizada, selector 0xa7be41ab.
 *  La billetera lo muestra como un código opaco; aquí se traduce. El rechazo
 *  puede llegar por tres caminos: la billetera se niega al estimar el gas, el
 *  recibo vuelve revertido, o la espera del recibo falla. */
function Rechazo({
  error,
  hash,
  onReset,
}: {
  error: Error | null;
  hash?: `0x${string}`;
  onReset: () => void;
}) {
  const mensaje = error?.message ?? "";

  if (/user rejected|denied|rechaz/i.test(mensaje)) {
    return (
      <p className="mt-6 text-sm text-slate-500">
        Cancelaste la firma.{" "}
        <button onClick={onReset} className="underline">
          Reintentar
        </button>
      </p>
    );
  }

  return (
    <div className="mt-6 rounded-md border border-red-200 border-t-4 border-t-red-600 bg-red-50 p-5">
      <p className="text-lg font-bold text-red-900">El contrato rechazó la venta</p>
      <p className="mt-2 text-sm text-red-900">
        Un título de propiedad solo lo mueve un notario autorizado. No es una política
        de esta página: está escrito en el contrato y nadie puede saltárselo, ni
        siquiera el dueño.
      </p>
      <p className="mt-3 font-mono text-[11px] break-all text-red-700/70">
        {mensaje
          ? mensaje.split("\n")[0].slice(0, 160)
          : "Custom error 0xa7be41ab · TransferenciaNoAutorizada"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {hash && (
          <a
            href={`https://testnet.snowtrace.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-red-900 underline underline-offset-2"
          >
            Ver la transacción fallida en Snowtrace ↗
          </a>
        )}
        <button onClick={onReset} className="text-xs text-red-900 underline">
          Reintentar
        </button>
      </div>
    </div>
  );
}
