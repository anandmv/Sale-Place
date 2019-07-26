import React from 'react';
import Web3  from 'web3';
import { Box, Card, Heading} from 'rimble-ui';
import { Link, Image } from './styledComponent'

const ItemCard = ({ id, name , image, priceInWei}) => <Link to={`/item/${id}`}>
    <Card mx={'auto'} my={5} p={0}>
        <Image borderRadius={8} src={image} width={1} alt={name}/>
        <Box px={4} py={3}>
            <Heading.h4>{name}</Heading.h4>
            <Heading.h5 bold>{Web3.utils.fromWei(priceInWei, 'ether')} ETH</Heading.h5>
        </Box>
    </Card></Link>

export default ItemCard;