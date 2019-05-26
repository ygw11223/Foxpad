import React from 'react';
import {Button, ButtonGroup,ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu} from 'reactstrap';

// TODO : change position method when adding multiple canvas
const styleNavbar = {
  zIndex: '5',
  position: 'absolute',
  height: '50px',
  borderRadius: '0 25px 25px 0',
  width: '50px',
  fontSize: '150%',
  border: 0,
  outline: 0,
  boxShadow: 'none',
};

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {show: true};
    }

    componentDidMount() {
       this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(null)
    }

    render() {
        let left = this.props.hideNavbar ? '0' : '212px';
        let top = this.props.mobile ? '450px' : '600px';
        top = this.props.landscape ? ((window.innerHeight - 50) / 2) + 'px' : top;
        var display = (this.props.mobile && this.props.landscape && !this.state.show) ? 'none' :'block';

        const style = {
            ...styleNavbar,
            left: left,
            top: top,
            backgroundColor: this.props.color,
            transition: '0.5s',
            display: display,
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
