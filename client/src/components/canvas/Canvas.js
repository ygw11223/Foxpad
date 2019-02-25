import React, {Component} from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket();

const style = {
  backgroundColor: 'white',
};


class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = { active: false, height: 700, width: 1000};
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.onCommandEvent = this.onCommandEvent.bind(this);

        this.preX = -1;
        this.preY = -1;
        socket.emit('init', {
            user_id: "111",
            session_id:this.props.room_id,
        });
        socket.on('drawing', this.onDrawingEvent);
        socket.emit('command', 'update');
        socket.on('command', this.onCommandEvent);

    }
    componentWillUnmount() {
        this.props.onRef(null)
    }
    componentDidMount() {
       window.addEventListener("resize", this.updateDimensions);
       this.props.onRef(this);
       this.ctx = this.refs.canvas.getContext('2d');
    }
    componentWillMount() {
        this.setState({height: window.innerHeight-8, width: window.innerWidth-8-50});
    }
    updateDimensions() {
        this.setState({height: window.innerHeight-8, width: window.innerWidth-8-50});
        socket.emit('command', 'update');
    }


    drawLine(x0,y0,x1,y1,color, lineWidth, emit) {

        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
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
    onCommandEvent(cmd) {

        if (cmd === "clear") {
            this.ctx.clearRect(0, 0, this.state.width, this.state.height);
        }
    }
    onUndoEvent(e) {
        console.log('undo');
        this.ctx.clearRect(0, 0, this.state.width, this.state.height);
        socket.emit('command', 'undo');
        socket.emit('command', 'update');
    }
    onMouseDown(e) {
        this.setState({ active: true });
        if(this.state.mode){

        }
        else {
            this.preX = e.nativeEvent.offsetX;
            this.preY = e.nativeEvent.offsetY;
            socket.emit('command', 'new_stroke');
        }
    }

    onMouseMove(e) {
        if (!this.state.active) {
            return;
        }
        if(this.props.mode){

        }
        else {
            this.drawLine(this.preX,this.preY, e.nativeEvent.offsetX, e.nativeEvent.offsetY, this.props.color, this.props.lineWidth, 1)
            this.preX = e.nativeEvent.offsetX;
            this.preY = e.nativeEvent.offsetY;
        }
    }

    onMouseUp() {
        this.setState({ active: false });
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
