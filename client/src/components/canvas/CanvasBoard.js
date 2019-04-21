import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import  { Route, Redirect } from 'react-router-dom';
import Canvas from './Canvas';
import Sidebar from '../layout/Sidebar';

const cookies = new Cookies();

const styleSideBar = {
  zIndex: '5',
  position:'absolute',
  left:'100px',
  top:'100px',
};

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
    }

    componentDidMount() {
        let id = cookies.get('cd_user_name');
        if (id == undefined) {
            this.setState({toLogin: true});
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
            <div style = {{height:'100%'}}>
                <Canvas
                        onRef={ref => (this.canvas= ref)}
                        mode={this.state.mode}
                        width={this.state.width}
                        height={this.state.height}
                        color={this.state.color}
                        room_id={this.props.match.params.id}
                        lineWidth={this.state.lineWidth}
                        eraser={this.state.eraser} />

                <Sidebar style={styleSideBar}
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
