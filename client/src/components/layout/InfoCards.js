import React from 'react';
import {Card, CardText, CardBody, CardTitle} from 'reactstrap';
import InfoCard from './InfoCard'
import './style.css'

// TODO : Programmatically add and remove cards
class CardStack extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            hoverId : 0, // Card id which user hovers on
            totalIds : 1, // Total number of cards
            name: this.props.name,
            members: {},
            current_canvas: 1,
            followName: null,
        }
        this.updateHoverId = this.updateHoverId.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.lockCard = this.lockCard.bind(this);
        this.followId = 0;
    }

    lockCard(name) {
        if (name === this.state.followName) {
            this.setState({followName: null});
            this.props.releaseFollowing();
        } else {
            this.props.socket.emit('position', name);
            this.setState({followName: name});
        }
    }

    renderCard(key, index, lastCard) {
        if (!lastCard) return;
        let color = (this.state.members[key] !== undefined ? this.state.members[key] : 'gray');
        return <InfoCard
                    id={index+1}
                    name={key}
                    color={color}
                    updateHoverId={this.updateHoverId}
                    hoverId={this.state.hoverId}
                    followId={this.followId}
                    lockCard={this.lockCard}/>
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

    componentWillUnmount() {
        this.props.onRef(null)
    }

    render () {
        let left = this.props.hideNavbar ? '0' : '212px';
        let width = 225 + this.state.totalIds*25 + (this.state.hoverId ? 100 : 0);
        let lastCard = false;
        if (this.state.followName) {
            lastCard = true;
            this.followId = 1;
            for (let key in this.state.members) {
                if (key === this.state.followName) {
                    lastCard = false;
                    break;
                }
                this.followId += 1;
            }
            if (this.state.hoverId !== this.followId) width += 100;
            if (lastCard) width += 25;
        } else {
            this.followId = 0;
        }
        const style = {
            ...stackStyles,
            // Update width of the card deck to prevent white space
            width: width,
            left: left
        };
        const mainCardStyle = {
            ...card1Style,
            background: this.props.color
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
                            <b>Canvas {this.state.current_canvas}</b>
                        </CardTitle>
                        <p style={{
                            padding: 0,
                            margin: 0,
                            fontSize: '10px',
                        }}>————</p>
                        <CardText>Logined in as: <b>{this.state.name}</b></CardText>
                    </CardBody>
                </Card>

                {Object.keys(this.state.members).map((key, index) => this.renderCard(key, index, true))}
                {this.renderCard(this.state.followName, this.followId-1, lastCard)}
            </ul>
        );
    }

}

// TODO : Refine styling according to design
// TODO : change position method when adding multiple canvas
const stackStyles = {
    zIndex: '5',
    position:'absolute',
    top:'0px',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    borderRadius: '0 0 25px 0',
    height: 100,
    color: 'white',
    border: 0,
    transition: '0.5s',
};
// TODO : Pass in background through props
const card1Style = {
    zIndex: '100',
    height: '100px',
    width: '250px',
    padding: '0 0 0 20px',
    margin: 0,
    borderRadius: '0 0 25px 0',
    flexShrink: 0,
    border: 0,
};

export default CardStack;
