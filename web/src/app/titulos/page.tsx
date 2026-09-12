"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { isAddress } from "viem";
import { sitioUrl } from "@/lib/contrato";

/** Los folios deben coincidir con contracts/script/Seed.s.sol */
const TITULOS = [
  {
    folio: "BOL-LP-001234",
    oficina: "La Paz",
    ubicacion: "Av. Ballivián N° 1234, Zona Calacoto",
    municipio: "La Paz — Murillo — La Paz",
    superficie: "420,00",
    catastro: "021-045-012",
    titular: "María Elena Quispe Mamani",
    ci: "4587123 LP",
    norte: "Av. Ballivián, 18,00 m",
    sur: "Lote N° 14 de Juana Condori, 18,00 m",
    este: "Calle 12, 23,30 m",
    oeste: "Lote N° 11 de Pedro Gutiérrez, 23,30 m",
    antecedente: "Escritura Pública N° 412/2019, Not. 18 de La Paz",
  },
  {
    folio: "BOL-LP-005678",
    oficina: "La Paz",
    ubicacion: "Calle 21 de Calacoto N° 780",
    municipio: "La Paz — Murillo — La Paz",
    superficie: "315,50",
    catastro: "021-063-008",
    titular: "Jorge Luis Ticona Flores",
    ci: "3211456 LP",
    norte: "Calle 21, 14,50 m",
    sur: "Lote N° 7 de Ana Mamani, 14,50 m",
    este: "Lote N° 9 de Luis Paredes, 21,75 m",
    oeste: "Pasaje peatonal, 21,75 m",
    antecedente: "Escritura Pública N° 87/2021, Not. 5 de La Paz",
  },
  {
    folio: "BOL-SC-009012",
    oficina: "Santa Cruz",
    ubicacion: "Av. San Martín N° 450, Barrio Equipetrol",
    municipio: "Santa Cruz — Andrés Ibáñez — Santa Cruz de la Sierra",
    superficie: "680,00",
    catastro: "104-022-031",
    titular: "Rosa Angélica Suárez Áñez",
    ci: "7845221 SC",
    norte: "Av. San Martín, 20,00 m",
    sur: "Lote N° 30 de Mario Vaca, 20,00 m",
    este: "Calle Los Cusis, 34,00 m",
    oeste: "Lote N° 32 de Elena Roca, 34,00 m",
    antecedente: "Escritura Pública N° 233/2020, Not. 11 de Santa Cruz",
  },
  {
    folio: "BOL-SC-003456",
    oficina: "Santa Cruz",
    ubicacion: "Barrio Las Palmas, 3er Anillo Interno",
    municipio: "Santa Cruz — Andrés Ibáñez — Santa Cruz de la Sierra",
    superficie: "540,00",
    catastro: "098-014-007",
    titular: "Carlos Alberto Justiniano Roca",
    ci: "5123789 SC",
    norte: "Calle Las Palmas, 18,00 m",
    sur: "Lote N° 6 de Sonia Áñez, 18,00 m",
    este: "Lote N° 8 de Hugo Melgar, 30,00 m",
    oeste: "Área verde municipal, 30,00 m",
    antecedente: "Escritura Pública N° 156/2018, Not. 3 de Santa Cruz",
  },
  {
    folio: "BOL-CB-007890",
    oficina: "Cochabamba",
    ubicacion: "Av. América N° 210, Zona Cala Cala",
    municipio: "Cochabamba — Cercado — Cochabamba",
    superficie: "390,00",
    catastro: "045-031-019",
    titular: "Silvia Patricia Rojas Vargas",
    ci: "6332014 CB",
    norte: "Av. América, 15,00 m",
    sur: "Lote N° 18 de Raúl Claros, 15,00 m",
    este: "Calle Beni, 26,00 m",
    oeste: "Lote N° 20 de Carmen Peña, 26,00 m",
    antecedente: "Escritura Pública N° 301/2022, Not. 7 de Cochabamba",
  },
];

/** El título clonado de la demo: mismo inmueble, titular suplantado. */
const FOLIO_CLONADO = "BOL-LP-001234";
const TITULAR_FALSO = "Ramiro Andrés Peñaranda Ortiz";
const CI_FALSO = "8901234 LP";

export default function TitulosPage() {
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
          <Titulo key={t.folio} t={t} url={`${base}/verify/${t.folio}`} />
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

function Titulo({ t, url }: { t: (typeof TITULOS)[number]; url: string }) {
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
            <QRCodeSVG value={url} size={96} level="M" marginSize={0} />
            <p className="mt-1.5 font-mono text-[8px] tracking-[0.1em] uppercase text-slate-500">
              Verificar titular
            </p>
            <p className="mt-0.5 max-w-[120px] font-mono text-[6.5px] leading-tight break-all text-slate-400">
              {url.replace(/^https:\/\//, "")}
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
