var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var sprintf = require("sprintf-js").sprintf

const url = 'https://api.us2.sumologic.com/api/v1/search/jobs/';
const query1 = "{\n  \"query\": \"_sourceCategory=\\\"prod/css/transactions\\\" \\\"CallRoutingState\\\" \\\"callStatus=\\\" | parse \\\"|*|*|\\\" as type,nodeid | parse \\\"ONFERENCE|*|*|*|CallRoutingState|\\\" as confid,participant_id,callmanager_id | parse \\\"to.email=*, to.displayName=*, to.group=*,\\\" as to_email,to_displayname,to_group | parse \\\"to.userID=*, to.extension=*,\\\" as to_userID,to_extension |parse \\\"callStatus=*, dialString=*, destination.uri.user=*, destination.uri.host=*, from.userID=*, from.extension=*, from.email=*, from.displayName=*, from.group=*, from.provisioned=*, from.registered=*, from.guest=*, from.uri.user=*, from.interface=*, from.protocol=*, from.IP=*, from.vendorIdentifier.productID=*, from.vendorIdentifier.versionID=*, from.alias.E164=*, from.alias.H323ID=*, from.alias.URLID=*, from.alias.EMAILID=*, from.alias.TRANSPORTADDRESS=*, from.alias.PARTYNUMBER=*, from.alias.SIPURI=*, from.alias.x-DeviceId=*, from.alias.cssParticipantId=*,\\\" as callStatus, dialString, destination_uri_user, destination_uri_host, from_userID, from_extension, from_email, from_displayName, from_group, from_provisioned, from_registered, from_guest, from_uri_user, from_interface, from_protocol, from_IP, from_vendorIdentifier_productID, from_vendorIdentifier_versionID, from_alias_E164, from_alias_H323ID, from_alias_URLID, from_alias_EMAILID, from_alias_TRANSPORTADDRESS, from_alias_PARTYNUMBER, from_alias_SIPURI, from_alias_x_DeviceId, from_alias_cssParticipantId |parse regex field=from_alias_SIPURI \\\"sip:(?<test>.*?)@\\\" nodrop |_messagetime as _timeslice |if (isempty(from_extension),test,from_extension) as from_extension |if (isempty(from_extension),from_uri_user,from_extension) as from_extension |where from_extension matches \\\"%s\\\" |count by _timeslice,nodeid,confid,callstatus,dialstring,from_extension,to_userID,to_extension,from_displayname,to_displayname |sort by _timeslice asc //|count confid |fields -_count\",\n  \"from\": \"%s\",\n  \"to\": \"%s\",\n  \"timeZone\": \"%s\"\n}\n";
const query2 = "{   \"query\": \"(_sourceCategory=\\\"prod/css/cdr\\\" ) or (_sourceCategory=\\\"prod/css/calltrace\\\" \\\"call-ID assigned to CallHandlerJSON\\\") | if(_raw matches \\\"*CSS-1.2|*\\\", 2, 1) as stream| parse \\\"*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|\\\" as CssVersion,node_id,confid,callHandlerID,RemoteEndpointID,Direction,ProtocolStack,CallSetupResult,TerminationReason,VerboseTerminationDetails,from_extension,CallerID,CallerIPandPort,CallerProductandVersion,CalledUserID,to,CalledIPandPort,CalledProductandVersion,SetupTimestamp,ConnectedTimestamp,DisconnectedTimestamp,ConnectionDuration,CallType,Encryption nodrop|parse regex field=callerid \\\"sips:(?<test>.*?)@\\\" nodrop|parse regex field=callerid \\\"sip:(?<test2>.*?)@\\\" nodrop |parse regex field=to \\\"sips:(?<to>.*?)@\\\" nodrop|parse regex field=_sourcehost \\\"(?<node>.*)-\\\"| parse \\\"CallTrace\t|UNKNOWN|*|\\\" as first_ib nodrop| parse \\\" call-ID: *] \\\" as callid nodrop|_messagetime as _timeslice|if (isempty(test),test2,test) as test3|if (isempty(from_extension),test3,from_extension) as from_extension|if (!(callHandlerID  matches(\\\"*CLUSTER*\\\")) and direction matches \\\"IB\\\",\\\"First Leg\\\",\\\"\\\") as Leg_type|count by _timeslice,stream,node,node_id,from_extension,callHandlerID,to,direction,SetupTimestamp,ConnectedTimestamp,DisconnectedTimestamp,first_ib,callid,Leg_type| join( where stream=1) as t1, ( where stream=2) as t2 on t2.callHandlerID=t1.first_ib|count by t2_node,t2_node_id,t2_from_extension,t2_Leg_type,t2_callHandlerID,t1_callid,t2_to,t2_direction,t2_SetupTimestamp,t2_ConnectedTimestamp,t2_DisconnectedTimestamp|t2_node as node|t2_node_id as node_id|t2_from_extension as from_extension|t2_callHandlerID as callHandlerID|t1_callid as callid|t2_Leg_type as Leg_type|t2_to as to|t2_direction as direction|t2_SetupTimestamp as SetupTimestamp|t2_ConnectedTimestamp as ConnectedTimestamp|t2_DisconnectedTimestamp as DisconnectedTimestamp|where t2_from_extension matches \\\"%s\\\"|sort by t2_node,t1_callid|fields-_count,t2_node_id,t2_from_extension,t2_callHandlerID,t1_callid,t2_node,t2_Leg_type,t2_to,t2_direction,t2_SetupTimestamp,t2_ConnectedTimestamp,t2_DisconnectedTimestamp\",   \"from\": \"%s\",  \"to\": \"%s\",   \"timeZone\": \"%s\" } ";

const query3 = "{ \"query\": \"(_sourceCategory=prod/css/cdr ) or (_sourceCategory=prod/css/calltrace  call-ID assigned to CallHandlerJSON)\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }";


// working!
const query4 = "{ \"query\": \"_sourceCategory=\\\"prod/css/transactions\\\" \\\"CallRoutingState\\\" \\\"callStatus=\\\" | parse \\\"|*|*|\\\" as type,nodeid | parse \\\"ONFERENCE|*|*|*|CallRoutingState|\\\" as confid,participant_id,callmanager_id| parse \\\"to.email=*, to.displayName=*, to.group=*,\\\" as to_email,to_displayname,to_group| parse \\\"to.userID=*, to.extension=*,\\\" as to_userID,to_extension |parse \\\"callStatus=*, dialString=*, destination.uri.user=*, destination.uri.host=*, from.userID=*, from.extension=*, from.email=*, from.displayName=*, from.group=*, from.provisioned=*, from.registered=*, from.guest=*, from.uri.user=*, from.interface=*, from.protocol=*, from.IP=*, from.vendorIdentifier.productID=*, from.vendorIdentifier.versionID=*, from.alias.E164=*, from.alias.H323ID=*, from.alias.URLID=*, from.alias.EMAILID=*, from.alias.TRANSPORTADDRESS=*, from.alias.PARTYNUMBER=*, from.alias.SIPURI=*, from.alias.x-DeviceId=*, from.alias.cssParticipantId=*,\\\" as callStatus, dialString, destination_uri_user, destination_uri_host, from_userID, from_extension, from_email, from_displayName, from_group, from_provisioned, from_registered, from_guest, from_uri_user, from_interface, from_protocol, from_IP, from_vendorIdentifier_productID, from_vendorIdentifier_versionID, from_alias_E164, from_alias_H323ID, from_alias_URLID, from_alias_EMAILID, from_alias_TRANSPORTADDRESS, from_alias_PARTYNUMBER, from_alias_SIPURI, from_alias_x_DeviceId, from_alias_cssParticipantId|parse regex field=from_alias_SIPURI \\\"sip:(?<test>.*?)@\\\" nodrop|parse regex field=_sourcehost \\\"(?<node>.*)-\\\"|_messagetime as _timeslice|if (isempty(from_extension),test,from_extension) as from_extension|if (isempty(from_extension),from_uri_user,from_extension) as from_extension|where from_extension matches \\\"%s\\\"|count by _timeslice,node,confid,callstatus,dialstring,from_extension,to_userID,to_extension,from_displayname,to_displayname|sort by _timeslice asc|fields -_count\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }";

const query5 = "{ \"query\": \"(_sourceCategory=prod/css/cdr ) or (_sourceCategory=prod/css/calltrace  \\\"call-ID\\\" \\\"assigned to CallHandlerJSON\\\")| if(_raw matches \\\"*CSS-1.2|*\\\", 2, 1) as stream| parse \\\"*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|\\\" as CssVersion,node_id,confid,callHandlerID,RemoteEndpointID,Direction,ProtocolStack,CallSetupResult,TerminationReason,VerboseTerminationDetails,from_extension,CallerID,CallerIPandPort,CallerProductandVersion,CalledUserID,to,CalledIPandPort,CalledProductandVersion,SetupTimestamp,ConnectedTimestamp,DisconnectedTimestamp,ConnectionDuration,CallType,Encryption nodrop|parse regex field=callerid \\\"sips:(?<test>.*?)@\\\" nodrop|parse regex field=callerid \\\"sip:(?<test2>.*?)@\\\" nodrop|parse regex field=to \\\"sips:(?<to>.*?)@\\\" nodrop|parse regex field=_sourcehost \\\"(?<node>.*)-\\\"| parse \\\"CallTrace\t|UNKNOWN|*|\\\" as first_ib nodrop| parse \\\" call-ID: *] \\\" as callid nodrop|_messagetime as _timeslice|if (isempty(test),test2,test) as test3|if (isempty(from_extension),test3,from_extension) as from_extension|if (!(callHandlerID  matches(\\\"*CLUSTER*\\\")) and direction matches \\\"IB\\\",\\\"First Leg\\\",\\\"\\\") as Leg_type|count by _timeslice,stream,node,node_id,from_extension,callHandlerID,to,direction,SetupTimestamp,ConnectedTimestamp,DisconnectedTimestamp,first_ib,callid,Leg_type| join ( where stream=1) as t1,( where stream=2) as t2 on t2.callHandlerID=t1.first_ib |count by t2_node,t2_node_id,t2_from_extension,t2_Leg_type,t2_callHandlerID,t1_callid,t2_to,t2_direction,t2_SetupTimestamp,t2_ConnectedTimestamp,t2_DisconnectedTimestamp|t2_node as node|t2_node_id as node_id|t2_from_extension as from_extension|t2_callHandlerID as callHandlerID|t1_callid as callid|t2_Leg_type as Leg_type|t2_to as to|t2_direction as direction|t2_SetupTimestamp as SetupTimestamp|t2_ConnectedTimestamp as ConnectedTimestamp|t2_DisconnectedTimestamp as DisconnectedTimestamp|where t2_from_extension matches \\\"%s\\\"|sort by t2_node,t1_callid|fields -_count,t2_node_id,t2_from_extension,t2_callHandlerID,t1_callid,t2_node,t2_Leg_type,t2_to,t2_direction,t2_SetupTimestamp,t2_ConnectedTimestamp,t2_DisconnectedTimestamp\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }";


var coo;
var jobId;

const fetchOptions = {
  // mode: 'cross-domain',
  credentials: 'include',
  redirect: 'follow',
  headers: {
    'authorization': 'Basic c3UxbXkycGNnNlM0dmo6azNnakNHUElVY1NtTEdON1NWc0VWcXRPbFo2U1Q1Vmo3RUJjckdINGlBdUJXOVpPV092bGk5empYSmg4Qkdsbw==',
    'cache-control': 'no-cache',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
}

var sleep = (ms) => function() {
  return new Promise((resolve) =>
    setTimeout(resolve.bind(null, ...arguments), ms)
  );
};

router.use(bodyParser.json());
router.post('/find', function(req, res, next) {
  console.log('/find called');
  console.log('Extension: ' + req.body.extension);
  console.log('From:      ' + req.body.from);
  console.log('To:        ' + req.body.to);
  console.log('Time Zone: ' + req.body.timeZone);

  fetchOptions.method = 'POST';
  fetchOptions.body = sprintf(query1, req.body.extension, req.body.from, req.body.to, req.body.timeZone);
  return fetch(url, fetchOptions)
  // .then(r => console.log('Cookies: ' + r.headers.getAll('set-cookie')))
  .then(r => {
    coo = r.headers.getAll('set-cookie');
    console.log('Cookies:   ' + coo);
    return r.json();
  })
  .then(json => {
    console.log('JOB ID:    ' + json.id);
    jobId = json.id;
    fetchOptions.method = 'GET';
    fetchOptions.body = sprintf(query1, req.body.extension, req.body.from, req.body.to, req.body.timeZone);
    fetchOptions.headers.cookie = coo;
    console.log('Waiting for job ' + jobId + '...');
  })
  .then(sleep(3000))
  .then(() => {
    return fetch(url + jobId + '/messages?offset=0&limit=100', fetchOptions)
    .then(r => r.json())
    .then(json => {
      var f = json.messages[0].map.from_displayname;
      var t = json.messages[0].map.to_displayname;
      //console.log('Response: ' + JSON.stringify(json.messages[0], null, 2));
      console.log('--> Found a call from ' + f + ' to ' + t);
      json.sumoJobId = jobId;
      json.success = true;
      return res.send(json);
    })
    .catch(err => {
      console.log(err);
      return res.json({ success: false });
    });
  })
});

module.exports = router;
