import { ethers } from "hardhat";
import { BatchContract } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

async function deployBatchContract() {
  const BatchContract = await ethers.getContractFactory("BatchContract");
  const batchContract = await BatchContract.deploy(
    "https://game.example/api/item/{id}.json"
  );

  await batchContract.deployed();

  return batchContract;
}

async function main() {
    const batchContract = await deployBatchContract()
    console.log("batchContract :", batchContract)
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
