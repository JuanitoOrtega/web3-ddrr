import { createPublicClient, http, type Address } from "viem";
import { avalancheFuji } from "viem/chains";
import { registroAbi } from "./abi";

export { registroAbi };

export const contratoAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc";

/** Bloque del deploy: acota getLogs para no barrer la cadena entera. */
export const deployBlock = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK ?? "0");

export const chain = avalancheFuji;

/** Cliente de solo lectura. No necesita wallet: verificar es gratis. */
export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(rpcUrl),
});

export const contratoConfigurado =
  contratoAddress !== "0x0000000000000000000000000000000000000000";

export function acortar(dir?: string | null) {
  if (!dir) return "—";
  return `${dir.slice(0, 6)}…${dir.slice(-4)}`;
}

export function urlIpfs(cid: string) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/** Los CID sembrados son placeholders hasta que se suban los PDF reales.
 *  Sin esto la demo ofrece un enlace muerto, que es peor que no ofrecer nada. */
export function cidUtilizable(cid?: string | null): cid is string {
  if (!cid) return false;
  if (cid.includes("placeholder")) return false;
  return cid.length > 20;
}

export function fecha(ts: bigint) {
  if (!ts) return "—";
  return new Date(Number(ts) * 1000).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
