const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarrierToken", function () {
  let CarrierToken;
  let carrierToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    CarrierToken = await ethers.getContractFactory("CarrierToken");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    carrierToken = await CarrierToken.deploy();
    await carrierToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carrierToken.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      expect(await carrierToken.name()).to.equal("CarrierToken");
      expect(await carrierToken.symbol()).to.equal("crr");
    });
  });

  describe("Minting", function () {
    it("Should mint a new token and set the carrier details", async function () {
      const carrier = {
        owner: addr1.address,
        carrierName: "Global Carrier",
        carrierType: "Air",
        registrationNumber: "GC123",
        price: ethers.parseEther("1.0"),
        year: 2023,
        txSucCount: 0,
      };

      await expect(carrierToken.connect(addr1).mintToken(carrier))
        .to.emit(carrierToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 1);

      const tokenId = 1;
      const storedCarrier = await carrierToken.tokenId2Carrier(tokenId);

      expect(storedCarrier.owner).to.equal(addr1.address);
      expect(storedCarrier.carrierName).to.equal("Global Carrier");
      expect(storedCarrier.carrierType).to.equal("Air");
      expect(storedCarrier.registrationNumber).to.equal("GC123");
      expect(storedCarrier.price).to.equal(ethers.parseEther("1.0"));
      expect(storedCarrier.year).to.equal(2023);
      expect(storedCarrier.txSucCount).to.equal(0);
    });
  });

  describe("Transaction Records", function () {
    it("Should set a transaction record for a token", async function () {
      const carrier = {
        owner: addr1.address,
        carrierName: "Global Carrier",
        carrierType: "Air",
        registrationNumber: "GC123",
        price: ethers.parseEther("1.0"),
        year: 2023,
        txSucCount: 0,
      };

      await carrierToken.connect(addr1).mintToken(carrier);

      const tokenId = 1;
      await carrierToken.connect(addr1).approveOperator(tokenId, addr2.address);
      await carrierToken.connect(addr1).setTokenTxRecord(tokenId, addr2.address);

      const txCount = (await carrierToken.tokenId2Carrier(tokenId)).txSucCount;
      const txRecord = await carrierToken.tokenTxRecord(tokenId, txCount);

      expect(txRecord).to.equal(addr2.address);
    });
  });
});