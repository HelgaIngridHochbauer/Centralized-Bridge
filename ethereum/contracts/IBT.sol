// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IBT - Inter-Blockchain Token
 * @dev ERC20 token that can only be minted and burned by the deployer
 */
contract IBT is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Inter-Blockchain Token", "IBT") Ownable(initialOwner) {}

    /**
     * @dev Mint tokens to a specified address
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from a specified address (owner only)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev Allows users to burn their own tokens (for bridging)
     * @param amount Amount of tokens to burn
     */
    function burnOwn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

