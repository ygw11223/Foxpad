import React, {Component} from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:4000/');

const style = {
  backgroundColor: 'white',
  borderStyle: 'solid'
};


class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = { drawing: false };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);

        this.preX = -1;
        this.preY = -1;
        socket.on('drawing', this.onDrawingEvent);
    }

    getContext() {
        return this.refs.canvas.getContext('2d');
    }
    drawLine(x0,y0,x1,y1,color, emit) {
        const ctx = this.getContext();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;;
        ctx.stroke();
        if(!emit){return;}
        socket.emit('drawing', {
            x0: x0 ,
            y0: y0,
            x1: x1 ,
            y1: y1,
            color: color,
        });
    }
    onDrawingEvent(data) {
        console.log(data.x0);

        this.drawLine(data.x0,data.y0,
                    data.x1,data.y1,data.color)
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

        this.drawLine(this.preX,this.preY, e.nativeEvent.offsetX, e.nativeEvent.offsetY,  '#FF0000', 1)


        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
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
export default Canvas;
