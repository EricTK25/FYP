// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract DocumentRegistry {
    address public immutable carrierApp;
    address public immutable owner;

    struct Document {
        address buyer;
        uint256 productId;
        uint256 orderId;
        string ipfsCid;
        uint256 timestamp;
    }

    mapping(address => Document[]) private documents;

    event DocumentStored(
        address indexed buyer,
        uint256 indexed productId,
        uint256 indexed orderId,
        string ipfsCid,
        uint256 timestamp
    );

    error NotBuyer();
    error InvalidOrder(uint256 orderId);
    error InvalidProduct(uint256 productId);

    constructor(address _carrierApp) {
        carrierApp = _carrierApp;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert();
        _;
    }

    function storeDocument(
        address _buyer,
        uint256 _productId,
        uint256 _orderId,
        string memory _ipfsCid
    ) external {
        if (msg.sender != _buyer) revert NotBuyer();

        (bool orderValid, uint256 itemId) = verifyOrder(_buyer, _orderId);
        if (!orderValid) revert InvalidOrder(_orderId);
        if (itemId != _productId) revert InvalidProduct(_productId);

        documents[_buyer].push(Document({
            buyer: _buyer,
            productId: _productId,
            orderId: _orderId,
            ipfsCid: _ipfsCid,
            timestamp: block.timestamp
        }));

        emit DocumentStored(_buyer, _productId, _orderId, _ipfsCid, block.timestamp);
    }

    function verifyOrder(address _user, uint256 _orderId) internal view returns (bool, uint256) {
        ICarrierApp carrier = ICarrierApp(carrierApp);
        if (_orderId == 0 || _orderId > carrier.getOrderCount(_user)) {
            return (false, 0);
        }
        ICarrierApp.Order memory order = carrier.getOrder(_user, _orderId);
        return (true, order.item_id);
    }

    function getDocuments(address _buyer) external view returns (Document[] memory) {
        return documents[_buyer];
    }
}

interface ICarrierApp {
    struct Order {
        uint256 time;
        uint256 item_id;
    }
    function getOrder(address _user, uint256 _orderId) external view returns (Order memory);
    function getOrderCount(address _user) external view returns (uint256);
}