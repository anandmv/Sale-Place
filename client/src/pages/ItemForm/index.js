import React , { Component } from 'react';
import { Button, Card, Form, Heading, Loader } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import Web3  from 'web3';
import { withFirestore } from 'react-firestore';

class ItemForm extends Component {
  state = {
    item: null,
    isEdit: false,
    isLoading: true,
    name:'',
    image:'', 
    description:'', 
    price:'', 
    numberOfItems:'', 
    priceInEth:'',
    logs:[]
  };

  componentDidMount = async () => {
    const {accounts, instance} = await getInstance();
    const isEdit = !!this.props.match.params.id;
    this.setState({ accounts, instance, isEdit, isLoading: isEdit }, this.getItem);
  }

  getItem(){
    if(this.state.isEdit){
      const { firestore } = this.props;
      const itemId = this.props.match.params.id;
      firestore.doc(`items/${itemId}`).onSnapshot(snapshot => {
        const { name , description , image, priceInWei , numberOfItems, logs = []} = snapshot.data();
        const price = Web3.utils.fromWei(priceInWei, 'ether')
        this.setState({ name , description , image, price , numberOfItems, isLoading: false, logs});
      });
    }
  }

  addUpdateItem = async ()=> {
    const { name , description , image, price , numberOfItems, isEdit, accounts, instance } = this.state;
    let itemId = this.props.match.params.id;
    const priceInWei = Web3.utils.toWei(price, 'ether')
    const seller = accounts[0];      
    let status = false;
    let logs = this.state.logs;
    if(!isEdit){
      const documentRef = this.props.firestore.collection('items');
      const itemRef = await documentRef.add({
        name , image, description, priceInWei, numberOfItems, status
      })
      itemId = itemRef.id
      this.setState({itemId});
      try{
        const response = await instance.methods.addItem(itemId, name , image, description, priceInWei, numberOfItems ).send({ from: seller });
        delete response.events
        status = true
        logs.push(response)
      }
      catch(e){
        console.log(e)
      }
      await this.props.firestore.doc(`items/${itemId}`).update({status, logs, seller})
    }else{
      const documentRef = this.props.firestore.doc(`items/${itemId}`);
      try{
        const response = await instance.methods.updateItem( itemId, name , image, description, priceInWei, numberOfItems ).send({ from: seller });
        delete response.events
        status = true
        logs.push(response)
      }
      catch(e){
        console.log(e)
      }
      await documentRef.update({name , image, description, priceInWei, numberOfItems, status, logs, seller})
    }
    this.setState({itemId})
  }

  handleSubmit = async (e) => {
    this.setState({submitting:true});
    e.preventDefault();
    await this.addUpdateItem();
    this.setState({submitting:false});
    this.props.history.push(`/item/${this.state.itemId}`)
  };

  handleValueChange = e => {
    const {name , value} = e.target
    this.setState({[name]:value})
  }

  render() {
    const { isEdit, isLoading } = this.state;
    if(isLoading){
      return <Loader size="100px"/>
    }
    return  <Card>
        <Heading.h2> {isEdit ? 'Update': 'Create'} Item </Heading.h2>
        <Form onSubmit={this.handleSubmit}>
            <Form.Field label="Name" width={1}>
            <Form.Input
                type="text"
                name="name"
                required
                width={1}
                onChange={this.handleValueChange}
                value={this.state.name}
            />
            </Form.Field>
            <Form.Field label="Description" width={1}>
            <Form.Input
                type="text"
                name="description"
                width={1}
                onChange={this.handleValueChange}
                value={this.state.description}
            />
            </Form.Field>
            <Form.Field label="Image Url" width={1}>
            <Form.Input
                type="url"
                name="image"
                required
                width={1}
                onChange={this.handleValueChange}
                value={this.state.image}
            />
            </Form.Field>
            <Form.Field label="Price per Item(ETH)" width={1}>
            <Form.Input
                type="number"
                name="price"
                required
                width={1}
                onChange={this.handleValueChange}
                min="0"
                value={this.state.price}
            />
            </Form.Field>
            <Form.Field label="Number of units" width={1}>
            <Form.Input
                type="number"
                name="numberOfItems"
                required
                width={1}
                onChange={this.handleValueChange}
                min="1"
                value={this.state.numberOfItems}
            />
            </Form.Field>
            <Button type="submit" width={1} disabled={this.state.submitting}>{isEdit ? 'Update': 'Create'}</Button>
        </Form>
      </Card>
  }
}

export default withFirestore(ItemForm);