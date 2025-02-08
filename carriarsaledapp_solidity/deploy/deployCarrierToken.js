const { ethers } = require("hardhat");
const { JsonRpcProvider } = require("ethers");

const provider = new JsonRpcProvider();
const signer = provider.getSigner();

const deployCarrierToken = async (signer) => {
    let CarrierToken = await ethers.getContractFactory("CarrierToken");
    let carrierToken = await CarrierToken.deploy();
    await carrierToken.waitForDeployment();

    console.log("CarrierToken deployed to:", await carrierToken.getAddress());
    return carrierToken.getAddress();
};

deployCarrierToken(signer);