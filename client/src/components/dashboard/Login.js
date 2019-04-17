import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import  { Redirect } from 'react-router-dom'
import './login.css'

const logo = require('./foxy2.png');
const cookies = new Cookies();

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {user_name: '', toDashboard: false};
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({user_name: event.target.value});
    }

    onSubmit() {
        cookies.set('cd_user_name', this.state.user_name);
        this.setState({toDashboard: true});
    }

    render() {
        if (this.state.toDashboard === true) {
            return <Redirect to={'/dashboard'} />
        }
        return (
            <div class="parent-container" id="gradient">
                <div class="wrapper">
                    <div class="logo-wrapper">
                        <img src={logo} alt="cute fox logo" />
                    </div>
                    <div class="input-wrapper">
                        <row>
                            <label for="userName" id="user_name">Collaborative Drawing</label>
                            <input type="text" placeholder="What's your name?" s={3} label="userName" id="userName" onChange={this.handleChange}/>
                            <button type="button" id="submitButton" onClick={this.onSubmit}>Start drawing!</button>
                        </row>
                    </div>
                </div>
            </div>
        );
    }
}
export default Login;
