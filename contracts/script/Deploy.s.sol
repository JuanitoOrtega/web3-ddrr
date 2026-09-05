// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RegistroPropiedad} from "../src/RegistroPropiedad.sol";

/// Despliega el registro. El deployer queda como owner y como primer notario.
///   forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
contract Deploy is Script {
    function run() external returns (RegistroPropiedad registro) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);
        registro = new RegistroPropiedad(deployer);
        vm.stopBroadcast();

        console.log("RegistroPropiedad:", address(registro));
        console.log("Owner / notario 0:", deployer);
        console.log("");
        console.log("Copia esto a web/.env.local:");
        console.log(
            string.concat(
                "NEXT_PUBLIC_CONTRACT_ADDRESS=", vm.toString(address(registro))
            )
        );
    }
}
