// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {IBT} from "../contracts/IBT.sol";

contract MintScript is Script {
    function run(address tokenAddress, address to, uint256 amount) external {
        vm.startBroadcast();
        IBT token = IBT(tokenAddress);
        token.mint(to, amount);
        vm.stopBroadcast();
    }
}

