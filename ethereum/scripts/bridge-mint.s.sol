// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IBT} from "../contracts/IBT.sol";

/**
 * @title BridgeMintScript
 * @dev Admin script to mint tokens on destination chain after bridge operation
 *      This simulates the centralized bridge operator minting tokens after
 *      verifying a burn transaction on the source chain
 */
contract BridgeMintScript is Script {
    function run(
        address tokenAddress,
        address recipient,
        uint256 amount,
        string memory sourceTxHash
    ) external {
        // In production, you would verify the sourceTxHash here
        // by checking the source chain for the burn transaction
        
        vm.startBroadcast();
        IBT token = IBT(tokenAddress);
        token.mint(recipient, amount);
        vm.stopBroadcast();
        
        console.log("Minted %s tokens to %s", amount, recipient);
        console.log("Source transaction: %s", sourceTxHash);
    }
}

