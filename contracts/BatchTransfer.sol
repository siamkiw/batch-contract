// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./IBatchContract.sol";

contract BatchTransfer is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    // Counters.Counter private batchListIndex;

    address private batchAddress;

    struct CreateBatchList {
        uint256[] ids;
        uint256[] amounts;
        uint256 claimedId;
        uint256 claimedAmount;
    }

    struct BatchList {
        uint256 batchId;
        uint256[] ids;
        uint256[] amounts;
        uint256 claimedId;
        uint256 claimedAmount;
    }

    mapping(address => mapping(uint256 => BatchList)) private batchLists;
    mapping(address => Counters.Counter) private batchListIndex;

    event CreateBatch(
        uint256 indexed batchId,
        uint256[] ids,
        uint256[] amounts,
        uint256 claimedId,
        uint256 claimedAmount
    );

    constructor(address _batchContract) {
        batchAddress = _batchContract;
    }

    function createBatch(
        address _batchAddress,
        CreateBatchList memory _batchList
    ) public {
        require(
            _batchList.ids.length == _batchList.amounts.length,
            "BatchTransfer: length of ids and amounts is not equal"
        );
        require(
            _batchList.claimedAmount > 0,
            "BatchTransfer: claimedAmount need to greater than 0"
        );
        require(
            _batchAddress != address(0),
            "BatchTransfer: batchAddress can not be the zero address"
        );

        uint256 index = batchListIndex[_batchAddress].current();

        BatchList memory batchList = BatchList(
            index,
            _batchList.ids,
            _batchList.amounts,
            _batchList.claimedId,
            _batchList.claimedAmount
        );

        batchLists[_batchAddress][index] = batchList;

        batchListIndex[_batchAddress].increment();

        emit CreateBatch(
            batchList.batchId,
            batchList.ids,
            batchList.amounts,
            batchList.claimedId,
            batchList.claimedAmount
        );
        
    }

    function getBatchLists(address _batchAddress)
        public
        view
        returns (BatchList[] memory)
    {
        uint256 batchCount = 0;
        uint256 index = batchListIndex[_batchAddress].current();

        for (uint256 i = 0; i < index; i++) {
            batchCount += 1;
        }

        BatchList[] memory items = new BatchList[](batchCount);

        for (uint256 i = 0; i < batchCount; i++) {
            BatchList storage currentItem = batchLists[_batchAddress][i];
            items[i] = currentItem;
        }

        return items;
    }

    function transfer() public {
        IBatchContract(batchAddress).mint(msg.sender, 1, 1, "");
    }
}
