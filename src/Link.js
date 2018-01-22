import React, { Component } from 'react';
//import './Link.css';

class Link extends Component {

  render() {
    return (
      <div className="link tooltip" id={"link" + this.props.link.divId}>{this.props.link.callId}<span className="tooltiptext">{this.props.link.callIdFull}</span></div>
    );
  }
}

export default Link;
