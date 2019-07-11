import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Card, Heading} from 'rimble-ui';

const ItemCard = ({ id, name , image, price}) => <Link to={`/item/${id}`}>
    <Card>
        <Heading.h4>{name}</Heading.h4>
        <Image borderRadius={8} src={image} />
        <Heading.h4>{price}</Heading.h4>
    </Card></Link>

export default ItemCard;