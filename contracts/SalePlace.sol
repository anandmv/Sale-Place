pragma solidity ^0.5.0;

contract SalePlace {

  address payable owner;

  uint itemId;
  enum Status { Processing ,Shipped, Received, Refunded }

  struct Item {
    string name;
    string image;
    uint price;
    uint numberOfItems;
    address payable seller;
  }

  struct ItemSold{
    uint numberOfItemsSold;
    Status status;
    address payable buyer;
  }

  mapping (uint => Item) items;
  mapping (uint => ItemSold) itemsSold;

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
    require(itemsSold[_itemId].buyer!= address(0) && itemsSold[_itemId].buyer == msg.sender);
  }

  modifier trade (uint _itemId, uint _numberOfItems)  {
    _;
    uint totalAmount = _numberOfItems * items[_itemId].price;
    require(msg.value >= totalAmount , 'Amount less than required');

    uint amountToRefund = msg.value - items[_itemId].price;
    if(amountToRefund>0){
      itemsSold[_itemId].buyer.transfer(amountToRefund); // transfer left over to buyer
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
  view returns (string memory name, string memory image, uint price, uint numberOfItems, address seller) {
    name = items[_itemId].name;
    image = items[_itemId].image;
    price = items[_itemId].price;
    numberOfItems = items[_itemId].numberOfItems;
    seller = items[_itemId].seller;
    return (name, image, price, numberOfItems, seller);
  }

  function addItem(string memory _name, string memory _image, uint _price, uint _numberOfItems)
  public
  returns(bool){
    require(_numberOfItems>0 , 'Number of items should be atleast 1');
    require(_price>0 , 'Price of items cannot be atleast 0');
    Item memory newItem;
    newItem.name = _name;
    newItem.image = _image;
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

    itemsSold[_itemId] = newItemSold;

    emit LogBuyItem(msg.sender, _itemId , _numberOfItems);

    return true;
  }

  function shipItem(uint _itemId)
  public
  isSeller(_itemId)
  returns(bool){
    require(itemsSold[_itemId].status == Status.Processing , 'Item already shipped');
    itemsSold[_itemId].status = Status.Shipped;
    emit LogItemShipped(msg.sender, _itemId);
    return true;
  }

  function receiveItem(uint _itemId)
  public
  isBuyer(_itemId)
  returns(bool){
    require(itemsSold[_itemId].status == Status.Shipped , 'Item not yet shipped');
    itemsSold[_itemId].status = Status.Received;
    emit LogItemReceived(msg.sender, _itemId);
    return true;
  }

  function refundItem(uint _itemId)
  public 
  payable
  isSeller(_itemId)
  returns(bool){
    uint totalAmount = itemsSold[_itemId].numberOfItemsSold * items[_itemId].price;
    require(msg.value >= totalAmount , 'Amount less than required');

    itemsSold[_itemId].buyer.transfer(totalAmount); // transfer to buyer

    uint amountLeftOver = msg.value - items[_itemId].price;
    if(amountLeftOver>0){
      items[_itemId].seller.transfer(amountLeftOver); // transfer any left over to seller
    }
    emit LogItemRefund(msg.sender, itemsSold[_itemId].buyer, _itemId, totalAmount);
    return true;
  }
}
