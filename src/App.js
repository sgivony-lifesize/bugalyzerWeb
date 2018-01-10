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
      id: '',
      cookie: 'Cookie',
      caller: 'caller',
      callee: 'callee',
      callerExt: 'callerExt',
      calleeExt: 'calleeExt',
    };
  }

  searchExtension(userInput) {
    this.setState({id: 'Please Wait...'});
    fetch('/api/id/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userInput)
    })
    .then(res => res.json())
    .then(json => this.setState({
      id: json.id,
      cookie: json.cookie
    }));

    setTimeout(function() { //Start the timer
      this.setState({render: true}) //After 1 second, set render to true
    }.bind(this), 2000)

    setTimeout(function() {
      userInput.id = this.state.id;
      fetch('/api/job/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInput)
      })
      //.then(res => console.log(res.cookie))
      .then(res => res.json())
      // .then(json => console.log(json))
      .then(json => {
        var map = json.messages[0].map;
        this.setState({
          //job: json.messages[0].map.confid,
          caller: map.from_displayname,
          callee: map.to_displayname,
          callerExt: map.from_extension,
          calleeExt: map.to_extension,
          srcIp: map.from_ip
        });
        console.log(json);
      })
    //)
      .catch(err => console.log('err ' + err))
      .then(this.setState({ message: "bummer" }))
    }.bind(this), 3000)
  }

  componentDidMount() {
    //this.searchExtension(this.state.extensionFromUser);
  }

  handleSearch(evt) {
    var userInput = {
      extension: ReactDOM.findDOMNode(this.refs.refExt).value,
      from: ReactDOM.findDOMNode(this.refs.refTimeFrom).value,
      to: ReactDOM.findDOMNode(this.refs.refTimeTo).value,
      timeZone: ReactDOM.findDOMNode(this.refs.refTimeZone).value
    }
    this.searchExtension(userInput);
  }

  render() {
    return (
      <div className="canvas" id="canvas1">
        <div id="userInput">
          <input ref="refExt" type="text"/>
          <input ref="refTimeFrom" type="text" />
          <input ref="refTimeTo" type="text" />
          <input ref="refTimeZone" type="text" />
          <button onClick={this.handleSearch}>Search</button>
        </div>
        <div className="App">
          <h4>Sumo Job ID: {this.state.id}</h4>
          <Caller name={this.state.caller}
                  client="Lifesize Web Client"
                  extension={this.state.callerExt}
                  ip={this.state.srcIp}
          />
          <Caller name={this.state.callee}
                  client="Lifesize Web Client"
                  extension={this.state.calleeExt}
                  ip="999.888.777.666"
          />
        </div>
      </div>
    );
  }
}

export default App;
