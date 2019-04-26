import React, { Component } from 'react'
import { CirclePicker } from 'react-color';

class MyColorPicker extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      color: '#fff',
    }
  }

  handleChangeComplete = (color, event) => {
    this.setState({ color: color.hex });
    this.props.onChangeColor(this.state.color);
    this.props.updateColor(this.state.color);
  };

  render() {
    return (
        <CirclePicker
            onChangeComplete={ this.handleChangeComplete }
        />
    )
  }
}

export default MyColorPicker
