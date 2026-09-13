# Registro DDRR — capa de validación anti-fraude

MVP para el **ETH Bolivia Buildathon 2026**. Los notarios autorizados tokenizan
títulos de propiedad sobre Avalanche y cualquier persona verifica al dueño real
en segundos, gratis y sin billetera.

### En vivo

| | |
|---|---|
| **Demo** | https://registro-ddrr.vercel.app |
| **Contrato** | [`0xdeb63063360B782867375E04194833EC2AdA57CF`](https://testnet.snowtrace.io/address/0xdeb63063360B782867375E04194833EC2AdA57CF) — verificado en Snowtrace |
| **Red** | Avalanche Fuji C-Chain (43113) |

Pruébalo sin instalar nada, desde el celular y sin billetera:

- 🟢 [Título legítimo](https://registro-ddrr.vercel.app/verify/BOL-LP-001234?vendedor=0x8168ED937C3d5665349eA33B9a1543042eF705a6) — el vendedor es el titular
- 🔴 [Título clonado](https://registro-ddrr.vercel.app/verify/BOL-LP-001234?vendedor=0x7732b8ee0Aa6AB50F508DE371d71296C301D25dd) — el vendedor no es el titular
- ⚪ [Sin declarar vendedor](https://registro-ddrr.vercel.app/verify/BOL-LP-001234) — la app avisa de lo que *no* comprobó
- 🔴 [Folio inexistente](https://registro-ddrr.vercel.app/verify/BOL-XX-999999)

Plan de 48 horas: [docs/guia.md](docs/guia.md) · Bounty: [docs/avalanche.md](docs/avalanche.md)

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
nativa del celular los abre: no hay escáner dentro de la app. La wallet que va en
cada QR se lee de la cadena al renderizar, así que un título recién impreso nunca
contradice al registro.

### La app no avala comprobaciones que no hizo

| Situación | Respuesta |
|---|---|
| El QR declara vendedor y coincide con el titular | 🟢 **El vendedor es el titular** |
| El QR declara vendedor y no coincide, o el folio no existe | 🔴 **Rojo**, con instrucción de no firmar ni pagar |
| No se declara vendedor | ⚪ **Folio registrado**: muestra el titular, pero advierte que no se verificó quién vende |

Ese tercer estado importa. Verde significa «comprobé al vendedor», no «esta compra
es segura». Quien borre el parámetro de la URL no obtiene un aval: obtiene una
pantalla que le explica qué le falta por comprobar. La raíz de la confianza es la
cadena, no el papel.

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
- [x] Smart contract desplegado en Avalanche — [`0xdeb6…57CF`](https://testnet.snowtrace.io/address/0xdeb63063360B782867375E04194833EC2AdA57CF)
- [x] Contratos verificados en Snowtrace
- [x] MVP funcional — https://registro-ddrr.vercel.app
- [x] Repositorio con evidencia técnica
- [x] Explicación de por qué Avalanche tiene sentido — sección «Por qué Avalanche»

## Sobre los documentos de la demo

Los títulos que genera `/titulos` son **maquetas**, no réplicas de un folio real
boliviano: el formato `BOL-LP-001234` está inventado y la maquetación se compuso
para la demostración. Llevan marca de agua y una nota al pie que lo dice.

La propuesta no cambia el documento que emite Derechos Reales — le añade una
forma de verificarlo.

## Regenerar el ABI tras tocar el contrato

```bash
cd contracts && forge build && cd ../web && pnpm run abi
```
