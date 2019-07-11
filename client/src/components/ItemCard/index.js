import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Card, Heading, Text} from 'rimble-ui';

const ItemCard = ({ id, name , image, price}) => <Link to={`/item/${id}`}>
    <Card>
        <Heading.h4>{name}</Heading.h4>
        <Image borderRadius={8} src={image}/>
        <Text bold>{price} ETH</Text>
    </Card></Link>

export default ItemCard;