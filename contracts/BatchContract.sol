// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BatchContract is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private claimerIndex;

    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant BRONZE = 2;

    struct Claimer {
        address claimerAddress;
        uint256 id;
        uint256 amount;
        bool isClaimed;
    }

    event ClaimedToken(
        address indexed claimerAddress,
        uint256 indexed id,
        uint256 amount
    );

    mapping(uint256 => Claimer) private claimLists;

    constructor(string memory _uri) ERC1155(_uri) {
        _mint(msg.sender, GOLD, 100, "");
        _mint(msg.sender, SILVER, 100, "");
        _mint(msg.sender, BRONZE, 100, "");
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(to, id, amount, data);
    }

    function addClaimLists(
        address _claimerAddress,
        uint256 _id,
        uint256 _amount
    ) public returns (Claimer memory) {
        uint256 index = claimerIndex.current();

        Claimer memory claimer = Claimer(_claimerAddress, _id, _amount, false);

        claimLists[index] = claimer;

        claimerIndex.increment();

        return claimer;
    }

    function getClaimLists() public view returns (Claimer[] memory) {
        uint256 claimerCount = 0;

        for (uint256 i = 0; i < claimerIndex.current(); i++) {
            claimerCount += 1;
        }

        Claimer[] memory items = new Claimer[](claimerCount);

        for (uint256 i = 0; i < claimerCount; i++) {
            Claimer storage currentItem = claimLists[i];
            items[i] = currentItem;
        }

        return items;
    }

    function claimedToken(address _claimerAddress) public virtual {
        uint256 claimerCount = 0;

        for (uint256 i = 0; i < claimerIndex.current(); i++) {
            claimerCount += 1;
        }

        for (uint256 i = 0; i < claimerCount; i++) {
            if (
                claimLists[i].claimerAddress == _claimerAddress &&
                claimLists[i].isClaimed == false
            ) {
                _mint(
                    claimLists[i].claimerAddress,
                    claimLists[i].id,
                    claimLists[i].amount,
                    ""
                );
                claimLists[i].isClaimed = true;

                emit ClaimedToken(
                    claimLists[i].claimerAddress,
                    claimLists[i].id,
                    claimLists[i].amount
                );
            }
        }
    }
}
