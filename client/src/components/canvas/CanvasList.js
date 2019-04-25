import React, {Component} from 'react';
import {Button} from 'reactstrap';

const CanvasListStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '200%',
    color: 'white',
    transition: '0.5s',
    position: 'absolute',
    zIndex: '5',
    overflow: 'hidden',
    border: 0,
};

class CanvasList extends Component {
    constructor(props) {
        super(props);
        this.state = {color: 'blue', num_canvas: 1, current_canvas: 1};
        this.renderCanvas = this.renderCanvas.bind(this);
    }

    componentDidMount() {
       this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    renderCanvas() {
        var children = [];
        for (var i = 1; i <= this.state.num_canvas; i++) {
            var border = (i === this.state.current_canvas ? '5px' : '0');
            children.push(
                <Button
                    style={{
                        height: '108px',
                        width: '192px',
                        backgroundColor: 'white',
                        padding: 0,
                        border: border,
                        borderColor: 'black',
                        margin: '10px 0 10px 0',
                    }}
                    onClick={this.props.setCanvas.bind(this, i)}>
                </Button>
            );
        }
        return children;
    }

    render() {
        var width = this.props.hideNavbar ? '0' : '212px';
        const style = {
            ...CanvasListStyle,
            width: width,
            backgroundColor: this.state.color,
        }
        return (
            <div style={style}>
                <p style={{width: '150px'}}> Canvas List </p>

                {this.renderCanvas()}

                <Button style={{
                        height: '108px',
                        width: '192px',
                        backgroundColor: 'transparent',
                        fontSize: '200%',
                        border: 0,
                        outline: 0,
                        boxShadow: 'none',
                    }}
                    onClick={() => this.props.newCanvas()}
                    backgroundColor='blue'>
                    <b>+</b>
                </Button>
            </div>
        );
    }
}

export default CanvasList
