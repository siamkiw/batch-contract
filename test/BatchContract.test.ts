import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import {
  BatchContract,
  BatchTransfer,
  BatchTransfer__factory,
} from "../typechain-types";
require("chai").use(require("chai-as-promised")).should();

describe("BatchContract", () => {
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;
  let receiverAddress: SignerWithAddress;
  let batchContract: BatchContract;

  let batchTransfer: BatchTransfer;

  beforeEach(async function () {
    [owner, address1, receiverAddress] = await ethers.getSigners();

    const BatchContract = await ethers.getContractFactory("BatchContract");
    batchContract = await BatchContract.deploy(
      "https://game.example/api/item/{id}.json"
    );

    await batchContract.deployed();

    // addClaimLists to the contract
    await batchContract.addClaimLists(address1.address, 1, 20);
    await batchContract.addClaimLists(address1.address, 1, 20);

    const BatchTransfer = await ethers.getContractFactory("BatchTransfer");
    batchTransfer = await BatchTransfer.deploy(
      batchContract.address,
      receiverAddress.address
    );
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

  it("createBatch", async () => {
    await batchTransfer.createBatch(batchContract.address, {
      ids: [1, 2, 3],
      amounts: [10, 10, 10],
      claimedId: 4,
      claimedAmount: 1,
    });

    const createBatchResult = await batchTransfer.createBatch(
      batchContract.address,
      {
        ids: [2, 3],
        amounts: [10, 10],
        claimedId: 4,
        claimedAmount: 2,
      }
    );

    await expect(createBatchResult)
      .to.emit(batchTransfer, "CreateBatch")
      .withArgs(batchContract.address, 1, [2, 3], [10, 10], 4, 2);

    const getBatchListsResult = await batchTransfer.getBatchLists(
      batchContract.address
    );

    const batchTransferIds1 = [
      ethers.BigNumber.from(1),
      ethers.BigNumber.from(2),
      ethers.BigNumber.from(3),
    ];
    const batchTransferAmounts1 = [
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(10),
    ];

    expect(getBatchListsResult.length).to.equal(2);
    expect(getBatchListsResult[0].ids.length).to.equal(
      getBatchListsResult[0].amounts.length
    );
    expect(getBatchListsResult[0].batchId).to.equal(0);
    expect(getBatchListsResult[0].claimedId).to.equal(4);
    expect(getBatchListsResult[0].claimedAmount).to.equal(1);

    for (const index in getBatchListsResult[0].ids) {
      expect(getBatchListsResult[0].ids[index]).to.equal(
        batchTransferIds1[index]
      );
    }

    for (const index in getBatchListsResult[0].amounts) {
      expect(getBatchListsResult[0].amounts[index]).to.equal(
        batchTransferAmounts1[index]
      );
    }
  });

  it("getBatch", async () => {
    const batchTransferIds1 = [
      ethers.BigNumber.from(1),
      ethers.BigNumber.from(2),
      ethers.BigNumber.from(3),
    ];
    const batchTransferAmounts1 = [
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(10),
      ethers.BigNumber.from(10),
    ];
    await batchTransfer.createBatch(batchContract.address, {
      ids: [1, 2, 3],
      amounts: [10, 10, 10],
      claimedId: 4,
      claimedAmount: 1,
    });

    const getBatchResult = await batchTransfer.getBatch(
      batchContract.address,
      0
    );

    expect(getBatchResult.batchId).to.equal(0);
    expect(getBatchResult.claimedId).to.equal(4);
    expect(getBatchResult.claimedAmount).to.equal(1);

    for (const index in getBatchResult.ids) {
      expect(getBatchResult.ids[index]).to.equal(batchTransferIds1[index]);
    }

    for (const index in getBatchResult.amounts) {
      expect(getBatchResult.amounts[index]).to.equal(
        batchTransferAmounts1[index]
      );
    }

    const getBatchResult2 = await batchTransfer.getBatch(
      batchTransfer.address,
      1
    );

    expect(getBatchResult2.batchId).to.equal(0);
    expect(getBatchResult2.claimedId).to.equal(0);
    expect(getBatchResult2.claimedAmount).to.equal(0);

    for (const index in getBatchResult2.ids) {
      expect(getBatchResult2.ids[index]).to.equal(undefined);
    }

    for (const index in getBatchResult.amounts) {
      expect(getBatchResult2.amounts[index]).to.equal(undefined);
    }
  });

  it("claimBatch", async () => {
    await batchContract.setApprovalForAll(batchTransfer.address, true);

    await batchTransfer.createBatch(batchContract.address, {
      ids: [0, 1, 2],
      amounts: [50, 60, 70],
      claimedId: 4,
      claimedAmount: 1,
    });

    const claimBatchResult = await batchTransfer.claimBatch(
      batchContract.address,
      0
    );

    await expect(claimBatchResult)
      .to.emit(batchTransfer, "ClaimBatch")
      .withArgs(
        batchContract.address,
        owner.address,
        receiverAddress.address,
        0,
        [0, 1, 2],
        [50, 60, 70],
        4,
        1
      );

    const receiverBalance = await batchContract.balanceOfBatch(
      [
        receiverAddress.address,
        receiverAddress.address,
        receiverAddress.address,
      ],
      [0, 1, 2]
    );

    const ownerBalance = await batchContract.balanceOfBatch(
      [owner.address, owner.address, owner.address],
      [0, 1, 2]
    );
    
    const initBalance = 100;

    expect(ownerBalance[0]).to.equal(initBalance - 50);
    expect(ownerBalance[1]).to.equal(initBalance - 60);
    expect(ownerBalance[2]).to.equal(initBalance - 70);

    expect(receiverBalance[0]).to.equal(50);
    expect(receiverBalance[1]).to.equal(60);
    expect(receiverBalance[2]).to.equal(70);
  });
});
