#!/usr/bin/env bash
# Despliega, verifica y siembra en un solo comando.
#   ./scripts/desplegar.sh          → Avalanche Fuji (con verificación)
#   ./scripts/desplegar.sh local    → anvil en localhost, para ensayar
set -euo pipefail

cd "$(dirname "$0")/.."
RED="${1:-fuji}"

set -a; source contracts/.env; set +a

if [ "$RED" = "local" ]; then
  RPC="http://127.0.0.1:8545"
  VERIFY=""
  echo "▸ Red: anvil local"
else
  RPC="${FUJI_RPC_URL:-https://api.avax-test.network/ext/bc/C/rpc}"
  VERIFY="--verify"
  echo "▸ Red: Avalanche Fuji (43113)"
fi

DEPLOYER=$(cast wallet address --private-key "$PRIVATE_KEY")
SALDO=$(cast balance "$DEPLOYER" --rpc-url "$RPC" --ether)
echo "▸ Deployer: $DEPLOYER"
echo "▸ Saldo:    $SALDO AVAX"

if [ "$SALDO" = "0.000000000000000000" ]; then
  echo "✗ Sin saldo. Consigue AVAX de prueba antes de continuar:"
  echo "  https://build.avax.network/console/primary-network/faucet"
  exit 1
fi

echo
echo "▸ Desplegando…"
cd contracts
SALIDA=$(forge script script/Deploy.s.sol --rpc-url "$RPC" --broadcast $VERIFY 2>&1)
echo "$SALIDA" | grep -E "RegistroPropiedad:|Verifying|Successfully verified|ONCHAIN" || true

ADDR=$(echo "$SALIDA" | grep -oE 'NEXT_PUBLIC_CONTRACT_ADDRESS=0x[a-fA-F0-9]{40}' | head -1 | cut -d= -f2)
if [ -z "$ADDR" ]; then echo "✗ No se pudo leer la dirección desplegada"; exit 1; fi
BLOQUE=$(cast block-number --rpc-url "$RPC")

echo
echo "▸ Sembrando las 5 propiedades…"
CONTRACT_ADDRESS="$ADDR" \
PROPIETARIO_DEMO="${PROPIETARIO_DEMO:-$DEPLOYER}" \
  forge script script/Seed.s.sol --rpc-url "$RPC" --broadcast 2>&1 | grep -E "emitido|ya existe|Total" || true

cd ..
cat > web/.env.local <<ENVEOF
NEXT_PUBLIC_CONTRACT_ADDRESS=$ADDR
NEXT_PUBLIC_RPC_URL=$RPC
NEXT_PUBLIC_DEPLOY_BLOCK=$BLOQUE
ENVEOF

echo
echo "✓ Listo. web/.env.local actualizado:"
echo "   contrato $ADDR  ·  bloque $BLOQUE"
[ "$RED" != "local" ] && echo "   https://testnet.snowtrace.io/address/$ADDR"
echo
echo "Siguiente:  cd web && pnpm dev"
