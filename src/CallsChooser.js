import React, { Component } from 'react';
//import './CallsChooser.css';

class CallsChooser extends Component {

  render() {
    if (this.props.calls.length !== 0) {
      var calls = this.props.calls.map(call => {
        return <option key={call.key} value={call.ib}>{call.ib}</option>
      })
      var firstOptionStyle = {
        display: 'none'
      }
      return (
        <div id="calls">
          <br />
          <select name="drop1" id="callSelect" defaultValue="0" onChange={this.props.onCallSelected}>
            <option value="0" disabled style={firstOptionStyle}>Select a call</option>
            {calls}
          </select>
        </div>
      );
    } else {
      return <div />
    }
  }
}

export default CallsChooser;
