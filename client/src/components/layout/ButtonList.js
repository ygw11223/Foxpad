import React, {Component}  from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu} from 'reactstrap';
import './style.css'

class  ButtonList extends Component {
    constructor(props) {
        super(props);
        this.getButtons = this.getButtons.bind(this);
    }
    getButtons() {
        return this.props.buttons.map((button) =>
            <Button eventKey={button.eventKey}
                    className='bg-light tool-button'
                    onClick={button.onclick} >
                <i class={"fas fa-"+button.icon} style={{color:'black'}}></i>
            </Button>
        );
    }

    render() {
        return this.getButtons();
    }
}

export default ButtonList;
