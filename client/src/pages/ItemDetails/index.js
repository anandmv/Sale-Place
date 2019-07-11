import React, { Component } from "react";
import { Button, Card, Loader, Image, Heading, EthAddress } from 'rimble-ui';
import getInstance from '../../utils/getInstance';

class ItemList extends Component {
  state = { item: {} };

  componentDidMount = async () => {
    try {
      const {accounts, instance} = await getInstance();
      this.setState({ accounts, instance }, this.getItem);
    } catch (error) {
      alert(
        `Failed to load contract. Check console for details.`,
      );
    }
  };

  getItem = async () => {
    const item = await this.state.instance.methods.getItem(this.props.match.params.id).call();
    item.id = this.props.match.params.id;
    // const itemPurcahsed = await this.state.instance.methods.getItemPurcahsed(this.props.match.params.id).call();
    this.setState({ item });
  };

  buyItem = async()=>{
    const {accounts, instance, item} = this.state;
    const response = await instance.methods.buyItem(item.id,1).send({ from: accounts[0] , value: item.price});
    if(response.status){
      alert(`${item.name} purcahse successfully!`)
    }
  }

  render() {
    const { item } = this.state;
    let { numberOfItems } = item;
    numberOfItems = parseInt(numberOfItems);
    if(Object.keys(item).length === 0){
      return <Loader size="100px"/>
    }
    const { name, price , image, seller} = item;
    return <Card>
        <Heading.h4>{name}</Heading.h4>
        <Image borderRadius={8} src={image} />
        <Heading.h4>{price}</Heading.h4>
        <EthAddress address={seller} truncate/>
        {numberOfItems > 0 && <Button onClick={this.buyItem}>Buy</Button>}
        {numberOfItems === 0 && <Button disabled>SoldOut</Button>}
    </Card>
  }

}

export default ItemList;
