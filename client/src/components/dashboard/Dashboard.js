import React, {Component} from 'react';
import Card from 'react-bootstrap/Card'
import CardDeck from 'react-bootstrap/CardDeck'
import  { Redirect } from 'react-router-dom'
import './dashboard.css'

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {toDashboard: false, id: null};
        this.newCanvas = this.newCanvas.bind(this);
        this.onReadyStateChange = this.onReadyStateChange.bind(this);
        this.xmlHttp = new XMLHttpRequest();
        this.xmlHttp.onreadystatechange = this.onReadyStateChange;
    }

    newCanvas() {
        this.xmlHttp.open("GET", '/new_canvas', true);
        this.xmlHttp.send(null);
    }

    onReadyStateChange() {
        if (this.xmlHttp.readyState == 4 && this.xmlHttp.status == 200) {
            var id = this.xmlHttp.responseText;
            this.setState({toDashboard: true, id: id});
        }
    }

    // CardDeck(props) {
    //     const canvasID = props.canvasID;
    //     const cards = canvasID.map((card) =>
    //         <Card>
    //             <Card.Img variant="top" src="http://www.wilddaggerart.com/uploads/1/0/4/1/10415311/s380724976374511844_p214_i1_w1619.jpeg" />
    //             <Card.Footer>
    //                 <small className="text-muted">Last updated 3 mins ago</small>
    //             </Card.Footer>
    //         </Card>
    //     );
    //
    //     return (
    //         <CardDeck> {cards} </CardDeck>
    //     );
    // }

    render() {
        if (this.state.toDashboard === true) {
            return <Redirect to={'/canvas/'+this.state.id} />
        }
        return (
            <div id="wrapper">
                <div id="welcome">
                    <h1 id="header">Welcome Alice</h1>
                </div>
                <div id="parent">
                    <CardDeck>
                        <Card>
                            <Card.Img variant="top" src="http://www.wilddaggerart.com/uploads/1/0/4/1/10415311/s380724976374511844_p214_i1_w1619.jpeg" />
                            <Card.Footer>
                                <small className="text-muted">Last updated 3 mins ago</small>
                            </Card.Footer>
                        </Card>

                        <Card>
                            <Card.Img variant="top" src="http://www.wilddaggerart.com/uploads/1/0/4/1/10415311/s380724976374511844_p214_i1_w1619.jpeg" />
                            <Card.Footer>
                                <small className="text-muted">Last updated 3 mins ago</small>
                            </Card.Footer>
                        </Card>

                        <Card>
                            <Card.Img variant="top" src="http://www.wilddaggerart.com/uploads/1/0/4/1/10415311/s380724976374511844_p214_i1_w1619.jpeg" />
                            <Card.Footer>
                                <small className="text-muted">Last updated 3 mins ago</small>
                            </Card.Footer>
                        </Card>

                        <Card>
                            <Card.Img variant="top" src="http://www.wilddaggerart.com/uploads/1/0/4/1/10415311/s380724976374511844_p214_i1_w1619.jpeg" />
                            <Card.Footer>
                                <small className="text-muted">Last updated 3 mins ago</small>
                            </Card.Footer>
                        </Card>
                    </CardDeck>
                    <div id="addCanvas">
                        <button type="button" id="button" class="btn btn-outline-primary" onClick={() => this.newCanvas()}>
                            <i class="fas fa-plus"></i> Create a new canvas
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
export default Dashboard;
