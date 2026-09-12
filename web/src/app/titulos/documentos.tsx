"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { isAddress } from "viem";
import { sitioUrl } from "@/lib/contrato";
import {
  TITULOS,
  FOLIO_CLONADO,
  TITULAR_FALSO,
  CI_FALSO,
  type TituloDoc,
} from "./datos";





export default function Documentos({ duenos }: { duenos: Record<string, string> }) {
  const base = sitioUrl;
  const [estafador, setEstafador] = useState("");

  const valido = isAddress(estafador);
  const original = TITULOS.find((t) => t.folio === FOLIO_CLONADO)!;

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <div className="no-print">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500 hover:text-teal-700"
        >
          ← Registro DDRR
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Títulos para imprimir</h1>
        <p className="mt-2 max-w-prose text-slate-600">
          Cada título lleva su propio QR. Imprime, y tendrás los documentos físicos de la
          demo. Guarda como PDF si quieres subirlos a Pinata.
        </p>

        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">Título clonado</h2>
          <p className="mt-1 text-sm text-red-900/80">
            Pega la billetera de quien hará de vendedor falso. Se genera un sexto documento:
            el mismo inmueble con titular suplantado, y un QR que delata el fraude.
          </p>
          <input
            value={estafador}
            onChange={(e) => setEstafador(e.target.value.trim())}
            placeholder="0x…"
            aria-label="Billetera del vendedor falso"
            className="mt-3 w-full rounded-md border border-red-300 bg-white px-3 py-2 font-mono text-sm
                       focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
          />
          {estafador && !valido && (
            <p className="mt-2 text-sm font-medium text-red-700">
              Dirección inválida. Debe empezar con 0x y tener 42 caracteres.
            </p>
          )}
        </div>

        <button
          onClick={() => window.print()}
          className="mt-6 rounded-md bg-teal-800 px-5 py-2.5 font-semibold text-white hover:bg-teal-700"
        >
          Imprimir / Guardar como PDF
        </button>
      </div>

      <div className="mt-10 grid gap-10">
        {TITULOS.map((t) => (
          <Titulo
            key={t.folio}
            t={t}
            url={enlace(base, t.folio, duenos[t.folio])}
          />
        ))}
        {valido && (
          <Titulo
            t={{ ...original, titular: TITULAR_FALSO, ci: CI_FALSO }}
            url={`${base}/verify/${FOLIO_CLONADO}?vendedor=${estafador}`}
          />
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          main { padding: 0 !important; max-width: none !important; }
          .doc { break-after: page; box-shadow: none !important; }
          .doc:last-child { break-after: auto; }
        }
      `}</style>
    </main>
  );
}

function Titulo({ t, url }: { t: TituloDoc; url: string }) {
  return (
    <article className="doc relative overflow-hidden border border-slate-400 bg-white p-10 text-slate-900 shadow-sm">
      {/* Marca de agua: protege al equipo si alguien fotografía el documento */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="rotate-[-28deg] text-[62px] font-bold tracking-[0.1em] text-slate-900/[0.07] select-none">
          DOCUMENTO DE DEMOSTRACIÓN
        </span>
      </div>

      <div className="relative">
        <header className="border-b-2 border-slate-800 pb-4 text-center">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase">
            Estado Plurinacional de Bolivia · Órgano Judicial
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-[0.12em] uppercase">
            Derechos Reales
          </h2>
          <p className="mt-1 font-mono text-[11px] tracking-[0.14em] uppercase text-slate-600">
            Folio Real — Oficina Registral de {t.oficina}
          </p>
        </header>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-slate-500">
              Matrícula computarizada
            </p>
            <p className="font-mono text-2xl font-bold tracking-tight">{t.folio}</p>
          </div>
          <div className="text-center">
            <QRCodeSVG value={url} size={128} level="Q" marginSize={2} />
            <p className="mt-1.5 font-mono text-[8px] tracking-[0.1em] uppercase text-slate-500">
              Verificar titular
            </p>
          </div>
        </div>

        <Bloque titulo="Datos del inmueble">
          <Dato k="Ubicación" v={t.ubicacion} />
          <Dato k="Depto / Prov / Municipio" v={t.municipio} />
          <Dato k="Superficie" v={`${t.superficie} m²`} />
          <Dato k="Código catastral" v={t.catastro} />
        </Bloque>

        <Bloque titulo="Colindancias">
          <Dato k="Norte" v={t.norte} />
          <Dato k="Sur" v={t.sur} />
          <Dato k="Este" v={t.este} />
          <Dato k="Oeste" v={t.oeste} />
        </Bloque>

        <Bloque titulo="Titularidad sobre el dominio">
          <Dato k="Titular" v={t.titular} />
          <Dato k="Cédula de identidad" v={t.ci} />
          <Dato k="Cuota parte" v="100 %" />
          <Dato k="Antecedente dominial" v={t.antecedente} />
        </Bloque>

        <Bloque titulo="Gravámenes y restricciones">
          <Dato k="Estado" v="NO REGISTRA gravámenes ni restricciones vigentes" />
        </Bloque>

        <footer className="mt-7 flex items-end justify-between gap-6 border-t border-slate-300 pt-4">
          <p className="max-w-[46ch] text-[10px] leading-snug text-slate-500">
            Documento generado para la demostración del ETH Bolivia Buildathon 2026.
            No constituye un certificado oficial de Derechos Reales ni tiene validez legal.
          </p>
          <div className="text-center">
            <div className="h-9 w-44 border-b border-slate-400" />
            <p className="mt-1 font-mono text-[9px] tracking-[0.1em] uppercase text-slate-500">
              Registrador
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="border-b border-slate-300 pb-1 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-600">
        {titulo}
      </h3>
      <dl className="mt-2 grid grid-cols-[170px_1fr] gap-x-4 gap-y-1 text-[12.5px]">
        {children}
      </dl>
    </section>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </>
  );
}

/** El documento afirma quién lo porta; la página contrasta esa afirmación
 *  contra la cadena. Sin dueño conocido se emite el QR sin afirmar nada. */
function enlace(base: string, folio: string, dueno?: string) {
  const url = `${base}/verify/${folio}`;
  return dueno ? `${url}?vendedor=${dueno}` : url;
}
