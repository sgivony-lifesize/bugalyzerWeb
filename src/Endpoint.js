import React, { Component } from 'react';
//import './Endpoint.css';

class Endpoint extends Component {

  render() {
    if (this.props.endpoint !== undefined) {
      return (
        <div className="entity" id="caller">
          <div className="field title">{this.props.endpoint.name}</div>
          <div className="content">
            <div className="field version" id="client_name">{this.props.endpoint.client}</div>
            <div className="field" id="ext">{this.props.endpoint.extension}</div>
            <div className="field" id="caller_ip">{this.props.endpoint.ip}</div>
          </div>
        </div>
      );
    } else {
      return <div />
    }
  }
}

export default Endpoint;
