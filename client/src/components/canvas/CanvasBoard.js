import React, {Component} from 'react';
import Canvas from './Canvas';
import Sidebar from '../layout/Sidebar'

class CanvasBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {color: 'red', lineWidth: 5};
        this.changeColor = this.changeColor.bind(this);
        this.changeWidth = this.changeWidth.bind(this);
        this.onUndoEvent = this.onUndoEvent.bind(this);
        
    }

    changeColor(e) {
        this.setState({color: e})
    }

    changeWidth(e) {
        this.setState({lineWidth: e})
    }
    componentDidMount() {
      console.log(this.canvas.color);
    }
    onUndoEvent() {
        this.canvas.onUndoEvent();
    }
    render(){
        return(
            <div style = {{ display: 'flex', flexDirection: 'row', height:'100%'}}>
                <div >
                    <Sidebar onChangeColor={this.changeColor}
                             onChangeWidth={this.changeWidth}
                             onUndo={this.onUndoEvent}/>
                </div>
                    <div style={{  backgroundColor: 'gray', border: 'solid 4px', flexGrow : 1}} >
                        <Canvas
                            onRef={ref => (this.canvas= ref)}
                            width={this.state.width}
                            height={this.state.height}
                            color={this.state.color}
                            room_id={this.props.match.params.id}
                            lineWidth={this.state.lineWidth} />
                    </div>
            </div>
        );
    }
}

export default CanvasBoard
