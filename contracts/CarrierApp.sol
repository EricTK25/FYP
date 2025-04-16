// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CarrierApp {
    address public immutable owner;
    uint256 private nextId = 1; // Tracks next available product ID

    struct Specification {
        string color;
        string engine_power;
        string fuel;
        string interior;
        string mileage;
        string condition;
        string cubic_capacity;
    }

    struct Item {
        uint256 product_id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint32 stock;
        Specification specs;
        string highlights;
        address seller;
    }

    struct Order {
        uint256 time;
        uint256 item_id;
    }

    mapping(uint256 => Item) private items;
    mapping(address => uint256) private orderCount;
    mapping(address => mapping(uint256 => Order)) private orders;

    event Buy(address indexed buyer, uint256 orderId, uint256 itemId);
    event List(uint256 indexed id, string name, uint256 cost, uint32 stock, address indexed seller);
    event Update(uint256 indexed id, uint256 cost, uint32 stock);

    error InsufficientPayment(uint256 sent, uint256 required);
    error OutOfStock(uint256 id);
    error ItemNotFound(uint256 id);
    error NotOwner();
    error WithdrawalFailed();
    error InvalidItemData();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // Returns the next available ID and increments the counter
    function getNextId() external returns (uint256) {
        uint256 id = nextId;
        nextId++;
        return id;
    }

    // Modified list function to allow optional ID input
    function list(
        uint256 _id, // 0 means use nextId
        Item calldata _item,
        Specification calldata _specs
    ) external {
        uint256 productId = _id == 0 ? nextId++ : _id;
        if (productId == 0 || items[productId].product_id != 0) revert ItemNotFound(productId);
        if (_item.cost == 0 || _item.stock == 0) revert InvalidItemData();
        if (bytes(_item.name).length == 0 || bytes(_item.category).length == 0) revert InvalidItemData();

        items[productId] = Item({
            product_id: productId,
            name: _item.name,
            category: _item.category,
            image: _item.image,
            cost: _item.cost,
            stock: _item.stock,
            specs: _specs,
            highlights: _item.highlights,
            seller: msg.sender
        });

        emit List(productId, _item.name, _item.cost, _item.stock, msg.sender);
    }

    function update(uint256 _id, uint256 _cost, uint32 _stock) external onlyOwner {
        if (items[_id].product_id == 0) revert ItemNotFound(_id);
        Item storage item = items[_id];
        item.cost = _cost;
        item.stock = _stock;

        emit Update(_id, _cost, _stock);
    }

    function buy(uint256 _id) external payable {
        Item storage item = items[_id];
        if (item.product_id == 0) revert ItemNotFound(_id);
        if (item.stock == 0) revert OutOfStock(_id);
        if (msg.value < item.cost) revert InsufficientPayment(msg.value, item.cost);

        unchecked {
            item.stock--;
            orderCount[msg.sender]++;
        }

        orders[msg.sender][orderCount[msg.sender]] = Order(block.timestamp, _id);

        (bool success, ) = item.seller.call{value: item.cost}("");
        if (!success) revert WithdrawalFailed();

        if (msg.value > item.cost) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - item.cost}("");
            if (!refundSuccess) revert WithdrawalFailed();
        }

        emit Buy(msg.sender, orderCount[msg.sender], item.product_id);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawalFailed();
    }

    function getProduct(uint256 _id) external view returns (Item memory) {
        if (items[_id].product_id == 0) revert ItemNotFound(_id);
        return items[_id];
    }

    function getItemDetails(uint256 _id) external view returns (
        uint256 product_id,
        string memory name,
        string memory category,
        string memory image,
        uint256 cost,
        uint32 stock,
        Specification memory specs,
        string memory highlights,
        address seller
    ) {
        Item memory item = items[_id];
        if (item.product_id == 0) revert ItemNotFound(_id);
        return (
            item.product_id,
            item.name,
            item.category,
            item.image,
            item.cost,
            item.stock,
            item.specs,
            item.highlights,
            item.seller
        );
    }

    function getOrder(address _user, uint256 _orderId) external view returns (Order memory) {
        if (_orderId == 0 || _orderId > orderCount[_user]) revert ItemNotFound(_orderId);
        return orders[_user][_orderId];
    }

    function getOrderCount(address _user) external view returns (uint256) {
        return orderCount[_user];
    }
}