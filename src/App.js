import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Endpoint from './Endpoint.js';
import Node from './Node.js';
import Link from './Link.js';

var ReactDOM = require('react-dom');

class App extends Component {
  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.searchExtension = this.searchExtension.bind(this);
    this.state = {
      erroe: false,
      display: false,
      sumoJobId: '',
    };
  }

  searchExtension(userInput) {
    fetch('/api/find', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userInput)
    })
    .then(res => res.json())
    .then(json => {
      console.log("success: " + json.success);
      if (json.success) {
        var map = json.messages[0].map;
        this.setState({
          error: false,
          display: true,
          sumoJobId: json.sumoJobId,
          caller: {
            name:      map.from_displayname,
            client:    '',
            extension: map.from_extension,
            ip:        map.from_ip
          },
          link1: {
            divId: 1,
            callId: '-----',
            callIdFull: '-'
          },
          node1: {
            index: 1,
            name: '-----------------------------------',
            version: '-',
            ipExt: '-',
            ipInt: '-',
            ib: '-',
            ibFull: '-',
            ob: '-',
            obFull: '-'
          },
          link2: {
            divId: 2,
            callId: '-----',
            callIdFull: '-'
          },
          node2: {
            index: 2,
            name: '-----------------------------------',
            version: '-',
            ipExt: '-',
            ipInt: '-',
            ib: '-',
            ibFull: '-',
            ob: '-',
            obFull: '-'
          },
          link3: {
            divId: 3,
            callId: '-----',
            callIdFull: '-'
          },
          callee: {
            name:      map.to_displayname,
            client:    '',
            extension: map.to_extension,
            ip:        map.to_ip
          },
        });
      } else {
        this.setState({
          error: true
        })
      }
    });
  }

  handleSearch(evt) {
    var userInput = {
      extension: ReactDOM.findDOMNode(this.refs.refExt).value,
      from:      ReactDOM.findDOMNode(this.refs.refTimeFrom).value,
      to:        ReactDOM.findDOMNode(this.refs.refTimeTo).value,
      timeZone:  ReactDOM.findDOMNode(this.refs.refTimeZone).value
    }

    var emptyEndpoint = undefined;
    this.setState({
      sumoJobId: 'Please Wait...',
      display: false,
      caller: emptyEndpoint,
      callee: emptyEndpoint
    });

    // this.searchExtension(userInput);
    this.searchExtension({
      extension: '6598550',
      from:      '2017-12-20T10:00:00',
      to:        '2017-12-20T23:00:00',
      timeZone:  'CST'

      // extension: '+14167585550',
      // from:      '2018-01-04T07:00:00',
      // to:        '2018-01-04T10:00:00',
      // timeZone:  'CST'

      // extension: '2549448',
      // from:      '2018-01-10T08:30:00',
      // to:        '2018-01-10T08:40:00',
      // timeZone:  'CST'
    });
  }

  render() {
    var callFlow;
    if (this.state.error) {
      callFlow = (
        <div>Oops... Error!</div>
      );
    }
    else if (this.state.display) {
      callFlow = (
        <div id="callFlow">
          <Endpoint endpoint={this.state.caller}/>
          <Link     link={this.state.link1} />
          <Node     node={this.state.node1} />
          <Link     link={this.state.link2} />
          <Node     node={this.state.node2} />
          <Link     link={this.state.link3} />
          <Endpoint endpoint={this.state.callee}/>
        </div>
      );
    } else {
      callFlow = <div>---</div>
    }
    return (
      <div className="canvas" id="canvas1">
        <div id="userInput">
          <input ref="refExt" type="text" placeholder="Caller Extension" autoFocus/>
          <input ref="refTimeFrom" type="text" placeholder="From Time" />
          <input ref="refTimeTo" type="text" placeholder="To Time" />
          <input ref="refTimeZone" type="text" placeholder="Time Zone" />
          <button onClick={this.handleSearch}>Search</button>
        </div>
        <div className="App">
          <h6>Sumo Job ID: {this.state.sumoJobId}</h6>
          {callFlow}
        </div>
      </div>
    );
  }
}

export default App;
