// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IBatchContract.sol";
import "hardhat/console.sol";

contract BatchTransfer is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    address private batchAddress;
    address private receiver;

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
        address indexed batchAddress,
        uint256 indexed batchId,
        uint256[] ids,
        uint256[] amounts,
        uint256 claimedId,
        uint256 claimedAmount
    );

    event ClaimBatch(
        address batchAddress,
        address sender,
        address receiver,
        uint256 indexed batchId,
        uint256[] ids,
        uint256[] amounts,
        uint256 claimedId,
        uint256 claimedAmount
    );

    constructor(address _batchContract, address _receiver) {
        batchAddress = _batchContract;
        receiver = _receiver;
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
            _batchList.ids.length != 0 && _batchList.amounts.length != 0,
            "BatchTransfer: length of ids and amounts must not be 0"
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
            _batchAddress,
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

    function getBatch(address _batchAddress, uint batchId)
        public
        view
        returns (BatchList memory)
    {
        return batchLists[_batchAddress][batchId];
    }

    function claimBatch(address _batchAddress, uint256 _batchId) public {
        BatchList memory batch = getBatch(_batchAddress, _batchId);
        require(
            batch.ids.length == batch.amounts.length,
            "BatchTransfer: length of ids and amounts is not equal"
        );
        require(
            batch.ids.length != 0 && batch.amounts.length != 0,
            "BatchTransfer: length of ids and amounts must not be 0"
        );

        address[] memory addresses = new address[](batch.ids.length);
        for (uint256 i = 0; i < batch.ids.length; i++) {
            addresses[i] = (_msgSender());
        }

        uint256[] memory senderBalance = IBatchContract(_batchAddress)
            .balanceOfBatch(addresses, batch.ids);

        for (uint256 i = 0; i < senderBalance.length; i++) {
            require(
                senderBalance[i] >= batch.amounts[i],
                "BatchTransfer: token balance not enough"
            );
        }

        IBatchContract(_batchAddress).safeBatchTransferFrom(
            msg.sender,
            receiver,
            batch.ids,
            batch.amounts,
            ""
        );

        IBatchContract(_batchAddress).mint(
            msg.sender,
            batch.claimedId,
            batch.claimedAmount,
            ""
        );

        emit ClaimBatch(
            _batchAddress,
            msg.sender,
            receiver,
            batch.batchId,
            batch.ids,
            batch.amounts,
            batch.claimedId,
            batch.claimedAmount
        );
    }

    function transfer() public {
        IBatchContract(batchAddress).mint(msg.sender, 1, 1, "");
    }
}
