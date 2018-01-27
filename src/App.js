import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Endpoint from './Endpoint.js';
import Node from './Node.js';
import Link from './Link.js';
import CallsChooser from './CallsChooser.js';

var ReactDOM = require('react-dom');

class App extends Component {
  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.searchExtension = this.searchExtension.bind(this);
    this.handleStats = this.handleStats.bind(this);
    this.onCallSelected = this.onCallSelected.bind(this);
    this.state = {
      erroe: false,
      display: false,
      sumoJobId: '',
      calls: []
    };
  }

  searchExtension(userInput) {
    fetch('/api/search', {
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
        console.log("results: " + json.results.length);
        console.log(json);
        var calls = [];
        json.results.forEach((result, i) => {
          calls.push({ key: i, ib: result.node1.ib});
        })
        this.setState({
          json: json.results,
          calls: calls,
          sumoJobId: json.sumoJobId,
        });
      } else {
        this.setState({
          error: true
        })
      }
    });
  }

  searchStats(userInput) {
    fetch('/api/stats', {
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
        console.log(json);
      } else {
        this.setState({
          error: true
        })
      }
    });
  }

  handleStats(evt) {
    var userInput = {
      inboundLeg: ReactDOM.findDOMNode(this.refs.refInboundLeg).value
    }
    if (userInput.inboundLeg === '') {
      this.searchStats({
        inboundLeg: 'sdsdsdsds',
      });
    } else {
      this.searchStats(userInput);
    }
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
      calls: [],
      display: false,
      caller: emptyEndpoint,
      callee: emptyEndpoint
    });

    if (userInput.extension === '' &&
        userInput.from === '' &&
        userInput.to === '' &&
        userInput.timeZone === '') {
      this.searchExtension({
        // extension: '6598550',
        // from:      '2017-12-20T10:00:00',
        // to:        '2017-12-20T23:00:00',
        // timeZone:  'CST'

        // extension: '+14167585550',
        // from:      '2018-01-04T07:00:00',
        // to:        '2018-01-04T10:00:00',
        // timeZone:  'CST'

        // extension: '2549448',
        // from:      '2018-01-10T08:30:00',
        // to:        '2018-01-10T08:40:00',
        // timeZone:  'CST'

        // extension: '2194450',
        // from:      '2018-01-20T00:00:00',
        // to:        '2018-01-20T01:07:00',
        // timeZone:  'CST'

        // extension: '1313',
        // from:      '2018-01-22T09:30:00',
        // to:        '2018-01-22T09:55:00',
        // timeZone:  'CST'

        extension: '6598550',
        from:      '2018-01-22T20:00:00',
        to:        '2018-01-22T21:00:00',
        timeZone:  'CST'
      });
    } else {
      this.searchExtension(userInput);
    }
  }

  getValue(prop) {
    if (prop !== undefined && prop !== "") {
      return prop;
    } else {
      return 'N/A';
    }
  }
  getValueLeg(prop, shortForm) {
    if (prop !== undefined && prop !== "") {
      return shortForm ? prop.substring(prop.length - 4) : prop;
    } else {
      return 'N/A';
    }
  }
  getValueCallId(prop, shortForm) {
    if (prop !== undefined && prop !== "") {
      return shortForm ? prop.substring(0, 12) : prop;
    } else {
      return 'N/A';
    }
  }
  onCallSelected() {
    var myselect = document.getElementById("callSelect");
    var map = this.state.json[myselect.selectedIndex-1];
    this.setState({
      error: false,
      display: true,
      caller: {
        name:      this.getValue(map.caller.name),
        client:    '',
        extension: this.getValue(map.caller.extension),
        ip:        this.getValue(map.from_ip)
      },
      link1: {
        divId: 1,
        callId: this.getValueCallId(map.link1.callId, true),
        callIdFull: this.getValueCallId(map.link1.callId, false)
      },
      node1: {
        index: 1,
        id: this.getValue(map.node1.id),
        name: this.getValue(map.node1.name) + '  [' + this.getValue(map.node1.id) + ']',
        version: '--------------------------------',
        ipExt: this.getValue(map.node1.ipExt),
        ipInt: this.getValue(map.node1.ipInt),
        ib: this.getValueLeg(map.node1.ib, true),
        ibFull: this.getValueLeg(map.node1.ib, false),
        ob: this.getValueLeg(map.node1.ob, true),
        obFull: this.getValueLeg(map.node1.ob, false)
      },
      link2: {
        divId: 2,
        callId: this.getValueCallId(map.link2.callId, true),
        callIdFull: this.getValueCallId(map.link2.callId, false)
      },
      node2: {
        index: 2,
        id: this.getValue(map.node2.id),
        name: this.getValue(map.node2.name) + '  [' + this.getValue(map.node2.id) + ']',
        version: '--------------------------------',
        ipExt: this.getValue(map.node2.ipExt),
        ipInt: this.getValue(map.node2.ipInt),
        ib: this.getValueLeg(map.node2.ib, true),
        ibFull: this.getValueLeg(map.node2.ib, false),
        ob: this.getValueLeg(map.node2.ob, true),
        obFull: this.getValueLeg(map.node2.ob, false)
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
          <br />
          <br />
          <input ref="refInboundLeg" type="text" placeholder="Inbound Leg" />
          <button onClick={this.handleStats}>Search</button>
        </div>
        <CallsChooser calls={this.state.calls} onCallSelected={this.onCallSelected}/>
        <div className="App">
          <h6>Sumo Job ID: {this.state.sumoJobId}</h6>
          <br />
          <br />
          {callFlow}
        </div>
      </div>
    );
  }
}

export default App;
