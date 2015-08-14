var aDebug = [];
var parser = new JSONParser();
var sApiKey = '';

var jsonServices = [];

var nGetStatusCode;
var aGetHeaders;
var sGetBody;
var jsonBody;
var json;

var rest;

var nTotal = getRecordTotal()

if ( nTotal > 0 ) {
    var jsonRecords;

    var nLimit  = 20;
    var nOffset = 0;

    for ( var i = 0; i <= nTotal; i += parseInt(nLimit) ) {
        rest = new RESTMessage('PagerDuty Reporting', 'get');
        rest.setStringParameter('TargetTable', 'services');
        rest.setStringParameter('APIKey', sApiKey);
        rest.setStringParameter('SubDomain', 'betfair');
        rest.setHttpTimeout(10000);

        result  = postRestMessage(rest, nLimit, (i));
        nGetStatusCode   = result.getStatusCode;
        aGetHeaders      = result.getHeaders;
        sGetBody         = result.getBody;
        json = parser.parse(sGetBody);

        jsonServices.push(json.services);
    }

    var num = 0;
    var aRecords = [];
    for ( var j = 0; j < jsonServices.length; j++ ) {
        var sRow = '';
        for ( var k = 0; k < jsonServices[j].length; k++ ) {
            num++;
            var aRow = [];
            for ( var key in jsonServices[j][k] ) {
                if ( key == 'incident_counts' ) {
                    aRow.push('"' + key + '_triggered" : "' + jsonServices[j][k][key].triggered + '"');
                    aRow.push('"' + key + '_resolved" : "' + jsonServices[j][k][key].resolved + '"');
                    aRow.push('"' + key + '_acknowledged" : "' + jsonServices[j][k][key].acknowledged + '"');
                    aRow.push('"' + key + '_total" : "' + jsonServices[j][k][key].total + '"');
                } else if ( key == 'incident_urgency_rule' ) {
                    aRow.push('"' + key + '_type" : "' + jsonServices[j][k][key].type + '"');
                    aRow.push('"' + key + '_urgency" : "' + jsonServices[j][k][key].urgency + '"');
                } else {
                    aRow.push('"' + key + '" : "' + jsonServices[j][k][key] + '"');
                }
            }
            sRow = '{ "RecordNumber" : "' + num + '", ' + aRow.join(',') + ' }';

//            sRow = '{ ' +
//                       '"id" : "' + jsonServices[j][k].id + '", ' +
//                       '"name" : "' + jsonServices[j][k].name + '", ' +
//                       '"service_url" : "' + jsonServices[j][k].service_url + '", ' +
//                       '"service_key" : "' + jsonServices[j][k].service_key + '", ' +
//                       '"auto_resolve_timeout" : "' + jsonServices[j][k].auto_resolve_timeout + '", ' +
//                       '"acknowledgement_timeout" : "' + jsonServices[j][k].acknowledgement_timeout + '", ' +
//                       '"created_at" : "' + jsonServices[j][k].created_at + '", ' +
//                       '"deleted_at" : "' + jsonServices[j][k].deleted_at + '", ' +
//                       '"status" : "' + jsonServices[j][k].status + '", ' +
//                       '"last_incident_timestamp" : "' + jsonServices[j][k].last_incident_timestamp + '", ' +
//                       '"email_incident_creation" : "' + jsonServices[j][k].email_incident_creation + '", ' +
//                       '"incident_counts_triggered" : "' + jsonServices[j][k].incident_counts.triggered + '", ' +
//                       '"incident_counts_resolved" : "' + jsonServices[j][k].incident_counts.resolved + '", ' +
//                       '"incident_counts_acknowledged" : "' + jsonServices[j][k].incident_counts.acknowledged + '", ' +
//                       '"incident_counts_total" : "' + jsonServices[j][k].incident_counts.total + '", ' +
//                       '"email_filter_mode" : "' + jsonServices[j][k].email_filter_mode + '", ' +
//                       '"type" : "' + jsonServices[j][k].type + '", ' +
//                       '"incident_urgency_rule_type" : "' + jsonServices[j][k].incident_urgency_rule.type + '", ' +
//                       '"incident_urgency_rule_urgency" : "' + jsonServices[j][k].incident_urgency_rule.urgency + '", ' +
//                       '"scheduled_actions" : "' + jsonServices[j][k].scheduled_actions + '", ' +
//                       '"support_hours" : "' + jsonServices[j][k].support_hours + '", ' +
//                       '"description" : "' + jsonServices[j][k].description + '" ' +
//                   '}';

            aRecords.push(sRow);
        }
    }
    var sRecords = '{ "TotalRecords" : "' + nTotal + '", "Records" : [ ' + aRecords.join(',') + ' ] }';

    gs.print(sRecords);
}

function getRecordTotal() {
    var nTotal = 0;

    var rest = new RESTMessage('PagerDuty Reporting', 'get');
    rest.setStringParameter('TargetTable', 'services');
    rest.setStringParameter('APIKey', sApiKey);
    rest.setStringParameter('SubDomain', 'betfair');
    rest.setHttpTimeout(10000);

    var result  = postRestMessage(rest, 1, 0);

    var nGetStatusCode   = result.getStatusCode;
    var sGetBody         = result.getBody;

    if ( nGetStatusCode == 200 ) {
        var jsonBody = parser.parse(sGetBody);
        nTotal  = jsonBody.total;
    }
    return nTotal;
}

function postRestMessage(inRest, inLimit, inOffset) {
    var response;

    inRest.setStringParameter('URIString', 'sort_by=name&limit=' + inLimit + '&offset=' + inOffset);

    try {
        response = inRest.execute();
        response = { "getHttpMethod" : response.getHttpMethod(), "getStatusCode" : response.getStatusCode(), "getHeaders" : response.getHeaders(), "getBody" : response.getBody(), "haveError" : response.haveError(), "getErrorCode" : response.getErrorCode(), "getErrorMessage" : response.getErrorMessage(), "getEndpoint" : response.getEndpoint(), "getParameters" : response.getParameters() };
    } catch ( err ) {
        response = { "getHttpMethod" : "error", "getStatusCode" : "500", "getHeaders" : "error", "getBody" : "error", "haveError" : "true", "getErrorCode" : "500", "getErrorMessage" : err.message, "getEndpoint" : "error", "getParameters" : "error" };
    }
    return { "getHttpMethod" : response.getHttpMethod, "getStatusCode" : response.getStatusCode, "getHeaders" : response.getHeaders, "getBody" : response.getBody, "haveError" : response.haveError, "getErrorCode" : response.getErrorCode, "getErrorMessage" : response.getErrorMessage, "getEndpoint" : response.getEndpoint, "getParameters" : response.getParameters };
}
