import React, {Component} from 'react';

const CanvasListStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '200%',
    transition: '0.5s',
    position: 'absolute',
    zIndex: '5',
    overflow: 'hidden'
};

class CanvasList extends Component {
    constructor(props) {
        super(props);
        this.state = {color: 'blue'};
        this.renderCanvas = this.renderCanvas.bind(this);
    }

    renderCanvas() {
        var children = [];
        for (var i = 0; i < this.props.num_canvas; i++) {
            children.push(
                <div
                    style={{
                        height: '108px',
                        width: '192px',
                        backgroundColor: 'white',
                        padding: 0,
                        margin: '10px 0 10px 0',
                    }}>
                </div>
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
            </div>
        );
    }
}

export default CanvasList
