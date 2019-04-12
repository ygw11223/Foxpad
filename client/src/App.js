import React, { Component } from 'react';
import {BrowserRouter, Route} from 'react-router-dom'
import CanvasBoard from './components/canvas/CanvasBoard'
import Login from './components/dashboard/Login'
import Dashboard from './components/dashboard/Dashboard'
import Indirect from './components/dashboard/Indirect'


class App extends Component {
  render() {
    return (
        <BrowserRouter>
            <div className="App" style={{ height:'100%', width:'100%'}}>
                <Route path='/canvas/:id' component={CanvasBoard} />
                <Route path='/' component={Indirect}/>
                <Route path='/dashboard' component={Dashboard}/>
                <Route path='/login' component={Login}/>
            </div>
        </BrowserRouter>
    );
  }
}

export default App;
