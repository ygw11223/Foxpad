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
            colors={
                ["#ff0000", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#000000", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b"]
            }
        />
    )
  }
}

export default MyColorPicker
