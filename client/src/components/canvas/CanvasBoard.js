import React, {Component} from 'react';
import Canvas from './Canvas';
import Sidebar from '../layout/Sidebar'

class CanvasBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {color: 'red', lineWidth: 5, mode: false, eraser: false};
        this.changeColor = this.changeColor.bind(this);
        this.changeWidth = this.changeWidth.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        this.showForm = this.showForm.bind(this);
        this.onChangeMode = this.onChangeMode.bind(this);
        this.onZoom = this.onZoom.bind(this);
        this.onEraser = this.onEraser.bind(this);
    }

    changeColor(e) {
        this.setState({color: e})
    }

    changeWidth(e) {
        this.setState({lineWidth: e, eraser: false})
    }

    componentDidMount() {
      console.log(this.canvas.color);
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
        return(
            <div style = {{ display: 'flex', flexDirection: 'row', height:'100%'}}>
                <div >
                    <Sidebar mode={this.state.mode ? "fa-hand-paper": "fa-edit"}
                             onChangeColor={this.changeColor}
                             onChangeWidth={this.changeWidth}
                             onUndo={this.onUndoEvent}
                             onChangeMode={this.onChangeMode}
                             onZoom={this.onZoom}
                             showForm={this.showForm}
                             onEraser={this.onEraser}/>
                </div>
                    <div style={{  backgroundColor: 'gray', border: 'solid 4px', flexGrow : 1}} >
                        <Canvas
                            onRef={ref => (this.canvas= ref)}
                            mode={this.state.mode}
                            width={this.state.width}
                            height={this.state.height}
                            color={this.state.color}
                            room_id={this.props.match.params.id}
                            lineWidth={this.state.lineWidth}
                            eraser={this.state.eraser} />
                    </div>
            </div>
        );
    }
}

export default CanvasBoard
