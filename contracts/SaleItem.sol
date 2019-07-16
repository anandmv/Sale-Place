pragma solidity ^0.5.0;

contract SaleItem {
  struct Item {
    string name;
    string image;
    string description;
    uint price;
    uint numberOfItems;
    uint timestamp;
    address payable seller;
  }

  mapping (string => Item) private items;

  modifier isSeller(string memory _itemId){
    _;
    require(items[_itemId].seller!= address(0) && items[_itemId].seller == msg.sender);
  }

  event LogAddItem(address seller, string itemId , uint numberOfItems, uint price);
  event LogUpdateItem(address seller, string itemId , uint numberOfItems, uint price);

  /// @notice Get am item based on item id
  /// @param _itemId id of the item to fetch
  /// @return id, name, image , description , price , number of Items left, timestamp and seller address of the item
  function getItem(string memory _itemId)
  public
  view 
  returns (string memory id, string memory name, string memory image, string memory description, uint price, uint numberOfItems, address seller, uint timestamp) {
    id = _itemId;
    name = items[_itemId].name;
    image = items[_itemId].image;
    price = items[_itemId].price;
    description = items[_itemId].description;
    numberOfItems = items[_itemId].numberOfItems;
    seller = items[_itemId].seller;
    timestamp = items[_itemId].timestamp;
    return (id, name, image, description, price, numberOfItems, seller, timestamp);
  }

  /// @notice Add item 
  /// @dev Emits LogAddItem
  /// @param _itemId id of the item
  /// @param _name name of the item
  /// @param _image image url of the item
  /// @param _description description of the item
  /// @param _price price of the item
  /// @param _numberOfItems number of the item to sell
  /// @return true if item is created
  function addItem(string memory _itemId,string memory _name, string memory _image, string memory _description, uint _price, uint _numberOfItems)
  public
  returns(bool){
    require(_numberOfItems>0 , 'Number of items should be atleast 1');
    require(_price>0 , 'Price of items cannot be atleast 0');
    Item memory newItem;
    newItem.name = _name;
    newItem.image = _image;
    newItem.description = _description;
    newItem.price = _price;
    newItem.numberOfItems = _numberOfItems;
    newItem.seller = msg.sender;
    newItem.timestamp = now;
    items[_itemId] = newItem;
    emit LogAddItem(msg.sender, _itemId, _numberOfItems, _price);
    return true;
  }

  /// @notice Update item 
  /// @dev Emits LogUpdateItem
  /// @dev Need to be seller of the item to update
  /// @param _itemId id of the item
  /// @param _name name of the item
  /// @param _image image url of the item
  /// @param _description description of the item
  /// @param _price price of the item
  /// @param _numberOfItems number of the item to sell
  /// @return true if item is udpated
  function updateItem(string memory _itemId, string memory _name, string memory _image, string memory _description, uint _price, uint _numberOfItems)
  public
  isSeller(_itemId)
  returns(bool){
    require(_numberOfItems>0 , 'Number of items should be atleast 1');
    require(_price>0 , 'Price of items cannot be atleast 0');
    items[_itemId].name = _name;
    items[_itemId].image = _image;
    items[_itemId].description = _description;
    items[_itemId].price = _price;
    items[_itemId].numberOfItems = _numberOfItems;
    emit LogUpdateItem(msg.sender, _itemId, _numberOfItems, _price);
    return true;
  }
}