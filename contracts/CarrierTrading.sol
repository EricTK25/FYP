// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CarrierToken.sol";
import "hardhat/console.sol";

contract CarrierTrading is ReentrancyGuard{
    uint256 private constant DEPOSIT_RATE = 20;//20%
    uint256 constant BITS_DURATION = 300;

    enum Status { Bits, WaitDeposit, DepositPaid, FinalPaymentPaid, Completed, Cancelled}
    Status public status = Status.Bits;

    address public immutable seller;
    address public finalbuyer;
    uint256 public immutable bitStartingPrice;
    uint256 public immutable createdAt;

    CarrierToken public carrierToken;
    uint256 public immutable tokenId;

    struct buyer {
        uint256 bitPrice;
        uint256 depositAmount;
    }
    mapping(address => buyer) public buyers;

    constructor(CarrierToken _carrierToken, uint256 _tokenId){
        require(_carrierToken.ownerOf(_tokenId) == msg.sender, "You are not owner of token");
        seller = msg.sender;
        finalbuyer = address(0);
        (,,,, uint256 price,,) = _carrierToken.tokenId2Carrier(_tokenId);
        bitStartingPrice = price;
        createdAt = block.timestamp;
        carrierToken = _carrierToken;
        tokenId = _tokenId;
    }


    function bits(uint256 bitsPrice) external {
        require(status == Status.Bits, "Bits is expired");
        require(bitsPrice>buyers[finalbuyer].bitPrice, "Bits price is too low");
        require(bitsPrice>=bitStartingPrice, "Bits price is too low");
        require(msg.sender != seller, "You are seller");
        
        buyers[msg.sender] = buyer({
            bitPrice: bitsPrice,
            depositAmount: 0
        });
        finalbuyer = msg.sender;
    }
    
    function deposit() external payable nonReentrant{
        setStatus();
        require(status == Status.WaitDeposit, "Not the pay deposit time");
        require(msg.sender == finalbuyer, "You are not final buyer");
        uint256 requiredDeposit = (buyers[finalbuyer].bitPrice * DEPOSIT_RATE) / 100;
        require(msg.value == requiredDeposit, "Incorrect deposit amount");

        buyers[finalbuyer].depositAmount = msg.value;
        status = Status.DepositPaid;
    }

    function payFinalPayment() external payable nonReentrant{
        require(status == Status.DepositPaid, "Not pay deposit");
        require(msg.sender == finalbuyer, "You are not final buyer");
        require(msg.value == buyers[finalbuyer].bitPrice - buyers[finalbuyer].depositAmount, "Incorrect FinalPayment amount");

        status = Status.FinalPaymentPaid;
    }

    function complete() external nonReentrant{
        require(status == Status.FinalPaymentPaid, "Not pay deposit");
        require(msg.sender == seller, "You are not seller");
        
        payable(seller).transfer(buyers[finalbuyer].bitPrice);
        carrierToken.setTokenTxRecord(tokenId, address(this));
        carrierToken.safeTransferFrom(seller, finalbuyer, tokenId);
        status = Status.Completed;
    }

    function cancel() external nonReentrant {
        require(status == Status.Bits || status == Status.WaitDeposit || status == Status.DepositPaid || status == Status.FinalPaymentPaid, "Not the cancel time");
        require(msg.sender == seller || msg.sender == finalbuyer, "You are not seller or buyer");

        if(msg.sender == seller){
            if(status == Status.DepositPaid)
                payable(finalbuyer).transfer(buyers[finalbuyer].depositAmount);
            else if(status == Status.FinalPaymentPaid)
                payable(finalbuyer).transfer(buyers[finalbuyer].bitPrice);
            status = Status.Cancelled;
            return;
        }

        if(status == Status.WaitDeposit)
            status = Status.Cancelled;
    }

    function setStatus() internal {
        if(block.timestamp > createdAt + BITS_DURATION)
            status = Status.WaitDeposit;
    }
}