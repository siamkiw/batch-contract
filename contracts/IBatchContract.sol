// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./BatchContract.sol";

interface IBatchContract is IERC1155 {
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    function addClaimLists(
        address _claimerAddress,
        uint256 _id,
        uint256 _amount
    ) external returns (BatchContract.Claimer memory);

    function getClaimLists()
        external
        view
        returns (BatchContract.Claimer[] memory);

    function claimedToken(address _claimerAddress) external;
}
