import React, {Component}  from 'react';
import './minimap.css';

const height = 135;
const width = 240;

class Minimap extends Component {
    constructor(props) {
        super(props);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.onDrawImage = this.onDrawImage.bind(this);

        this.image = new Image();
        this.image.onload = this.onDrawImage;
        // Buffer for next level of resolution of image. Needed for smooth
        // zooming
        this.nextImage = new Image();
        this.nextImage.onload = this.onLoadNextImage;
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       this.props.onRef(this);
       this.ctx = this.refs.minimap.getContext('2d');
       this.pctx = this.refs.picture.getContext('2d');
       this.offsetY = -135/2;
       this.offsetX = -120;
       this.ctx.translate(-this.offsetX, -this.offsetY);
    }

    onRedrawEvent(data_array) {
        this.ctx.save();    // save the current state of our canvas (translate offset)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, width, height); // clear the whole canvas
        this.ctx.restore(); // restore the translate offset
        var i = 0;
        for (i = 0; i < data_array.length; i++) {
            this.onDrawingEvent(data_array[i]);
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
        this.ctx.moveTo(x0/8, y0/8);
        this.ctx.lineTo(x1/8, y1/8);
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = lineWidth/8;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
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

    onDrawImage(data, imgWidth, imgHeight) {
        this.pctx.clearRect(0, 0, width, height);
        console.log("x", -this.offsetX - imgWidth/2, "y", -this.offsetY - imgHeight/2);
        this.pctx.drawImage(data, -this.offsetX - imgWidth/16, -this.offsetY - imgHeight/16, imgWidth/8, imgHeight/8);
        console.log("printed minimap img");
    }

    render() {
        return (
            <div>
              <canvas
                  ref="minimap"
                  id = "mini"
                  height = {height}
                  width  = {width}/>
              <canvas
                  ref="picture"
                  id = "minipicture"
                  height = {height}
                  width  = {width}/>
            </div>
        );
    }
}
export default Minimap;
