import React from 'react';
import {Card, CardText, CardBody, CardTitle} from 'reactstrap';
import InfoCard from './InfoCard'

// TODO : Refine styling according to design
// TODO : change position method when adding multiple canvas
const stackStyles = {
    zIndex: '5',
    position:'absolute',
    left:'0px',
    top:'0px',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    background: '#f8f8f8',
    height: 100,
    color: 'white',
};
// TODO : Pass in background through props
const card1Style = {
    zIndex: '100',
    height: 100,
    width: 250,
    padding: '0 0 0 20px',
    margin: 0,
    borderRadius: '0 0 25px 0',
    flexShrink: 0,
};

// TODO : Programmatically add and remove cards
class CardStack extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            hoverId : 0, // Card id which user hovers on
            totalIds : 1, // Total number of cards
            name: this.props.name,
            color: '#42c8f4',
            members: {},
        }
        this.updateHoverId = this.updateHoverId.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    renderCard(key, index) {
        return <InfoCard
                    id={index+1}
                    name={key}
                    color={this.state.members[key]}
                    updateHoverId={this.updateHoverId}
                    hoverId={this.state.hoverId}/>
    }

    updateHoverId(id) {
        this.setState({hoverId : id});
    }

    onMouseOut() {
        this.setState({hoverId : 0});
    }

    componentDidMount() {
       this.props.onRef(this);
    }

    render () {
        const style = {
            ...stackStyles,
            // Update width of the card deck to prevent white space
            width: 225 + this.state.totalIds*25 + (this.state.hoverId ? 100 : 0),
        };
        const mainCardStyle = {
            ...card1Style,
            background: this.state.color
        };

        return (
            <ul style={style}
                onMouseOut={this.onMouseOut}>
                <Card style={mainCardStyle}>
                    <CardBody style={{padding: '0 0 0 0'}}>
                        <CardTitle style={{
                            margin: 0,
                            padding: 0,
                            fontSize: '200%'
                        }}>
                            <b>Canvas 1</b>
                        </CardTitle>
                        <p style={{
                            padding: 0,
                            margin: 0,
                            fontSize: '10px',
                        }}>————</p>
                        <CardText>Logined in as: <b>{this.state.name}</b></CardText>
                    </CardBody>
                </Card>

                {Object.keys(this.state.members).map((key, index) => this.renderCard(key, index))}
            </ul>
        );
    }

}

export default CardStack;
