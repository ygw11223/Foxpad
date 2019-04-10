import React, {Component} from 'react'
import  { Redirect } from 'react-router-dom'
import Cookies from 'universal-cookie'

const cookies = new Cookies();

class Indirect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {toLogin: false};
    }

    componentDidMount() {
        if (cookies.get('cd_user_name') == undefined) {
            this.setState({toLogin: true});
        }
    }

    render() {
        return this.state.toLogin === true ? <Redirect to={'/dashboard'} />
                                           : <Redirect to={'/login'} />;
    }
}
export default Indirect;
