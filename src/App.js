import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Caller from './Caller.js'

var ReactDOM = require('react-dom');

class App extends Component {
  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.searchExtension = this.searchExtension.bind(this);
    this.state = {
      id: 'Please Wait...',
      cookie: 'Cookie',
      caller: 'caller',
      callee: 'callee',
      callerExt: 'callerExt',
      calleeExt: 'calleeExt',
    };
  }

  searchExtension(extension) {
    fetch('/api/id/' + extension, {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(json => this.setState({
      id: json.id,
      cookie: json.cookie
    }));

    setTimeout(function() { //Start the timer
      this.setState({render: true}) //After 1 second, set render to true
    }.bind(this), 2000)

    setTimeout(function() { //Start the timer
      fetch('/api/job/' + this.state.id + '/' + extension)
      //.then(res => console.log(res.cookie))
      .then(res => res.json())
      .then(json => this.setState({
        //job: json.messages[0].map.confid,
        caller: json.messages[0].map.from_displayname,
        callee: json.messages[0].map.to_displayname,
        callerExt: json.messages[0].map.from_extension,
        calleeExt: json.messages[0].map.to_extension,
      }))
      .catch(err => console.log('err ' + err))
      .then(this.setState({ message: "bummer" }))
    }.bind(this), 3000)
  }

  componentDidMount() {
    //this.searchExtension(this.state.extensionFromUser);
  }

  handleSearch(evt) {
    var ext = ReactDOM.findDOMNode(this.refs.extRef).value;
    this.searchExtension(ext);
  }

  render() {
    return (
      <div className="canvas" id="canvas1">
        <div id="callerExtension">
          <input ref="extRef" type="text" />
          <button className="btn btn-primary" onClick={this.handleSearch}>Search</button>
        </div>
        <div className="App">
          <h2>Sumo Job ID: {this.state.id}</h2>
          <Caller name={this.state.caller}
                  client="Lifesize Web Client"
                  extension={this.state.callerExt}
                  ip="82.1.68.119"
          />
          <Caller name={this.state.callee}
                  client="Lifesize Web Client"
                  extension={this.state.calleeExt}
                  ip="82.1.68.119"
          />
        </div>
      </div>
    );
  }
}

export default App;
