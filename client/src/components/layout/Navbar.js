import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu} from 'reactstrap';

// TODO : change position method when adding multiple canvas
const styleNavbar = {
  zIndex: '5',
  position: 'absolute',
  top: '600px',
  height: '50px',
  borderRadius: '0 25px 25px 0',
  width: '50px',
  fontSize: '150%',
  transition: '0.5s',
  border: 0,
  outline: 0,
  boxShadow: 'none',
};

class Navbar extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
       this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    render() {
        let left = this.props.hideNavbar ? '0' : '212px';
        const style = {
            ...styleNavbar,
            left: left,
            backgroundColor: this.props.color,
        }
        return (
            <Button style={style}
                eventKey="white"
                onClick={() => this.props.onHideNavbar()}>
            <b>{this.props.icon}</b>
            </Button>
        );
    }
}

export default Navbar;
