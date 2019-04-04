import React, {Component} from 'react';
import openSocket from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';
import Cookies from 'universal-cookie';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const cookies = new Cookies();
const socket;
const uploader = new SocketIOFileClient(socket);

const styleCanvas = {
  zIndex: '2',
  position:'absolute',
  left:'54px',
  top:'4px',
};

const stylePicture = {
    backgroundColor: 'white',
    zIndex: '1',
    position:'absolute',
    left:'54px',
    top:'4px',
};

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = { drawing: false, height: 700, width: 1000, modal: false};
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.onInitCanvas = this.onInitCanvas.bind(this);
        this.onEmitImg = this.onEmitImg.bind(this);
        this.onDrawImage = this.onDrawImage.bind(this);
        //this.onScrollEvent = this.onScrollEvent.bind(this);
        this.mapWindowToCanvas = this.mapWindowToCanvas.bind(this);
        this.onImageEvent = this.onImageEvent.bind(this);
        this.zoom = this.zoom.bind(this);
        this.onLoadNextImage = this.onLoadNextImage.bind(this);
        this.onUploadEvent = this.onUploadEvent.bind(this);
        this.showForm = this.showForm.bind(this);

        this.fileInput = React.createRef();
        this.offsetX = 0;
        this.offsetY = 0;
        this.pictureOffsetX = 0;
        this.pictureOffsetY = 0;
        this.scale = 1;
        this.preX = -1;
        this.preY = -1;
        this.imageWidth = -1;
        this.imageHight = -1;
        this.image = new Image();
        this.nextImage = new Image();
        this.image.onload = this.onDrawImage;
        this.nextImage.onload = this.onLoadNextImage;

        // On server, we save user and canvas id on the socket object, which
        // will disappear when connection is lost. So we need to init again
        // for reconections.
        socket = openSocket();
        socket.on('connect', this.onInitCanvas);
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
        socket.on('drawing', this.onDrawingEvent);
        socket.on('image', this.onImageEvent);
        socket.on('update', (cmd)=>{
            if(cmd === "image_ready") {
                this.onEmitImg();
            }
        });
        socket.on('redraw', this.onRedrawEvent);
        this.onEmitImg();
        socket.emit('command', 'update');
    }

    onEmitImg(){
        console.log('emit image');
        socket.emit('image',{x:this.pictureOffsetX, y: this.pictureOffsetY, w:this.state.width, h:this.state.height, l:Math.log2(this.scale)});
    }

    onEmitImg(){
        console.log('emit image');
        socket.emit('image',{x:this.pictureOffsetX, y: this.pictureOffsetY, w:this.state.width, h:this.state.height, l:Math.log2(this.scale)});
    }
    onRedrawEvent(data_array) {
        this.ctx.save();    // save the current state of our canvas (translate offset)
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.clearRect(0,0,this.state.width,this.state.height); // clear the whole canvas
        this.ctx.restore(); // restore the translate offset
        var i = 0;
        for (i = 0; i < data_array.length; i++) {
            this.onDrawingEvent(data_array[i]);
        }
        this.onDrawImage();
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       window.addEventListener("resize", this.updateDimensions);
       this.props.onRef(this);
       this.ctx = this.refs.canvas.getContext('2d');
       this.pctx = this.refs.picture.getContext('2d');
    }

    componentWillMount() {
        this.setState({height: window.innerHeight-8, width: window.innerWidth-8-50});
    }

    updateDimensions() {
        this.setState({height: window.innerHeight-8, width: window.innerWidth-8-50});
        this.ctx.translate(-this.offsetX,-this.offsetY);
        socket.emit('command', 'update');
        this.onEmitImg();
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

    onImageEvent(data) {
        console.log("image");
        this.nextImage.src = data;
        console.log([this.image.width,this.image.height]);
    }

    onLoadNextImage() {
        this.image.src = this.nextImage.src;
    } 

    onDrawImage() {
        if (this.imageHight <= 0 || this.imageWidth <= 0) {
            this.imageHight = this.image.height;
            this.imageWidth = this.image.width;
        }
        console.log("draw image");
        console.log(this.image);
        this.pctx.clearRect(0, 0, this.state.width, this.state.height);
        this.pctx.drawImage(this.image, -this.pictureOffsetX, -this.pictureOffsetY, this.imageWidth, this.imageHight);
    }

    onUndoEvent(e) {
        console.log('undo');
        socket.emit('command', 'undo');
    }

    showForm(e) {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    onUploadEvent(e) {
        e.preventDefault();
        console.log("upload");
        var file = document.getElementById("file");
        var id = uploader.upload(file);
        console.log(id);
    }

    onMouseDown(e) {

        this.setState({ active: true });
        let currentX = 0;
        let currentY = 0;
        if(e.type === "mousedown") {
            currentX = e.nativeEvent.offsetX;
            currentY = e.nativeEvent.offsetY;
        }
        else if(e.type === "touchstart"){
        //
        //Since the touch event cannot get the relative position on canvas directly
        //We should compute this coordinate by subtracting offsets of the canvas
        //
            let rect = this.refs.canvas.getBoundingClientRect();
            currentX = e.touches[0].clientX - rect.left;
            currentY = e.touches[0].clientY - rect.top;
        }
        this.preX = currentX;
        this.preY = currentY;
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

        let currentX = 0;
        let currentY = 0;

        if(e.type === "mousemove") {
            currentX = e.nativeEvent.offsetX;
            currentY = e.nativeEvent.offsetY;
        }
        else if(e.type === "touchmove") {
            let rect = this.refs.canvas.getBoundingClientRect();
            currentX = e.touches[0].clientX - rect.left;
            currentY = e.touches[0].clientY - rect.top;
        }

        if(this.props.mode){
            let dx =  this.mapWindowToCanvas(currentX, this.offsetX) - this.mapWindowToCanvas(this.preX, this.offsetX);
            let dy =  this.mapWindowToCanvas(currentY, this.offsetY) - this.mapWindowToCanvas(this.preY, this.offsetY);
            this.pictureOffsetX -= currentX - this.preX;
            this.pictureOffsetY -= currentY - this.preY;
            if(this.pictureOffsetX < 0) {
                this.pictureOffsetX = 0;
                dx = this.offsetX;
                this.offsetX = 0;
            } else {
                this.offsetX -= dx;
            }
            if(this.pictureOffsetY < 0) {
                this.pictureOffsetY = 0;
                dy = this.offsetY;
                this.offsetY = 0;
            } else {
                this.offsetY -= dy;
            }
            this.ctx.translate(dx,dy);
            socket.emit('command', 'update');

            this.onEmitImg();
        }
        else {
            console.log(this.offsetX);
            this.drawLine(this.mapWindowToCanvas(this.preX, this.offsetX),
                          this.mapWindowToCanvas(this.preY, this.offsetY),
                          this.mapWindowToCanvas(currentX, this.offsetX),
                          this.mapWindowToCanvas(currentY, this.offsetY),
                          this.props.color,
                          this.props.lineWidth,
                          1)
        }
        this.preX = currentX;
        this.preY = currentY;
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
        this.imageHight *= factor;
        this.imageWidth *= factor;
        this.pictureOffsetX /= factor;
        this.pictureOffsetY /= factor;
        // this.ctx.translate(dx, dy);
        // this.offsetX -= dx;
        // this.offsetY -= dy;
        socket.emit('command', 'update');
        this.onEmitImg();
    }
    render() {
        return (
            <div>
            <canvas
                ref="canvas"
                style={styleCanvas}
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
            <canvas
                ref="picture"
                style={stylePicture}
                height = {this.state.height }
                width  = {this.state.width }
            />

                <Modal isOpen={this.state.modal} toggle={this.showForm}>
                    <ModalHeader toggle={this.showForm}>Upload Image</ModalHeader>
                    <ModalBody>
                      <form id="myform" name="myform" onSubmit={this.onUploadEvent}>
                        <input type="file" id="file" multiple />
                        <input type="submit" value="Upload" />
                      </form>
                     </ModalBody>
                     <ModalFooter>
                        <Button color="secondary" onClick={this.showForm}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
export default Canvas;
