const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarrierTrading", function () {
  let CarrierTrading;
  let carrierTrading;
  let CarrierToken;
  let carrierToken;
  let owner;
  let seller;
  let buyer1;
  let buyer2;

  beforeEach(async function () {
    [owner, seller, buyer1, buyer2] = await ethers.getSigners();

    // Deploy the CarrierToken contract
    CarrierToken = await ethers.getContractFactory("CarrierToken");
    carrierToken = await CarrierToken.deploy();

    // Mint a token for the seller
    const tokenId = 1;
    const carrier = {
      owner: seller,
      carrierName: "Test Carrier",
      carrierType: "Airplane",
      registrationNumber: "12345",
      price: ethers.parseEther("1.0"), // 1 ETH
      year: 2023,
      txSucCount: 0,
    };
    
    await carrierToken.connect(seller).mintToken(carrier);
    

    // Deploy the CarrierTrading contract
    CarrierTrading = await ethers.getContractFactory("CarrierTrading");
    CarrierTrading = await CarrierTrading.connect(seller);
    carrierTrading = await CarrierTrading.deploy(carrierToken, tokenId);

    //approveContract
    await carrierToken.connect(seller).approveOperator(tokenId, carrierTrading);
  });

  it("should allow a buyer to place a bid", async function () {
    const bidPrice = ethers.parseEther("1.5"); // 1.5 ETH
    await carrierTrading.connect(buyer1).bits(bidPrice);

    const buyerInfo = await carrierTrading.buyers(buyer1.address);
    expect(buyerInfo.bitPrice).to.equal(bidPrice);
    expect(await carrierTrading.finalbuyer()).to.equal(buyer1.address);
  });

  it("should not allow a buyer to place a bid lower than the starting price", async function () {
    const bidPrice = ethers.parseEther("0.5"); // 0.5 ETH
    await expect(carrierTrading.connect(buyer1).bits(bidPrice)).to.be.revertedWith("Bits price is too low");
  });

  it("should allow the final buyer to pay the deposit", async function () {
    const bidPrice = ethers.parseEther("1.5"); // 1.5 ETH
    await carrierTrading.connect(buyer1).bits(bidPrice);

    // Fast forward time to the deposit phase
    await ethers.provider.send("evm_increaseTime", [300]);
    await ethers.provider.send("evm_mine");

    const requiredDeposit = bidPrice*20n/100n;
    await carrierTrading.connect(buyer1).deposit({ value: requiredDeposit });
    const buyerInfo = await carrierTrading.buyers(buyer1.address);
    expect(buyerInfo.depositAmount).to.equal(requiredDeposit);
    expect(await carrierTrading.status()).to.equal(2); // Status.DepositPaid
  });

  it("should allow the final buyer to pay the final payment", async function () {
    const bidPrice = ethers.parseEther("1.5"); // 1.5 ETH
    await carrierTrading.connect(buyer1).bits(bidPrice);

    // Fast forward time to the deposit phase
    await ethers.provider.send("evm_increaseTime", [300]);
    await ethers.provider.send("evm_mine");

    const requiredDeposit = bidPrice*20n/100n;
    await carrierTrading.connect(buyer1).deposit({ value: requiredDeposit });

    await carrierTrading.connect(buyer1).payFinalPayment({ value: bidPrice-requiredDeposit });

    expect(await carrierTrading.status()).to.equal(3); // Status.FinalPaymentPaid
  });

  it("should allow the seller to complete the transaction", async function () {
    const bidPrice = ethers.parseEther("1.5"); // 1.5 ETH
    await carrierTrading.connect(buyer1).bits(bidPrice);

    // Fast forward time to the deposit phase
    await ethers.provider.send("evm_increaseTime", [300]);
    await ethers.provider.send("evm_mine");

    const requiredDeposit = bidPrice*20n/100n;
    await carrierTrading.connect(buyer1).deposit({ value: requiredDeposit });

    await carrierTrading.connect(buyer1).payFinalPayment({ value: bidPrice-requiredDeposit });

    await carrierTrading.connect(seller).complete();

    expect(await carrierTrading.status()).to.equal(4); // Status.Completed
    expect(await carrierToken.ownerOf(1)).to.equal(buyer1.address);
  });

  it("should allow the seller or buyer to cancel the transaction", async function () {
    const bidPrice = ethers.parseEther("1.5"); // 1.5 ETH
    await carrierTrading.connect(buyer1).bits(bidPrice);

    // Fast forward time to the deposit phase
    await ethers.provider.send("evm_increaseTime", [300]);
    await ethers.provider.send("evm_mine");

    const requiredDeposit = bidPrice*20n/100n;
    await carrierTrading.connect(buyer1).deposit({ value: requiredDeposit });

    await carrierTrading.connect(seller).cancel();

    expect(await carrierTrading.status()).to.equal(5); // Status.Cancelled
  });
});