import React, { Component } from "react";
import { Loader, Image, Card, Heading, EthAddress } from 'rimble-ui';
import getInstance from '../../utils/getInstance';

class ItemList extends Component {
  state = { item: {} };

  componentDidMount = async () => {
    try {
    console.log("component did mount called1")
      const {instance} = await getInstance();
      console.log("component did mount called1.2")
      this.getItem(instance);
    } catch (error) {
      alert(
        `Failed to load contract. Check console for details.`,
      );
    }
  };

  getItem = async (instance) => {
    console.log("component did mount called2")
    const item = await instance.methods.getItem(this.props.match.params.id).call();

    console.log("component did mount called3")
    this.setState({ item });
  };

  render() {
    const { item } = this.state;
    if(Object.keys(item).length === 0){
      return <Loader size="100px"/>
    }
    const { name, price , image, seller} = item;
    return <Card>
        <Heading.h4>{name}</Heading.h4>
        <Image borderRadius={8} src={image} />
        <Heading.h4>{price}</Heading.h4>
        <EthAddress address={seller} truncate/>
    </Card>
  }

}

export default ItemList;
