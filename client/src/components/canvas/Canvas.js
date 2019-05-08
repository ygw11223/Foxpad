import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import Modal from '../layout/ImageForm.js'


const cookies = new Cookies();

const styleMouse = {
    zIndex: '3',
    position:'absolute',
    left:'0px',
    top:'0px',
    touchAction: 'none',
};

const styleCanvas = {
    zIndex: 'auto',
    position:'absolute',
    left:'0px',
    top:'0px',
};

const stylePicture = {
    backgroundColor: 'white',
    zIndex: '-1',
    position:'absolute',
    left:'0px',
    top:'0px',
};

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = { drawing: false, height: 0, width: 0, modal: false};
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.onEmitImg = this.onEmitImg.bind(this);
        this.onDrawImage = this.onDrawImage.bind(this);
        this.onScrollEvent = this.onScrollEvent.bind(this);
        this.mapWindowToCanvas = this.mapWindowToCanvas.bind(this);
        this.onImageEvent = this.onImageEvent.bind(this);
        this.zoom = this.zoom.bind(this);
        this.onLoadNextImage = this.onLoadNextImage.bind(this);
        this.showForm = this.showForm.bind(this);
        this.solveOffSet = this.solveOffSet.bind(this);
        this.updateMouseLocation = this.updateMouseLocation.bind(this);
        this.initCanvas = this.initCanvas.bind(this);
        this.onMouseSideMove = this.onMouseSideMove.bind(this);
        this.initializeScale = this.initializeScale.bind(this);
        this.followCanvas = this.followCanvas.bind(this);

        this.fileInput = React.createRef();
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.preX = 50;
        this.preY = 50;
        this.imageWidth = -1;
        this.imageHight = -1;
        this.canvas_width = 1920;
        this.canvas_hight = 1080;
        this.imageScale = 0;
        this.reconnect = false;
        this.image = new Image();
        this.image.onload = this.onDrawImage;
        // Buffer for next level of resolution of image. Needed for smooth
        // zooming
        this.nextImage = new Image();
        this.nextImage.onload = this.onLoadNextImage;
        this.move_active = true;
        this.initialScale = 1;
    }

    initializeScale() {
        let widthScale =  Math.log(this.state.width / this.canvas_width)/Math.log(1.1);
        let hightScale = Math.log(this.state.height / this.canvas_hight)/Math.log(1.1);
        this.initialScale = widthScale > hightScale ? widthScale : hightScale;
        if(this.initialScale > 0) {
            this.initialScale = Math.pow(1.1, this.initialScale);
            this.scale = 1/this.initialScale;
            this.offsetX = this.offsetX/this.initialScale;
            this.offsetY = this.offsetY/this.initialScale;
            this.imageHight *= this.initialScale;
            this.imageWidth *= this.initialScale;
            this.ctx.scale(this.initialScale,this.initialScale);
            this.mctx.scale(this.initialScale,this.initialScale);
            this.initialScale = this.scale;
        } else {
            this.initialScale = 1;
        }
    }

    initCanvas() {
        if (this.reconnect) return;
        else this.reconnect = true;
        this.scale = 1;
        this.initialScale = 1;
        this.imageScale = 0;
        this.imageHight = -1;
        this.imageWidth = -1;
        this.offsetY = -this.state.height/2;
        this.offsetX = -this.state.width/2;
        this.preX = 50;
        this.preY = 50;
        this.ctx.setTransform(this.scale,0,0,this.scale,-this.offsetX,-this.offsetY);
        this.mctx.setTransform(this.scale,0,0,this.scale,-this.offsetX,-this.offsetY);
        this.initializeScale();
        this.props.socket.emit('viewport_position', {
            x: this.mapWindowToCanvas(0, this.offsetX),
            y: this.mapWindowToCanvas(0, this.offsetY),
            w: this.mapWindowToCanvas(this.state.width, this.offsetX) - this.mapWindowToCanvas(0, this.offsetX),
            h: this.mapWindowToCanvas(this.state.height, this.offsetY) - this.mapWindowToCanvas(0, this.offsetY),
        });
    }

    followCanvas(x, y, w, h) {
        console.log(x, y, w, h);
        this.imageHight *= this.scale;
        this.imageWidth *= this.scale;
        this.scale = 1;
        this.initialScale = 1;
        this.imageScale = 0;
        this.offsetY = -this.state.height/2;
        this.offsetX = -this.state.width/2;
        this.ctx.setTransform(this.scale,0,0,this.scale,-this.offsetX,-this.offsetY);
        this.mctx.setTransform(this.scale,0,0,this.scale,-this.offsetX,-this.offsetY);
        this.initializeScale();
        let zoom_factor = 0;
        let widthScale = Math.log(this.state.width / w)/Math.log(1.1);
        let hightScale = Math.log(this.state.height / h)/Math.log(1.1);
        zoom_factor = widthScale > hightScale ? widthScale : hightScale;
        if(zoom_factor > 0){
            zoom_factor = Math.pow(1.1, zoom_factor);
            this.scale      /= zoom_factor;
            this.offsetX     = this.offsetX/zoom_factor;
            this.offsetY     = this.offsetY/zoom_factor;
            this.imageHight *= zoom_factor;
            this.imageWidth *= zoom_factor;
            this.ctx.scale(zoom_factor,zoom_factor);
            this.mctx.scale(zoom_factor,zoom_factor);
        }
        let dx = this.mapWindowToCanvas(0, this.offsetX) - x;
        let dy = this.mapWindowToCanvas(0, this.offsetY) - y;

        if(this.mapWindowToCanvas(0, this.offsetX - dx) < -this.canvas_width/2) {
            dx = this.offsetX - this.solveOffSet(0, -this.canvas_width/2);
        } else if (this.mapWindowToCanvas(this.state.width, this.offsetX - dx) > this.canvas_width/2) {
            dx = this.offsetX - this.solveOffSet(this.state.width, this.canvas_width/2 );
        }
        if(this.mapWindowToCanvas(0, this.offsetY - dy) < -this.canvas_hight/2) {
            dy = this.offsetY - this.solveOffSet(0, -this.canvas_hight/2);
        } else if (this.mapWindowToCanvas(this.state.height, this.offsetY - dy) > this.canvas_hight/2) {
            dy = this.offsetY - this.solveOffSet(this.state.height, this.canvas_hight/2);
        }
        if(dx === 0 && dy === 0)
            return;
        this.offsetX -= dx;
        this.offsetY -= dy;
        this.ctx.translate(dx,dy);
        this.mctx.translate(dx,dy);
        this.props.socket.emit('command', 'update');
        this.props.socket.emit('viewport_position', {
            x: this.mapWindowToCanvas(0, this.offsetX),
            y: this.mapWindowToCanvas(0, this.offsetY),
            w: this.mapWindowToCanvas(this.state.width, this.offsetX) - this.mapWindowToCanvas(0, this.offsetX),
            h: this.mapWindowToCanvas(this.state.height, this.offsetY) - this.mapWindowToCanvas(0, this.offsetY),
        });

    }

    onEmitImg() {
        this.props.socket.emit('image',{w:this.state.width, h:this.state.height, l:this.imageScale});
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
        this.ctx.beginPath();
        this.ctx.rect(-960,-540,1920,1080);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       window.addEventListener("resize", this.updateDimensions);
       this.props.onRef(this);
       this.ctx = this.refs.canvas.getContext('2d');
       this.pctx = this.refs.picture.getContext('2d');
       this.mctx = this.refs.mouse.getContext('2d');
       this.offsetY = -this.state.height/2;
       this.offsetX = -this.state.width/2;
       this.ctx.translate(-this.offsetX, -this.offsetY);
       this.mctx.translate(-this.offsetX, -this.offsetY);
       setInterval(this.onMouseSideMove, 50);
       this.props.socket.emit('viewport_position', {
           x: this.mapWindowToCanvas(0, this.offsetX),
           y: this.mapWindowToCanvas(0, this.offsetY),
           w: this.mapWindowToCanvas(this.state.width, this.offsetX) - this.mapWindowToCanvas(0, this.offsetX),
           h: this.mapWindowToCanvas(this.state.height, this.offsetY) - this.mapWindowToCanvas(0, this.offsetY),
       });
       let id = "mouse-listener"
       document.getElementById(id).addEventListener('touchstart',  this.onMouseDown, { passive: false });
       document.getElementById(id).addEventListener('touchmove',   this.onMouseMove, { passive: false });
       document.getElementById(id).addEventListener('touchend',    this.onMouseUp,   { passive: false });
       document.getElementById(id).addEventListener('touchcancel', this.onMouseUp,   { passive: false });
    }

    componentWillMount() {
        this.setState({height: window.innerHeight, width: window.innerWidth});

    }

    updateDimensions() {
        // when change canvas size, reset scale and offsets
        this.setState({height: window.innerHeight, width: window.innerWidth});
        this.imageHight *= this.scale;
        this.imageWidth *= this.scale;
        this.scale = this.initialScale;
        this.offsetY = -this.state.height/2;
        this.offsetX = -this.state.width/2;
        this.ctx.translate(-this.offsetX, -this.offsetY);
        this.mctx.translate(-this.offsetX, -this.offsetY);
        this.initializeScale();
        this.props.socket.emit('command', 'update');
    }

    updateMouseLocation(mouseList) {
        this.mctx.save();    // save the current state of our canvas (translate offset)
        this.mctx.setTransform(1,0,0,1,0,0);
        this.mctx.clearRect(0,0,this.state.width,this.state.height); // clear the whole canvas
        this.mctx.restore(); // restore the translate offset
        let time = new Date().getTime();

        for(var i in mouseList) {
            if(i == this.props.name || time - mouseList[i]['timestamp'] > 3000)
                continue;

            this.mctx.beginPath();
            this.mctx.arc(mouseList[i]['pos_x_mouse'],
                          mouseList[i]['pos_y_mouse'],
                           mouseList[i]['pen_width'],
                          0, 2 * Math.PI);
            this.mctx.fillStyle = mouseList[i]['color'];
            this.mctx.fill();
            this.mctx.closePath();
        }
    }

    drawLine(x0,y0,x1,y1,color, lineWidth, isEraser, emit) {
        this.ctx.beginPath();
        if (isEraser) {
            this.ctx.globalCompositeOperation="destination-out";
        }
        else {
            this.ctx.globalCompositeOperation="source-over";
        }
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        if(!emit){return;}
        this.props.socket.emit('drawing', {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
            color: color,
            lineWidth: lineWidth,
            isEraser: this.props.eraser,
        });
    }

    onDrawingEvent(data) {
        this.drawLine(data.x0,
                      data.y0,
                      data.x1,
                      data.y1,
                      data.color,
                      data.lineWidth,
                      data.isEraser)
    }

    onImageEvent(data) {
        if (data === 'NONE') {
            this.nextImage.src = null;
            this.image.src = null;
        } else {
            if (this.imageHight <= 0 || this.imageWidth <= 0) {
                this.imageHight = data.h/this.scale;
                this.imageWidth = data.w/this.scale;
            }
            this.nextImage.src = data.url;
        }
    }

    onLoadNextImage() {
        this.image.src = this.nextImage.src;
        this.imageScale += 1;
        this.onEmitImg();
    }

    onDrawImage() {
        console.log('drawImg', this.imageWidth, this.imageHight);
        this.pctx.clearRect(0, 0, this.state.width, this.state.height);
        this.props.minimapClearImage();
        if (this.image.src === null || this.imageHight <= 0 || this.imageWidth <= 0) return;
        this.pctx.drawImage(this.image, -this.offsetX/this.scale - this.imageWidth/2, -this.offsetY/this.scale - this.imageHight/2  , this.imageWidth, this.imageHight);
        this.props.minimapImage(this.image, this.imageWidth*this.scale, this.imageHight*this.scale);
    }

    onUndoEvent(e) {
        this.props.socket.emit('command', 'undo');
    }

    showForm(e) {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
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
            this.props.socket.emit('command', 'new_stroke');
        }
    }

    mapWindowToCanvas(x, offset) {
        return x*this.scale+offset;
    }

    solveOffSet(x,y) {
        return y - x*this.scale;
    }

    onMouseSideMove() {
        if(!this.state.active && this.move_active) {
            var dx =  this.mapWindowToCanvas(this.state.width*0.02, this.offsetX)
                    - this.mapWindowToCanvas(0, this.offsetX);
            var dy =  this.mapWindowToCanvas(this.state.height*0.02, this.offsetY)
                    - this.mapWindowToCanvas(0, this.offsetY);
            //hardcode the boundary, 40px
            if (this.preX > 40 && this.preX < this.state.width - 40)
                dx = 0;
            else if(this.preX > this.state.width - 40) {
                dx = -dx;
            }
            if (this.preY > 40 && this.preY < this.state.height - 40)
                dy = 0;
            else if(this.preY > this.state.height - 40) {
                dy = -dy;
            }
            if(this.mapWindowToCanvas(0, this.offsetX - dx) < -this.canvas_width/2) {
                dx = this.offsetX - this.solveOffSet(0, -this.canvas_width/2);
            } else if (this.mapWindowToCanvas(this.state.width, this.offsetX - dx) > this.canvas_width/2) {
                dx = this.offsetX - this.solveOffSet(this.state.width, this.canvas_width/2 );
            }
            if(this.mapWindowToCanvas(0, this.offsetY - dy) < -this.canvas_hight/2) {
                dy = this.offsetY - this.solveOffSet(0, -this.canvas_hight/2);
            } else if (this.mapWindowToCanvas(this.state.height, this.offsetY - dy) > this.canvas_hight/2) {
                dy = this.offsetY - this.solveOffSet(this.state.height, this.canvas_hight/2);
            }
            // Position not changed
            if(dx === 0 && dy === 0) {
                document.getElementById('mainCanvas').style.cursor = 'default';
                return;
            }

            document.getElementById('mainCanvas').style.cursor = 'move';
            this.offsetX -= dx;
            this.offsetY -= dy;
            this.ctx.translate(dx,dy);
            this.mctx.translate(dx,dy);
            this.props.socket.emit('command', 'update');
            this.props.socket.emit('viewport_position', {
                x: this.mapWindowToCanvas(0, this.offsetX),
                y: this.mapWindowToCanvas(0, this.offsetY),
                w: this.mapWindowToCanvas(this.state.width, this.offsetX) - this.mapWindowToCanvas(0, this.offsetX),
                h: this.mapWindowToCanvas(this.state.height, this.offsetY) - this.mapWindowToCanvas(0, this.offsetY),
            })
        }
    }

    onMouseMove(e) {
        e.preventDefault();
        let currentX = 0;
        let currentY = 0;
        this.move_active = true;
        if(e.type === "mousemove") {
            currentX = e.nativeEvent.offsetX;
            currentY = e.nativeEvent.offsetY;
            this.props.socket.emit("mouse_position",
                                   {x: this.mapWindowToCanvas(currentX, this.offsetX),
                                    y: this.mapWindowToCanvas(currentY, this.offsetY),
                                    w: this.props.lineWidth * this.scale / 2 });
        }
        else if(e.type === "touchmove") {
            let rect = this.refs.canvas.getBoundingClientRect();
            currentX = e.touches[0].clientX - rect.left;
            currentY = e.touches[0].clientY - rect.top;
        }

        if(this.props.mode && this.state.active){
            let dx =  this.mapWindowToCanvas(currentX , this.offsetX)
                    - this.mapWindowToCanvas(this.preX, this.offsetX);
            let dy =  this.mapWindowToCanvas(currentY , this.offsetY)
                    - this.mapWindowToCanvas(this.preY, this.offsetY);

            if(this.mapWindowToCanvas(0, this.offsetX - dx) < -this.canvas_width/2) {
                dx = this.offsetX - this.solveOffSet(0, -this.canvas_width/2);
            } else if (this.mapWindowToCanvas(this.state.width, this.offsetX - dx) > this.canvas_width/2) {
                dx = this.offsetX - this.solveOffSet(this.state.width, this.canvas_width/2 );
            }
            if(this.mapWindowToCanvas(0, this.offsetY - dy) < -this.canvas_hight/2) {
                dy = this.offsetY - this.solveOffSet(0, -this.canvas_hight/2);
            } else if (this.mapWindowToCanvas(this.state.height, this.offsetY - dy) > this.canvas_hight/2) {
                dy = this.offsetY - this.solveOffSet(this.state.height, this.canvas_hight/2);
            }
            if(dx === 0 && dy === 0)
                return;
            this.offsetX -= dx;
            this.offsetY -= dy;
            this.ctx.translate(dx,dy);
            this.mctx.translate(dx,dy);
            this.props.socket.emit('command', 'update');
            this.props.socket.emit('viewport_position', {
                x: this.mapWindowToCanvas(0, this.offsetX),
                y: this.mapWindowToCanvas(0, this.offsetY),
                w: this.mapWindowToCanvas(this.state.width, this.offsetX) - this.mapWindowToCanvas(0, this.offsetX),
                h: this.mapWindowToCanvas(this.state.height, this.offsetY) - this.mapWindowToCanvas(0, this.offsetY),
            });
        }
        else if (this.state.active) {
            this.drawLine(this.mapWindowToCanvas(this.preX, this.offsetX),
                          this.mapWindowToCanvas(this.preY, this.offsetY),
                          this.mapWindowToCanvas(currentX, this.offsetX),
                          this.mapWindowToCanvas(currentY, this.offsetY),
                          this.props.color,
                          this.props.lineWidth * this.scale,
                          this.props.eraser,
                          1)
            this.props.minimapDraw(this.mapWindowToCanvas(this.preX, this.offsetX),
                          this.mapWindowToCanvas(this.preY, this.offsetY),
                          this.mapWindowToCanvas(currentX, this.offsetX),
                          this.mapWindowToCanvas(currentY, this.offsetY),
                          this.props.color,
                          this.props.lineWidth * this.scale,
                          this.props.eraser);
        }
        this.preX = currentX;
        this.preY = currentY;
        // console.log(this.preX, this.preY);
    }

    onMouseUp(e) {
        e.preventDefault();
        this.setState({ active: false });
    }

    zoom(direction, zoom_factor, x, y) {
        // cursor positon; if using button, set center of view port as cursor positon.
        let preX = (x === undefined ? this.state.width/2 : x);
        let preY = (y === undefined ? this.state.height/2: y);
        // apply operator on cursor positon
        let preX_T = this.mapWindowToCanvas(preX, this.offsetX);
        let preY_T = this.mapWindowToCanvas(preY, this.offsetY);
        // factor is 1.1
        let factor = Math.pow(zoom_factor === undefined ? 2 : zoom_factor, direction);//set scale factor to 2
        // set base scale, cannot zoom out further
        if(this.scale/factor > this.initialScale) {
            factor = this.initialScale/this.scale;
        }
        // translate (0, 0) to cursor point
        this.ctx.translate(preX_T, preY_T);
        this.mctx.translate(preX_T, preY_T);
        this.offsetX -= preX_T;
        this.offsetY -= preY_T;

        // zoom in
        this.scale /= factor;
        this.offsetX = this.offsetX/factor;
        this.offsetY = this.offsetY/factor;
        this.imageHight *= factor;
        this.imageWidth *= factor;
        this.ctx.scale(factor,factor);
        this.mctx.scale(factor,factor);

        // translate back(fix mouse positon)
        this.ctx.translate(-preX_T, -preY_T);
        this.mctx.translate(-preX_T, -preY_T);
        this.offsetX += preX_T;
        this.offsetY += preY_T;

        // fix boundary
        let x1 = this.mapWindowToCanvas(0, this.offsetX);
        let y1 = this.mapWindowToCanvas(0, this.offsetY);
        let x2 = this.mapWindowToCanvas(this.state.width, this.offsetX);
        let y2 = this.mapWindowToCanvas(this.state.height, this.offsetY);

        let dx = 0;
        let dy = 0;

        if(x1 < -this.canvas_width/2) {
            dx = -this.canvas_width/2 - x1;
        } else if(x2 > this.canvas_width/2) {
            dx = this.canvas_width/2 - x2;
        }

        if (y1 < -this.canvas_hight/2) {
            dy = -this.canvas_hight/2 - y1;
        } else if(y2 > this.canvas_hight/2) {
            dy = this.canvas_hight/2 - y2;
        }
        // if both dx and dy are 0, don't transform
        if(!(dx === 0 && dy === 0)) {
            this.offsetX += dx;
            this.offsetY += dy;
            this.ctx.translate(-dx,-dy);
            this.mctx.translate(-dx,-dy);
        }
        this.props.socket.emit('command', 'update');
        this.props.socket.emit('viewport_position', {
            x: this.mapWindowToCanvas(0, this.offsetX),
            y: this.mapWindowToCanvas(0, this.offsetY),
            w: this.mapWindowToCanvas(this.state.width, this.offsetX) - this.mapWindowToCanvas(0, this.offsetX),
            h: this.mapWindowToCanvas(this.state.height, this.offsetY) - this.mapWindowToCanvas(0, this.offsetY),
        })
    }

    onScrollEvent(event) {
        event.preventDefault();
        let wheel = event.deltaY < 0 ? 1 : -1;

        if(event.ctrlKey)
            this.zoom(wheel, 1.1, this.preX, this.preY);
        else {
            this.zoom(wheel, 1.1)
        }
    }

    render() {
        return (
            <div id="mainCanvas">
                <canvas
                    ref="mouse"
                    id="mouse-listener"
                    style={styleMouse}
                    height = {this.state.height }
                    width  = {this.state.width}
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onMouseOut={(e)=>{
                                        e.preventDefault();
                                        this.move_active = false;
                                        this.setState({ active: false });
                                    }}
                    onWheel={this.onScrollEvent}/>

                <canvas
                    ref="canvas"
                    style={styleCanvas}
                    height = {this.state.height }
                    width  = {this.state.width }/>

                <canvas
                    ref="picture"
                    style={stylePicture}
                    height = {this.state.height }
                    width  = {this.state.width }/>

                <Modal
                    showForm={this.showForm}
                    modal={this.state.modal}
                    uploader={this.props.uploader}/>
            </div>
        );
    }
}
export default Canvas;
