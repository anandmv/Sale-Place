import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Web3  from 'web3';
import { Button, Box, Card, Flex, Loader, Image, Heading, EthAddress, Text } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import { FirestoreDocument } from 'react-firestore';
import { ContentFlex } from './styledComponent'

const status = ["Processing" ,"Shipped", "Received", "Refunded"];

class ItemList extends Component {
  state = { item: {} , itemsPurchased:[], itemsSold:[] };

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

  
  getDateTime = (timeStamp)=> {
    const timeDate = new Date(parseInt(`${timeStamp}000`));
    return `${timeDate.toDateString()}, ${timeDate.toTimeString()}`
  }

  isActionOwner(address = ''){
    return address.toString() === this.state.accounts[0].toString() 
  }

  buyItem(){
    
  }

  render() {
    const itemId = this.props.match.params.id;

    return <>
    <FirestoreDocument
      path={`items/${itemId}`}
      render={({ isLoading, data }) => {
        if(isLoading){
          return <Loader size="100px"/>
        }
        console.log(data)
        const { name, priceInWei , image, seller, description, numberOfItems} = data;
        return <Card>
            <Heading.h4>{name}</Heading.h4>
            {this.isActionOwner(seller) && <Link to={`/item/${data.id}/edit`}>Edit Item</Link>}
            <Flex>
              <Box p={3} width={1 / 2}>
                <Image borderRadius={8} src={image} />
              </Box>
              <Box p={3} width={1 / 2}>
                <ContentFlex>
                  <Text>{description}</Text>
                  <Heading.h4>{Web3.utils.fromWei(priceInWei, 'ether')} ETH</Heading.h4>
                  <Text>Seller <EthAddress address={seller} truncate/></Text>
                  <Text>Only {numberOfItems} items left </Text>
                  {numberOfItems > 0 && <Button onClick={this.buyItem}>Buy</Button>}
                  {numberOfItems === 0 && <Button disabled>SoldOut</Button>}
                </ContentFlex>
              </Box>
            </Flex>
        </Card>
      }}
    />
    
    </>
  }

}

export default ItemList;
