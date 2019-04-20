import React, { Component } from 'react';
import {Card, CardText, CardBody, CardTitle} from 'reactstrap';

const InfoCardStyle = {
    height: 100,
    width: 150,
    position:'relative',
    padding: '25px 0 0 0',
    margin: 0,
    borderRadius: '0 0 25px 0',
    textAlign: 'center',
    flexShrink: 0,
};

class InfoCard extends Component {
    constructor (props) {
        super(props);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    onMouseOver () {
        this.props.updateHoverId(this.props.id);
    }

    onMouseOut () {
    }

    render() {
        var offset = this.props.id * -125;
        if (this.props.hoverId && this.props.id >= this.props.hoverId) {
            offset += 100;
        }

        const style = {
            ...InfoCardStyle,
            left: offset,
            background: this.props.color,
            zIndex: 100 - this.props.id,
        }

        return (
            <Card style={style}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}>

                <CardBody style={{padding: 10}}>
                    <CardText> {this.props.name} </CardText>
                </CardBody>

            </Card>
        );
    }
}

export default InfoCard;