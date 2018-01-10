import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      id: 'BLA',
      cookie: 'Cookie',
      job: '000',
      caller: 'caller',
      callee: 'callee',
      callerExt: 'callerExt',
      calleeExt: 'calleeExt',
    };
  }

  componentDidMount() {
    fetch('/api/id', {
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
      fetch('/api/job/' + this.state.id)
      //.then(res => console.log(res.cookie))
      .then(res => res.json())
      .then(json => this.setState({
        job: json.messages[0].map.confid,
        caller: json.messages[0].map.from_displayname,
        callee: json.messages[0].map.to_displayname,
        callerExt: json.messages[0].map.from_extension,
        calleeExt: json.messages[0].map.to_extension,
        //caller:
      }))
      .catch(err => console.log('err ' + err))
      .then(this.setState({ message: "bummer" }))
    }.bind(this), 3000)
  }

  render() {
    return (
      <div className="App">
        <div /*className="App-header"*/>
          <h2>{this.state.id}</h2>
          <h4>{this.state.job}</h4>
          <div>Caller: {this.state.caller}  {this.state.callerExt}</div>
          <div>Callee: {this.state.callee}  {this.state.calleeExt}</div>
        </div>
      </div>
    );
  }
}

export default App;
