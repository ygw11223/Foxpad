import React, {Component} from 'react';
import {Button} from 'reactstrap';
import '../layout/style.css'

const arrow = require('./left_arrow.png');

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

const styleButton = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    verticalAlign: 'middle',
    height: '35px',
    fontSize: '15px',
    zIndex: '5',
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderStyle: 'solid',
    borderRadius: '6px',
};

class CanvasList extends Component {
    constructor(props) {
        super(props);
        this.state = {num_canvas: 1, current_canvas: 1, members: {}};
        this.renderCanvas = this.renderCanvas.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.updatePreview = this.updatePreview.bind(this);
        this.renderColorBar = this.renderColorBar.bind(this);
    }

    updatePreview(id, url) {
        // console.log('update preivew canvas:', id);
        let canvas = document.getElementsByClassName('canvasPreview' + id)[0];
        if (canvas) {
            canvas.style.backgroundImage = 'url(' + url + ')';
        }
    }

    renderColorBar(cid) {
        let children = [];
        for (let key in this.state.members) {
            if (key == cid) {
                for (let i in this.state.members[key]) {
                    children.push(
                        <div style={{
                            backgroundColor: this.state.members[key][i],
                            width: '5px',
                            height: '110px',
                            position: 'relative',
                            zIndex: '5'
                        }}>
                        </div>);
                }
            }
        }
        return(children);
    }

    componentDidMount() {
       this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    renderCanvas() {
        let children = [];
        for (let i = 1; i <= this.state.num_canvas; i++) {
            let url = 'url(images/' + 'preview' + this.props.rid + i + '.png)';
            // let boxShadow = (i === this.state.current_canvas ? 'inset 0 0 10px black' : 'none');
            let style = {};
            if (i === this.state.current_canvas) {
                style = {
                    width: '100%',
                    backgroundColor: 'gray',
                    position: 'relative',
                    left: '-5px',
                    margin: '5px 0 5px 0',
                    borderRadius: '5px 5px 5px 5px',
                    flexShrink: 0,
                }
            } else {
                style = {
                    width: '100%',
                    backgroundColor: 'transparent',
                    position: 'relative',
                    left: '-5px',
                    margin: '5px 0 5px 0',
                    borderRadius: '5px 5px 5px 5px',
                    flexShrink: 0,
                }
            }

            children.push(
                <div style={style}>
                    <Button
                        style={{
                            borderColor: 'gray',
                            borderWidth: '0',
                            boxShadow: 'none',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            position: 'relative',
                            left: '15px',
                            height: '108px',
                            width: '192px',
                            backgroundColor: 'white',
                            backgroundImage: url,
                            padding: 0,
                            margin: '5px 0 5px 0',
                        }}
                        className={'canvasPreview' + i}
                        onClick={this.props.setCanvas.bind(this, i)}>
                        {this.renderColorBar(i)}
                    </Button>
                </div>
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
                <p style={{width: '150px', textAlign: 'center', margin: '7px 0 7px 0'}}> Canvases </p>
                <p><button onClick={this.props.toDashboard} style={styleButton}><img src={arrow} style={{width: '15px', height: '15px', float: 'left', marginRight: '5px'}} alt="arrow" id="arrow"/>Dashboard</button></p>

                {this.renderCanvas()}

                {this.renderButton()}
            </div>
        );
    }
}

export default CanvasList
