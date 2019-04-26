import React, { Component } from 'react'
import Slider from 'react-rangeslider'

class MySlider extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      value: this.props.value
    }
  }

  handleOnChange = (value) => {
    this.setState({
      value: value
    })
    this.props.getValue(value);
  }

  handleChangeComplete = () => {
    this.props.onChangeWidth(this.state.value);
  };

  render() {
    return (
      <Slider
        min={1}
        max={30}
        tooltip={false}
        value={this.state.value}
        onChange={this.handleOnChange}
        onChangeComplete={this.handleChangeComplete}
      />
    )
  }
}

export default MySlider
