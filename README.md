# Registro DDRR — capa de validación anti-fraude

MVP de hackatón: los notarios autorizados tokenizan títulos de propiedad y
cualquier persona verifica al dueño real en segundos, gratis y sin billetera.

**El plan completo de 48 horas:** [docs/GUIA.md](docs/GUIA.md) y la página del plan.

```
contracts/   Foundry · Solidity · OpenZeppelin v5
web/         Next.js 16 · Tailwind · wagmi/viem
scripts/     utilidades (regenerar ABI)
```

## Puesta en marcha

```bash
# 1. Contratos
cd contracts
cp .env.example .env        # rellena PRIVATE_KEY y BASE_SEPOLIA_RPC_URL
forge test                  # 14 tests, incluido el del fraude
forge build

# 2. Deploy a Base Sepolia
source .env
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify

# 3. Sembrar las 5 propiedades de demo
#    Antes: pon CONTRACT_ADDRESS y PROPIETARIO_DEMO en .env
source .env
forge script script/Seed.s.sol --rpc-url base_sepolia --broadcast

# 4. Frontend
cd ../web
cp .env.local.example .env.local   # pega la dirección del contrato
pnpm dev
```

## Rutas

| Ruta | Qué hace |
|---|---|
| `/` | Buscador por folio real |
| `/verify/<folio>` | **La pantalla de la demo.** Server-side, sin billetera |
| `/verify/<folio>?vendedor=0x…` | Contrasta al vendedor contra el titular real |
| `/notario` | Emitir y traspasar títulos (wallet autorizada) |

Los QR de los títulos apuntan a `/verify/<folio>?vendedor=<wallet>`. La cámara
nativa del celular los abre: no hay escáner dentro de la app.

## El contrato

`RegistroPropiedad` es un ERC-721 cuyo dueño **no puede transferirlo**. El override
de `_update` bloquea todo movimiento que no venga de un notario autorizado, y las
aprobaciones están deshabilitadas, así que un título no se lista en un marketplace.

| Función | Quién |
|---|---|
| `emitirTitulo` | notario |
| `transferirPorNotario` | notario |
| `autorizarNotario` / `revocarNotario` | owner |
| `esTitular` / `consultarPorFolio` | cualquiera, gratis |

El historial de titularidad no vive en storage: son eventos `TituloTransferido`
que el frontend lee con `getContractEvents`.

## Regenerar el ABI tras tocar el contrato

```bash
cd contracts && forge build && cd ../web && pnpm run abi
```
