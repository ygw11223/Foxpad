import React, {Component} from 'react';
//openSocket = require ('socket.io-client');
//const socket = openSocket();

const style = {
  backgroundColor: 'white',
  borderStyle: 'solid'
};
//socket.on('drawing', onDrawingEvent);

export default class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = { drawing: false };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.preX = -1;
        this.preY = -1;
    }

    getContext() {
        return this.refs.canvas.getContext('2d');
    }

    onMouseDown(e) {
        this.setState({ drawing: true });
        const ctx = this.getContext();
        ctx.beginPath();
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
    }

    onMouseMove(e) {
        if (!this.state.drawing) {
            return;
        }
        const ctx = this.getContext();
        ctx.moveTo(this.preX,this.preY);
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.props.color;
        ctx.stroke();
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;

        // socket.emit('drawing', {
        //     x0: this.preX / this.props.width,
        //     y0: this.preY / this.props.height,
        //     x1: e.nativeEvent.offsetX / this.props.width,
        //     y1: e.nativeEvent.offsetY / this.props.height,
        //     color: this.props.color
        // });
    }

    onMouseUp() {
        const ctx = this.getContext();
        ctx.closePath();
        this.setState({ drawing: false });
    }

    render() {
        return (
            <canvas
                ref="canvas"
                style={style}
                height = {800}
                width  = {1000}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            />
        );
    }
}
