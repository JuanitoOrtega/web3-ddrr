"use client";

import { useState } from "react";
import Link from "next/link";
import { baseSepolia } from "wagmi/chains";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { isAddress, type Address } from "viem";
import { registroAbi, contratoAddress, contratoConfigurado, acortar } from "@/lib/contrato";

export default function NotarioPage() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: conectando } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const { data: esNotario } = useReadContract({
    address: contratoAddress,
    abi: registroAbi,
    functionName: "esNotario",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && contratoConfigurado },
  });

  const redIncorrecta = isConnected && chainId !== baseSepolia.id;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-teal-700"
      >
        ← Registro DDRR
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Panel de notario</h1>
      <p className="mt-2 text-slate-600">
        Solo las billeteras autorizadas pueden emitir y traspasar títulos.
      </p>

      {!contratoConfigurado && (
        <Aviso tono="alerta">
          Falta <code className="font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code> en{" "}
          <code className="font-mono">web/.env.local</code>.
        </Aviso>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-4">
        {isConnected ? (
          <>
            <span className="font-mono text-sm">{acortar(address)}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
                esNotario
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {esNotario ? "notario autorizado" : "sin autorización"}
            </span>
            <button
              onClick={() => disconnect()}
              className="ml-auto text-sm text-slate-500 underline hover:text-slate-900"
            >
              Desconectar
            </button>
          </>
        ) : (
          connectors.map((c) => (
            <button
              key={c.uid}
              onClick={() => connect({ connector: c })}
              disabled={conectando}
              className="rounded-md bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {conectando ? "Conectando…" : `Conectar ${c.name}`}
            </button>
          ))
        )}
      </div>

      {redIncorrecta && (
        <Aviso tono="alerta">
          Estás en otra red.{" "}
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            className="font-semibold underline"
          >
            Cambiar a Base Sepolia
          </button>
        </Aviso>
      )}

      {isConnected && esNotario === false && (
        <Aviso tono="alerta">
          Esta billetera no está autorizada. El owner del contrato debe llamar a{" "}
          <code className="font-mono">autorizarNotario</code> con tu dirección.
        </Aviso>
      )}

      <Emitir habilitado={Boolean(esNotario) && !redIncorrecta} />
      <Traspasar habilitado={Boolean(esNotario) && !redIncorrecta} />
    </main>
  );
}

function Emitir({ habilitado }: { habilitado: boolean }) {
  const [propietario, setPropietario] = useState("");
  const [folio, setFolio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cid, setCid] = useState("");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: minando, isSuccess } = useWaitForTransactionReceipt({ hash });

  const valido = isAddress(propietario) && folio.trim() !== "";

  return (
    <Tarjeta titulo="Emitir título">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valido) return;
          writeContract({
            address: contratoAddress,
            abi: registroAbi,
            functionName: "emitirTitulo",
            args: [propietario as Address, folio.trim(), direccion.trim(), cid.trim()],
          });
        }}
        className="grid gap-3"
      >
        <Campo label="Propietario (0x…)" value={propietario} onChange={setPropietario} mono />
        <Campo label="Folio real" value={folio} onChange={setFolio} mono placeholder="BOL-LP-001234" />
        <Campo label="Dirección física" value={direccion} onChange={setDireccion} placeholder="Av. Ballivián 1234, Calacoto, La Paz" />
        <Campo label="CID de IPFS" value={cid} onChange={setCid} mono placeholder="bafkrei…" />
        <Boton disabled={!habilitado || !valido || isPending || minando}>
          {isPending ? "Confirma en la billetera…" : minando ? "Minando…" : "Emitir título"}
        </Boton>
      </form>
      <Resultado
        isSuccess={isSuccess}
        hash={hash}
        error={error}
        onReset={reset}
        exito="Título emitido y registrado en cadena."
      />
    </Tarjeta>
  );
}

function Traspasar({ habilitado }: { habilitado: boolean }) {
  const [tokenId, setTokenId] = useState("");
  const [nuevo, setNuevo] = useState("");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: minando, isSuccess } = useWaitForTransactionReceipt({ hash });

  const valido = /^\d+$/.test(tokenId.trim()) && isAddress(nuevo);

  return (
    <Tarjeta titulo="Traspasar titularidad">
      <p className="mb-3 text-sm text-slate-600">
        La única vía legítima para cambiar de dueño. El titular por sí solo no puede.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!valido) return;
          writeContract({
            address: contratoAddress,
            abi: registroAbi,
            functionName: "transferirPorNotario",
            args: [BigInt(tokenId.trim()), nuevo as Address],
          });
        }}
        className="grid gap-3"
      >
        <Campo label="Token ID" value={tokenId} onChange={setTokenId} mono placeholder="1" />
        <Campo label="Nuevo propietario (0x…)" value={nuevo} onChange={setNuevo} mono />
        <Boton disabled={!habilitado || !valido || isPending || minando}>
          {isPending ? "Confirma en la billetera…" : minando ? "Minando…" : "Traspasar"}
        </Boton>
      </form>
      <Resultado
        isSuccess={isSuccess}
        hash={hash}
        error={error}
        onReset={reset}
        exito="Titularidad traspasada."
      />
    </Tarjeta>
  );
}

/* ---------------------------------------------------------------- primitivas */

function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({
  label,
  value,
  onChange,
  mono,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-md border border-slate-300 px-3 py-2 text-sm
                    focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none
                    ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

function Boton({
  disabled,
  children,
}: {
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-1 rounded-md bg-teal-800 px-4 py-2.5 font-semibold text-white
                 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Resultado({
  isSuccess,
  hash,
  error,
  onReset,
  exito,
}: {
  isSuccess: boolean;
  hash?: `0x${string}`;
  error: Error | null;
  onReset: () => void;
  exito: string;
}) {
  if (isSuccess && hash) {
    return (
      <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <p className="font-semibold">{exito}</p>
        <a
          href={`https://sepolia.basescan.org/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-xs underline"
        >
          Ver en Basescan ↗
        </a>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        <p className="font-semibold">La transacción no se completó</p>
        <p className="mt-1 text-xs">
          {error.message.split("\n")[0].slice(0, 200)}
        </p>
        <button onClick={onReset} className="mt-2 text-xs underline">
          Reintentar
        </button>
      </div>
    );
  }
  return null;
}

function Aviso({
  tono,
  children,
}: {
  tono: "alerta" | "info";
  children: React.ReactNode;
}) {
  const estilos =
    tono === "alerta"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-100 text-slate-700";
  return (
    <p className={`mt-6 rounded-md border px-4 py-3 text-sm ${estilos}`}>{children}</p>
  );
}
