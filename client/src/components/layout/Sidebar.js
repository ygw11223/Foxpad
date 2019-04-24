import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import Slider from './Slider.js'
import './style.css'

// TODO : change position method when adding multiple canvas
const styleSideBar = {
  zIndex: '5',
  position:'absolute',
  left:'0px',
  top:'100px',
};

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.togglePopover = this.togglePopover.bind(this);
        this.state = {btnDroprightColor:false, btnDroprightWidth:false, btnDroprightEraser: false, popoverPenOpen: false, popoverEraserOpen: false, sliderValue: 10};
    }

    togglePopover() {
        this.setState({popoverOpen: !this.state.popoverOpen});
    }

    // Todo: Anze
    //          rewrite DropdownItem into list
    //
    render() {
        return (
            <ButtonGroup   vertical id="buttonGroup" style={styleSideBar}>

                <Button eventKey="draw" id="eraser" className='tool-button button'> <i class={"fas fa-eraser fa-2x"} style={{color: 'white'}}></i></Button>
                <Popover placement="right" hideArrow="true" isOpen={this.state.popoverEraserOpen} target="eraser" trigger="legacy" className="popover" toggle={()=>{this.setState({popoverEraserOpen: !this.state.popoverEraserOpen})}}>

                  <PopoverBody className="popover"><Slider onChangeWidth={this.props.onEraser}/></PopoverBody>
                </Popover>


                <Button eventKey="draw" id="draw" className='tool-button button'> <i class={"fas fa-pencil-alt fa-2x"} style={{color: 'white'}}></i></Button>
                <Popover placement="right" hideArrow="true" isOpen={this.state.popoverPenOpen} target="draw" trigger="legacy" className="popover" toggle={()=>{this.setState({popoverPenOpen: !this.state.popoverPenOpen})}}>

                  <PopoverBody className="popover"><Slider onChangeWidth={this.props.onChangeWidth}/></PopoverBody>
                </Popover>


                <ButtonDropdown   direction="right" isOpen={this.state.btnDroprightColor}
                                    toggle={()=>{this.setState({btnDroprightColor: !this.state.btnDroprightColor})}}>
                    <DropdownToggle   si id="palette" className='tool-button button' >
                        <i className="fas fa-palette fa-2x" style={{color: 'white'}}></i>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem eventKey="black" onClick={() => this.props.onChangeColor("black")} ><i className="fas fa-square" style={{color:'black',}}></i></DropdownItem>
                        <DropdownItem eventKey="red" onClick={() => this.props.onChangeColor("red")}><i className="fas fa-square" style={{color:'red',}}></i></DropdownItem>
                        <DropdownItem eventKey="blue" onClick={() => this.props.onChangeColor("blue")}><i className="fas fa-square" style={{color:'blue',}}></i></DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>

                <Button eventKey="undo" id="undo" className='tool-button button' onClick={() => this.props.onUndo()} > <i class="fas fa-undo fa-2x" style={{color: 'white'}}></i></Button>
                <Button eventKey="draw" id="draw" className='tool-button button' onClick={() => this.props.onDraw()} > <i class={"fas fa-edit fa-2x"} style={{color: 'white'}}></i></Button>
                <Button eventKey="drag" id="drag" className='tool-button button' onClick={() => this.props.onDrag()} > <i class={"fas fa-hand-paper fa-2x"} style={{color: 'white'}}></i></Button>
                <Button eventKey="zoom-in" id="zoomIn" className='tool-button button' onClick={() => this.props.onZoom(1)} > <i class="fas fa-search-plus fa-2x" style={{color: 'white'}}></i></Button>
                <Button eventKey="zoom-out" id="zoomOut" className='tool-button button' onClick={() => this.props.onZoom(-1)} > <i class="fas fa-search-minus fa-2x" style={{color: 'white'}}></i></Button>
                <Button eventKey="upload" id="image" className='tool-button button' onClick={() => this.props.showForm()} > <i className="fas fa-image fa-2x" style={{color: 'white'}}></i></Button>
            </ButtonGroup>
        );
    }
}

export default Sidebar;
