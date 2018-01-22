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

const query6 =
"{ \"query\": \"(_sourceCategory=prod/css/calltrace \\\"referenceCallID\\\" or \\\"assigned to CallHandlerJSON\\\" or (\\\"play\\\"and \\\"OUTBOUND\\\"))" +
"| if(_raw matches \\\"*referenceCallID*\\\", 2, if(_raw matches \\\"*play*\\\", 3, 1)) as stream" +
"| _messagetime as _timeslice" +
"| parse \\\"|CallTrace\\t|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|TlcCall [ptr: *, call-ID: *] assigned to CallHandlerJSON [ptr: *, call-ID: *]\\\"" +
" as inbound,ptr1,sip_id,ptr2,uk1 nodrop" +
// "| where !(inbound matches \\\"*CLUSTER*\\\")" +
// "| parse \\\"|CallTrace\\t|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|Creating Call Handler. referenceCallID:[*] \\\" as outbound,inbound nodrop" +
// "| parse \\\"|OUTBOUND|*|\\\" as outbound nodrop" +
// "| parse \\\"callmgrtag=*;\\\" as callmgrtag nodrop" +
// "| count by _timeslice,inbound,outbound,sip_id,callmgrtag,stream" +
// "| join " +
// "( where stream=1 ) as t1," +
// "( where stream=2 ) as t2," +
// "( where stream=3 ) as t3 " +
// "on t2.inbound=t1.inbound and t3.outbound=t2.outbound" +
// "| formatDate(t1__timeslice, \\\"MM/dd/yyyy HH:mm:ss:SSS\\\") as messageDate" +
// "|t1_inbound as inbound|t1_sip_id as sip_id|t2_outbound as outbound|t3_callmgrtag as callmgrtag" +
// "|fields messageDate,sip_id,inbound,outbound,callmgrtag" +
"\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }";

const query7 =
"{ \"query\": \"(_sourceCategory=prod/css/calltrace \\\"referenceCallID\\\" or \\\"assigned to CallHandlerJSON\\\" or (\\\"play\\\" and \\\"OUTBOUND\\\")) or (_sourcecategory = \\\"prod/css/cdr\\\" )" +
"| if(_raw matches \\\"*referenceCallID*\\\", 2, if(_raw matches \\\"*play*\\\", 3, if(_raw matches \\\"CSS-1.2|*\\\",4,1))) as stream" +
"| _messagetime as _timeslice" +
"| parse \\\"|CallTrace*|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|TlcCall [ptr: *, call-ID: *] assigned to CallHandlerJSON [ptr: *, call-ID: *]\\\" as stam1,inbound,ptr1,sip_id,ptr2,uk1 nodrop" +
"| where !(inbound matches \\\"*CLUSTER*\\\")" +
"| parse \\\"|CallTrace*|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|Creating Call Handler. referenceCallID:[*] \\\" as stam2,outbound,inbound nodrop" +
"| parse \\\"|OUTBOUND|*|\\\" as outbound nodrop" +
"| parse \\\"callmgrtag=*;\\\" as callmgrtag nodrop" +
"| parse \\\"*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|\\\" as CssVersion,node_id,confid,inbound,RemoteEndpointID,Direction,ProtocolStack,CallSetupResult,TerminationReason,VerboseTerminationDetails,from_extension,CallerID,CallerIPandPort,CallerProductandVersion,CalledUserID,to,CalledIPandPort,CalledProductandVersion,SetupTimestamp,ConnectedTimestamp,DisconnectedTimestamp,ConnectionDuration,CallType,Encryption nodrop" +
"|parse regex field=callerid \\\"sips:(?<test>.*?)@\\\" nodrop" +
"|parse regex field=callerid \\\"sip:(?<test2>.*?)@\\\" nodrop" +
"|if (isempty(test),test2,test) as test3" +
"|if (isempty(from_extension),test3,from_extension) as from_extension" +
"|count by _timeslice,inbound,outbound,sip_id,callmgrtag,stream,from_extension" +
"| join " +
"( where stream=1) as t1, " +
"( where stream=2) as t2, " +
"( where stream=3) as t3, " +
"( where stream=4) as t4 " +
"on t2.inbound=t1.inbound and t3.outbound=t2.outbound and t4.inbound=t1.inbound" +
"| formatDate(t1__timeslice, \\\"MM/dd/yyyy HH:mm:ss:SSS\\\") as messageDate" +
"|t1_inbound as inbound|t1_sip_id as sip_id|t2_outbound as outbound|t3_callmgrtag as callmgrtag|t4_from_extension as from_extension" +
"|count messageDate,from_extension,sip_id,inbound,outbound,callmgrtag" +
"|fields -_count" +
"| where from_extension=\\\"%s\\\"" +
"\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }";


const queryStats1 =
"{ \"query\": \"_sourceCategory=prod/css/callstats/*" +
"|_messagetime as _timeslice" +
"|where callid matches \\\"%s\\\"" +
"|count by _timeslice,callid,atx_bw,atx_Packets,atx_PacketsLost,vtx_bw,vtx_Packets,vtx_PacketsLost,ptx_bw,ptx_Packets,ptx_PacketsLost,arx_bw,arx_packets,arx_packets_lost,vrx_bw,vrx_packets,vrx_packets_lost,prx_bw,prx_packets,prx_packets_lost" +
"|atx_bw as audio_tx_bw|atx_Packets as audio_tx_packets|atx_PacketsLost as audio_tx_loss|arx_bw as audio_rx_bw|arx_packets as audio_rx_packets|arx_packets_lost as audio_rx_loss|vtx_bw as video_tx_bw|vtx_packets as video_tx_packets|vtx_PacketsLost as video_tx_loss|vrx_bw as video_rx_bw|vrx_packets as video_rx_packets|vrx_Packets_Lost as video_rx_loss|ptx_bw as presentation_tx_bw|ptx_Packets as presentation_tx_packets|ptx_PacketsLost as presentation_tx_loss|prx_bw as " + "presentation_rx_bw|prx_Packets as presentation_rx_packets|prx_Packets_Lost as presentation_rx_loss" +
"|fields -_count,atx_bw,atx_Packets,atx_PacketsLost,vtx_bw,vtx_Packets,vtx_PacketsLost,ptx_bw,ptx_Packets,ptx_PacketsLost,arx_bw,arx_packets,arx_packets_lost,vrx_bw,vrx_packets,vrx_packets_lost,prx_bw,prx_packets,prx_packets_lost" +
"|sort by _timeslice asc\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }";


var coo;
var jobId;

const fetchOptions = {
  // mode: 'cross-domain',
  credentials: 'include',
  redirect: 'follow',
  headers: {
    'authorization': 'Basic c3UxbXkycGNnNlM0dmo6azNnakNHUElVY1NtTEdON1NWc0VWcXRPbFo2U1Q1Vmo3RUJjckdINGlBdUJXOVpPV092bGk5empYSmg4Qkdsbw==',
    'cache-control': 'no-cache, no-store, must-revalidate',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
}

var sleep = (ms) => function() {
  return new Promise((resolve) =>
    setTimeout(resolve.bind(null, ...arguments), ms)
  );
};

function querySumo(query) {
  console.log('querySumo called with query:\n' + query);
  fetchOptions.method = 'POST';
  fetchOptions.body = query;
  fetchOptions.headers.cookie = '';
  return fetch(url, fetchOptions)
  .then(r => {
    //console.log('Result:    ' + JSON.stringify(r.headers, null, 2));
    coo = r.headers.getAll('set-cookie');
    return r.json();
  })
  .then(json => {
    console.log(JSON.stringify(json, null, 2));
    console.log('JOB ID:    ' + json.id);
    jobId = json.id;
    fetchOptions.method = 'GET';
    fetchOptions.body = query;
    fetchOptions.headers.cookie = coo;
    console.log('Waiting for job ' + jobId + ' to complete...');
  })
  .then(() => querySumoStatus())
  .then(() => {
    return fetch(url + jobId + '/records?offset=0&limit=100', fetchOptions)
    .then(r => r.json())
    .then(json => {
      console.log('--> Found ' + json.records.length + ' call' + (json.records.length != 1 ? 's' : ''));
      json.sumoJobId = jobId;
      json.success = true;
      return json;
    })
    .catch(err => {
      console.log(err);
      return { success: false, error: err };
    });
  })
}

async function querySumoStatus() {
  fetchOptions.method = 'GET';
  fetchOptions.body = '';
  var done = false;
  var res;
  while (!done) {
    res = await fetch(url + jobId , fetchOptions)
    .then(r => r.json())
    .then(sleep(500))
    .then(json => {
      console.log('Job ' + jobId +': ' + json.state + ' (messages: ' + json.messageCount + ')');
      done = (json.state === "DONE GATHERING RESULTS");
    })
  }
  return res;
}

router.use(bodyParser.json());

// var ans = {
//   caller: {
//     name:      '',
//     client:    '',
//     extension: '',
//     ip:        ''
//   },
//   link1: {
//     // divId: 1,
//     callIdShort: '-----',
//     callId: '-'
//   },
//   node1: {
//     // index: 1,
//     name: '-----------------------------------',
//     version: '-',
//     ipExt: '-',
//     ipInt: '-',
//     ib: '-',
//     ibShort: '-',
//     ob: '-',
//     obShort: '-'
//   },
//   link2: {
//     // divId: 2,
//     callIdShort: '-----',
//     callId: '-'
//   },
//   node2: {
//     // index: 2,
//     name: '-----------------------------------',
//     version: '-',
//     ipExt: '-',
//     ipInt: '-',
//     ib: '-',
//     ibShort: '-',
//     ob: '-',
//     obShort: '-'
//   },
//   link3: {
//     divId: 3,
//     callIdShort: '-----',
//     callId: '-'
//   },
//   callee: {
//     name:      '',
//     client:    '',
//     extension: '',
//     ip:        ''
//   },
// };
//
// var ans1 = {
//   caller: {},
//   link1: {},
//   node1: {},
//   link2: {},
//   node3: {},
//   link3: {},
//   callee: {},
//   callmgrtag: ''
// }

router.post('/search', function(req, res, next) {
  console.log('/search called');

  var ext = req.body.extension;
  var from = req.body.from;
  var to = req.body.to;
  var timeZone = req.body.timeZone;
  console.log('Args: ' + ext + ' ' + from + ' ' + to + ' ' + timeZone);

  sumoQuery = sprintf(query7, ext, from, to, timeZone);
  querySumo(sumoQuery)
  .then(json => {
    console.log('result :' + JSON.stringify(json, null, 2));
    var results = json.records.map(result => {
      return {
        node1: {
          ib: result.map.inbound,
          ob: result.map.outbound
        },
        link1: {
          callId: result.map.sip_id
        },
        caller: {
          extension: result.map.from_extension,
          name: 'Moshe'
        },
        callmgrtag: result.map.callmgrtag
      };
    });
    return {
      results: results,
      success: json.success,
      sumoJobId: json.sumoJobId
    }
  })
  .then(json1 => res.send(json1));
});

router.post('/stats', function(req, res, next) {
  console.log('/stats called');

  var inboundLeg = /*req.body.inboundLeg*/'SIP_WAN.hflr_20180116111348000_0679';
  var from = '2018-01-01T11:00:00';
  var to = '2018-01-16T12:00:00';
  var timeZone = 'CST';
  console.log('Args: ' + inboundLeg + ' ' + from + ' ' + to + ' ' + timeZone);

  sumoQuery = sprintf(queryStats1, inboundLeg, from, to, timeZone);
  querySumo(sumoQuery)
  .then(json => res.send(json));
});

module.exports = router;
