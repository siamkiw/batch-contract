// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract BatchContract is ERC1155 {

    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant BRONZE = 2;


    constructor(string memory _uri) ERC1155(_uri) {
        _mint(msg.sender, GOLD, 100, "");
        _mint(msg.sender, SILVER, 100, "");
        _mint(msg.sender, BRONZE, 100, "");
    }

}
