const hre = require("hardhat");

async function main() {

  // const NFT = await hre.ethers.deployContract("NFT", ["Super Car", "SUP", hre.ethers.parseEther('0.02')]);
  const NFT = await hre.ethers.deployContract("SuperCarERC1155", ["https://bafkreiebuhhy4e2p23nquu3llaftgvpy6cycpdfpuld7ccmfnksrzt2gom.ipfs.nftstorage.link/", 1000]);

  await NFT.waitForDeployment();

  console.log(
    `Contract deployed at address: ${await NFT.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
