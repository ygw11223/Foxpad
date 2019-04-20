import React from 'react';
import {Card, CardText, CardBody, CardTitle} from 'reactstrap';
import InfoCard from './InfoCard'

const stackStyles = {
    zIndex: '5',
    position:'absolute',
    left:'0px',
    top:'0px',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: 0,
    margin: 0,
    background: '#f8f8f8',
    height: 100,
    color: 'white',
    fontWeight: 'bold',
};
const card1Style = {
    zIndex: '100',
    height: 100,
    width: 150,
    padding: 0,
    margin: 0,
    background:'#42c8f4',
    borderRadius: '0 0 25px 0',
    flexShrink: 0,
};

class CardStack extends React.Component {
    constructor (props) {
        super(props);
        this.state = {hoverId : 0, totalIds : 4}
        this.updateHoverId = this.updateHoverId.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    updateHoverId(id) {
        this.setState({hoverId : id});
    }

    onMouseOut() {
        this.setState({hoverId : 0});
    }

    render () {
        const style = {
            ...stackStyles,
            width: 125 + this.state.totalIds*25 + (this.state.hoverId ? 100 : 0),
        }
        return (
            <ul style={style}
                onMouseOut={this.onMouseOut}>
                <Card style={card1Style}>
                    <CardBody style={{padding: 10}}>
                        <CardTitle style={{
                            margin: 0,
                            padding: 0,
                        }}>
                            <b>Canvas 1</b>
                        </CardTitle>
                        <CardText>————<br/>Anze</CardText>
                    </CardBody>
                </Card>
                <InfoCard
                    id={1}
                    name={'Guowei'}
                    color={'#0b8e44'}
                    updateHoverId={this.updateHoverId}
                    hoverId={this.state.hoverId}
                />
                <InfoCard
                    id={2}
                    name={'Joseph'}
                    color={'#e8571e'}
                    updateHoverId={this.updateHoverId}
                    hoverId={this.state.hoverId}
                />
                <InfoCard
                    id={3}
                    name={'Alice'}
                    color={'#cc1c1c'}
                    updateHoverId={this.updateHoverId}
                    hoverId={this.state.hoverId}
                />
            </ul>
        );
    }

}

export default CardStack;