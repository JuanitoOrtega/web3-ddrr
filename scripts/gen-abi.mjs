// Regenera web/src/lib/abi.ts desde el artefacto de Foundry.
// Uso: cd web && pnpm run abi   (requiere haber corrido `forge build` antes)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const artefacto = join(raiz, "contracts/out/RegistroPropiedad.sol/RegistroPropiedad.json");
const destino = join(raiz, "web/src/lib/abi.ts");

const { abi } = JSON.parse(readFileSync(artefacto, "utf8"));
writeFileSync(
  destino,
  `// Generado desde contracts/out/RegistroPropiedad.sol/RegistroPropiedad.json\n` +
    `// Regenerar tras cambiar el contrato:  pnpm run abi\n` +
    `export const registroAbi = ${JSON.stringify(abi, null, 2)} as const;\n`
);
console.log(`ABI regenerado: ${abi.length} entradas`);
