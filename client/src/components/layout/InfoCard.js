import React, { Component } from 'react';
import {Card, CardText, CardBody, CardTitle} from 'reactstrap';

const followIcon = require('./follow.png');

// Set flexShrink to fix card size
const InfoCardStyle = {
    height: '100%',
    width: '100%',
    padding: '25px 25px 0 50px',
    margin: 0,
    borderRadius: '0 0 25px 0',
};

const cardDivStyle = {
    height: 100,
    width: 150,
    position: 'relative',
    padding: 0,
    margin: 0,
    borderRadius: '0 0 25px 0',
    textAlign: 'center',
    flexShrink: 0,
    fontWeight: 'bold',
    transition: '0.5s',
}

class InfoCard extends Component {
    constructor (props) {
        super(props);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.renderFollowIcon = this.renderFollowIcon.bind(this);
    }

    onMouseOver () {
        if (this.props.color !== 'gray') {
            this.props.updateHoverId(this.props.id);
        } else {
            this.props.updateHoverId(0);
        }
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
        }

        return (
            <div style={styleD} 
                onClick={() => {this.props.lockCard(this.props.name)}}>
                <Card style={styleC}
                    onMouseOver={this.onMouseOver}>
                    <CardBody style={{padding: 10}}>
                        <CardText> {this.props.name} </CardText>
                    </CardBody>
                </Card>
                {this.renderFollowIcon()}
            </div>
        );
    }
}

export default InfoCard;