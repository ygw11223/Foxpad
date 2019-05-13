import React, {Component} from 'react';
import {Button} from 'reactstrap';
import '../layout/style.css'

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
    overflow: 'scroll',
    border: 0,
};

class CanvasList extends Component {
    constructor(props) {
        super(props);
        this.state = {num_canvas: 1, current_canvas: 1};
        this.renderCanvas = this.renderCanvas.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.updatePreview = this.updatePreview.bind(this);
    }

    updatePreview(id, url) {
        // console.log('update preivew canvas:', id);
        document.getElementsByClassName('canvasPreview' + id)[0].style.backgroundImage 
            = 'url(' + url + ')';
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
            let url = 'url(images/' + 'preview' + this.props.rid + i + '.png)';
            let boxShadow = (i === this.state.current_canvas ? 'inset 0 0 10px black' : 'none');
            children.push(
                <Button
                    style={{
                        height: '108px',
                        width: '192px',
                        backgroundColor: 'white',
                        backgroundImage: url,
                        padding: 0,
                        border: 0,
                        borderColor: 'black',
                        margin: '10px 0 10px 0',
                        flexShrink: 0,
                        boxShadow: boxShadow
                    }}
                    className={'canvasPreview' + i}
                    onClick={this.props.setCanvas.bind(this, i)}>
                </Button>
            );
        }
        return children;
    }

    renderButton() {
        if (this.state.num_canvas < 10) {
            return(
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
                </Button>);
        }
    }

    render() {
        var width = this.props.hideNavbar ? '0' : '212px';
        const style = {
            ...CanvasListStyle,
            width: width,
            backgroundColor: this.props.color,
        }
        return (
            <div style={style} class='canvasList'>
                <p style={{width: '150px', textAlign: 'center'}}> Canvases </p>

                {this.renderCanvas()}

                {this.renderButton()}
            </div>
        );
    }
}

export default CanvasList
