# Estado del proyecto

> Documento operativo para las horas previas a la presentación.
> ETH Bolivia Buildathon 2026 · Bounty de Avalanche

## En vivo

| | |
|---|---|
| **Demo** | https://registro-ddrr.vercel.app |
| **Rutas** | `/` · `/verify/<folio>` · `/titulos` · `/vender` · `/notario` |
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

Las dos viven en **el mismo MetaMask, en el equipo de Juanito**. La demo corre
desde ese único equipo.

| Cuenta | Rol | Dirección |
|---|---|---|
| Account 1 | notario, deployer y owner | `0x8168ED937C3d5665349eA33B9a1543042eF705a6` |
| **Account 2** | el vendedor falso | `0x7732b8ee0Aa6AB50F508DE371d71296C301D25dd` |

### Puesta a punto antes de subir al escenario

**Deja MetaMask en Account 2 y no la muevas.** Ningún momento de la demo
necesita Account 1: las pantallas de verificación funcionan sin billetera, y el
único paso que la pide es el intento de venta, que debe salir de Account 2.

Desde Account 1 ese botón aparece bloqueado, porque es notaria y la venta se
ejecutaría en vez de ser rechazada.

### Propiedades

| Token | Folio | Inmueble | Dueño |
|---|---|---|---|
| 1 | `BOL-LP-001234` | Av. Ballivián 1234, Calacoto, La Paz | A |
| 2 | `BOL-LP-005678` | Calle 21 de Calacoto 780, La Paz | A |
| **3** | `BOL-SC-009012` | Av. San Martín 450, Equipetrol, Santa Cruz | **B** |
| 4 | `BOL-SC-003456` | Barrio Las Palmas, 3er Anillo, Santa Cruz | A |
| 5 | `BOL-CB-007890` | Av. América 210, Cala Cala, Cochabamba | A |

**El token 3 es el del golpe técnico.** Es el único que ve Account 2 en
`/vender`, y el botón «Vender directamente al comprador» es lo que dispara el
rechazo. Simulado contra Fuji: revierte con `TransferenciaNoAutorizada(0x7732…)`,
así que MetaMask avisa de que la transacción va a fallar antes incluso de firmar.

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
| 1:20–1:45 | **El golpe técnico.** En `/vender`, con Account 2 ya conectada, pulsar «Vender directamente» sobre Equipetrol → el contrato lo rechaza |
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

**Prueba permanente del fraude rechazado.** Un intento real, ya ejecutado y
registrado en la cadena, que cualquiera puede auditar:

https://testnet.snowtrace.io/tx/0xf7d096e704d7bcf1a115ac129e6d267358c7c2bbee1614650b5187cfd22afe18

Estado: fallida. De la billetera del vendedor falso al contrato, revertida con
`TransferenciaNoAutorizada`. Sirve como respaldo si el intento en vivo no sale,
y como respuesta a quien sospeche que la pantalla roja es una animación.

**Si falla el wifi en el escenario:** el video de respaldo. Por eso se graba.

**Si MetaMask aparece con la cuenta equivocada:** la página lo dice sola. Con
Account 1 el botón sale bloqueado con un aviso ámbar; con cualquier otra
billetera, «no figura como titular de ninguna propiedad». Cambiar a Account 2
en MetaMask y la página se actualiza sola, sin recargar.
