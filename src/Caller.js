import React, { Component } from 'react';
//import './Caller.css';

class Caller extends Component {
  constructor() {
    super();
    this.state = {
      id: 'Please Wait...',
      cookie: 'Cookie',
      job: '000',
      caller: 'caller',
      callee: 'callee',
      callerExt: 'callerExt',
      calleeExt: 'calleeExt',
    };
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <div className="entity" id="caller">
        <div className="field title">{this.props.name}</div>
        <div className="content">
          <div className="field version" id="client_name">{this.props.client}</div>
          <div className="field" id="ext">{this.props.extension}</div>
          <div className="field" id="caller_ip">{this.props.ip}</div>
        </div>
      </div>
    );
  }
}

export default Caller;
