// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract CarrierToken is ERC721URIStorage, Ownable{
    uint256 private _tokenIds;
    struct Carrier {
        address owner;
        string carrierName;
        string carrierType;
        string registrationNumber;
        uint256 price;
        uint256 year;
        uint256 txSucCount;
    }
    mapping(uint256 => Carrier) public tokenId2Carrier;
    mapping(uint256 => mapping(uint256 => address)) public tokenTxRecord;

    constructor() ERC721("CarrierToken", "crr") Ownable(msg.sender){}

    function _baseURI() internal pure override returns (string memory) {
        return "https://app.GlobalCarrierSale/token/";
    }

    function mintToken(Carrier memory carrier) public payable returns (uint) {
        ++_tokenIds;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, "");

        tokenId2Carrier[_tokenIds] = carrier;
        return newTokenId;
    }

    function setTokenTxRecord(uint256 tokenId, address contractAddr) public isAuthorized(tokenId){
        Carrier storage carrier = tokenId2Carrier[tokenId];
        uint256 sucCount = ++carrier.txSucCount;
        tokenTxRecord[tokenId][sucCount] = contractAddr;
    }

    function approveOperator(uint256 tokenId, address operator) public isAuthorized(tokenId){
        approve(operator, tokenId);
    }

    function getTokenIds() public view returns(uint256) {
        return _tokenIds;
    }

    modifier isAuthorized(uint256 tokenId) {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner || msg.sender == getApproved(tokenId), "Unauthorized");
        _;
    }
}