// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IBatchContract.sol";

contract BatchTransfer is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private claimerIndex;

    address private batchAddress;

    struct BatchList {
        uint256[] ids;
        uint256[] amounts;
        uint256 claimedId;
        uint256 claimedAmount;
        address batchAddress;
    }

    mapping(uint256 => BatchList) private batchLists;

    constructor(address _batchContract) {
        batchAddress = _batchContract;
        // IBatchContract(_batchContract).mint(msg.sender, 1, 1, "");
    }

    function transfer() public {
        IBatchContract(batchAddress).mint(msg.sender, 1, 1, "");
    }
}
