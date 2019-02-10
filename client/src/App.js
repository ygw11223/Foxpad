import React, { Component } from 'react';
import {BrowserRouter, Route} from 'react-router-dom'
import Canvas from './components/canvas/Canvas'
class App extends Component {
  render() {
    return (
        <BrowserRouter>
            <div className="App">
                <h1>Test</h1>
                <Route path='/canvas/:id' component={Canvas}/>
            </div>
        </BrowserRouter>
    );
  }
}

export default App;
