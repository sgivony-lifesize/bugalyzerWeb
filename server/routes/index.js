var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');

const url = 'https://api.us2.sumologic.com/api/v1/search/jobs/';
var coo;

router.get('/id', function(req, res, next) {
  console.log('/id called');

  fetch(url, {
      method: 'POST',
      // mode: 'cross-domain',
      credentials: 'include',
      redirect: 'follow',
      headers: {
        'authorization': 'Basic c3UxbXkycGNnNlM0dmo6azNnakNHUElVY1NtTEdON1NWc0VWcXRPbFo2U1Q1Vmo3RUJjckdINGlBdUJXOVpPV092bGk5empYSmg4Qkdsbw==',
        'cache-control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: "{\n  \"query\": \"_sourceCategory=\\\"prod/css/transactions\\\" \\\"CallRoutingState\\\" \\\"callStatus=\\\" | parse \\\"|*|*|\\\" as type,nodeid | parse \\\"ONFERENCE|*|*|*|CallRoutingState|\\\" as confid,participant_id,callmanager_id | parse \\\"to.email=*, to.displayName=*, to.group=*,\\\" as to_email,to_displayname,to_group | parse \\\"to.userID=*, to.extension=*,\\\" as to_userID,to_extension |parse \\\"callStatus=*, dialString=*, destination.uri.user=*, destination.uri.host=*, from.userID=*, from.extension=*, from.email=*, from.displayName=*, from.group=*, from.provisioned=*, from.registered=*, from.guest=*, from.uri.user=*, from.interface=*, from.protocol=*, from.IP=*, from.vendorIdentifier.productID=*, from.vendorIdentifier.versionID=*, from.alias.E164=*, from.alias.H323ID=*, from.alias.URLID=*, from.alias.EMAILID=*, from.alias.TRANSPORTADDRESS=*, from.alias.PARTYNUMBER=*, from.alias.SIPURI=*, from.alias.x-DeviceId=*, from.alias.cssParticipantId=*,\\\" as callStatus, dialString, destination_uri_user, destination_uri_host, from_userID, from_extension, from_email, from_displayName, from_group, from_provisioned, from_registered, from_guest, from_uri_user, from_interface, from_protocol, from_IP, from_vendorIdentifier_productID, from_vendorIdentifier_versionID, from_alias_E164, from_alias_H323ID, from_alias_URLID, from_alias_EMAILID, from_alias_TRANSPORTADDRESS, from_alias_PARTYNUMBER, from_alias_SIPURI, from_alias_x_DeviceId, from_alias_cssParticipantId |parse regex field=from_alias_SIPURI \\\"sip:(?<test>.*?)@\\\" nodrop |_messagetime as _timeslice |if (isempty(from_extension),test,from_extension) as from_extension |if (isempty(from_extension),from_uri_user,from_extension) as from_extension |where from_extension matches \\\"6598550\\\" |count by _timeslice,nodeid,confid,callstatus,dialstring,from_extension,to_userID,to_extension,from_displayname,to_displayname |sort by _timeslice asc //|count confid |fields -_count\",\n  \"from\": \"2017-12-20T10:00:00\",\n  \"to\": \"2017-12-20T23:00:00\",\n  \"timeZone\": \"CST\"\n}\n",
  })
  // .then(r => console.log('Cookies: ' + r.headers.getAll('set-cookie')))
  .then(r => {
    coo = r.headers.getAll('set-cookie');
    console.log('Cookies: ' + coo);
    return r.json();
  })
  .then(function(json) {
    json.cookie = coo;
    return res.send(json);
  })
  .then(r => r.json())
  .then(json => console.log('ID:      ' + json.id))
  .catch(err => {
    console.log(err);
    res.json({ error: err });
  });
});

router.get('/job/:id', function(req, res, next) {
  console.log('/job/' + req.params.id + ' called');

  return fetch(url + req.params.id + '/messages?offset=0&limit=100', {
      method: 'GET',
      // mode: 'cross-domain',
      credentials: 'include',
      redirect: 'follow',
      headers: {
        'cookie': coo,
        'authorization': 'Basic c3UxbXkycGNnNlM0dmo6azNnakNHUElVY1NtTEdON1NWc0VWcXRPbFo2U1Q1Vmo3RUJjckdINGlBdUJXOVpPV092bGk5empYSmg4Qkdsbw==',
        'cache-control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: "{\n  \"query\": \"_sourceCategory=\\\"prod/css/transactions\\\" \\\"CallRoutingState\\\" \\\"callStatus=\\\" | parse \\\"|*|*|\\\" as type,nodeid | parse \\\"ONFERENCE|*|*|*|CallRoutingState|\\\" as confid,participant_id,callmanager_id | parse \\\"to.email=*, to.displayName=*, to.group=*,\\\" as to_email,to_displayname,to_group | parse \\\"to.userID=*, to.extension=*,\\\" as to_userID,to_extension |parse \\\"callStatus=*, dialString=*, destination.uri.user=*, destination.uri.host=*, from.userID=*, from.extension=*, from.email=*, from.displayName=*, from.group=*, from.provisioned=*, from.registered=*, from.guest=*, from.uri.user=*, from.interface=*, from.protocol=*, from.IP=*, from.vendorIdentifier.productID=*, from.vendorIdentifier.versionID=*, from.alias.E164=*, from.alias.H323ID=*, from.alias.URLID=*, from.alias.EMAILID=*, from.alias.TRANSPORTADDRESS=*, from.alias.PARTYNUMBER=*, from.alias.SIPURI=*, from.alias.x-DeviceId=*, from.alias.cssParticipantId=*,\\\" as callStatus, dialString, destination_uri_user, destination_uri_host, from_userID, from_extension, from_email, from_displayName, from_group, from_provisioned, from_registered, from_guest, from_uri_user, from_interface, from_protocol, from_IP, from_vendorIdentifier_productID, from_vendorIdentifier_versionID, from_alias_E164, from_alias_H323ID, from_alias_URLID, from_alias_EMAILID, from_alias_TRANSPORTADDRESS, from_alias_PARTYNUMBER, from_alias_SIPURI, from_alias_x_DeviceId, from_alias_cssParticipantId |parse regex field=from_alias_SIPURI \\\"sip:(?<test>.*?)@\\\" nodrop |_messagetime as _timeslice |if (isempty(from_extension),test,from_extension) as from_extension |if (isempty(from_extension),from_uri_user,from_extension) as from_extension |where from_extension matches \\\"6598550\\\" |count by _timeslice,nodeid,confid,callstatus,dialstring,from_extension,to_userID,to_extension,from_displayname,to_displayname |sort by _timeslice asc //|count confid |fields -_count\",\n  \"from\": \"2017-12-20T10:00:00\",\n  \"to\": \"2017-12-20T23:00:00\",\n  \"timeZone\": \"CST\"\n}\n",
  })
  .then(r => r.json())
  .then(json => {
    console.log('Response: ' + json);
    res.send(json);
  })
  .catch(err => {
    console.log(err);
    res.json({ error: err });
  });
});   // end of router.get()

module.exports = router;
