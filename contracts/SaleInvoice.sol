pragma solidity ^0.5.0;

contract SaleInvoice {
  /* Staus Enum used by ItemInvoice ,with 4 states
    Processing
    Shipped
    Received
    Refunded
  */
  enum Status { Processing ,Shipped, Received, Refunded }

  struct ItemInvoice{
    string itemId;
    uint numberOfItemsSold;
    Status status;
    uint timestamp;
    address payable buyer;
    address payable seller;
  }

  mapping (string => ItemInvoice) private itemInvoices;

  event LogBuyItem(address seller, address buyer, string invoiceId, string itemId , uint numberOfItems);
  event LogShipped(address seller, string invoiceId, string itemId);
  event LogReceived(address buyer, string invoiceId, string itemId);
  event LogRefund(address seller, string buyer, string invoiceId, uint itemId, uint amountRefunded);

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
    newItemSold.timestamp = now;
    itemsSold[_itemId].push(newItemSold);

    items[_itemId].numberOfItems = items[_itemId].numberOfItems - 1;

    itemsPurcahsed[msg.sender].push(_itemId);

    emit LogBuyItem(msg.sender, _itemId , _numberOfItems);

    return true;
  }
}