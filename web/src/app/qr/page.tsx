"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { isAddress } from "viem";
import { sitioUrl } from "@/lib/contrato";

/** Debe coincidir con contracts/script/Seed.s.sol */
const PROPIEDADES = [
  { folio: "BOL-LP-001234", dir: "Av. Ballivián 1234, Calacoto, La Paz" },
  { folio: "BOL-LP-005678", dir: "Calle 21 de Calacoto 780, La Paz" },
  { folio: "BOL-SC-009012", dir: "Av. San Martín 450, Equipetrol, Santa Cruz" },
  { folio: "BOL-SC-003456", dir: "Barrio Las Palmas, 3er Anillo, Santa Cruz" },
  { folio: "BOL-CB-007890", dir: "Av. América 210, Cala Cala, Cochabamba" },
];

const FOLIO_FRAUDE = "BOL-LP-001234";

export default function QrPage() {
  const base = sitioUrl;
  const [estafador, setEstafador] = useState("");

  const estafadorValido = isAddress(estafador);
  const urlFraude = estafadorValido
    ? `${base}/verify/${FOLIO_FRAUDE}?vendedor=${estafador}`
    : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="no-print">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-teal-700"
        >
          ← Registro DDRR
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          QR para los títulos
        </h1>
        <p className="mt-2 max-w-prose text-slate-600">
          Pega cada QR en su título impreso. La cámara nativa del celular los abre: no hace
          falta ninguna app.
        </p>

        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">QR del estafador</h2>
          <p className="mt-1 text-sm text-red-900/80">
            Pega la billetera de quien hará de vendedor falso. Este QR va en el título
            clonado — el que dispara la pantalla roja en la demo.
          </p>
          <input
            value={estafador}
            onChange={(e) => setEstafador(e.target.value.trim())}
            placeholder="0x…"
            aria-label="Billetera del estafador"
            className="mt-3 w-full rounded-md border border-red-300 bg-white px-3 py-2 font-mono text-sm
                       focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          />
          {estafador && !estafadorValido && (
            <p className="mt-2 text-sm font-medium text-red-700">
              Esa no es una dirección válida. Debe empezar con 0x y tener 42 caracteres.
            </p>
          )}
        </div>

        <button
          onClick={() => window.print()}
          className="mt-6 rounded-md bg-teal-800 px-5 py-2.5 font-semibold text-white hover:bg-teal-700"
        >
          Imprimir
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
        {PROPIEDADES.map((p) => (
          <Ficha
            key={p.folio}
            titulo={p.folio}
            sub={p.dir}
            url={`${base}/verify/${p.folio}`}
          />
        ))}
        {urlFraude && (
          <Ficha
            titulo={FOLIO_FRAUDE}
            sub="TÍTULO CLONADO — vendedor falso"
            url={urlFraude}
            fraude
          />
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
        }
      `}</style>
    </main>
  );
}

function Ficha({
  titulo,
  sub,
  url,
  fraude,
}: {
  titulo: string;
  sub: string;
  url: string;
  fraude?: boolean;
}) {
  return (
    <div
      className={`flex break-inside-avoid flex-col items-center rounded-md border bg-white p-4 text-center ${
        fraude ? "border-red-400 border-dashed" : "border-slate-300"
      }`}
    >
      <div className="flex size-[148px] items-center justify-center">
        {url ? (
          <QRCodeSVG value={url} size={140} level="M" marginSize={1} />
        ) : (
          <span className="text-xs text-slate-400">…</span>
        )}
      </div>
      <p className="mt-3 font-mono text-sm font-semibold">{titulo}</p>
      <p
        className={`mt-1 text-xs leading-snug ${
          fraude ? "font-semibold text-red-700" : "text-slate-500"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}
