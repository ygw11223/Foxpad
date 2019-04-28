import React, {Component}  from 'react';
import './minimap.css'
const minimap = require('./boop.jpg');

class Minimap extends Component {
    constructor(props) {
        super(props);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       this.props.onRef(this);
       this.ctx = this.refs.minimap.getContext('2d');
       this.offsetY = -135/2;
       this.offsetX = -120;
       this.ctx.translate(-this.offsetX, -this.offsetY);
    }

    onRedrawEvent(data_array) {
        this.ctx.save();    // save the current state of our canvas (translate offset)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, 240, 135); // clear the whole canvas
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

    render() {
        return (
            <div>
              <canvas
                  ref="minimap"
                  id = "mini"
                  height = {135}
                  width  = {240}
                  />
            </div>
        );
    }
}
export default Minimap;
