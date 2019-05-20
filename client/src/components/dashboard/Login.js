import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import  { Route, Redirect } from 'react-router-dom'
import './login.css'

const logo = require('./foxy2.png');
const arrow = require('./right-arrow.png');
const cookies = new Cookies();

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {user_name: '', toDashboard: false, toCanvas: false, fromCanvas: false};
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        console.log("In componentdidmount");
        console.log(this.props.location);
    }

    handleChange(event) {
        this.setState({user_name: event.target.value});
    }

    onSubmit(e) {
        e.preventDefault();
        cookies.set('cd_user_name', this.state.user_name,  {path: '/'});
        console.log(this.props.location);
        if (this.props.location.state === undefined) {
            this.setState({toDashboard: true});
        }
        else {
            this.setState({toCanvas: true});
        }
    }

    render() {
        if (this.state.toDashboard === true) {
            return <Redirect to={'/dashboard'} />
        }
        else if (this.state.toCanvas === true) {
            return <Redirect to={'/canvas/'+this.props.location.state.room_id} />
        }
        return (
            <div class="parent-container" id="gradient">
                <div class="wrapper">
                    <div class="logo-wrapper">
                        <img src={logo} alt="cute fox logo" />
                    </div>
                    <div class="input-wrapper">
                        <row>
                            <label for="userName" id="user_name">Before we start</label>
                            <p id="name_text">How do you want other people know you by?</p>
                            <form onSubmit={this.onSubmit}>
                                <div id="wrappinginput">
                                    <input type="text" placeholder="Enter name here" s={3} label="userName" id="userName" onChange={this.handleChange}/>
                                    <button type="submit" id="submitButton"><img src={arrow} alt="arrow" id="arrow"/></button>
                                </div>
                            </form>
                        </row>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
