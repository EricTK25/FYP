pragma solidity ^0.8.9;

contract CarrierApp {
    address public owner;

    struct Item {
        uint256 product_id;
        string product_name;
        string product_category;
        string product_image;
        uint256 cost;
        uint256 stock;
        string specification; // New field
        string highlights;    // New field
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint256 cost, uint quantity);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _stock,
        string memory _specification, // New parameter
        string memory _highlights     // New parameter
    ) public onlyOwner {
        Item memory item = Item(
            _id, 
            _name,
            _category, 
            _image, 
            _cost, 
            _stock,
            _specification, // New field
            _highlights     // New field
        );

        items[_id] = item;

        emit List(_name, _cost, _stock);
    }

    function buy(uint256 _id) public payable {
        Item memory item = items[_id];
        require(msg.value >= item.cost, "Insufficient payment");
        require(item.stock > 0, "Item out of stock");

        Order memory order = Order(block.timestamp, item);
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        items[_id].stock = item.stock - 1;

        emit Buy(msg.sender, orderCount[msg.sender], item.product_id);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function getProduct(uint256 _id) public view returns (Item memory) {
        return items[_id];
    }

    function getItemDetails(uint256 _id) public view returns (
        uint256 id,
        string memory name,
        string memory category,
        string memory image,
        uint256 cost,
        uint256 stock,
        string memory specification, // New return value
        string memory highlights      // New return value
    ) {
        Item memory item = items[_id];
        return (
            item.product_id,
            item.product_name,
            item.product_category,
            item.product_image,
            item.cost,
            item.stock,
            item.specification, // New field
            item.highlights      // New field
        );
    }
}
