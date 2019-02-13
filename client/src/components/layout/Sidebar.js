import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu} from 'reactstrap';




class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {btnDropright:false};
    }
    // Todo: Anze
    //          rewrite DropdownItem into list
    //
    render() {
        return (
            <ButtonGroup   vertical >
                <Button eventKey="white" className='bg-light'> <i class="fas fa-eraser" style={{color: 'black'}}></i></Button>
                <Button className='bg-light'> <i className="fas fa-pencil-alt" style={{color: 'black'}}></i></Button>
                <ButtonDropdown   direction="right" isOpen={this.state.btnDropright}
                                    toggle={()=>{this.setState({btnDropright: !this.state.btnDropright})}}>
                    <DropdownToggle   si className='bg-light' >
                        <i className="fas fa-palette" style={{color: 'black'}}></i>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem eventKey="black" onClick={() => this.props.onChangeColor("black")} ><i className="fas fa-square" style={{color:'black',}}></i></DropdownItem>
                        <DropdownItem eventKey="red" onClick={() => this.props.onChangeColor("red")}><i className="fas fa-square" style={{color:'red',}}></i></DropdownItem>
                        <DropdownItem eventKey="blue" onClick={() => this.props.onChangeColor("blue")}><i className="fas fa-square" style={{color:'blue',}}></i></DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </ButtonGroup>
        );
    }
}
export default Sidebar;
