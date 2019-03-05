import React, {Component} from 'react';
import openSocket from 'socket.io-client';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
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
        this.onInitCanvas = this.onInitCanvas.bind(this);
        //this.onScrollEvent = this.onScrollEvent.bind(this);
        this.mapWindowToCanvas = this.mapWindowToCanvas.bind(this);
        this.zoom = this.zoom.bind(this);
        this.preX = -1;
        this.preY = -1;
        this.onInitCanvas();
        // On server, we save user and canvas id on the socket object, which
        // will disappear when connection is lost. So we need to init again
        // for reconections.
        socket.on('connect', this.onInitCanvas);
        this.onUploadEvent = this.onUploadEvent.bind(this);
        this.showForm = this.showForm.bind(this);
        this.fileInput = React.createRef();
        socket.on('drawing', this.onDrawingEvent);
        socket.emit('command', 'update');
        socket.on('redraw', this.onRedrawEvent);
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
    }

    onInitCanvas(){
        let id = cookies.get('cd_user_name');
        if (id == undefined) {
            // TODO : This is not guaranteed unique. Look for better id generator.
            id = Math.random().toString(36).substr(2, 9);
            cookies.set('cd_user_name', id);
            console.log(id)
        }
        socket.emit('init', {
            user_id: id,
            canvas_id: this.props.room_id,
        });
    }

    onRedrawEvent(data_array) {
        this.ctx.save();    // save the current state of our canvas (translate offset)
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.clearRect(0,0,this.state.width,this.state.height); // clear the whole canvas
        this.ctx.restore(); // restore the translate offset
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
<<<<<<< HEAD

=======
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
        xhttp.open("POST", "/image", true);
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
>>>>>>> image uploading in progress
    onMouseDown(e) {
        console.log([this.offsetX, this.offsetY]);
        this.setState({ active: true });
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
        if(!this.props.mode){
            socket.emit('command', 'new_stroke');
        }
    }
    mapWindowToCanvas(x, offset) {
        return x*this.scale+offset;
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
            this.drawLine(this.mapWindowToCanvas(this.preX, this.offsetX),
                          this.mapWindowToCanvas(this.preY, this.offsetY),
                          this.mapWindowToCanvas(e.nativeEvent.offsetX, this.offsetX),
                          this.mapWindowToCanvas(e.nativeEvent.offsetY, this.offsetY),
                          this.props.color,
                          this.props.lineWidth,
                          1)
        }
        this.preX = e.nativeEvent.offsetX;
        this.preY = e.nativeEvent.offsetY;
    }

    onMouseUp() {
        this.setState({ active: false });
    }
    zoom(direction) {
        let dx =  this.scale*this.preX;
        let dy =  this.scale*this.preY;
        let factor = Math.pow(2, direction);//set scale factor to 2
        // this.ctx.translate(-dx, -dy);
        // this.offsetX += dx;
        // this.offsetY += dy;
        this.ctx.scale(factor,factor);
        //linear algebra
        this.scale /= factor;
        this.offsetX /= factor;
        this.offsetY/= factor;
        // this.ctx.translate(dx, dy);
        // this.offsetX -= dx;
        // this.offsetY -= dy;

        //console.log([this.offsetX,this.offsetY]);
        socket.emit('command', 'update');
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
                onMouseOut={this.onMouseUp}
                onTouchStart={this.onMouseDown}
                onTouchMove={this.onMouseMove}
                onTouchEnd={this.onMouseUp}
                onTouchCancel={this.onMouseUp}
                //onWheel={this.onScrollEvent}
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
