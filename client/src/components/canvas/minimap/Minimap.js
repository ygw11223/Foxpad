import React, {Component}  from 'react';
import './minimap.css'
const minimap = require('./boop.jpg');

class Minimap extends Component {
    constructor(props) {
        super(props);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       this.props.onRef(this);
       this.ctx = this.refs.minimap.getContext('2d');
    }

    drawLine(x0,y0,x1,y1,color, lineWidth, isEraser, emit) {
        this.ctx.beginPath();
        if (isEraser) {
            this.ctx.globalCompositeOperation="destination-out";
        }
        else {
            this.ctx.globalCompositeOperation="source-over";
        }
        this.ctx.moveTo(x0/4, y0/4);
        this.ctx.lineTo(x1/4, y1/4);
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = lineWidth/4;
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
                  height = {270}
                  width  = {480}
                  />
              // <img src={minimap} id="test" alt="minimap" />
            </div>
        );
    }
}
export default Minimap;
