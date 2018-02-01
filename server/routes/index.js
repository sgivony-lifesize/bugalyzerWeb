var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var sprintf = require("sprintf-js").sprintf

const CSS_NODES = {
  "1I14" : { name: "San Jose 1",    wan: "192.155.215.197", lan: "10.90.32.219"   },
  "RmUN" : { name: "Melbourne 1",   wan: "168.1.68.251",    lan: "10.118.0.103"   },
  "5lh4" : { name: "Washington 4",  wan: "169.55.87.188",   lan: "10.148.82.237"  },
  "fJdc" : { name: "Toronto 1",     wan: "169.53.184.72",   lan: "10.114.233.202" },
  "FUrl" : { name: "Sao Paulo 1",   wan: "169.57.160.228",  lan: "10.150.190.243" },
  "gf3g" : { name: "San Jose 3",    wan: "169.45.75.100",   lan: "10.160.141.162" },
  "soqY" : { name: "Frankfurt 2",   wan: "159.122.100.42",  lan: "10.134.114.174" },
  "8cLo" : { name: "London 2",      wan: "5.10.105.200",    lan: "10.112.27.204"  },
  "e7Ob" : { name: "Hong Kong 2",   wan: "119.81.134.226",  lan: "10.110.16.66"   },
  "xNNH" : { name: "Mexico City 1", wan: "169.57.7.200",    lan: "10.130.22.235"  },
  "pkqS" : { name: "Dallas 6",      wan: "23.246.195.8",    lan: "10.107.35.206"  },
  "Vwp6" : { name: "Washington 1",  wan: "50.97.60.166",    lan: "10.56.150.202"  },
  "mCvS" : { name: "Amsterdam 1",   wan: "5.153.63.162",    lan: "10.104.163.194" },
  "T3NB" : { name: "Dallas 7",      wan: "184.173.213.195", lan: "10.51.43.68"    },
  "hflr" : { name: "Washington 2",  wan: "169.63.70.87",    lan: "10.65.27.16"    },
  "AylT" : { name: "Paris 1",       wan: "159.8.77.42",     lan: "10.127.230.72"  },
  "geCs" : { name: "Channai 1",     wan: "169.38.84.49",    lan: "10.162.54.88"   },
  "6opA" : { name: "Milan 1",       wan: "159.122.152.111", lan: "10.144.77.62"   },
  "Lfxy" : { name: "Amsterdam 3",   wan: "159.8.223.72",    lan: "10.137.60.134"  },
  "kyT4" : { name: "Dallas 10",     wan: "169.46.49.132",   lan: "10.177.21.144"  },
};

const url = 'https://api.us2.sumologic.com/api/v1/search/jobs/';

const query1 = { name: "First node query", query:
"{ \"query\": \"" +
"(_sourceCategory=prod/css/calltrace \\\"referenceCallID\\\" or \\\"assigned to CallHandlerJSON\\\" or (\\\"play\\\" and \\\"OUTBOUND\\\")) or (_sourcecategory = \\\"prod/css/cdr\\\" )" +
"| if(_raw matches \\\"*referenceCallID*\\\", 2, if(_raw matches \\\"*play*\\\", 3, if(_raw matches \\\"CSS-1.2|*\\\",4,1))) as stream" +
"| _messagetime as _timeslice" +
"| parse \\\"|CallTrace*|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|TlcCall [ptr: *, call-ID: *] assigned to CallHandlerJSON [ptr: *, call-ID: *]\\\" as backslashT1,inbound,ptr1,sip_id,ptr2,uk1 nodrop" +
"| where !(inbound matches \\\"*CLUSTER*\\\")" +
"| parse \\\"|CallTrace*|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|Creating Call Handler. referenceCallID:[*] \\\" as backslashT1,outbound,inbound nodrop" +
"| parse \\\"|OUTBOUND|*|\\\" as outbound nodrop" +
"| parse \\\"callmgrtag=*;\\\" as callmgrtag nodrop" +
"| parse \\\"*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|*|\\\" as CssVersion,node_id,confid,inbound,RemoteEndpointID,Direction,ProtocolStack,CallSetupResult,TerminationReason,VerboseTerminationDetails,from_extension,CallerID,CallerIPandPort,CallerProductandVersion,CalledUserID,to,CalledIPandPort,CalledProductandVersion,SetupTimestamp,ConnectedTimestamp,DisconnectedTimestamp,ConnectionDuration,CallType,Encryption nodrop" +
"|parse regex field=callerid \\\"sips:(?<test>.*?)@\\\" nodrop" +
"|parse regex field=callerid \\\"sip:(?<test2>.*?)@\\\" nodrop" +
"|if (isempty(test),test2,test) as test3" +
"|if (isempty(from_extension),test3,from_extension) as from_extension" +
"|count by _timeslice,node_id,inbound,outbound,sip_id,callmgrtag,stream,from_extension" +
"| join " +
"( where stream=1) as t1, " +
"( where stream=2) as t2, " +
"( where stream=3) as t3, " +
"( where stream=4) as t4 " +
"on t2.inbound=t1.inbound and t3.outbound=t2.outbound and t4.inbound=t1.inbound" +
"| formatDate(t1__timeslice, \\\"MM/dd/yyyy HH:mm:ss:SSS\\\") as messageDate" +
"| t1_inbound as inbound|t1_sip_id as sip_id|t2_outbound as outbound|t3_callmgrtag as callmgrtag|t4_from_extension as from_extension|t4_node_id as node_id" +
"| count messageDate,node_id,from_extension,sip_id,inbound,outbound,callmgrtag" +
"| fields -_count" +
"| where from_extension=\\\"%s\\\"" +
"\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }"
};

const query2 = { name: "Second node query", query:
"{ \"query\": \"" +
"(_sourceCategory=prod/css/calltrace \\\"From\\\" and \\\"callmgrtag=\\\" and \\\"1|INVITE|\\\") or (_sourceCategory=prod/css/calltrace  \\\"ptr:\\\" and \\\"assigned to CallHandlerJSON\\\") or (_sourceCategory=prod/css/calltrace  \\\"referenceCallID\\\" and \\\"_CLUSTER_LAN\\\")" +
"| if(_raw matches \\\"*assigned to CallHandlerJSON*\\\", 2, if(_raw matches \\\"*referenceCallID*\\\", 3, 1)) as stream" +
"| parse \\\"From: *;\\\" as from nodrop" +
"| parse regex field=from \\\"<sip:(?<from_extension>.*?)@\\\" nodrop" +
"| parse \\\"callmgrtag=*;\\\" as callmgrtag nodrop" +
"| parse \\\"Call-ID: *\\\" as sip_id_next_test nodrop" +
"| parse \\\"TlcCall [ptr: *, call-ID: *]\\\" as ptr1,sip_id_next nodrop" +
"| parse \\\"|*|\\\" as node_id" +
"| parse \\\"|CallTrace*|UNKNOWN|*|\\\" as stam1,inbound_proxy_callhandlerid nodrop" +
"| parse \\\"|CallTrace*|UNKNOWN|*|UNKNOWN|UNKNOWN|Call_UNKNOWN|Creating Call Handler. referenceCallID:[*]\\\" as stam2,outbound_proxy_callhandlerid,inbound_proxy_callhandlerid nodrop" +
"| parse regex field=sip_id_next_test \\\"(?<sip_id_next>.*?)\\n\\\" nodrop" +
"| count by callmgrtag,node_id,sip_id_next,inbound_proxy_callhandlerid,outbound_proxy_callhandlerid,stream,from_extension" +
"| join " +
"( where stream=1) as t1, " +
"( where stream=2) as t2, " +
"( where stream=3) as t3 " +
"on t2.sip_id_next=t1.sip_id_next and t3.inbound_proxy_callhandlerid=t2.inbound_proxy_callhandlerid" +
"|t1_callmgrtag as callmgrtag|t1_sip_id_next as sip_id_next |t2_inbound_proxy_callhandlerid as inbound_proxy_callhandlerid|t3_outbound_proxy_callhandlerid as outbound_proxy_callhandlerid|t2_node_id as node_id|t1_from_extension as from_extension" +
"|count from_extension,callmgrtag,node_id,sip_id_next,inbound_proxy_callhandlerid,outbound_proxy_callhandlerid" +
"|where from_extension matches \\\"%s\\\"" +
"|fields -_count" +
// "|where callmgrtag matches \\\"T3NB_LEG_20180122093135434117\\\"" +
"\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }"
};

const queryStats1 = { name: "Stats query", query:
"{ \"query\": \"_sourceCategory=prod/css/callstats/*" +
"|_messagetime as _timeslice" +
"|where callid matches \\\"%s\\\"" +
"|count by _timeslice,callid,atx_bw,atx_Packets,atx_PacketsLost,vtx_bw,vtx_Packets,vtx_PacketsLost,ptx_bw,ptx_Packets,ptx_PacketsLost,arx_bw,arx_packets,arx_packets_lost,vrx_bw,vrx_packets,vrx_packets_lost,prx_bw,prx_packets,prx_packets_lost" +
"|atx_bw as audio_tx_bw|atx_Packets as audio_tx_packets|atx_PacketsLost as audio_tx_loss|arx_bw as audio_rx_bw|arx_packets as audio_rx_packets|arx_packets_lost as audio_rx_loss|vtx_bw as video_tx_bw|vtx_packets as video_tx_packets|vtx_PacketsLost as video_tx_loss|vrx_bw as video_rx_bw|vrx_packets as video_rx_packets|vrx_Packets_Lost as video_rx_loss|ptx_bw as presentation_tx_bw|ptx_Packets as presentation_tx_packets|ptx_PacketsLost as presentation_tx_loss|prx_bw as " + "presentation_rx_bw|prx_Packets as presentation_rx_packets|prx_Packets_Lost as presentation_rx_loss" +
"|fields -_count,atx_bw,atx_Packets,atx_PacketsLost,vtx_bw,vtx_Packets,vtx_PacketsLost,ptx_bw,ptx_Packets,ptx_PacketsLost,arx_bw,arx_packets,arx_packets_lost,vrx_bw,vrx_packets,vrx_packets_lost,prx_bw,prx_packets,prx_packets_lost" +
"|sort by _timeslice asc\", \"from\": \"%s\", \"to\": \"%s\", \"timeZone\": \"%s\" }"
};


var coo;
var jobId;
var resultsFromNode1saved;
var callmgrtagMap = {};

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

function getNodeName(nodeId) {
  var node = CSS_NODES[nodeId];
  return node ? node.name : "Node Unknown";
}

function getNodeWan(nodeId) {
  var node = CSS_NODES[nodeId];
  return node ? node.wan : "Node Unknown";
}

function getNodeLan(nodeId) {
  var node = CSS_NODES[nodeId];
  return node ? node.lan : "Node Unknown";
}

function querySumo(queryName, query) {
  console.log('Calling Sumo with query: ' + queryName);
  fetchOptions.method = 'POST';
  fetchOptions.body = query;
  fetchOptions.headers.cookie = '';
  return fetch(url, fetchOptions)
  .then(r => {
    coo = r.headers.getAll('set-cookie');
    return r.json();
  })
  .then(json => {
    console.log('JOB ID: ' + json.id);
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

function fillStats(stats, leg) {
  leg.audio = {};
  leg.audio.rx = {};
  leg.audio.rx.bw = [];
  leg.audio.rx.packets = [];
  leg.audio.rx.loss = [];
  leg.audio.tx = {};
  leg.audio.tx.bw = [];
  leg.audio.tx.packets = [];
  leg.audio.tx.loss = [];
  leg.video = {};
  leg.video.rx = {};
  leg.video.rx.bw = [];
  leg.video.rx.packets = [];
  leg.video.rx.loss = [];
  leg.video.tx = {};
  leg.video.tx.bw = [];
  leg.video.tx.packets = [];
  leg.video.tx.loss = [];
  leg.presentation = {};
  leg.presentation.rx = {};
  leg.presentation.rx.bw = [];
  leg.presentation.rx.packets = [];
  leg.presentation.rx.loss = [];
  leg.presentation.tx = {};
  leg.presentation.tx.bw = [];
  leg.presentation.tx.packets = [];
  leg.presentation.tx.loss = [];
  stats.records.forEach(entry => {
    var map = entry.map;

    leg.audio.rx.bw.push(map.audio_rx_bw);
    leg.audio.rx.packets.push(map.audio_rx_packets);
    leg.audio.rx.loss.push(map.audio_rx_loss);
    leg.audio.tx.bw.push(map.audio_tx_bw);
    leg.audio.tx.packets.push(map.audio_tx_packets);
    leg.audio.tx.loss.push(map.audio_tx_loss);

    leg.video.rx.bw.push(map.video_rx_bw);
    leg.video.rx.packets.push(map.video_rx_packets);
    leg.video.rx.loss.push(map.video_rx_loss);
    leg.video.tx.bw.push(map.video_tx_bw);
    leg.video.tx.packets.push(map.video_tx_packets);
    leg.video.tx.loss.push(map.video_tx_loss);

    leg.presentation.rx.bw.push(map.presentation_rx_bw);
    leg.presentation.rx.packets.push(map.presentation_rx_packets);
    leg.presentation.rx.loss.push(map.presentation_rx_loss);
    leg.presentation.tx.bw.push(map.presentation_tx_bw);
    leg.presentation.tx.packets.push(map.presentation_tx_packets);
    leg.presentation.tx.loss.push(map.presentation_tx_loss);
  })
  return resultsFromNode1saved;
}

async function querySumoStatus() {
  fetchOptions.method = 'GET';
  fetchOptions.body = '';
  var done = false;
  var res;
  while (!done) {
    res = await fetch(url + jobId , fetchOptions)
    .then(r => r.json())
    .then(sleep(2000))
    .then(json => {
      console.log('[' + new Date() + '] Job ' + jobId +': ' + json.state + ' (records: ' + json.recordCount + ')');
      done = (json.state === "DONE GATHERING RESULTS");
    })
  }
  return res;
}

router.use(bodyParser.json());

router.post('/search', function(req, res, next) {
  console.log('/search called');

  var ext =      req.body.extension;
  var from =     req.body.from;
  var to =       req.body.to;
  var timeZone = req.body.timeZone;
  console.log('Args: ' + ext + ' ' + from + ' ' + to + ' ' + timeZone);

  querySumo(query1.name, sprintf(query1.query, ext, from, to, timeZone))
  .then(resultsFromNode1 => {
    console.log('resultsFromNode1 :' + JSON.stringify(resultsFromNode1.records, null, 2));
    var results = resultsFromNode1.records.map((result, i) => {
      return {
        node1: {
          id: result.map.node_id,
          name: getNodeName(result.map.node_id),
          ipExt: getNodeWan(result.map.node_id),
          ipInt: getNodeLan(result.map.node_id),
          ib: { id: result.map.inbound },
          ob: { id: result.map.outbound }
        },
        link1: {
          callId: result.map.sip_id
        },
        caller: {
          extension: result.map.from_extension,
          name: 'ABC'
        },
        callmgrtag: result.map.callmgrtag
      };
    });

    resultsFromNode1saved = {
      results: results,
      success: resultsFromNode1.success,
      sumoJobId: resultsFromNode1.sumoJobId
    };
  })
  .then(() => querySumo(query2.name, sprintf(query2.query, ext, from, to, timeZone)))
  .then(resultsFromNode2 => {
    console.log('resultsFromNode2: ' + JSON.stringify(resultsFromNode2.records, null, 2));

    // map each exisiting callmgrtag to its index:
    resultsFromNode2.records.forEach((record, i) => {
      var mgrTag = record.map.callmgrtag;
      if (mgrTag !== undefined && mgrTag !== "") {
        callmgrtagMap[mgrTag] = i;
      }
    });
    console.log('callmgrtagMap: ' + JSON.stringify(callmgrtagMap, null, 2));

    // matching entries from node1 results to entries from node2 results using callmgrtag:
    var resultsFinal = resultsFromNode1saved.results.map((result, j) => {
      var i = callmgrtagMap[result.callmgrtag];
      result.node2 = {};
      result.node2.ib = {};
      result.node2.ob = {};
      result.link2 = {};
      if (i !== undefined) {
        console.log('Query1 result No.' + j + ' matched with query2 result No.' + i);
        result.node2.id = resultsFromNode2.records[i].map.node_id;
        result.node2.name = getNodeName(resultsFromNode2.records[i].map.node_id);
        result.node2.ipExt = getNodeWan(resultsFromNode2.records[i].map.node_id);
        result.node2.ipInt = getNodeLan(resultsFromNode2.records[i].map.node_id);
        result.node2.ib = { id: resultsFromNode2.records[i].map.inbound_proxy_callhandlerid };
        result.node2.ob = { id: resultsFromNode2.records[i].map.outbound_proxy_callhandlerid };
        result.link2.callId = resultsFromNode2.records[i].map.sip_id_next;
      }
      return result;
    });
    console.log('resultsFinal: ' + JSON.stringify(resultsFinal, null, 2));
    return {
      results: resultsFinal,
      success: resultsFromNode2.success,
      sumoJobId: resultsFromNode2.sumoJobId
    };
  })
  .then(json => res.send(json));
});

router.post('/stats', function(req, res, next) {
  console.log('/stats called');

  var leg       = req.body.callHandlerId;
  var from      = req.body.from;
  var to        = req.body.to;
  var timeZone  = req.body.timeZone;

  console.log('Args: ' + leg + ' ' + from + ' ' + to + ' ' + timeZone);

  var statsResult = {};
  if (leg != undefined && leg !== "") {
    statsResult[leg] = {};
    querySumo(queryStats1.name, sprintf(queryStats1.query, leg, from, to, timeZone))
    .then(stats => fillStats(stats, statsResult[leg]))
    .then(() => res.send({ success: true, results: statsResult }))
    .catch(err => {
      console.log(err);
      return res.send({ success: false, error: err });
    });
  }
});


module.exports = router;
