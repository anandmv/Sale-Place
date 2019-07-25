import React, { Component } from "react";
import { Loader, Flex, Box } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import { ItemCard } from '../../components';
import { withFirestore } from 'react-firestore';
import Web3  from 'web3';

class ItemPurcahsed extends Component {
  state = { purcahses: false, isLoading: true};

  componentDidMount = async () => {
    const { accounts, instance } = await getInstance();
    this.setState({accounts, instance}, this.getItems);
  };

  getItems(){
    const { firestore } = this.props;
    const { accounts } = this.state;
    firestore.collection(`invoices`).where("seller", "==",accounts[0]).onSnapshot(snapshot => {
      const invoices = [];
      snapshot.docs.forEach((invoice)=>{
        const invoiceItem = {...invoice.data(), id:invoice.id, item:false};
        invoices.push(invoiceItem)
        this.getItem(invoiceItem)
      })
      this.setState({purcahses:invoices, isLoading:false})
    })
  }

  async getItem(invoice){
    const { firestore } = this.props;
    firestore.doc(`items/${invoice.itemId}`).onSnapshot(snapshot => {
      const item = snapshot.data();
      item.price = Web3.utils.fromWei(item.priceInWei, 'ether')
      const purcahses = this.state.purcahses
      item.id = invoice.itemId
      purcahses.map((purcahsesItem)=>{
        if(purcahsesItem.id === invoice.id){
          purcahsesItem.item = item
        }
        return purcahsesItem;
      })
      this.setState({purcahses})
    });
}

  render() {
    const { purcahses, isLoading } = this.state;
    if(isLoading){
      return <Loader size="100px"/>
    }
    else if(purcahses && purcahses.length === 0){
      return "No items purcahsed yet!"
    }
    return <Flex>
      {purcahses.map((purcahseItem,index)=>
        <Box p={3} width={[1, 1/2, 1/3]} key={index}>
          {purcahseItem.item!==false && <ItemCard {...purcahseItem.item}/>}
          {purcahseItem.item===false && <Loader/>}
        </Box>
      )}
    </Flex>
  }

}

export default withFirestore(ItemPurcahsed);
