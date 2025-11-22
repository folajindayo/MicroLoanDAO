import { ethers } from "hardhat";

async function main() {
  const MicroLoanDAO = await ethers.getContractFactory("MicroLoanDAO");
  const microLoanDAO = await MicroLoanDAO.deploy();

  await microLoanDAO.waitForDeployment();

  console.log("MicroLoanDAO deployed to:", await microLoanDAO.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

