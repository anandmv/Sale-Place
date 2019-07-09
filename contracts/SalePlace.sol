pragma solidity ^0.5.0;

contract SalePlace {

  address payable owner;

  uint itemId;
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
    owner = msg.sender;
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
  event LogBuyItem(address buyer, uint itemId , uint numberOfItems);
  event LogItemShipped(address seller, uint itemId);
  event LogItemReceived(address buyer, uint itemId);
  event LogItemRefund(address seller, address buyer, uint itemId, uint amountRefunded);

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

  function getItemSold(uint _itemId) 
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
  
  function getItemSoldIndex(uint _itemId, address _buyer)
  private
  view
  returns(uint){
    uint itemIndex;
    for( uint index = 0 ; index < itemId; index++){
        if(itemsSold[_itemId][index].buyer == _buyer){
            itemIndex = index;
        }
    }
    return itemIndex;
  }

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

  function buyItem(uint _itemId, uint _numberOfItems) 
  public 
  payable
  trade(_itemId,_numberOfItems)
  returns(bool){
    require(_numberOfItems>0 , 'Number of items should be atleast 1');

    ItemSold memory newItemSold;
    newItemSold.status = Status.Processing;
    newItemSold.numberOfItemsSold = _numberOfItems;
    newItemSold.buyer = msg.sender;
    uint newItemsSoldIndex = itemsSold[_itemId].length+1;
    itemsSold[_itemId][newItemsSoldIndex] = newItemSold;

    emit LogBuyItem(msg.sender, _itemId , _numberOfItems);

    return true;
  }

  function shipItem(uint _itemId, address _buyer)
  public
  isSeller(_itemId)
  returns(bool){
    uint itemIndex = getItemSoldIndex(_itemId, _buyer);
    require(itemsSold[_itemId][itemIndex].status == Status.Processing , 'Item already shipped');
    itemsSold[_itemId][itemIndex].status = Status.Shipped;
    emit LogItemShipped(msg.sender, _itemId);
    return true;
  }

  function receiveItem(uint _itemId)
  public
  isBuyer(_itemId)
  returns(bool){
    uint itemIndex = getItemSoldIndex(_itemId, msg.sender);
    require(itemsSold[_itemId][itemIndex].status == Status.Shipped , 'Item not yet shipped');
    itemsSold[_itemId][itemIndex].status = Status.Received;
    emit LogItemReceived(msg.sender, _itemId);
    return true;
  }

  function refundItem(uint _itemId)
  public 
  payable
  isSeller(_itemId)
  returns(bool){
    uint itemIndex = getItemSoldIndex(_itemId, msg.sender);
    uint totalAmount = itemsSold[_itemId][itemIndex].numberOfItemsSold * items[_itemId].price;
    require(msg.value >= totalAmount , 'Amount less than required');

    itemsSold[_itemId][itemIndex].buyer.transfer(totalAmount); // transfer to buyer

    uint amountLeftOver = msg.value - items[_itemId].price;
    if(amountLeftOver>0){
      items[_itemId].seller.transfer(amountLeftOver); // transfer any left over to seller
    }
    emit LogItemRefund(msg.sender, itemsSold[_itemId][itemIndex].buyer, _itemId, totalAmount);
    return true;
  }
}