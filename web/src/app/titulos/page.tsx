import {
  publicClient,
  registroAbi,
  contratoAddress,
  contratoConfigurado,
} from "@/lib/contrato";
import { TITULOS } from "./datos";
import Documentos from "./documentos";

// Los QR impresos deben reflejar la titularidad real en el momento de imprimir.
export const dynamic = "force-dynamic";

/** Lee de la cadena quién posee cada folio. Si algo falla, se devuelve vacío:
 *  el documento se imprime igual, solo que su QR no afirma vendedor. */
async function duenosActuales(): Promise<Record<string, string>> {
  if (!contratoConfigurado) return {};
  try {
    const res = await Promise.all(
      TITULOS.map(async (t) => {
        const [existe, , propietario] = await publicClient.readContract({
          address: contratoAddress,
          abi: registroAbi,
          functionName: "consultarPorFolio",
          args: [t.folio],
        });
        return existe ? ([t.folio, propietario] as const) : null;
      })
    );
    return Object.fromEntries(res.filter((x) => x !== null));
  } catch {
    return {};
  }
}

export default async function TitulosPage() {
  return <Documentos duenos={await duenosActuales()} />;
}
