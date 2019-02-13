import React, {Component} from 'react';
import Canvas from './Canvas';
import Sidebar from '../layout/Sidebar'


class CanvasBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {color: 'red'};
        this.changeColor = this.changeColor.bind(this);
    }

    changeColor(e) {
        this.setState({color: e})
    }

    render(){
        return(
            <div style = {{ display: 'flex', flexDirection: 'row', height:'100%'}}>
                <div >
                    <Sidebar onChangeColor={this.changeColor} />
                </div>
                    <div style={{  backgroundColor: 'gray', border: 'solid 4px', flexGrow : 1}} >
                        <Canvas
                            width={this.state.width}
                            height={this.state.height}
                            color={this.state.color}
                            room_id={this.props.match.params.id}/>
                    </div>
            </div>
        );
    }
}

export default CanvasBoard
