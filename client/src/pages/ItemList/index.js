import React from "react";
import { Loader } from 'rimble-ui';
import { ItemCard } from '../../components';
import { FirestoreCollection } from 'react-firestore';

const ItemList = ()=> <FirestoreCollection
  path="items"
  render={({ isLoading, data }) => {
    if(isLoading){
      return <Loader size="100px"/>
    }
    return <div>
        <h1>Items</h1>
        <div className="masonry">
          {data.map((item,index)=>item.status === true && <ItemCard {...item} key={index}/>)}
        </div>
      </div>
  }}
/>
  
export default ItemList;
