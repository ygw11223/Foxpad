import React, {Component}  from 'react';
import './minimap.css';
// minimap ration is 1/8 of original canvas size
// 16 pixel offset from right edge and bottom edge
const height = 135;
const width = 240;

// ctx.strokeRect(50, 100, 10, 50);
//x-position, y-position, width, height
class Minimap extends Component {
    constructor(props) {
        super(props);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.drawLine = this.drawLine.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.onDrawImage = this.onDrawImage.bind(this);
        this.generateUrl = this.generateUrl.bind(this);
        this.clearImage = this.clearImage.bind(this);
    }

    generateUrl() {
        let previewCanvas = document.createElement("canvas");
        previewCanvas.width = 192;
        previewCanvas.height = 108;
        let previewContext = previewCanvas.getContext("2d");

        previewContext.drawImage(this.refs.picture, 0, 0, 192, 108);
        previewContext.drawImage(this.refs.minimap, 0, 0, 192, 108);
        let data = {
            url: previewCanvas.toDataURL('image/png'),
            id: this.props.cid,
        }
        return data;
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       this.props.onRef(this);
       this.ctx = this.refs.minimap.getContext('2d');
       this.pctx = this.refs.picture.getContext('2d');
       this.rctx = this.refs.rectangle_peers.getContext('2d');
       this.octx = this.refs.rectangle_own.getContext('2d');
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
        this.pctx.drawImage(data, -this.offsetX - imgWidth/16, -this.offsetY - imgHeight/16, imgWidth/8, imgHeight/8);
    }

    clearImage() {
        this.pctx.clearRect(0, 0, width, height);
    }

    displayUserPosition(data) {
        this.rctx.clearRect(0, 0, width, height);
        for (let key in data) {
            if (key === '.num_canvas') continue;

            let cid = parseInt(data[key].canvas_id.substr(-1));
            if (cid === 0) cid = 10;
            if (cid !== this.props.cid || key === this.props.uid) continue;

            // current doesnt update when user moves their own view
            // only updates after other user moves
            var viewport_width = data[key].width_viewport/8;
            var viewport_height = data[key].height_viewport/8;
            if (viewport_width <= 5 || viewport_height <= 5) {
                this.rctx.fillStyle = data[key].color;
                this.rctx.fillRect(-this.offsetX + data[key].pos_x_viewport/8, -this.offsetY + data[key].pos_y_viewport/8, 10, 10);
            } else {
                this.rctx.strokeStyle = data[key].color;
                this.rctx.lineWidth = 2;
                this.rctx.strokeRect(-this.offsetX + data[key].pos_x_viewport/8, -this.offsetY + data[key].pos_y_viewport/8, viewport_width, viewport_height);
            }
        }
    }

    displayOwnPosition(pos_x_viewport, pos_y_viewport, width_viewport, height_viewport) {
        this.octx.clearRect(0, 0, width, height);
        width_viewport = width_viewport/8;
        height_viewport = height_viewport/8;
        if (width_viewport <= 10 || height_viewport <= 10) {
            this.octx.fillStyle = this.props.color;
            this.octx.fillRect(-this.offsetX + pos_x_viewport/8, -this.offsetY + pos_y_viewport/8, 10, 10);
        } else {
            this.octx.strokeStyle = this.props.color;
            this.octx.lineWidth = 5;
            this.octx.strokeRect(-this.offsetX + pos_x_viewport/8, -this.offsetY + pos_y_viewport/8, width_viewport, height_viewport);
        }
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
              <div style={{width: '240px', height: '135px'}} id='minimap_background'></div>
              <canvas
                  ref="rectangle_peers"
                  id = "minirectangle_peers"
                  height = {height}
                  width  = {width}/>
              <canvas
                  ref="rectangle_own"
                  id = "minirectangle_own"
                  height = {height}
                  width  = {width}/>
            </div>
        );
    }
}
export default Minimap;
