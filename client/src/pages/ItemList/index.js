import React from "react";
import { Loader, Flex, Box } from 'rimble-ui';
import { ItemCard } from '../../components';
import { FirestoreCollection } from 'react-firestore';

const ItemList = ()=> <FirestoreCollection
  path="items"
  render={({ isLoading, data }) => {
    console.log(data)
    return isLoading ? (
      <Loader />
    ) : (
      <div>
        <h1>Items</h1>
        <Flex>
          {data.map((item,index)=>
            <Box p={3} width={[1, 1/2, 1/3]} key={index}>
              <ItemCard {...item}/>
            </Box>
          )}
        </Flex>
      </div>
    );
  }}
/>
  
export default ItemList;
