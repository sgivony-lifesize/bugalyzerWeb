#!/usr/bin/env node
//import fetch from 'isomorphic-fetch'

/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('express-react:server');
var http = require('http');
var fetch = require('node-fetch');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


fetch("http://httpbin.org/post",
{
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: "POST",
    body: JSON.stringify({a: 1, b: 2})
})
.then(res=>res.json())
.then(res=>console.log('res: ' + res.data))
//.catch(err=>err.json())
.catch(err=>console.log('err: ' + err))






return fetch('https://api.us2.sumologic.com/api/v1/search/jobs', {
    method: 'POST',
    //mode: 'cross-domain',
    credentials: 'include',
    redirect: 'follow',
    headers: {
      'authorization': 'Basic c3UxbXkycGNnNlM0dmo6azNnakNHUElVY1NtTEdON1NWc0VWcXRPbFo2U1Q1Vmo3RUJjckdINGlBdUJXOVpPV092bGk5empYSmg4Qkdsbw==',
      'cache-control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: "{\n  \"query\": \"_sourceCategory=\\\"prod/css/transactions\\\" \\\"CallRoutingState\\\" \\\"callStatus=\\\" | parse \\\"|*|*|\\\" as type,nodeid | parse \\\"ONFERENCE|*|*|*|CallRoutingState|\\\" as confid,participant_id,callmanager_id | parse \\\"to.email=*, to.displayName=*, to.group=*,\\\" as to_email,to_displayname,to_group | parse \\\"to.userID=*, to.extension=*,\\\" as to_userID,to_extension |parse \\\"callStatus=*, dialString=*, destination.uri.user=*, destination.uri.host=*, from.userID=*, from.extension=*, from.email=*, from.displayName=*, from.group=*, from.provisioned=*, from.registered=*, from.guest=*, from.uri.user=*, from.interface=*, from.protocol=*, from.IP=*, from.vendorIdentifier.productID=*, from.vendorIdentifier.versionID=*, from.alias.E164=*, from.alias.H323ID=*, from.alias.URLID=*, from.alias.EMAILID=*, from.alias.TRANSPORTADDRESS=*, from.alias.PARTYNUMBER=*, from.alias.SIPURI=*, from.alias.x-DeviceId=*, from.alias.cssParticipantId=*,\\\" as callStatus, dialString, destination_uri_user, destination_uri_host, from_userID, from_extension, from_email, from_displayName, from_group, from_provisioned, from_registered, from_guest, from_uri_user, from_interface, from_protocol, from_IP, from_vendorIdentifier_productID, from_vendorIdentifier_versionID, from_alias_E164, from_alias_H323ID, from_alias_URLID, from_alias_EMAILID, from_alias_TRANSPORTADDRESS, from_alias_PARTYNUMBER, from_alias_SIPURI, from_alias_x_DeviceId, from_alias_cssParticipantId |parse regex field=from_alias_SIPURI \\\"sip:(?<test>.*?)@\\\" nodrop |_messagetime as _timeslice |if (isempty(from_extension),test,from_extension) as from_extension |if (isempty(from_extension),from_uri_user,from_extension) as from_extension |where from_extension matches \\\"6598550\\\" |count by _timeslice,nodeid,confid,callstatus,dialstring,from_extension,to_userID,to_extension,from_displayname,to_displayname |sort by _timeslice asc //|count confid |fields -_count\",\n  \"from\": \"2017-12-20T10:00:00\",\n  \"to\": \"2017-12-20T23:00:00\",\n  \"timeZone\": \"CST\"\n}\n",
}).then(res => res.json())
  .then(res => console.log('res id is ' + res.id))
  // .then(json => this.setState({ message: json.id }))
  // .then(res=>res.json())
  // .then(res => console.log(res));
.catch(err => {
  console.log(err);
  res.json({
    a: 8,
    b: 9,
    id: "lpll"
  });
});





/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
