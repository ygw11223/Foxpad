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
  };

  render() {
    return (
        <CirclePicker
            onChangeComplete={ this.handleChangeComplete }
            width="210px"
            colors={
                ["#EC1D63", "#664897", "#2296F3", "#02BED0", "#009C8A", "#FFEB36", "#FE9700", "#765743", "#84C83E", "#000000"]
            }
        />
    )
  }
}

export default MyColorPicker
