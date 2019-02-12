import React, { Component } from 'react';
import {BrowserRouter, Route} from 'react-router-dom'
import Canvas from './components/canvas/Canvas'
import Dropdown from 'react-bootstrap/Dropdown'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import DropdownButton from 'react-bootstrap/DropdownButton'

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
//import MenuItem from 'react-bootstrap/MenuItem'

import './Style.css'

class App extends Component {
  render() {
    return (
        <BrowserRouter>
            <div className="App">
            <h3> Test </h3>

            <div className="inside">
                <ButtonToolbar id="toolbar">
                    <ButtonGroup vertical>
                        <DropdownButton noCaret drop={"right"} title={<i className="fas fa-palette"></i>} id="bg-vertical-dropdown-1" onSelect= {this.props.onSelectColor}>
                            <Dropdown.Item eventKey="red"><i className="fas fa-square" style={{color:'red',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="blue"><i className="fas fa-square" style={{color:'blue',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="green"><i className="fas fa-square" style={{color:'green',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="black"><i className="fas fa-square" style={{color:'black',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="brown"><i className="fas fa-square" style={{color:'brown',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="pink"><i className="fas fa-square" style={{color:'pink',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="gray"><i className="fas fa-square" style={{color:'gray',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="orange"><i className="fas fa-square" style={{color:'orange',}}></i></Dropdown.Item>
                            <Dropdown.Item eventKey="purple"><i className="fas fa-square" style={{color:'purple',}}></i></Dropdown.Item>
                        </DropdownButton>
                        <DropdownButton drop={"right"} noCaret title={<i className="fas fa-pencil-alt"></i>} id="bg-vertical-dropdown-2" onSelect= {this.props.onChangeWidth}>
                            <Dropdown.Item eventKey="1">1.0</Dropdown.Item>
                            <Dropdown.Item eventKey="5">2.0</Dropdown.Item>
                            <Dropdown.Item eventKey="10">3.0</Dropdown.Item>
                            <Dropdown.Item eventKey="15">4.0</Dropdown.Item>
                        </DropdownButton>
                        <DropdownButton noCaret drop={"right"} title={<i className="fas fa-highlighter"></i>} id="bg-vertical-dropdown-3" onSelect= {this.selected}>
                            <Dropdown.Item eventKey="1">Dropdown link</Dropdown.Item>
                            <Dropdown.Item eventKey="2">Dropdown link</Dropdown.Item>
                        </DropdownButton>
                        <Button onClick={this.clicked}> {<i className="fas fa-undo"></i>} </Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </div>

                <Route path='/canvas/:id' component={Canvas}/>
            </div>
        </BrowserRouter>
    );
  }
}

export default App;
