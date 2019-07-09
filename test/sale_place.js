let BN = web3.utils.BN;
const SalePlace = artifacts.require("./SalePlace.sol");
let catchRevert = require("./exceptionsHelpers.js").catchRevert

contract("SalePlace", accounts => {
  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]

  const name = "book"
  const image = "testImage"
  const description = "test description"
  const price = "1000"
  const numberOfItems = 100

  let instance

  beforeEach(async () => {
      instance = await SalePlace.new()
  })

  it("should add an item with the provided details", async() => {
      const tx = await instance.addItem(name, image, description, price, numberOfItems, {from: alice})
              
      const result = await instance.getItem.call(0)

      assert.equal(result[0], name, 'the name of the last added item does not match the expected value')
      assert.equal(result[1], image, 'the image of the last added item does not match the expected value')
      assert.equal(result[2], description, 'the description of the last added item does not match the expected value')
      assert.equal(result[3].toString(10), price, 'the price of the last added item does not match the expected value')
      assert.equal(result[4].toString(10), numberOfItems, 'the number of items of the last added item does not match the expected value')
      assert.equal(result[5], alice, 'the address adding the item should be listed as the seller')
  })

  it("should emit a LogAddItem event when an item is added", async()=> {
    let eventEmitted = false
    const tx = await instance.addItem(name, image, description, price, numberOfItems, {from: alice})
    
    if (tx.logs[0].event == "LogAddItem") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a LogAddItem event')
  })

  it("should allow someone to purchase an item and update state accordingly", async() => {
    await instance.addItem(name, image, description, price, numberOfItems, {from: alice})
    var aliceBalanceBefore = await web3.eth.getBalance(alice)
    var bobBalanceBefore = await web3.eth.getBalance(bob)

    await instance.buyItem(0, 1, {from: bob, value: (parseInt(price)+100).toString()})

    var aliceBalanceAfter = await web3.eth.getBalance(alice)
    var bobBalanceAfter = await web3.eth.getBalance(bob)

    const result = await instance.getItemSold(0,{from: bob})

    assert.equal(result[0], 1, 'number of items sold should be 1')
    assert.equal(result[0].toString(10), 0, 'the state of the item sold should be "Processing", which should be declared first in the State Enum')
    assert.equal(result[1], bob, 'the buyer address should be set bob when he purchases an item')
    assert.equal(new BN(aliceBalanceAfter).toString(), new BN(aliceBalanceBefore).add(new BN(price)).toString(), "alice's balance should be increased by the price of the item")
    assert.isBelow(Number(bobBalanceAfter), Number(new BN(bobBalanceBefore).sub(new BN(price))), "bob's balance should be reduced by more than the price of the item (including gas costs)")
  })

  it("should error when not enough value is sent when purchasing an item", async()=>{
    await instance.addItem(name, image, description, price, numberOfItems, {from: alice})
    await catchRevert(instance.buyItem(0, 1, {from: bob, value: price-1}))
  })

  it("should emit LogSold event when and item is purchased", async()=>{
    var eventEmitted = false

    await instance.addItem(name, image, description, price, numberOfItems, {from: alice})
    const tx = await instance.buyItem(0, 1, {from: bob, value: (parseInt(price)+100).toString()})

    if (tx.logs[0].event == "LogBuyItem") {
        eventEmitted = true
    }

    assert.equal(eventEmitted, true, 'adding an item should emit a LogBuyItem event')
  })
});
