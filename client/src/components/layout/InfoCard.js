import React, { Component } from 'react';
import {Card, CardText, CardBody, CardTitle} from 'reactstrap';
import './style.css'

const followIcon = require('./follow.png');

// Set flexShrink to fix card size
const InfoCardStyle = {
    height: '100%',
    width: '100%',
    padding: '0px 25px 0 50px',
    margin: 0,
    borderRadius: '0 0 25px 0',
    verticalAlign: 'middle',
};

const cardDivStyle = {
    height: '100px',
    width: '150px',
    position: 'relative',
    padding: 0,
    margin: 0,
    borderRadius: '0 0 25px 0',
    textAlign: 'center',
    flexShrink: 0,
    fontWeight: 'bold',
    transition: '0.5s',
    touchAction: 'none',
}

class InfoCard extends Component {
    constructor (props) {
        super(props);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.renderFollowIcon = this.renderFollowIcon.bind(this);
        this.onTouch = this.onTouch.bind(this);
    }

    onMouseOver (e) {
        if (this.props.color !== 'gray') {
            this.props.updateHoverId(this.props.id);
        } else {
            this.props.updateHoverId(0);
        }
    }

    onTouch(e) {
        e.preventDefault();
        if (this.props.hoverId != this.props.id) {
            this.props.updateHoverId(this.props.id);
        } else {
            this.props.lockCard(this.props.name);
        }
    }

    componentDidMount(){
        let id = this.props.name + 'card';
        document.getElementById(id).addEventListener('touchstart',  this.onTouch, { passive: false });
    }

    renderFollowIcon() {
        if (this.props.followId === this.props.id) {
            return(<img src={followIcon} style={{
                position: 'relative',
                top: '-100px',
                left: '-50px',
                width: '50px',
                padding: '5px 2.5px 5px 27.5px',
                height: '100px',
                backgroundColor: '#292929',
                opacity: '0.76',
            }}/>)
        }
    }

    render() {
        // Set offset of each card according to which card the user hovers
        var offset = this.props.id * -125;
        if (this.props.hoverId && this.props.id >= this.props.hoverId) {
            offset += 100;
        }
        if (this.props.followId && this.props.hoverId !== this.props.followId && this.props.id >= this.props.followId) {
            offset += 100;
        }

        const styleC = {
            ...InfoCardStyle,
            background: this.props.color,
        }
        const styleD = {
            ...cardDivStyle,
            left: offset,
            zIndex: 100 - this.props.id, // Allow left card cover right card.
            boxShadow: '0px 0px 5px #000000',
        }
        const len_name = this.props.name.length - 6;

        return (
            <div id={this.props.name+'card'} style={styleD} 
                onClick={() => {this.props.lockCard(this.props.name)}}>
                <Card style={styleC}
                    onMouseOver={this.onMouseOver}>
                    <CardBody className='nametext' style={{padding: 5}}>
                        <CardText> {this.props.name.substr(0, len_name)} </CardText>
                    </CardBody>
                </Card>
                {this.renderFollowIcon()}
            </div>
        );
    }
}

export default InfoCard;