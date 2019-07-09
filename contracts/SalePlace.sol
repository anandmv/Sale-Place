pragma solidity ^0.5.0;

/// @title Sale Place Solidity Contract
/// @author Larry A. Gardner
/// @notice You can use this contract for selling an item with mutiple users
/// @dev All function calls are currently implemented without side effects
contract SalePlace {

  /* A variable to track the item count/sequence */
  uint itemId;

  /* Staus Enum used bu ItemSold ,with 4 states
    Processing
    Shipped
    Received
    Refunded
  */
  enum Status { Processing ,Shipped, Received, Refunded }

  struct Item {
    string name;
    string image;
    string description;
    uint price;
    uint numberOfItems;
    address payable seller;
  }

  struct ItemSold{
    uint numberOfItemsSold;
    Status status;
    address payable buyer;
  }

  mapping (uint => Item) public items;
  mapping (uint => ItemSold[] ) itemsSold;

  constructor() public{
    itemId = 0;
  }

  modifier isSeller(uint _itemId){
    _;
    require(items[_itemId].seller!= address(0) && items[_itemId].seller == msg.sender);
  }

  modifier isBuyer(uint _itemId){
    _;
    bool havePurchase = false;
    for( uint index = 0 ; index < itemId; index++){
        if(itemsSold[_itemId][index].buyer == msg.sender){
            havePurchase = true;
        }
    }
    require(havePurchase == true, "should be a buyer to process forward");
  }


  /// @notice Trade logic called when items are purchased by a user
  /// @param _itemId id of the item to fetch 
  /// @param _numberOfItems number of the items purchased
  /// @dev the function will trade amount from buyer to seller , also any left over amount will be transfered to buyer itself
  modifier trade (uint _itemId, uint _numberOfItems)  {
    _;
    uint totalAmount = _numberOfItems * items[_itemId].price;
    require(msg.value >= totalAmount , 'Amount less than required');

    uint amountToRefund = msg.value - items[_itemId].price;
    if(amountToRefund>0){
      msg.sender.transfer(amountToRefund); // transfer left over to buyer
    }
    items[_itemId].seller.transfer(items[_itemId].price); // send the money to seller
  }

  event LogAddItem(address seller, uint itemId , uint numberOfItems, uint price);
  event LogUpdateItem(address seller, uint itemId , uint numberOfItems, uint price);
  event LogBuyItem(address buyer, uint itemId , uint numberOfItems);
  event LogShipped(address seller, uint itemId);
  event LogReceived(address buyer, uint itemId);
  event LogRefund(address seller, address buyer, uint itemId, uint amountRefunded);

  /// @notice Get am item based on item id
  /// @param _itemId id of the item to fetch 
  /// @return name, image , description , price , number of Items left and seller address of the item
  function getItem(uint _itemId) 
  public 
  view returns (string memory name, string memory image, string memory description, uint price, uint numberOfItems, address seller) {
    name = items[_itemId].name;
    image = items[_itemId].image;
    price = items[_itemId].price;
    description = items[_itemId].description;
    numberOfItems = items[_itemId].numberOfItems;
    seller = items[_itemId].seller;
    return (name, image, description, price, numberOfItems, seller);
  }

  /// @notice Get item purcahsed details of the request user mapping for given item
  /// @param _itemId id of the item to fetch 
  /// @return itemId, number of Items sold , status and buyer address
  function getItemPurcahsed(uint _itemId) 
  public 
  view 
  returns (uint , uint , Status, address) {
    ItemSold memory itemSold;
    for( uint index = 0 ; index < itemId; index++){
        if(itemsSold[_itemId][index].buyer == msg.sender){
            itemSold = itemsSold[_itemId][index];
        }
    }
    return (_itemId, itemSold.numberOfItemsSold, itemSold.status, itemSold.buyer);
  }
  
  /// @notice Get item sold array index for a given item id and buyer address
  /// @param _itemId id of the item to fetch 
  /// @param _buyer address of the buyer 
  /// @return itemId, number of Items sold , status and buyer address
  function getItemSoldIndex(uint _itemId, address _buyer)
  private
  view
  returns(uint){
    uint itemIndex;
    bool isFound = false;
    for( uint index = 0 ; index < itemsSold[_itemId].length; index++){
        if(itemsSold[_itemId][index].buyer == _buyer){
            itemIndex = index;
            isFound = true;
        }
    }
    require(isFound == true, 'Item sold not found for given buyer address');
    return itemIndex;
  }

  /// @notice Add item 
  /// @dev Emits LogAddItem
  /// @param _name name of the item
  /// @param _image image url of the item
  /// @param _description description of the item
  /// @param _price price of the item
  /// @param _numberOfItems number of the item to sell
  /// @return true if item is created
  function addItem(string memory _name, string memory _image, string memory _description, uint _price, uint _numberOfItems)
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
    items[itemId] = newItem;
    emit LogAddItem(msg.sender, itemId, _numberOfItems, _price);
    itemId++;
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
  function updateItem(uint _itemId, string memory _name, string memory _image, string memory _description, uint _price, uint _numberOfItems)
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

  /// @notice Function to buy items
  /// @dev Emits LogBuyItem
  /// @dev Amount paid more than required will be refunded
  /// @param _itemId id of the item
  /// @param _numberOfItems number of the item to buy
  /// @return true if items are bought
  function buyItem(uint _itemId, uint _numberOfItems) 
  public 
  payable
  trade(_itemId,_numberOfItems)
  returns(bool){
    require(_numberOfItems>0 , 'Number of items should be atleast 1');
    require(items[_itemId].numberOfItems >= _numberOfItems, 'Out of stock');

    ItemSold memory newItemSold;
    newItemSold.status = Status.Processing;
    newItemSold.numberOfItemsSold = _numberOfItems;
    newItemSold.buyer = msg.sender;
    itemsSold[_itemId].push(newItemSold);

    items[_itemId].numberOfItems = items[_itemId].numberOfItems - 1;

    emit LogBuyItem(msg.sender, _itemId , _numberOfItems);

    return true;
  }

  /// @notice Function called by seller to set item status to shipped
  /// @dev Emits LogShipped
  /// @dev Needs to be seller of the itemto access the function
  /// @param _itemId id of the item
  /// @param _buyer address of buyer
  /// @return true if items is udpated to shipped status
  function shipItem(uint _itemId, address _buyer)
  public
  isSeller(_itemId)
  returns(bool){
    uint itemIndex = getItemSoldIndex(_itemId, _buyer);
    require(itemsSold[_itemId][itemIndex].status == Status.Processing , 'Item already shipped');
    itemsSold[_itemId][itemIndex].status = Status.Shipped;
    emit LogShipped(msg.sender, _itemId);
    return true;
  }

  /// @notice Function called by buyer to set item status to received
  /// @dev Emits LogReceived
  /// @dev Needs to be buyer of the item to access the function
  /// @param _itemId id of the item
  /// @return true if items is udpated to received status
  function receiveItem(uint _itemId)
  public
  isBuyer(_itemId)
  returns(bool){
    uint itemIndex = getItemSoldIndex(_itemId, msg.sender);
    require(itemsSold[_itemId][itemIndex].status == Status.Shipped , 'Item not yet shipped');
    itemsSold[_itemId][itemIndex].status = Status.Received;
    emit LogReceived(msg.sender, _itemId);
    return true;
  }

  /// @notice Function called by seller to refund for the item
  /// @dev Emits LogRefund
  /// @dev Needs to be seller of the item to access the function
  /// @dev Amount is transfered from seller account to buyer account , any left over paid will transfered to the seller itself
  /// @param _itemId id of the item
  /// @param _buyer address of buyer
  /// @return true if refund is successfull
  function refundItem(uint _itemId, address _buyer)
  public 
  payable
  isSeller(_itemId)
  returns(bool){
    uint itemIndex = getItemSoldIndex(_itemId, _buyer);
    uint totalAmount = itemsSold[_itemId][itemIndex].numberOfItemsSold * items[_itemId].price;
    require(msg.value >= totalAmount , 'Amount less than required');
    
    itemsSold[_itemId][itemIndex].buyer.transfer(totalAmount); // transfer to buyer

    uint amountLeftOver = msg.value - items[_itemId].price;
    if(amountLeftOver>0){
      items[_itemId].seller.transfer(amountLeftOver); // transfer any left over to seller
    }
    itemsSold[_itemId][itemIndex].status = Status.Refunded;
    emit LogRefund(msg.sender, itemsSold[_itemId][itemIndex].buyer, _itemId, totalAmount);
    return true;
  }
}