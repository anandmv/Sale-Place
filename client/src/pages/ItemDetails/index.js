import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Web3  from 'web3';
import { Button, Box, Card, Flex, Loader, Image, Heading, EthAddress, Text } from 'rimble-ui';
import getInstance from '../../utils/getInstance';

const status = ["Processing" ,"Shipped", "Received", "Refunded"];

class ItemList extends Component {
  state = { item: {} , itemsPurchased:[], itemsSold:[] };

  componentDidMount = async () => {
    try {
      const {accounts, instance} = await getInstance();
      this.setState({ accounts, instance }, this.getItem);
      this.getItemPurchased();
    } catch (error) {
      alert(
        `Failed to load contract. Check console for details.`,
      );
    }
  };

  getItemPurchased = async () => {
    const itemId = this.props.match.params.id;
    const totalItemsPurcahsed= await this.state.instance.methods.getItemPurchasedSize(itemId).call();
    console.log("Total Items purcahsed,", totalItemsPurcahsed);
    const itemsPurchased = [];
    for(let index = 0; index< totalItemsPurcahsed.length; index++){
      const itemPurchasedRaw = await this.state.instance.methods.getItemPurchased(itemId, totalItemsPurcahsed[index]).call();
      itemsPurchased.push({
        itemId: itemPurchasedRaw[0],
        numberOfItemPurchased : itemPurchasedRaw[1],
        status : status[parseInt(itemPurchasedRaw[2])],
        buyer : itemPurchasedRaw[3],
        timestamp: itemPurchasedRaw[4]
      });
    }
    console.log(itemsPurchased)
    this.setState({ itemsPurchased, totalItemsPurcahsed });
  }

  getDateTime = (timeStamp)=> {
    const timeDate = new Date(parseInt(`${timeStamp}000`));
    return `${timeDate.toDateString()}, ${timeDate.toTimeString()}`
  }

  getItemSold = async ()=>{
    const itemId = this.props.match.params.id;
    const totalItemsSold = await this.state.instance.methods.getItemsSoldSize(itemId).call();
    console.log("Total Items sold,", totalItemsSold);
    const itemsSold = [];
    for(let index = 0; index< totalItemsSold; index++){
      const item = await this.state.instance.methods.getItemSold(itemId, index).call();
      itemsSold.push(item);
    }
    console.log(itemsSold)
    this.setState({ itemsSold, totalItemsSold });
  }

  getItem = async () => {
    const item = await this.state.instance.methods.getItem(this.props.match.params.id).call();
    item.id = this.props.match.params.id;
    this.setState({ item });
    if(this.isActionOwner(item.seller)){
      this.getItemSold();
    }
  };

  buyItem = async()=>{
    const {accounts, instance, item} = this.state;
    const response = await instance.methods.buyItem(item.id,1).send({ from: accounts[0] , value: item.price});
    if(response.status){
      alert(`${item.name} purcahse successfully!`)
      this.getItemPurchased();
    }
  }

  isActionOwner(address){
    return address.toString() === this.state.accounts[0].toString() 
  }

  updateStatus= async (currentStatus, buyer, index = false)=>{
    const {accounts, instance, item} = this.state;
    let response;
    if(currentStatus === "Processing"){
      response = await instance.methods.shipItem(item.id, buyer).send({ from: accounts[0] });
    }
    else if(currentStatus === "Shipped"){
      response = await instance.methods.receiveItem(item.id).send({ from: accounts[0] });
    }
    else if(currentStatus === "Received"){
      response = await instance.methods.refundItem(item.id, buyer).send({ from: accounts[0], value: item.price});
    }
    if(response.status){
      this.getItemPurchased();
      this.getItemSold();
      alert(`${item.name} status updated successfully!`)
    }
  }

  render() {
    const { item, itemsPurchased, itemsSold } = this.state;
    let { numberOfItems } = item;
    numberOfItems = parseInt(numberOfItems);
    if(Object.keys(item).length === 0){
      return <Loader size="100px"/>
    }
    const { name, price , image, seller, description} = item;

    if(seller === '0x0000000000000000000000000000000000000000'){
      return "Item dosent exist"
    }
    return <>
    <Card>
        <Heading.h4>{name}</Heading.h4>
        {this.isActionOwner(seller) && <Link to={`/item/${item.id}/edit`}>Edit Item</Link>}
        <Flex>
          <Box p={3} width={1 / 2}>
            <Image borderRadius={8} src={image} />
          </Box>
          <Box p={3} width={1 / 2}>
            <Text>{description}</Text>
            <Heading.h4>{Web3.utils.fromWei(price, 'ether')} ETH</Heading.h4>
            <Text>Seller <EthAddress address={seller} truncate/></Text>
            {numberOfItems > 0 && <Button onClick={this.buyItem}>Buy</Button>}
            {numberOfItems === 0 && <Button disabled>SoldOut</Button>}
          </Box>
        </Flex>
    </Card>

    {itemsPurchased.length > 0 && 
    <Card>
      <Heading.h4>Purcahse history</Heading.h4>
      {itemsPurchased.map((itemPurchased,index)=>
      <div key={index}>
        <hr/>
        <Heading.h6>Status: {status[itemPurchased.status]}</Heading.h6>
        <Text>Number of Items purcahsed {itemPurchased.numberOfItemPurcahsed}</Text>
        <Text>You have purchased this item on {this.getDateTime(itemPurchased.timestamp)}</Text>
        {itemPurchased.status === status[1] && this.isActionOwner(itemPurchased.pedbuyer) && <Button onClick = {()=>this.updateStatus(itemPurchased.status,'',index)}> Set as Received </Button>}
      </div>
      )}
    </Card>
    }

    {itemsSold.length > 0 && 
    <Card>
      <Heading.h4>Items Sold history</Heading.h4>
      {itemsSold.map((itemSold,index)=>
        <div key={index}>
          <hr/>
          <Heading.h6>Status: {status[itemSold.status]}</Heading.h6>
          <Text>Number of Items Sold : {itemSold.numberOfItems}</Text>
          <Text>User have purchased this item on {this.getDateTime(itemSold.timestamp)}</Text>
          <Text> Buyer <EthAddress address={itemSold.buyer} truncate/></Text>
          {this.isActionOwner(item.seller) && parseInt(itemSold.status) === 0 && <Button onClick = {()=>this.updateStatus('Processing', itemSold.buyer,index)}> Set as Shipped </Button>}
          <br/>
          {this.isActionOwner(item.seller) && parseInt(itemSold.status) < 3 && <Button onClick = {()=>this.updateStatus('Received', itemSold.buyer, index)}> Refund </Button>}
        </div>
      )}
      
    </Card>
    }
    </>
  }

}

export default ItemList;
