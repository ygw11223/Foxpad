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
            return Math.round(elapsed/1000) + ' seconds';
        } else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' minutes';
        } else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + ' hours';
        } else if (elapsed < msPerMonth) {
            return Math.round(elapsed/msPerDay) + ' days';
        } else if (elapsed < msPerYear) {
            return Math.round(elapsed/msPerMonth) + ' months';
        } else {
            return Math.round(elapsed/msPerYear ) + ' years';
        }
    }

    renderCards() {
        let cards = [];
        let canvases = cookies.get('cd_test_canvases');
        let now = new Date().getTime();

        if (canvases === undefined) {
            return;
        }
        // Sort canvases based on last open time.
        canvases = Object.keys(canvases).map(function(key) {
            return [key, canvases[key]];
        });
        canvases.sort(function(first, second) {
            return second[1] - first[1];
        });

        for (let i in canvases) {
            let url = 'canvas/images/' + 'preview' + canvases[i][0] + 1 + '.png'
            cards.push(
                <div className="dashboardCard"
                    onClick={() => {this.setState({toCanvas: true, id: canvases[i][0]})}}>
                    <img className='dashboardImg' src={url}/>
                    <div className='dashboardCardFooter'>
                        <div className='footerBackground'></div>
                        <i class="fas fa-history"></i>
                        <b className='time'>{this.timeDifference(now, canvases[i][1])}</b>
                    </div>
                </div>
            );
        }

        return(cards);
    }

    componentDidMount() {
        if (cookies.get('cd_user_name') == undefined) {
            this.setState({toLogin: true});
        } else {
            let name = cookies.get('cd_user_name');
            document.getElementById('hello-name').innerHTML = "Hi! " + name;
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
                <div id="hello">
                    <h1 id="hello-name"></h1>
                </div>
                <div id="welcome">
                    <h1 id="header">Your Canvases</h1>
                </div>
                <div id="parent">
                    {this.renderCards()}
                    <div id="addCanvas">
                        <button type="button" id="button" onClick={() => this.newCanvas()}>
                            <p className='plus'>+</p>
                            <b className='create'>Create New</b>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
export default Dashboard;
