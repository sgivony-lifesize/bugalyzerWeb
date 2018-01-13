import React, { Component } from 'react';
//import './Node.css';

class Node extends Component {

  render() {
    return (
      <div className="entity" id={"node" + this.props.node.index}>
        <div className="field title">{this.props.node.name}</div>
        <div className="content">
          <div className="field version" id={"node" + this.props.node.index + "_version"}>{this.props.node.version}</div>
          <div className="field nodeIp" id="ipExt">{this.props.node.ipExt}</div>
          <div className="field nodeIp" id="ipInt">{this.props.node.ipInt}</div>
          <div className="legs">
            <div className="leg inboundLeg" id={"node" + this.props.node.index + "IB"}>
              <div className="legTitle">IB</div>
              <div className="legName tooltip">{this.props.node.ib}<span className="tooltiptext">{this.props.node.ibFull}</span></div>
            </div>
            <div className="leg outboundLeg" id={"node" + this.props.node.index + "OB"}>
              <div className="legTitle">OB</div>
              <div className="legName tooltip">{this.props.node.ob}<span className="tooltiptext">{this.props.node.obFull}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Node;
