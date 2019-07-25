import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Web3  from 'web3';
import { Button, Box, Card, Flex, Loader, Image, Heading, EthAddress, Text } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import { ContentFlex } from './styledComponent';
import { withFirestore } from 'react-firestore';

const state = ["Processing" ,"Shipped", "Received", "Refunded"];

class ItemDetails extends Component {
  state = { item: {} , itemsPurchased:[], itemsSold:[] , isLoading:true};

  componentDidMount = async () => {
    try {
      const itemId = this.props.match.params.id;
      const {accounts, instance} = await getInstance();
      this.setState({ accounts, instance, itemId }, this.getItem);
      this.getItemPurchased();
    } catch (error) {
      alert(
        `Failed to load contract. Check console for details.`,
      );
    }
  };

  
  getDateTime = (timeStamp)=> {
    const timeDate = new Date(parseInt(`${timeStamp}000`));
    return `${timeDate.toDateString()}, ${timeDate.toTimeString()}`
  }

  isActionOwner(address = ''){
    return address.toString() === this.state.accounts[0].toString() 
  }

  async getItem(){
      const { firestore } = this.props;
      const itemId = this.props.match.params.id;
      firestore.doc(`items/${itemId}`).onSnapshot(snapshot => {
        const { name , description , image, priceInWei , numberOfItems, seller } = snapshot.data();
        const price = Web3.utils.fromWei(priceInWei, 'ether')
        this.setState({ name, priceInWei, price , image, seller, description, numberOfItems, isLoading:false});
      });
  }

  async buyItem(){
    const {accounts, instance, itemId, name,  priceInWei , seller } = this.state;
    const numberOfItems = 1;
    const buyer = accounts[0];
    const documentRef = this.props.firestore.collection(`invoices`);

    const invoiceRef = await documentRef.add({ itemId, numberOfItems , buyer, amountPaid: priceInWei, state: state[0], seller: seller, status:false })

    const response = await instance.methods.buyItem(itemId, invoiceRef.id,numberOfItems).send({ from: buyer , value: priceInWei});

    if(response.status){
      alert(`${name} purcahse successfully!`)
      this.getItemPurchased();
      delete response.events
      const logs = response;
      await this.props.firestore.doc(`invoices/${invoiceRef.id}`).update({status: true, logs, timestamp: new Date().toISOString()})
    }
  }

  getItemPurchased(){
    const { firestore } = this.props;
    const itemId = this.props.match.params.id;
    firestore.collection(`invoices`).where("itemId", "==",itemId).where("status","==",true).onSnapshot(snapshot => {
      const invoices = [];
      snapshot.docs.forEach((invoice)=>{
        invoices.push({...invoice.data(), id:invoice.id})
      })
      this.setState({itemsPurchased:invoices})
    })
  }

  updateStatus= async (currentStatus, invoice)=>{
    const {accounts, instance, name} = this.state;
    let response;
    if(currentStatus === 0){
      response = await instance.methods.shipItem(invoice.id).send({ from: accounts[0] });
    }
    else if(currentStatus === 1){
      response = await instance.methods.receiveItem(invoice.id).send({ from: accounts[0] });
    }
    else if(currentStatus === 2){
      response = await instance.methods.refundItem(invoice.id).send({ from: accounts[0], value: invoice.amountPaid});
    }
    if(response.status){
      const documentRef = this.props.firestore.doc(`invoices/${invoice.id}`);
      await documentRef.update({state: state[currentStatus+1]})
      this.getItemPurchased();
      alert(`${name} status updated successfully!`)
    }
  }

  render() {
    if(this.state.isLoading){
      return <Loader size="100px"/>
    }
    const { itemId, name, price , image, seller, description, numberOfItems, itemsPurchased } = this.state
    return <>
        <Card>
            <Heading.h4>{name}</Heading.h4>
            {this.isActionOwner(seller) && <Link to={`/item/${itemId}/edit`}>Edit Item</Link>}
            <Flex>
              <Box p={3} width={1 / 2}>
                <Image borderRadius={8} src={image} />
              </Box>
              <Box p={3} width={1 / 2}>
                <ContentFlex>
                  <Text>{description}</Text>
                  <Heading.h4>{price} ETH</Heading.h4>
                  <Text>Seller <EthAddress address={seller} truncate/></Text>
                  <Text>Only {numberOfItems} items left </Text>
                  {numberOfItems > 0 && <Button onClick={this.buyItem.bind(this)}>Buy</Button>}
                  {numberOfItems === 0 && <Button disabled>SoldOut</Button>}
                </ContentFlex>
              </Box>
            </Flex>
        </Card>
        {itemsPurchased.length > 0 && 
        <Card>
          <Heading.h4>Purcahse history</Heading.h4>
          {itemsPurchased.map((itemPurchased,index)=>
          <div key={index}>
            <hr/>
            <Heading.h6>Status: {itemPurchased.state}</Heading.h6>
            <Text>Number of Items purcahsed {itemPurchased.numberOfItems}</Text>
            <Text>You have purchased this item on {this.getDateTime(itemPurchased.timestamp)}</Text>
            {itemPurchased.state === state[1] && this.isActionOwner(itemPurchased.buyer) && <Button onClick = {()=>this.updateStatus(1,itemPurchased)}> Set as Received </Button>}
          </div>
          )}
        </Card>
        }

        {this.isActionOwner(seller) && itemsPurchased.length > 0 && 
          <Card>
          <Heading.h4>Items Sold history</Heading.h4>
          {itemsPurchased.map((itemSold,index)=>
            <div key={index}>
              <hr/>
              <Heading.h6>Status: {itemSold.state}</Heading.h6>
              <Text>Number of Items Sold : {itemSold.numberOfItems}</Text>
              <Text>User have purchased this item on {this.getDateTime(itemSold.timestamp)}</Text>
              <Text> Buyer <EthAddress address={itemSold.buyer} truncate/></Text>
              {itemSold.state === state[0] && <Button onClick = {()=>this.updateStatus(0, itemSold)}> Set as Shipped </Button>}
              <br/>
              { itemSold.state === state[2] && <Button onClick = {()=>this.updateStatus(2, itemSold)}> Refund </Button>}
            </div>
          )}
          
          </Card>
        }
    </>
  }

}

export default withFirestore(ItemDetails);