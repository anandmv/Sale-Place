let BN = web3.utils.BN;
const SalePlace = artifacts.require("./SalePlace.sol");
let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract("SalePlace", accounts => {
  const alice = accounts[1]
  const bob = accounts[2]

  const name = "book"
  const image = "testImage"
  const description = "test description"
  const price = "1000"
  const numberOfItems = 100
  const excessAmount = (parseInt(price)+100).toString()

  const itemId = "item1"
  const invoiceId = "invoice1"

  let instance

  const addItem = () => instance.addItem(itemId, name, image, description, price, numberOfItems, {from: alice})

  beforeEach(async () => {
      instance = await SalePlace.new()
  })

  it("should add an item with the provided details", async() => {
      await addItem()
              
      const result = await instance.getItem.call(itemId)

      assert.equal(result[1], name, 'the name of the last added item does not match the expected value')
      assert.equal(result[2], image, 'the image of the last added item does not match the expected value')
      assert.equal(result[3], description, 'the description of the last added item does not match the expected value')
      assert.equal(result[4].toString(10), price, 'the price of the last added item does not match the expected value')
      assert.equal(result[5].toString(10), numberOfItems, 'the number of items of the last added item does not match the expected value')
      assert.equal(result[6], alice, 'the address adding the item should be listed as the seller')
  })

  it("should emit a LogAddItem event when an item is added", async()=> {
    let eventEmitted = false
    const tx = await addItem()
    
    if (tx.logs[0].event == "LogAddItem") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a LogAddItem event')
  })

  it("should add allow item to be udpated by seller", async() => {
      await addItem()

      const tx = await instance.updateItem(itemId, name+"test", image+"test", description+"test", price+"1", numberOfItems+10, {from: alice})

      const result = await instance.getItem.call(itemId)

      assert.equal(result[1], name+"test", 'the name of the last updated item does not match the expected value')
      assert.equal(result[2], image+"test", 'the image of the last updated item does not match the expected value')
      assert.equal(result[3], description+"test", 'the description of the last updated item does not match the expected value')
      assert.equal(result[4].toString(10), price+"1", 'the price of the last updated item does not match the expected value')
      assert.equal(result[5].toString(10), numberOfItems+10, 'the number of items of the last updated item does not match the expected value')
      assert.equal(result[6], alice, 'the address adding the item should be listed as the seller')
  })

  it("should emit a LogUpdateItem event when an item is updated", async()=> {
    let eventEmitted = false
    await addItem()

    const tx = await instance.updateItem(itemId, name, image, description, price+1, numberOfItems, {from: alice})
    
    if (tx.logs[0].event == "LogUpdateItem") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a LogUpdateItem event')
  })

  it("should revert if an address other than the seller calls updateItem()", async()=>{
    await addItem()
    await catchRevert(instance.updateItem(itemId, name, image, description, price+1, numberOfItems, {from: bob}))
  })

  it("should allow someone to purchase an item and update state accordingly", async() => {
    await addItem()
    var aliceBalanceBefore = await web3.eth.getBalance(alice)
    var bobBalanceBefore = await web3.eth.getBalance(bob)

    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})

    var aliceBalanceAfter = await web3.eth.getBalance(alice)
    var bobBalanceAfter = await web3.eth.getBalance(bob)

    const result = await instance.getItemSold(invoiceId,{from: bob})

    assert.equal(result[2], 1, 'number of items sold should be 1')
    assert.equal(result[3].toString(10), 0, 'the state of the item sold should be "Processing", which should be declared first in the State Enum')
    assert.equal(result[4], bob, 'the buyer address should be set bob when he purchases an item')
    assert.equal(Number(new BN(aliceBalanceAfter)), Number(new BN(aliceBalanceBefore).add(new BN(price))), "alice's balance should be increased by the price of the item")
    assert.isBelow(Number(bobBalanceAfter), Number(new BN(bobBalanceBefore).sub(new BN(price))), "bob's balance should be reduced by more than the price of the item (including gas costs)")
  })

  it("should error when not enough value is sent when purchasing an item", async()=>{
    await addItem()
    await catchRevert(instance.buyItem(itemId, invoiceId, 1, {from: bob, value: price-1}))
  })

  it("should emit LogSold event when and item is purchased", async()=>{
    var eventEmitted = false

    await addItem()
    const tx = await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})

    if (tx.logs[0].event == "LogBuyItem") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a LogBuyItem event')
  })

  it("should revert when someone that is not the seller tries to call shipItem()", async()=>{
    await addItem()
    await instance.buyItem(itemId, invoiceId, 1,  {from: bob, value: price})
    await catchRevert(instance.shipItem(invoiceId, {from: bob}))
  })

  it("should allow the seller to mark the item as shipped", async() => {
    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})

    const result = await instance.getItemSold(invoiceId, {from: bob})

    assert.equal(result[3].toString(10), 1, 'the state of the item should be "Shipped", which should be declared third in the State Enum')
  })

  it("should emit a LogShipped event when an item is shipped", async() => {
    var eventEmitted = false

    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    const tx = await instance.shipItem(invoiceId, {from: alice})

    if (tx.logs[0].event == "LogShipped") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a Shipped event')
  })

  it("should allow the buyer to mark the item as received", async() => {
    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})
    await instance.receiveItem(invoiceId, {from: bob})

    const result = await instance.getItemSold(invoiceId, {from: bob})

    assert.equal(result[3].toString(10), 2, 'the state of the item should be "Received", which should be declared fourth in the State Enum')
  })

  it("should revert if an address other than the buyer calls receiveItem()", async() =>{
    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})
    
    await catchRevert(instance.receiveItem(invoiceId, {from: alice}))
  })

  it("should emit a LogReceived event when an item is received", async() => {
    var eventEmitted = false

    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})
    const tx = await instance.receiveItem(invoiceId, {from: bob})
    
    if (tx.logs[0].event == "LogReceived") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a Received event')
  })

  it("should allow the seller to refund the item paid", async() => {
    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})
    await instance.receiveItem(invoiceId, {from: bob})

    var aliceBalanceBefore = await web3.eth.getBalance(alice)
    var bobBalanceBefore = await web3.eth.getBalance(bob)

    await instance.refundItem(invoiceId, {from: alice, value: price})

    var aliceBalanceAfter = await web3.eth.getBalance(alice)
    var bobBalanceAfter = await web3.eth.getBalance(bob)

    const result = await instance.getItemSold(invoiceId, {from: bob})

    assert.equal(result[3].toString(10), 3, 'the state of the item should be "Refunded", which should be declared fourth in the State Enum')

    assert.isBelow(Number(aliceBalanceAfter), Number(new BN(aliceBalanceBefore).sub(new BN(price))), "alice's balance should be decreased by the price of the item")
    assert.equal(Number(bobBalanceAfter), Number(new BN(bobBalanceBefore).add(new BN(price))), "bob's balance should be increased by more than the price of the item (including gas costs)")
  })

  it("should emit a LogRefund event when an item is refunded", async() => {
    var eventEmitted = false

    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})
    await instance.receiveItem(invoiceId, {from: bob})

    const tx = await instance.refundItem(invoiceId, {from: alice, value: price})
    
    if (tx.logs[0].event == "LogRefund") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a Refund event')
  })

  it("should revert if an address other than the seller calls refundItem()", async() =>{
    await addItem()
    await instance.buyItem(itemId, invoiceId, 1, {from: bob, value: excessAmount})
    await instance.shipItem(invoiceId, {from: alice})
    await instance.receiveItem(invoiceId, {from: bob})
    
    await catchRevert(instance.refundItem(invoiceId, {from: bob, value: price}))
  })
});
