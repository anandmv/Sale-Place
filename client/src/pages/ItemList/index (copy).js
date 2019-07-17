import React, { Component } from "react";
import { Loader, Flex, Box } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import { ItemCard } from '../../components'

class ItemList extends Component {
  state = { items: [] , totalItems: false };

  componentDidMount = async () => {
    const { instance } = await getInstance();
    await this.getItems(instance);
  };

  getItems = async (instance) => {
    const totalItems = await instance.methods.getItemsSize().call();
    console.log("Total Items ,", totalItems);
    const items = [];
    for(let index = 0; index< totalItems; index++){
      const item = await instance.methods.getItem(index).call();
      items.push(item);
    }
    console.log(items)
    this.setState({ items, totalItems});
  };

  render() {
    const { items, totalItems } = this.state;
    if(parseInt(totalItems) === 0 ){
      return "No Items to display"
    }
    if(!items || items.length === 0){
      return <Loader size="100px"/>
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

export default ItemList;