# Registro DDRR — capa de validación anti-fraude

MVP para el **ETH Bolivia Buildathon 2026**. Los notarios autorizados tokenizan
títulos de propiedad sobre Avalanche y cualquier persona verifica al dueño real
en segundos, gratis y sin billetera.

Plan de 48 horas: [docs/GUIA.md](docs/GUIA.md) · Bounty: [docs/avalanche.md](docs/avalanche.md)

```
contracts/   Foundry · Solidity · OpenZeppelin v5   → Avalanche Fuji (43113)
web/         Next.js 16 · Tailwind · wagmi/viem
scripts/     utilidades (regenerar ABI)
```

## Por qué Avalanche

Un registro de propiedad no quiere una cadena pública sin permisos: quiere
validadores conocidos —colegios de notarios, el Estado—, que el ciudadano
verifique sin pagar gas ni tener billetera, y reglas propias. Ese es exactamente
el modelo de **L1s soberanas de Avalanche**: conjunto de validadores permisionado
y token de gas configurable.

El MVP corre sobre **Fuji C-Chain** porque es lo que cabe en 48 horas. La L1 es
la arquitectura destino y el roadmap del pitch.

## Puesta en marcha

```bash
# 1. Contratos
cd contracts
cp .env.example .env        # rellena PRIVATE_KEY
forge test                  # 14 tests, incluido el del fraude
forge build

# 2. Deploy a Fuji + verificación en Snowtrace
source .env
forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify

# 3. Sembrar las 5 propiedades de demo
#    Antes: pon CONTRACT_ADDRESS y PROPIETARIO_DEMO en .env
source .env
forge script script/Seed.s.sol --rpc-url fuji --broadcast

# 4. Frontend
cd ../web
cp .env.local.example .env.local   # pega la dirección del contrato
pnpm dev
```

**AVAX de prueba:** el [faucet oficial](https://build.avax.network/console/primary-network/faucet)
pide saldo en mainnet **o un código de cupón** — los cupones se reparten en el
workshop presencial de Avalanche. Reclamen temprano y guarden reserva.

**Verificación:** Snowtrace corre sobre Routescan, cuya API es compatible con
Etherscan y **no necesita API key** (usa el literal `verifyContract`). Ya está
configurado en `foundry.toml`. Si el verificador falla, la alternativa es
`--verifier sourcify`.

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

## Checklist del bounty de Avalanche

- [x] Avalanche como parte relevante de la solución
- [ ] Smart contract desplegado en Avalanche — *pendiente: wallet con AVAX de prueba*
- [ ] Contratos verificados — *el flag `--verify` ya está configurado*
- [x] MVP funcional
- [x] Repositorio con evidencia técnica
- [ ] Explicación de por qué Avalanche tiene sentido — *va en el deck de Persona B*

## Regenerar el ABI tras tocar el contrato

```bash
cd contracts && forge build && cd ../web && pnpm run abi
```
