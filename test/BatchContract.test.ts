import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { BatchContract, BatchTransfer } from "../typechain-types";
require("chai").use(require("chai-as-promised")).should();

describe("BatchContract", () => {
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;
  let batchContract: BatchContract;

  let batchTransfer: BatchTransfer;

  beforeEach(async function () {
    [owner, address1] = await ethers.getSigners();

    const BatchContract = await ethers.getContractFactory("BatchContract");
    batchContract = await BatchContract.deploy(
      "https://game.example/api/item/{id}.json"
    );

    await batchContract.deployed();

    // addClaimLists to the contract
    await batchContract.addClaimLists(address1.address, 1, 20);
    await batchContract.addClaimLists(address1.address, 1, 20);

    const BatchTransfer = await ethers.getContractFactory("BatchTransfer");
    batchTransfer = await BatchTransfer.deploy(batchContract.address);
    await batchTransfer.deployed();

    await batchContract.setApprovalForAll(batchTransfer.address, true);
  });

  it.skip("safeTransferFrom", async () => {
    console.log("batchContract :", await batchContract.uri(3));
    console.log(
      "owner have token 1 :",
      (await batchContract.balanceOf(owner.address, 1)).toString(),
      "token"
    );

    await batchContract.safeTransferFrom(
      owner.address,
      address1.address,
      1,
      20,
      "0x0000"
    );
    console.log(
      "owner have token 1 :",
      (await batchContract.balanceOf(owner.address, 1)).toString(),
      "token"
    );

    await batchContract.safeTransferFrom(
      owner.address,
      address1.address,
      1,
      20,
      "0x0000"
    );
    console.log(
      "owner have token 1 :",
      (await batchContract.balanceOf(owner.address, 1)).toString(),
      "token"
    );
  });

  it.skip("balanceOfBatch", async () => {
    const result = await batchContract.balanceOfBatch(
      [owner.address, owner.address, owner.address],
      [0, 1, 2]
    );
    console.log("result: ", result);

    await batchContract.safeBatchTransferFrom(
      owner.address,
      address1.address,
      [0, 1, 2],
      [20, 20, 20],
      "0x0000"
    );

    const result2 = await batchContract.balanceOfBatch(
      [owner.address, owner.address, owner.address],
      [0, 1, 2]
    );
    console.log("result2: ", result2);
  });

  it.skip("getClaimLists", async () => {
    console.log("getClaimLists: ", await batchContract.getClaimLists());
  });

  it("claimedToken", async () => {
    const getClaimLists = await batchContract.getClaimLists();
    for (const claimList of getClaimLists) {
      expect(claimList.claimerAddress).to.equal(address1.address);
      expect(claimList.id).to.equal(1);
      expect(claimList.amount).to.equal(20);
      expect(claimList.isClaimed).to.be.false;
    }

    await batchContract.claimedToken(address1.address);

    const getClaimListsAfterClaimed = await batchContract.getClaimLists();
    expect(getClaimListsAfterClaimed.length).to.equal(2);
    for (const claimList of getClaimListsAfterClaimed) {
      expect(claimList.claimerAddress).to.equal(address1.address);
      expect(claimList.id).to.equal(1);
      expect(claimList.amount).to.equal(20);
      expect(claimList.isClaimed).to.be.true;
    }
  });

  it("batchTransfer constructor transfer", async () => {
    await batchContract.balanceOf(owner.address, 1);

    await batchTransfer.transfer();
    const balanceOfResultAfter = await batchContract.balanceOf(
      owner.address,
      1
    );
    expect(balanceOfResultAfter).to.equal(101);
  });
});
