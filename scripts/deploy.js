const hre = require("hardhat");
const config = require("../src/config.json");
const fs = require("fs");

async function main() {
  // Get deployer account and network ID
  const [deployer] = await ethers.getSigners();
  const networkId = (await hre.ethers.provider.getNetwork()).chainId.toString();
  let configData = { ...config };

  console.log(`Deploying on network ID: ${networkId} with deployer: ${deployer.address}`);

  // Deploy CarrierApp contract
  console.log("Deploying CarrierApp contract...");
  const CarrierApp = await ethers.getContractFactory("CarrierApp");
  const carrierApp = await CarrierApp.deploy();
  await carrierApp.waitForDeployment();
  const carrierAppAddress = await carrierApp.getAddress();
  console.log(`CarrierApp deployed at: ${carrierAppAddress}`);

  // Deploy DocumentRegistry contract, passing CarrierApp address
  console.log("Deploying DocumentRegistry contract...");
  const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistry.deploy(carrierAppAddress);
  await documentRegistry.waitForDeployment();
  const documentRegistryAddress = await documentRegistry.getAddress();
  console.log(`DocumentRegistry deployed at: ${documentRegistryAddress}`);

  // Update config.json with both contract addresses
  configData[networkId] = {
    CarrierApp: { address: carrierAppAddress },
    DocumentRegistry: { address: documentRegistryAddress },
  };
  try {
    fs.writeFileSync("../FYP/src/config.json", JSON.stringify(configData, null, 2));
    console.log("Config updated");
  } catch (error) {
    console.error("Failed to update config.json:", error);
    throw error;
  }

  console.log("Deployment successful!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});