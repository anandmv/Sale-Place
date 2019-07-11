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
    const totalItems = await instance.methods.getItemsPurcahsed().call({ from: account });
    console.log("Total Items Purcahsed,", totalItems);
    const items = [];
    for(let index = 0; index< totalItems.length; index++){
      const item = await instance.methods.getItem(totalItems[index]).call();
      items.push({...item, id:index});
    }
    console.log(items)
    this.setState({ items });
  };

  render() {
    const { items } = this.state;
    if(items === false){
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

export default ItemPurcahsed;
