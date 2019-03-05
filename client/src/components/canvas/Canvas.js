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
        this.onCommandEvent = this.onCommandEvent.bind(this);
        this.onUploadEvent = this.onUploadEvent.bind(this);
        this.showForm = this.showForm.bind(this);
        this.preX = -1;
        this.preY = -1;
        this.fileInput = React.createRef();
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
    onCommandEvent(cmd) {
        const ctx = this.getContext();
        if (cmd === "clear") {
            ctx.clearRect(0, 0, this.state.width, this.state.height);
        }
    }
    onUndoEvent(e) {
        console.log('undo');
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.state.width, this.state.height);
        socket.emit('command', 'undo');
        socket.emit('command', 'update');
    }
    showForm(e) {
        var form = document.getElementById("myform");
        console.log("display form");
        form.style.display="block";
    }
    onUploadEvent() {
        console.log("upload");
        //document.getElementById("myform").style.display="none";
        var formData = new FormData();
        formData.append(this.fileInput.current.files[0].name, this.fileInput.current.files[0]);
        alert(
            `Selected file - ${
                this.fileInput.current.files[0].name
            }`
        );
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/", true);
        xhttp.onreadystatechange = function(err) {
            if (this.readyState === 4 && this.status === 200) {
                console.log(xhttp.responseText);
            }
            else {
                console.log(err);
            }
        };
        xhttp.send(formData);
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
            <div>
            <canvas
                ref="canvas"
                style={style}
                height = {this.state.height }
                width  = {this.state.width }
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            />

            <form id="myform" name="myform" style={{display:"none"}} onSubmit={this.onUploadEvent}>
                <input type="file" name="image" accept="image/*" ref={this.fileInput}/>
                <br />
                <button type="submit">Upload</button>
            </form>
            </div>
        );
    }
}
export default Canvas;
