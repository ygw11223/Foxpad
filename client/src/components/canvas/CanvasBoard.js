import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import  { Route, Redirect } from 'react-router-dom';
import Canvas from './Canvas';
import Sidebar from '../layout/Sidebar';
import InfoCards from '../layout/InfoCards';
import openSocket from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';

const cookies = new Cookies();

class CanvasBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {color: 'red', lineWidth: 5, mode: false, eraser: false, toLogin: false};
        this.changeColor = this.changeColor.bind(this);
        this.changeWidth = this.changeWidth.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.showForm = this.showForm.bind(this);
        this.onChangeMode = this.onChangeMode.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.onEraser = this.onEraser.bind(this);
        this.onInitCanvas = this.onInitCanvas.bind(this);
        this.session_update = this.session_update.bind(this);

        this.socket = openSocket();
        this.uploader = new SocketIOFileClient(this.socket);
        this.id = cookies.get('cd_user_name');
    }

    session_update(data){
        this.cardDeck.state.totalIds = Object.keys(data).length;
        this.cardDeck.state.color = data[this.id];
        delete data[this.id];
        this.cardDeck.state.members = data;
        this.cardDeck.forceUpdate();
    }

    onInitCanvas(){
        this.socket.emit('init', {
            user_id: this.id,
            canvas_id: this.props.match.params.id,
        });
        // Get image and strokes from server.
        this.canvas.onEmitImg();
        this.socket.emit('command', 'update');
    }

    componentDidMount() {
        let id = cookies.get('cd_user_name');
        if (id == undefined) {
            this.setState({toLogin: true});
        } else {
            this.id = id;
            // On server, we save user and canvas id on the socket object, which
            // will disappear when connection is lost. So we need to init upon
            // each connection.
            this.socket.on('connect', this.onInitCanvas);
            this.socket.on('drawing', this.canvas.onDrawingEvent);
            this.socket.on('image', this.canvas.onImageEvent);
            this.socket.on('redraw', this.canvas.onRedrawEvent);
            this.socket.on('session_update', this.session_update);
            this.socket.on('update', (cmd)=>{
                if(cmd === "image_ready") {
                    this.canvas.onEmitImg();
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

    onChangeMode(){
        this.setState({mode: !this.state.mode})
    }

    onEraser(e) {
        this.setState({lineWidth: e, eraser: true})
    }

    render(){
        if (this.state.toLogin === true) {
            return <Redirect to={{
                pathname: '/login',
                state: { fromCanvas: true, room_id: this.props.match.params.id }
            }} />
        }
        return(
            <div>
                <Canvas
                        onRef={ref => (this.canvas= ref)}
                        mode={this.state.mode}
                        width={this.state.width}
                        height={this.state.height}
                        color={this.state.color}
                        room_id={this.props.match.params.id}
                        lineWidth={this.state.lineWidth}
                        eraser={this.state.eraser}
                        socket={this.socket}
                        uploader={this.uploader}/>

                <InfoCards
                        onRef={ref => (this.cardDeck= ref)}
                        name={this.id}/>

                <Sidebar
                        mode={this.state.mode ? "fa-hand-paper": "fa-edit"}
                        onChangeColor={this.changeColor}
                        onChangeWidth={this.changeWidth}
                        onUndo={this.onUndoEvent}
                        onChangeMode={this.onChangeMode}
                        onZoom={this.onZoom}
                        showForm={this.showForm}
                        onEraser={this.onEraser}/>
            </div>
        );
    }
}

export default CanvasBoard
