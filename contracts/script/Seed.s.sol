// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RegistroPropiedad} from "../src/RegistroPropiedad.sol";

/// Siembra el estado de la demo en un comando. Si algo explota a las 3am,
/// esto reconstruye las 5 propiedades en 30 segundos.
///   forge script script/Seed.s.sol --rpc-url fuji --broadcast
contract Seed is Script {
    struct Semilla {
        string folioReal;
        string direccion;
        string cid;
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address registroAddr = vm.envAddress("CONTRACT_ADDRESS");
        address propietarioDemo = vm.envAddress("PROPIETARIO_DEMO");

        RegistroPropiedad registro = RegistroPropiedad(registroAddr);

        // TODO(Persona B): reemplazar los CID por los reales de Pinata.
        Semilla[5] memory semillas = [
            Semilla({
                folioReal: "BOL-LP-001234",
                direccion: "Av. Ballivian 1234, Calacoto, La Paz",
                cid: "bafkreiplaceholder00000000000000000000000000000000000001"
            }),
            Semilla({
                folioReal: "BOL-LP-005678",
                direccion: "Calle 21 de Calacoto 780, La Paz",
                cid: "bafkreiplaceholder00000000000000000000000000000000000002"
            }),
            Semilla({
                folioReal: "BOL-SC-009012",
                direccion: "Av. San Martin 450, Equipetrol, Santa Cruz",
                cid: "bafkreiplaceholder00000000000000000000000000000000000003"
            }),
            Semilla({
                folioReal: "BOL-SC-003456",
                direccion: "Barrio Las Palmas, 3er Anillo, Santa Cruz",
                cid: "bafkreiplaceholder00000000000000000000000000000000000004"
            }),
            Semilla({
                folioReal: "BOL-CB-007890",
                direccion: "Av. America 210, Cala Cala, Cochabamba",
                cid: "bafkreiplaceholder00000000000000000000000000000000000005"
            })
        ];

        vm.startBroadcast(pk);
        for (uint256 i = 0; i < semillas.length; i++) {
            (bool existe,,,,,) = registro.consultarPorFolio(semillas[i].folioReal);
            if (existe) {
                console.log("ya existe, se omite:", semillas[i].folioReal);
                continue;
            }
            uint256 tokenId = registro.emitirTitulo(
                propietarioDemo,
                semillas[i].folioReal,
                semillas[i].direccion,
                semillas[i].cid
            );
            console.log("emitido", semillas[i].folioReal, "-> tokenId", tokenId);
        }
        vm.stopBroadcast();

        console.log("");
        console.log("Total emitidos:", registro.totalEmitidos());
    }
}
