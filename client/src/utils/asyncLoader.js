import React, { Component } from 'react'

export default function asyncLoader(componentToImport) {
  class AsyncLoaderComponent extends Component {
    constructor(props) {
      super(props)

      this.state = {
        component: null
      }
    }

    async componentDidMount() {
      const { default: component } = await componentToImport()

      this.setState({
        component: component
      })
    }

    render() {
      const C = this.state.component

      return C ?
        <C {...this.props} /> :
        null
    }
  }

  return AsyncLoaderComponent
}