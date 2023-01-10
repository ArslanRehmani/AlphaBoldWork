/***********************************************************************
 *
 * The following javascript code is created by Alphabold Inc..,
 * It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": Alphabold Inc. shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     Alphabold Inc.
 * Author:      Ilija
 * File:        LCP_REST_Test.js
 * Date:        12/21/2022
 * @NApiVersion 2.1
 * @NScriptType restlet
 * Revisions:
 ***********************************************************************/
/**
 *
 */
define(['N/error'], function (error) {
    return {
        get: function () {
            var title = 'get(::)';
            try{
                var getObject = {};
                getObject.status = true;
                return JSON.stringify(getObject);
            } catch(e) {
                log.debug('Exception ' +title, e.message);
            }
            // return "Hello World, we are ALPHABOLD!"
        },
        post: function (payloadBody) {
            try {
                var returnObject = {};
                returnObject.payload = payloadBody.payload;
                returnObject.alphabold = payloadBody.alphabold;
                returnObject.error = null;
                log.debug('JSON.stringify(returnObject)',JSON.stringify(returnObject));
                return JSON.stringify(returnObject);
            } catch (err) {
                log.debug({title: 'Error',details: err.message});
                // var returnObject = new Object;
                // var restletData = payloadBody.data;
                // log.debug(JSON.stringify(restletData));
                // returnObject.payload = JSON.stringify(restletData);
                // returnObject.success = false;
                // returnObject.error = err.toString();
                // return returnObject;
                var returnObject = {};
                returnObject.payload = payloadBody.payload;
                returnObject.alphabold = payloadBody.alphabold;
                returnObject.error = null;
                log.debug('JSON.stringify(returnObject)',JSON.stringify(returnObject));
                return JSON.stringify(returnObject);
            }
        }
    }
});