# Estado del proyecto

> Documento operativo para las horas previas a la presentación.
> ETH Bolivia Buildathon 2026 · Bounty de Avalanche

## En vivo

| | |
|---|---|
| **Demo** | https://registro-ddrr.vercel.app |
| **Contrato** | [`0xdeb63063360B782867375E04194833EC2AdA57CF`](https://testnet.snowtrace.io/address/0xdeb63063360B782867375E04194833EC2AdA57CF) |
| **Repositorio** | https://github.com/JuanitoOrtega/web3-ddrr |
| **Red** | Avalanche Fuji C-Chain · 43113 |

---

## Requisitos del bounty

Los seis, cumplidos.

- [x] Avalanche como parte relevante de la solución
- [x] Smart contract desplegado en Avalanche
- [x] Contratos verificados en Snowtrace
- [x] MVP funcional
- [x] Repositorio público con evidencia técnica
- [x] Explicación de por qué Avalanche tiene sentido

**Dónde se juega la nota que falta:** 40 % integración, 25 % caso de uso,
25 % implementación, 10 % potencial. Lo técnico está cerrado; el resto vive
en el pitch.

---

## Listo y verificado

- [x] Contrato `RegistroPropiedad` desplegado y verificado
- [x] 14 tests pasando, incluidos los tres del escenario de fraude
- [x] 5 propiedades emitidas, repartidas entre dos wallets
- [x] App pública leyendo Fuji, sin billetera y sin backend
- [x] Tres estados de verificación
- [x] QR que declaran a su dueño, leído de la cadena al renderizar
- [x] 6 títulos impresos
- [x] Ambas wallets fondeadas

## Pendiente

### Ruta crítica

- [ ] **Ensayo cronometrado** con los papeles en la mano
- [ ] **Video de respaldo** de la demo
- [ ] **Dormir**

### Persona B

- [ ] Deck de máximo 6 slides
- [ ] Guion de 2 minutos cronometrado
- [ ] 3 casos reales de fraude en DDRR con fuente periodística
- [ ] Incorporar la frase: «El notario lo registró en la cadena, y por eso lleva este QR»

### Opcional

- [ ] Subir un PDF a Pinata — el enlace a IPFS está oculto mientras los CID
      sean de relleno, así que no rompe nada si no se hace

---

## Datos para tener a mano durante la demo

### Wallets

| Rol | Dirección |
|---|---|
| **A** — notario, deployer y owner | `0x8168ED937C3d5665349eA33B9a1543042eF705a6` |
| **B** — Persona B, el vendedor falso | `0x7732b8ee0Aa6AB50F508DE371d71296C301D25dd` |

### Propiedades

| Token | Folio | Inmueble | Dueño |
|---|---|---|---|
| 1 | `BOL-LP-001234` | Av. Ballivián 1234, Calacoto, La Paz | A |
| 2 | `BOL-LP-005678` | Calle 21 de Calacoto 780, La Paz | A |
| **3** | `BOL-SC-009012` | Av. San Martín 450, Equipetrol, Santa Cruz | **B** |
| 4 | `BOL-SC-003456` | Barrio Las Palmas, 3er Anillo, Santa Cruz | A |
| 5 | `BOL-CB-007890` | Av. América 210, Cala Cala, Cochabamba | A |

**El token 3 es el del golpe técnico**: es de Persona B, y es el que intenta
transferir por fuera para que Metamask lo rechace en vivo.

---

## Los cuatro estados

| Escaneas | Respuesta |
|---|---|
| Título legítimo | 🟢 **El vendedor es el titular** |
| Título clonado de Calacoto | 🔴 **El vendedor NO es el titular** |
| URL sin el parámetro `vendedor` | ⚪ **Folio registrado** + aviso de lo que falta comprobar |
| Folio inexistente | 🔴 **No existe en el registro** |

---

## Guion de 2 minutos

| Tiempo | Qué pasa |
|---|---|
| 0:00–0:20 | **El gancho.** Sin slides: un caso real de título clonado |
| 0:20–0:50 | **Verificación honesta.** Escanear título legítimo → 🟢 |
| 0:50–1:20 | **El fraude.** Persona B presenta el título clonado → 🔴. Tres segundos de silencio |
| 1:20–1:45 | **El golpe técnico.** Persona B intenta transferir el token 3 → Metamask revierte |
| 1:45–2:00 | **Cierre de negocio.** «No reemplazamos a Derechos Reales» |

---

## Respuestas preparadas

**«¿Y si borro el parámetro del vendedor de la URL?»**
La pantalla verde nunca dice «esta compra es segura», dice «este vendedor es el
titular». Sin nadie que afirme quién vende, no hay nada que comprobar — y la app
lo dice en vez de tranquilizar. La raíz de la confianza es la cadena, no el papel.

**«Ese no es el formato de un folio real boliviano.»**
Correcto, es una maqueta para la demostración. La propuesta no cambia el
documento que emite Derechos Reales: le añade una forma de verificarlo.

**«¿Por qué Avalanche y no cualquier otra cadena?»**
Un registro de propiedad no quiere una cadena pública sin permisos. Quiere
validadores conocidos —los colegios de notarios, el Estado—, que el ciudadano
verifique sin pagar gas, y reglas propias. Ese es el modelo de L1s soberanas de
Avalanche. El MVP corre sobre Fuji porque es lo que cabe en el tiempo del
hackatón; la L1 es la arquitectura destino.

**«¿Qué impide que el dueño venda el NFT por fuera?»**
El override de `_update`. Un título solo se mueve si quien firma es un notario
autorizado, y las aprobaciones están deshabilitadas para que no pueda listarse
en un marketplace. Está en el contrato, no en una política.

---

## Si algo se rompe

**Reconstruir el estado de la demo** (vuelve a emitir lo que falte, no duplica):

```bash
cd ~/Courses/web3-ddrr
source contracts/.env
cd contracts && forge script script/Seed.s.sol --rpc-url fuji --broadcast
```

**Ensayar en local, sin gastar AVAX** — dos terminales:

```bash
anvil                                   # terminal 1

cd ~/Courses/web3-ddrr                  # terminal 2
./scripts/desplegar.sh local
cd web && pnpm dev
```

**Si falla el wifi en el escenario:** el video de respaldo. Por eso se graba.
