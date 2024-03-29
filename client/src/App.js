import React, { Component } from 'react';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom'
import CanvasBoard from './components/canvas/CanvasBoard'
import Login from './components/dashboard/Login'
import Dashboard from './components/dashboard/Dashboard'
import Indirect from './components/dashboard/Indirect'


class App extends Component {
  render() {
    return (
        <BrowserRouter>
            <div className="App" style={{ height:'100%', width:'100%'}}>
                <Switch>
                    <Route exact path='/canvas/:id' component={CanvasBoard} />
                    <Route exact path='/dashboard' component={Dashboard}/>
                    <Route exact path='/login' component={Login}/>
                    <Route exact path='/' component={Indirect}/>
                    <Route render={() => <Redirect to={{pathname: "/dashboard"}} />} />
                </Switch>
            </div>
        </BrowserRouter>
    );
  }
}

export default App;
