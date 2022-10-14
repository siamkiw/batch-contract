// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./IBatchContract.sol";

contract BatchTransfer is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private batchListIndex;

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
    }

    function createBatch(BatchList memory _batchList)
        public
        returns (BatchList memory)
    {
        require(
            _batchList.ids.length == _batchList.amounts.length,
            "BatchTransfer: length of ids and amounts is not equal"
        );
        require(
            _batchList.claimedAmount > 0,
            "BatchTransfer: claimedAmount need to greater than 0"
        );
        require(
            _batchList.batchAddress != address(0),
            "BatchTransfer: batchAddress can not be the zero address"
        );

        BatchList memory batchList = BatchList(
            _batchList.ids,
            _batchList.amounts,
            _batchList.claimedId,
            _batchList.claimedAmount,
            _batchList.batchAddress
        );

        batchLists[batchListIndex.current()] = batchList;

        batchListIndex.increment();

        return batchList;
    }

    function transfer() public {
        IBatchContract(batchAddress).mint(msg.sender, 1, 1, "");
    }
}
