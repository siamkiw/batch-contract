import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { BatchContract } from "../typechain-types";

describe("BatchContract", () => {
  let owner: SignerWithAddress;
  let address1: SignerWithAddress;
  let batchContract: BatchContract;

  beforeEach(async function () {
    [owner, address1] = await ethers.getSigners();

    const BatchContract = await ethers.getContractFactory("BatchContract");
    batchContract = await BatchContract.deploy(
      "https://game.example/api/item/{id}.json"
    );

    await batchContract.deployed();
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

  it("safeBatchTransferFrom", async () => {
    const result = await batchContract.balanceOfBatch([owner.address, owner.address, owner.address], [0, 1, 2])
    console.log("result: ", result);
    
    await batchContract.safeBatchTransferFrom(owner.address, address1.address, [0, 1, 2], [20, 20, 20], "0x0000")

    const result2 = await batchContract.balanceOfBatch([owner.address, owner.address, owner.address], [0, 1, 2])
    console.log("result2: ", result2);
  })
});
