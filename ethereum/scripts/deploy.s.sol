// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {IBT} from "../contracts/IBT.sol";

contract DeployScript is Script {
    function run() external returns (IBT) {
        vm.startBroadcast();
        IBT token = new IBT(msg.sender);
        vm.stopBroadcast();
        return token;
    }
}

