import React, {Component} from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket();

const style = {
  backgroundColor: 'white',
};

class Canvas extends Component {
    constructor(props) {

        super(props);

        console.log(this.props.room_id);
        this.state = { active: false, height: 700, width: 1000};
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.onInitCanvas = this.onInitCanvas.bind(this);
        this.preX = -1;
        this.preY = -1;
        this.onInitCanvas();
        // On server, we save user and canvas id on the socket object, which
        // will disappear when connection is lost. So we need to init again
        // for reconections.
        socket.on('connect', this.onInitCanvas);
        socket.on('drawing', this.onDrawingEvent);
        socket.emit('command', 'update');
        socket.on('redraw', this.onRedrawEvent);
        this.offsetX = 0;
        this.offsetY = 0;
    }
    onInitCanvas(){
        socket.emit('init', {
            user_id: "111",
            canvas_id: this.props.room_id,
        });
    }
    onRedrawEvent(data_array) {
        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.clearRect(0,0,this.state.width,this.state.height);
        this.ctx.restore();
        var i = 0;
        for (i = 0; i < data_array.length; i++) {
            //console.log(data_array[i]);
            this.onDrawingEvent(data_array[i]);
        }
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
        this.ctx.translate(-this.offsetX,-this.offsetY);
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
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
            color: color,
            lineWidth: lineWidth,
        });
    }

    onDrawingEvent(data) {
        this.drawLine(data.x0,
                      data.y0,
                      data.x1,
                      data.y1,
                      data.color,
                      data.lineWidth,)
    }
    onUndoEvent(e) {
        console.log('undo');
        socket.emit('command', 'undo');
    }

    onMouseDown(e) {
        console.log([this.offsetX, this.offsetY]);
        this.setState({ active: true });
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
        if(this.state.mode){

        }
        else {

            socket.emit('command', 'new_stroke');
        }

    }

    onMouseMove(e) {
        if (!this.state.active) {
            return;
        }
        if(this.props.mode){
            let dx =  e.nativeEvent.offsetX - this.preX ;
            let dy =  e.nativeEvent.offsetY - this.preY;
            //console.log([this.preX, e.nativeEvent.offsetX]);
            this.ctx.translate(dx,dy);
            this.offsetX -= dx;
            this.offsetY -= dy;
            socket.emit('command', 'update');
        }
        else {
            this.drawLine(this.preX + this.offsetX, this.preY + this.offsetY, e.nativeEvent.offsetX + this.offsetX, e.nativeEvent.offsetY+ this.offsetY, this.props.color, this.props.lineWidth, 1)
        }
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
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
