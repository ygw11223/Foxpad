import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu} from 'reactstrap';
import './style.css'


class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {btnDroprightColor:false, btnDroprightWidth:false};
    }
    // Todo: Anze
    //          rewrite DropdownItem into list
    //
    render() {
        return (
            <ButtonGroup   vertical >
                <Button eventKey="white" className='bg-light tool-button'  onClick={() => this.props.onChangeColor("white")}> <i class="fas fa-eraser" style={{color: 'black'}}></i></Button>

                <ButtonDropdown   direction="right" isOpen={this.state.btnDroprightWidth}
                                    toggle={()=>{this.setState({btnDroprightWidth: !this.state.btnDroprightWidth})}}>
                    <DropdownToggle   si className='bg-light tool-button' >
                        <i className="fas fa-pencil-alt" style={{color: 'black'}}></i>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem eventKey="2" onClick={() => this.props.onChangeWidth("2")} >2</DropdownItem>
                        <DropdownItem eventKey="10" onClick={() => this.props.onChangeWidth("10")}>10</DropdownItem>
                        <DropdownItem eventKey="15" onClick={() => this.props.onChangeWidth("15")}>15</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>

                <ButtonDropdown   direction="right" isOpen={this.state.btnDroprightColor}
                                    toggle={()=>{this.setState({btnDroprightColor: !this.state.btnDroprightColor})}}>
                    <DropdownToggle   si className='bg-light tool-button' >
                        <i className="fas fa-palette" style={{color: 'black'}}></i>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem eventKey="black" onClick={() => this.props.onChangeColor("black")} ><i className="fas fa-square" style={{color:'black',}}></i></DropdownItem>
                        <DropdownItem eventKey="red" onClick={() => this.props.onChangeColor("red")}><i className="fas fa-square" style={{color:'red',}}></i></DropdownItem>
                        <DropdownItem eventKey="blue" onClick={() => this.props.onChangeColor("blue")}><i className="fas fa-square" style={{color:'blue',}}></i></DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>

                <Button eventKey="undo" className='bg-light tool-button' onClick={() => this.props.onUndo()} > <i class="fas fa-undo" style={{color: 'black'}}></i></Button>

                <Button eventKey="mode" className='bg-light tool-button' onClick={() => this.props.onChangeMode()} > <i class={"fas "+this.props.mode} style={{color: 'black'}}></i></Button>

                <Button eventKey="upload" className='bg-light tool-button' onClick={() => this.props.showForm()} > <i className="fas fa-image" style={{color: 'black'}}></i></Button>
            </ButtonGroup>
        );
    }
}
export default Sidebar;
