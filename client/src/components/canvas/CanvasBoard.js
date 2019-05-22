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
        this.state = {color: '#EC1D63', lineWidth: 10, mode: DRAWING, eraser: false, hideNavbar: true, following: false, bgColor: 'blue', cid: 1, showUploader: true, mobile: false};
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
        this.releaseFollowing = this.releaseFollowing.bind(this);
        this.displayOwnPosition = this.displayOwnPosition.bind(this);
        this.toDashboard = this.toDashboard.bind(this);

        this.socket = openSocket();
        this.uploader = new SocketIOFileClient(this.socket);
        this.uid = null;
    }

    displayOwnPosition(x, y, w, h) {
        if (this.minimap) {
            this.minimap.displayOwnPosition(x, y, w, h);
        }
    }

    toDashboard(e) {
        this.setState({toDashboard: true});
    }

    updateViewportsPosition(data) {
        if (this.minimap) {
                this.minimap.displayUserPosition(data);
        }

        if (this.state.following === false) return;
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
        this.setState({mode: VIEWING, hideNavbar: true, following: data.uid});
        let cid = parseInt(data.cid);
        if (cid === 0) cid = 10;
        this.setCanvas(cid);
        this.canvas.followCanvas(data.x, data.y, data.w, data.h);
    }

    releaseFollowing() {
        this.setState({mode: DRAWING, following: false});
    }

    onImageEvent(data) {
        if (this.sidebar !== null) {
            if (data === 'NONE') {
                this.setState({showUploader: true});
            } else {
                this.setState({showUploader: false});
            }
        }
        this.canvas.onImageEvent(data);
    }

    onPreviewEvent(data) {
        this.canvasList.updatePreview(data.id, data.url);
    }

    broadcastPreview(cid) {
        if (this.minimap) {
            let data = this.minimap.generateUrl();
            if (cid.substr(-1) != data['id'] % 10) return;
            this.socket.emit('preivew', data);
            this.canvasList.updatePreview(data['id'], data['url']);
        }
    }

    setCanvas(id) {
        if (this.state.cid !== id) {
            this.canvasList.setState({current_canvas: id});
            this.cardDeck.setState({current_canvas: id});
            this.canvas.reconnect = false;
            this.setState({cid: id});
        }
    }

    newCanvas() {
        if (this.canvasList.state.num_canvas < 10) {
            let cid = this.canvasList.state.num_canvas + 1;
            this.canvasList.setState({num_canvas: cid, current_canvas: cid});
            this.cardDeck.setState({current_canvas: cid})
            this.canvas.reconnect = false;
            this.setState({cid: cid});
        }
    }

    // Function will be called after server init.
    canvas_update(data) {
        this.canvasList.setState({num_canvas: data['.num_canvas']});
        if (this.minimap) this.minimap.displayUserPosition(data);
    }

    session_update(data){
        if (!data[this.uid]) {
            console.log('refresh');
            window.location.reload();
        } else {
            delete data['.num_canvas'];
            let colors = {};
            for (let key in data) {
                if (key === this.uid) {
                    data[key] = data[key].color;
                    continue;
                }
                let cid = parseInt(data[key].cid.substr(-1));
                if (cid === 0) cid = 10;
                if (colors[cid]) {
                    colors[cid].push(data[key].color);
                } else {
                    colors[cid] = [data[key].color];
                }
                data[key] = data[key].color;
            }
            this.canvasList.setState({members: colors});

            this.cardDeck.state.totalIds = Object.keys(data).length;
            let color = data[this.uid];
            delete data[this.uid];
            this.cardDeck.setState({members: data});
            this.setState({bgColor: color})
            this.canvas.updatePosition();
        }
    }

    onInitCanvas() {
        this.socket.emit('init', {
            user_id: this.uid,
            room_id: this.props.match.params.id,
            canvas_id: this.props.match.params.id + this.state.cid,
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
        if (this.minimap) this.minimap.onDrawingEvent(data);
    }

    onRedrawEvent(data_array) {
        this.canvas.resetStroke(data_array);
        this.canvas.onRedrawEvent();
        if (this.minimap) this.minimap.onRedrawEvent(this.canvas.getCachedStroke());
    }

    minimapDraw(x0,y0,x1,y1,color, lineWidth, isEraser, emit) {
        if (this.minimap) this.minimap.drawLine(x0,y0,x1,y1,color, lineWidth, isEraser, emit);
    }

    minimapImage(datadata, imgWidth, imgHeight) {
        if (this.minimap) this.minimap.onDrawImage(datadata, imgWidth, imgHeight);
    }

    minimapClearImage() {
        if (this.minimap) {
            this.minimap.clearImage();
        }
    }

    componentDidMount() {
        if (cookies.get('cd_user_name') === undefined) {
            return;

        window.addEventListener("orientationchange", function() {
            window.location.reload();
        });
        if (window.screen.width < 1000 && window.screen.height < 1000) {
            document.documentElement.requestFullscreen();
            window.screen.orientation.lock("landscape");
            this.setState({mobile: true});
        }
        this.updateCanvasHistory();
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
        this.socket.on('canvas_preview', this.broadcastPreview);
        this.socket.on('update', (cmd)=>{
            if (cmd === 'image_ready') {
                this.canvas.onEmitImg();
            } else if (cmd === 'image_fail') {
                this.canvas.uploadingFailure();
            }
        });
    }

    componentWillUnmount() {
        this.updateCanvasHistory();
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

    componentDidUpdate(prevProps, prevState) {
        if (prevState.cid !== this.state.cid) {
            this.onInitCanvas();
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.cid !== this.state.cid) {
            this.socket.emit('stable', false);
        }
    }

    render(){
        let name = cookies.get('cd_user_name');
        if (name === undefined) {
            return <Redirect to={{
                pathname: '/login',
                state: { fromCanvas: true, room_id: this.props.match.params.id }
            }} />
        } else {
            this.uid = name;
        }

        if (this.state.toDashboard === true) {
            this.socket.disconnect();
            let time = new Date().getTime();
            return <Redirect to={{
                pathname: '/dashboard',
                state: {time: time, room_id: this.props.match.params.id },
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
                        rid={this.props.match.params.id}
                        color={this.state.bgColor}
                        toDashboard={this.toDashboard}/>

                <div>
                    {this.state.mobile === false &&
                        <Minimap
                                onRef={ref => (this.minimap= ref)}
                                cid={this.state.cid}
                                uid={this.uid}
                                color={this.state.bgColor}/>
                    }

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
                            name={this.uid}
                            minimapDraw={this.minimapDraw}
                            minimapImage={this.minimapImage}
                            minimapClearImage={this.minimapClearImage}
                            displayOwnPosition={this.displayOwnPosition}
                            cid={this.state.cid}/>

                    <InfoCards
                            onRef={ref => (this.cardDeck = ref)}
                            name={this.uid}
                            hideNavbar={this.state.hideNavbar}
                            socket={this.socket}
                            color={this.state.bgColor}
                            releaseFollowing={this.releaseFollowing}/>

                    {this.state.mode === VIEWING ? (""):(
                        <Sidebar
                                onRef={ref => (this.sidebar= ref)}
                                color={this.state.color}
                                onChangeColor={this.changeColor}
                                onChangeWidth={this.changeWidth}
                                onUndo={this.onUndoEvent}
                                onDrag={this.onDrag}
                                onZoom={this.onZoom}
                                showForm={this.showForm}
                                onEraser={this.onEraser}
                                hideNavbar={this.state.hideNavbar}
                                showUploader={this.state.showUploader}
                                mobile={this.state.mobile}/>)}
                    {this.state.mode === VIEWING ? (""):(
                        <Navbar
                            onRef={ref => (this.navbar= ref)}
                            onHideNavbar={this.onHideNavbar}
                            icon={icon}
                            hideNavbar={this.state.hideNavbar}
                            color={this.state.bgColor}/>)}/>
                </div>
            </div>
        );
    }
}

export default CanvasBoard
