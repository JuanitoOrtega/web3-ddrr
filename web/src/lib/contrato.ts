import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { registroAbi } from "./abi";

export { registroAbi };

export const contratoAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? "https://sepolia.base.org";

/** Bloque del deploy: acota getLogs para no barrer la cadena entera. */
export const deployBlock = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK ?? "0");

export const chain = baseSepolia;

/** Cliente de solo lectura. No necesita wallet: verificar es gratis. */
export const publicClient = createPublicClient({
  chain: baseSepolia,
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

export function fecha(ts: bigint) {
  if (!ts) return "—";
  return new Date(Number(ts) * 1000).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
