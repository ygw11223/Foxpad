import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import Slider from './Slider.js'
import ColorPicker from './ColorPicker.js'
import './style.css'

// TODO : change position method when adding multiple canvas
const styleSideBar = {
  zIndex: '5',
  position:'absolute',
  top:'100px',
  transition: '0.5s'
};

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.updatePenWidth = this.updatePenWidth.bind(this);
        this.updateEraserWidth = this.updateEraserWidth.bind(this);
        this.updateColor = this.updateColor.bind(this);
        this.onPen = this.onPen.bind(this);
        this.onEraser = this.onEraser.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.hideImageButton = this.hideImageButton.bind(this);
        this.showImageButton = this.showImageButton.bind(this);
        this.state = {popoverPenOpen: false, popoverEraserOpen: false, popoverColorOpen: false, penWidth: 10, eraserWidth: 10, color: '#EC1D63', onPen: true, onEraser: false};
    }

    hideImageButton() {
        let imageButton = document.getElementById("image");
        let eraserButton = document.getElementById("eraser");
        imageButton.style.visibility = "hidden";
        eraserButton.style.borderRadius = "0px 0px 25px 0px";
    }

    showImageButton() {
        let imageButton = document.getElementById("image");
        let eraserButton = document.getElementById("eraser");
        imageButton.style.visibility = "visible";
        eraserButton.style.borderRadius = "0px";
    }

    updatePenWidth(value) {
        this.setState({penWidth: value});
    }

    updateEraserWidth(value) {
        this.setState({eraserWidth: value});
    }

    updateColor(value) {
        this.setState({color: value});
    }

    onPen() {
        let buttons = document.getElementsByClassName("tool-button");
        let target = document.getElementById("penWidth");
        let penArrow = document.getElementById("penRight");
        let eraserArrow = document.getElementById("eraserRight");
        penArrow.style.display = "block";
        eraserArrow.style.display = "none";

        for(var i = 0; i < buttons.length; i++) {
             buttons[i].style.backgroundColor = "#A0A0A0";
        }
        target.style.backgroundColor = "#4C94CE";

        if (this.state.onPen) {
            this.setState({popoverPenOpen: !this.state.popoverPenOpen});
        }
        else {
            this.setState({onPen: true, onEraser: false, popoverEraserOpen: false, popoverColorOpen: false});
            this.props.onDrag(false);
            console.log(this.state.penWidth);
            this.props.onChangeWidth(this.state.penWidth);
        }
    }

    onEraser() {
        let buttons = document.getElementsByClassName("tool-button");
        let target = document.getElementById("eraser");
        let penArrow = document.getElementById("penRight");
        let eraserArrow = document.getElementById("eraserRight");
        penArrow.style.display = "none";
        eraserArrow.style.display = "block";

        for(var i = 0; i < buttons.length; i++) {
             buttons[i].style.backgroundColor = "#A0A0A0";
        }
        target.style.backgroundColor = "#4C94CE";

        if (this.state.onEraser) {
            this.setState({popoverEraserOpen: !this.state.popoverEraserOpen});
        }
        else {
            this.setState({onEraser: true, onPen: false, popoverPenOpen: false, popoverColorOpen: false, showImageButton: true});
            this.props.onDrag(false);
            this.props.onEraser(this.state.eraserWidth);
        }
    }

    onDrag() {
        let buttons = document.getElementsByClassName("tool-button");
        let target = document.getElementById("drag");
        let penArrow = document.getElementById("penRight");
        let eraserArrow = document.getElementById("eraserRight");
        penArrow.style.display = "none";
        eraserArrow.style.display = "none";

        for(var i = 0; i < buttons.length; i++) {
             buttons[i].style.backgroundColor = "#A0A0A0";
        }
        target.style.backgroundColor = "#4C94CE";

        this.setState({onDrag: true, onEraser: false, onPen: false, popoverEraserOpen: false, popoverPenOpen: false, popoverColorOpen: false, showImageButton: false});
        this.props.onDrag(true);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    componentDidMount() {
       this.props.onRef(this);
    }

    // Todo: Anze
    //          rewrite DropdownItem into list
    //
    render() {
        var left = this.props.hideNavbar ? '0' : '212px';
        const style = {
            ...styleSideBar,
            left: left,
        }

        return (
            <ButtonGroup   vertical id="buttonGroup" style={style}>

                <Button eventKey="drag" id="drag" className='tool-button button' onClick={this.onDrag} > <i class={"fas fa-hand-paper fa-2x"} style={{color: 'white'}}></i></Button>
                <Button eventKey="undo" id="undo" className='tool-button button' onClick={() => this.props.onUndo()} > <i class="fas fa-undo fa-2x" style={{color: 'white'}}></i></Button>
                <Button eventKey="zoom-in" id="zoomIn" className='tool-button button' onClick={() => this.props.onZoom(1)} > <i class="fas fa-search-plus fa-2x" style={{color: 'white'}}></i></Button>
                <Button eventKey="zoom-out" id="zoomOut" className='tool-button button' onClick={() => this.props.onZoom(-1)} > <i class="fas fa-search-minus fa-2x" style={{color: 'white'}}></i></Button>

                <Button eventKey="color" id="palette" className='tool-button button'> <i class={"fas fa-circle fa-2x"} style={{color: this.state.color}}></i></Button>
                <Popover placement="right" hideArrow="true" isOpen={this.state.popoverColorOpen} target="palette" trigger="legacy" className="colorPopover" toggle={()=>{this.setState({popoverColorOpen: !this.state.popoverColorOpen})}}>
                  <ColorPicker updateColor={this.updateColor} onChangeColor={this.props.onChangeColor}/>
                </Popover>

                <Button eventKey="penWidth" id="penWidth" className='tool-button button'> <i class="fas fa-pencil-alt fa-2x" style={{color: 'white'}}></i><i class="fas fa-chevron-right" id="penRight"></i></Button>
                <Popover placement="right" hideArrow="true" isOpen={this.state.popoverPenOpen} target="penWidth" trigger="legacy" className="popover" toggle={this.onPen}>
                  <Slider getValue={this.updatePenWidth} value={this.state.penWidth} onChangeWidth={this.props.onChangeWidth}/>
                </Popover>

                <Button eventKey="eraser" id="eraser" className='tool-button button'><i class={"fas fa-eraser fa-2x"} style={{color: 'white'}}></i><i class="fas fa-chevron-right" id="eraserRight"></i></Button>
                <Popover placement="right" hideArrow="true" isOpen={this.state.popoverEraserOpen} target="eraser" trigger="legacy" className="popover" toggle={this.onEraser}>
                  <Slider getValue={this.updateEraserWidth} value={this.state.eraserWidth} onChangeWidth={this.props.onEraser}/>
                </Popover>

                <Button eventKey="upload" id="image" className='tool-button button' onClick={() => this.props.showForm()} > <i className="fas fa-image fa-2x" style={{color: 'white'}}></i></Button>
            </ButtonGroup>
        );
    }
}

export default Sidebar;
