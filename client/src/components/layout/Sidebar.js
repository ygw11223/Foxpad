import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu} from 'reactstrap';
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
        this.state = {btnDroprightColor:false, btnDroprightWidth:false, btnDroprightEraser: false};
    }
    // Todo: Anze
    //          rewrite DropdownItem into list
    //
    render() {
        return (
            <ButtonGroup   vertical id="buttonGroup" style={styleSideBar}>

                <ButtonDropdown   direction="right" isOpen={this.state.btnDroprightEraser}
                                    toggle={()=>{this.setState({btnDroprightEraser: !this.state.btnDroprightEraser})}}>
                    <DropdownToggle   si id="eraser" className='tool-button' >
                        <i className="fas fa-eraser fa-2x" style={{color: 'white'}}></i>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem eventKey="2" onClick={() => this.props.onEraser("2")} >2</DropdownItem>
                        <DropdownItem eventKey="10" onClick={() => this.props.onEraser("10")}>10</DropdownItem>
                        <DropdownItem eventKey="15" onClick={() => this.props.onEraser("15")}>15</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>

                <ButtonDropdown   direction="right" isOpen={this.state.btnDroprightWidth}
                                    toggle={()=>{this.setState({btnDroprightWidth: !this.state.btnDroprightWidth})}}>
                    <DropdownToggle   si id="penWidth" className='tool-button' >
                        <i className="fas fa-pencil-alt fa-2x" style={{color: 'white'}}></i>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem eventKey="2" onClick={() => this.props.onChangeWidth("2")} >2</DropdownItem>
                        <DropdownItem eventKey="10" onClick={() => this.props.onChangeWidth("10")}>10</DropdownItem>
                        <DropdownItem eventKey="15" onClick={() => this.props.onChangeWidth("15")}>15</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>

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
