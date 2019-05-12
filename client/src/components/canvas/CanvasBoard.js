import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import  { Route, Redirect } from 'react-router-dom';
import Canvas from './Canvas';
import Sidebar from '../layout/Sidebar';
import Navbar from '../layout/Navbar';
import InfoCards from '../layout/InfoCards';
import Minimap from './minimap/Minimap';
import CanvasList from './CanvasList';
import openSocket from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';
import {DRAWING,VIEWING,DRAGGING} from '../Constants';

const cookies = new Cookies();

class CanvasBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {color: '#EC1D63', lineWidth: 10, mode: DRAWING, eraser: false, toLogin: false, hideNavbar: true, following: null};
        this.changeColor = this.changeColor.bind(this);
        this.changeWidth = this.changeWidth.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.showForm = this.showForm.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.onEraser = this.onEraser.bind(this);
        this.onInitCanvas = this.onInitCanvas.bind(this);
        this.session_update = this.session_update.bind(this);
        this.canvas_update = this.canvas_update.bind(this);
        this.onHideNavbar = this.onHideNavbar.bind(this);
        this.newCanvas = this.newCanvas.bind(this);
        this.setCanvas = this.setCanvas.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDrawingEvent = this.onDrawingEvent.bind(this);
        this.minimapDraw = this.minimapDraw.bind(this);
        this.minimapImage = this.minimapImage.bind(this);
        this.minimapClearImage = this.minimapClearImage.bind(this);
        this.onRedrawEvent = this.onRedrawEvent.bind(this);
        this.broadcastPreview = this.broadcastPreview.bind(this);
        this.onPreviewEvent = this.onPreviewEvent.bind(this);
        this.onPositionEvent = this.onPositionEvent.bind(this);
        this.updateCanvasHistory = this.updateCanvasHistory.bind(this);
        this.onImageEvent = this.onImageEvent.bind(this);
        this.updateViewportsPosition = this.updateViewportsPosition.bind(this);

        this.socket = openSocket();
        this.uploader = new SocketIOFileClient(this.socket);
        this.uid = cookies.get('cd_user_name');
        this.cid = 1;
    }

    updateViewportsPosition(data) {
        for (let key in data) {
            if (key === this.state.following) {
                let cid = parseInt(data[key].canvas_id.substr(-1));
                if (cid === 0) cid = 10;
                this.setCanvas(cid);
                this.canvas.followCanvas(data[key].pos_x_viewport, data[key].pos_y_viewport, data[key].width_viewport, data[key].height_viewport);
            }
        }
    }

    onPositionEvent(data) {
        let following = (data.uid === this.state.following ? null : data.uid);
        if(following === null) {
            this.setState({mode: DRAWING});
        } else {
            this.setState({mode: VIEWING});
        }
        this.setState({following: following});
        let cid = parseInt(data.cid);
        if (cid === 0) cid = 10;
        this.setCanvas(cid);
        this.canvas.followCanvas(data.x, data.y, data.w, data.h);
    }

    onImageEvent(data) {
        if (this.sidebar !== null) {
            if (data === 'NONE') {
                this.sidebar.showImageButton();
            } else {
                this.sidebar.hideImageButton();
            }
        }
        this.canvas.onImageEvent(data);
    }

    onPreviewEvent(data) {
        this.canvasList.updatePreview(data.id, data.url);
    }

    broadcastPreview() {
        let url = this.minimap.generateUrl();
        this.socket.emit('preivew', {id: this.cid, url: url});
        this.canvasList.updatePreview(this.cid, url);
    }

    setCanvas(id) {
        if (this.cid !== id) {
            this.cid = id;
            this.canvasList.setState({current_canvas: this.cid});
            this.cardDeck.setState({current_canvas: this.cid});
            this.canvas.reconnect = false;
            this.onInitCanvas();
            this.props.socket.emit('command', 'update');

        }
    }

    newCanvas() {
        if (this.canvasList.state.num_canvas < 10) {
            this.cid = this.canvasList.state.num_canvas += 1;
            this.canvasList.setState({num_canvas: this.cid, current_canvas: this.cid});
            this.cardDeck.setState({current_canvas: this.cid})
            this.canvas.reconnect = false;
            this.onInitCanvas();
        }
    }

    // Function will be called after server init.
    canvas_update(num) {
        this.canvasList.setState({num_canvas: num});
    }

    session_update(data){
        this.cardDeck.state.totalIds = Object.keys(data).length;
        var color = data[this.uid];
        delete data[this.uid];
        this.cardDeck.state.color = color;
        this.cardDeck.state.members = data;
        this.cardDeck.forceUpdate();
        if(this.canvasList !== null)
            this.canvasList.setState({'color': color});
        if(this.navbar !== null)
            this.navbar.setState({'color': color});
    }

    onInitCanvas() {
        this.socket.emit('init', {
            user_id: this.uid,
            room_id: this.props.match.params.id,
            canvas_id: this.props.match.params.id + this.cid,
        });
        this.canvas.initCanvas();
        // Get image and strokes from server.
        this.canvas.onEmitImg();
        this.socket.emit('command', 'update');
    }

    updateCanvasHistory() {
        let canvases = cookies.get('cd_test_canvases');
        if (canvases == undefined) {
            canvases = {}
        }
        canvases[this.props.match.params.id] = new Date().getTime();
        cookies.set('cd_test_canvases', canvases, {path: '/'});
    }

    onDrawingEvent(data) {
        this.canvas.cacheStroke(data);
        this.canvas.onDrawingEvent(data);
        this.minimap.onDrawingEvent(data);
    }

    onRedrawEvent(data_array) {
        this.canvas.resetStroke(data_array);
        this.canvas.onRedrawEvent();
        this.minimap.onRedrawEvent(this.canvas.getCachedStroke());
    }

    minimapDraw(x0,y0,x1,y1,color, lineWidth, isEraser, emit) {
        this.minimap.drawLine(x0,y0,x1,y1,color, lineWidth, isEraser, emit);
    }

    minimapImage(datadata, imgWidth, imgHeight) {
        this.minimap.onDrawImage(datadata, imgWidth, imgHeight);
    }

    minimapClearImage() {
        this.minimap.clearImage();
    }

    componentDidMount() {
        let id = cookies.get('cd_user_name');
        if (id == undefined) {
            this.setState({toLogin: true});
        } else {
            this.updateCanvasHistory();
            this.uid = id;
            // On server, we save user and canvas id on the socket object, which
            // will disappear when connection is lost. So we need to init upon
            // each connection.
            this.socket.on('connect', this.onInitCanvas);
            this.socket.on('drawing', this.onDrawingEvent);
            this.socket.on('position', this.onPositionEvent);
            this.socket.on('preview', this.onPreviewEvent);
            this.socket.on('image', this.onImageEvent);
            this.socket.on('redraw', this.onRedrawEvent);
            this.socket.on('session_update', this.session_update);
            this.socket.on('canvas_update', this.canvas_update);
            this.socket.on('mouse_position', this.canvas.updateMouseLocation);
            this.socket.on('viewport_position', this.updateViewportsPosition);
            this.socket.on('update', (cmd)=>{
                if(cmd === 'image_ready') {
                    this.canvas.onEmitImg();
                } else if (cmd === 'canvas_preview') {
                    this.broadcastPreview();
                }
            });
        }
    }

    changeColor(e) {
        this.setState({color: e})
    }

    changeWidth(e) {
        this.setState({lineWidth: e, eraser: false})
    }

    onUndoEvent() {
        this.canvas.onUndoEvent();
    }
    showForm() {
        this.canvas.showForm();
    }

    onZoom(direction) {
        this.canvas.zoom(direction);
    }

    onDrag(mode){
        this.setState({mode: mode ? DRAGGING : DRAWING});
    }

    onEraser(e) {
        this.setState({lineWidth: e, eraser: true});
    }

    onHideNavbar() {
        this.setState({hideNavbar: !this.state.hideNavbar})
    }

    render(){
        if (this.state.toLogin === true) {
            return <Redirect to={{
                pathname: '/login',
                state: { fromCanvas: true, room_id: this.props.match.params.id }
            }} />
        }

        var icon = (this.state.hideNavbar === true ? '>' : '<');

        return(
            <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
                <CanvasList
                        onRef={ref => (this.canvasList= ref)}
                        hideNavbar={this.state.hideNavbar}
                        newCanvas={this.newCanvas}
                        setCanvas={this.setCanvas}
                        rid={this.props.match.params.id}/>

                <div>
                    <Minimap
                            onRef={ref => (this.minimap= ref)}/>

                    <Canvas style={{cursor: 'none'}}
                            onRef={ref => (this.canvas= ref)}
                            mode={this.state.mode}
                            width={this.state.width}
                            height={this.state.height}
                            color={this.state.color}
                            room_id={this.props.match.params.id}
                            lineWidth={this.state.lineWidth}
                            eraser={this.state.eraser}
                            socket={this.socket}
                            uploader={this.uploader}
                            name = {this.uid}
                            minimapDraw={this.minimapDraw}
                            minimapImage={this.minimapImage}
                            minimapClearImage={this.minimapClearImage}/>

                    <InfoCards
                            onRef={ref => (this.cardDeck = ref)}
                            name={this.uid}
                            hideNavbar={this.state.hideNavbar}
                            socket={this.socket}/>

                    {this.state.mode === VIEWING ? (""):(
                        <Sidebar
                                onRef={ref => (this.sidebar= ref)}
                                onChangeColor={this.changeColor}
                                onChangeWidth={this.changeWidth}
                                onUndo={this.onUndoEvent}
                                onDrag={this.onDrag}
                                onZoom={this.onZoom}
                                showForm={this.showForm}
                                onEraser={this.onEraser}
                                hideNavbar={this.state.hideNavbar}/>)}
                    {this.state.mode === VIEWING ? (""):(
                        <Navbar
                            onRef={ref => (this.navbar= ref)}
                            onHideNavbar={this.onHideNavbar}
                            icon={icon}
                            hideNavbar={this.state.hideNavbar}/>)}
                </div>
            </div>
        );
    }
}

export default CanvasBoard
