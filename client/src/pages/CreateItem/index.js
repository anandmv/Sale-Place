import React , { Component } from 'react';
import { Button, Card, Form, Heading } from 'rimble-ui';
import getInstance from '../../utils/getInstance';

class CreateItem extends Component {
  state = { submitting:false };

  componentDidMount = async () => {
    try {
      const {accounts, instance} = await getInstance();
      this.setState({ accounts, instance });
    } catch (error) {
      alert(
        `Failed to load contract. Check console for details.`,
      );
    }
  };

  addItem = async() =>{
    const { name , description , image, price , numberOfItems, instance, accounts } = this.state;
    console.log("calling addItem, params: " , name , description , image, price , numberOfItems ,accounts[0])
    const response = await instance.methods.addItem(name , image, description, price, numberOfItems ).send({ from: accounts[0] });
    if(response.status){
        alert(`${name} created!`)
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
        <Heading.h2> Create Item </Heading.h2>
        <Form onSubmit={this.handleSubmit}>
            <Form.Field label="Name" width={1}>
            <Form.Input
                type="text"
                name="name"
                required
                width={1}
                onChange={this.handleValueChange}
            />
            </Form.Field>
            <Form.Field label="Description" width={1}>
            <Form.Input
                type="text"
                name="description"
                width={1}
                onChange={this.handleValueChange}
            />
            </Form.Field>
            <Form.Field label="Image Url" width={1}>
            <Form.Input
                type="url"
                name="image"
                required
                width={1}
                onChange={this.handleValueChange}
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
            />
            </Form.Field>
            <Button type="submit" width={1} disabled={this.state.submitting}>Create</Button>
        </Form>
      </Card>
    );
  }
}

export default CreateItem;