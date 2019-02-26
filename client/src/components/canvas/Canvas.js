import React, {Component} from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket();

const style = {
  backgroundColor: 'white',
};


class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = { drawing: false, height: 700, width: 1000};
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.preX = -1;
        this.preY = -1;
        socket.emit('init', {
            user_id: "111",
            session_id:this.props.room_id,
        });
        socket.on('drawing', this.onDrawingEvent);
        socket.emit('command', 'update');
        socket.on('redraw', this.onRedrawEvent);

    }

    onRedrawEvent(data_array) {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.state.width, this.state.height);
        var i = 0;
        for (i = 0; i < data_array.length; i++) {
            console.log(data_array[i]);
            this.onDrawingEvent(data_array[i]);
        }
    }


    componentWillUnmount() {
        this.props.onRef(null)
    }
    componentDidMount() {
       window.addEventListener("resize", this.updateDimensions);
       this.props.onRef(this)
    }
    componentWillMount() {
        this.setState({height: window.innerHeight-8, width: window.innerWidth-8-44.5});
        //console.log(this.state);
    }
    updateDimensions() {
        this.setState({height: window.innerHeight-8, width: window.innerWidth-8-44.5});
        socket.emit('command', 'update');
    }

    getContext() {

        return this.refs.canvas.getContext('2d');
    }
    drawLine(x0,y0,x1,y1,color, lineWidth, emit) {
        const ctx = this.getContext();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
        if(!emit){return;}
        socket.emit('drawing', {
            x0: x0/this.state.width ,
            y0: y0/this.state.height,
            x1: x1/this.state.width ,
            y1: y1/this.state.height,
            color: color,
            lineWidth: lineWidth,
        });
    }
    onDrawingEvent(data) {
        this.drawLine(data.x0*this.state.width,
                      data.y0*this.state.height,
                      data.x1*this.state.width,
                      data.y1*this.state.height,
                      data.color,
                      data.lineWidth,)
    }
    onUndoEvent(e) {
        console.log('undo');
        socket.emit('command', 'undo');
    }
    onMouseDown(e) {
        this.setState({ drawing: true });
        const ctx = this.getContext();
        ctx.beginPath();
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
        socket.emit('command', 'new_stroke');
    }

    onMouseMove(e) {
        if (!this.state.drawing) {
            return;
        }

        this.drawLine(this.preX,this.preY, e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.props.color, this.props.lineWidth, 1)
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
                height = {this.state.height }
                width  = {this.state.width }
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            />
        );
    }
}
export default Canvas;
