import React, { Component } from "react";
import { Loader, Flex, Box } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import { ItemCard } from '../../components'

class ItemPurcahsed extends Component {
  state = { items: false};

  componentDidMount = async () => {
    const { accounts, instance } = await getInstance();
    await this.getItems(accounts[0],instance);
  };

  getItems = async (account, instance) => {
    const totalItems = await instance.methods.getItemsPurchased().call({ from: account });
    console.log("Total Items Purcahsed,", totalItems);
    const items = [], itemIds = [];
    for(let index = 0; index< totalItems.length; index++){
      if(itemIds.indexOf(totalItems[index]) === -1){
        const item = await instance.methods.getItem(totalItems[index]).call();
        itemIds.push(totalItems[index]);
        items.push(item);
      }
    }
    console.log(items)
    this.setState({ items, totalItems });
  };

  render() {
    const { items } = this.state;
    if(items === false){
      return <Loader size="100px"/>
    }
    else if(items && items.length === 0){
      return "No items purcahsed yet!"
    }
    return <Flex>
      {items.map((item,index)=>
        <Box p={3} width={[1, 1/2, 1/3]} key={index}>
          <ItemCard {...item}/>
        </Box>
      )}
    </Flex>
  }

}

export default ItemPurcahsed;
