import React , { Component } from 'react';
import { Button, Card, Form, Heading } from 'rimble-ui';
import getInstance from '../../utils/getInstance';
import Web3  from 'web3';

class CreateItem extends Component {
  state = { submitting:false, name:'', image:'', description:'', price:'', numberOfItems:'', id:'', isEdit:false };

  componentDidMount = async () => {
    try {
      const {accounts, instance} = await getInstance();
      let isEdit = !!this.props.match.params.id;
      this.setState({ accounts, instance, isEdit }, this.getItem);
    } catch (error) {
      alert(
        `Failed to load contract. Check console for details.`,
      );
    }
  };

  getItem = async () => {
    if(this.state.isEdit){
      const item = await this.state.instance.methods.getItem(this.props.match.params.id).call();
      item.id = this.props.match.params.id;
      this.setState({ ...item });
    }
  };

  addItem = async() =>{
    const { id, name , description , image, price , numberOfItems, instance, accounts, isEdit } = this.state;
    const priceInEth = Web3.utils.toWei(price, 'ether')
    if(isEdit){
      console.log("calling updateItem, params: " , id, name , description , image, priceInEth , numberOfItems ,accounts[0])
      const response = await instance.methods.updateItem(id, name , image, description, priceInEth, numberOfItems ).send({ from: accounts[0] });
      if(response.status){
          alert(`${name} udpated!`)
      }
    }else{
      console.log("calling addItem, params: " , name , description , image, priceInEth , numberOfItems ,accounts[0])
      const response = await instance.methods.addItem(name , image, description, priceInEth, numberOfItems ).send({ from: accounts[0] });
      if(response.status){
          alert(`${name} created!`)
      }
    }
  }

  handleSubmit = async (e) => {
    this.setState({submitting:true});
    e.preventDefault();
    await this.addItem();
    this.setState({submitting:false});
  };

  handleValueChange = e => {
    const {name , value} = e.target
    this.setState({[name]:value})
  }

  render() {
    return (<Card>
        <Heading.h2> {this.state.isEdit ? 'Update': 'Create'} Item </Heading.h2>
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
            <Form.Field label="Price per Item" width={1}>
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
            <Button type="submit" width={1} disabled={this.state.submitting}>{this.state.isEdit ? 'Update': 'Create'}</Button>
        </Form>
      </Card>
    );
  }
}

export default CreateItem;