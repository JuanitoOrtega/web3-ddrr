"use client";

import { useEffect, useState } from "react";
import { useConnect, type Connector } from "wagmi";

/** Los monederos se anuncian por EIP-6963 en cuanto carga la página, pero no de
 *  forma síncrona: en el primer render solo existe el conector `injected`
 *  genérico que declaramos. Si pintáramos ya, el botón diría "Injected" y
 *  cambiaría de nombre al instante. Esperamos a que el anuncio se asiente. */
const MS_DESCUBRIMIENTO = 250;

/** MetaMask primero: en un equipo con varias extensiones, el orden en que
 *  llegan los anuncios es arbitrario, y en una demo en vivo pulsar el monedero
 *  equivocado cuesta el momento entero. */
function ordenar(cs: readonly Connector[]): Connector[] {
  const descubiertos = cs.filter((c) => c.id !== "injected");
  const lista = descubiertos.length > 0 ? [...descubiertos] : [...cs];
  return lista.sort((a, b) => {
    const mm = (c: Connector) => (/metamask/i.test(c.name) ? 0 : 1);
    return mm(a) - mm(b) || a.name.localeCompare(b.name);
  });
}

export function BotonesConectar() {
  const { connect, connectors, isPending } = useConnect();
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setListo(true), MS_DESCUBRIMIENTO);
    return () => clearTimeout(t);
  }, []);

  if (!listo) {
    return (
      <button
        disabled
        className="rounded-md bg-teal-800 px-4 py-2 font-semibold text-white opacity-50"
      >
        Conectar billetera
      </button>
    );
  }

  const lista = ordenar(connectors);

  return (
    <>
      {lista.map((c, i) => (
        <button
          key={c.uid}
          onClick={() => connect({ connector: c })}
          disabled={isPending}
          className={
            i === 0
              ? "rounded-md bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              : "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          }
        >
          {isPending ? "Conectando…" : `Conectar ${c.name}`}
        </button>
      ))}
    </>
  );
}
