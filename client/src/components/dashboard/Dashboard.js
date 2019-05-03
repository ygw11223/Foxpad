import React, {Component} from 'react'
import Card from 'react-bootstrap/Card'
import CardDeck from 'react-bootstrap/CardDeck'
import  { Redirect } from 'react-router-dom'
import Cookies from 'universal-cookie'

import './dashboard.css'

const cookies = new Cookies();

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {toCanvas: false, toLogin: false, id: null};
        this.newCanvas = this.newCanvas.bind(this);
        this.onReadyStateChange = this.onReadyStateChange.bind(this);
        this.renderCards = this.renderCards.bind(this);
        this.timeDifference = this.timeDifference.bind(this);
        this.xmlHttp = new XMLHttpRequest();
        this.xmlHttp.onreadystatechange = this.onReadyStateChange;
    }

    timeDifference(current, previous) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed/1000) + ' seconds ago';
        } else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' minutes ago';
        } else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + ' hours ago';
        } else if (elapsed < msPerMonth) {
            return Math.round(elapsed/msPerDay) + ' days ago';
        } else if (elapsed < msPerYear) {
            return Math.round(elapsed/msPerMonth) + ' months ago';
        } else {
            return Math.round(elapsed/msPerYear ) + ' years ago';
        }
    }

    renderCards() {
        let cards = [];
        let canvases = cookies.get('cd_test_canvases');
        let now = new Date().getTime();
        if (canvases === undefined) {
            return;
        }

        canvases = Object.keys(canvases).map(function(key) {
            return [key, canvases[key]];
        });

        canvases.sort(function(first, second) {
            return second[1] - first[1];
        });

        for (let i in canvases) {
            let url = 'canvas/images/' + 'preview' + canvases[i][0] + 1 + '.png'
            cards.push(
                <Card className="dashboard-card"
                    style={{
                    flexShrink: 0,
                    width: '288px',
                    height: '187px',
                    margin: '25px 25px 25px 25px',
                    borderRadius: '8px'}}
                    onClick={() => {this.setState({toCanvas: true, id: canvases[i][0]})}}>
                    <Card.Img variant="top" src={url}/>
                    <Card.Footer style={{height: '25px', paddingTop: 0, paddingBottom: 0,}}>
                        <small className="text-muted">Last opened {this.timeDifference(now, canvases[i][1])}</small>
                    </Card.Footer>
                </Card>
            );
        }

        return(cards);
    }

    componentDidMount() {
        if (cookies.get('cd_user_name') == undefined) {
            this.setState({toLogin: true});
        } else {
            var name = cookies.get('cd_user_name');
            document.getElementById('header').innerHTML = "Welcome " + name;
        }
    }

    newCanvas() {
        this.xmlHttp.open("GET", '/new_room', true);
        this.xmlHttp.send(null);
    }

    onReadyStateChange() {
        if (this.xmlHttp.readyState == 4 && this.xmlHttp.status == 200) {
            var id = this.xmlHttp.responseText;
            this.setState({toCanvas: true, id: id});
        }
    }

    render() {
        if (this.state.toCanvas === true) {
            return <Redirect to={'/canvas/'+this.state.id} />
        }
        else if (this.state.toLogin === true) {
            return <Redirect to={'/login'} />
        }
        return (
            <div id="wrapper">
                <div id="welcome">
                    <h1 id="header">Your Canvases</h1>
                </div>
                <div id="parent">
                    {this.renderCards()}
                    <div id="addCanvas">
                        <button type="button" id="button" class="btn btn-outline-primary" onClick={() => this.newCanvas()}>
                            <b>+</b>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
export default Dashboard;
