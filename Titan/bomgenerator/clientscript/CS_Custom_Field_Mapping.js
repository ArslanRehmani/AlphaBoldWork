/*
 ***********************************************************************
 *
 * The following javascript code is created by AlphaBOLD Inc.,
 * a NetSuite Partner. It is a SuiteCloud component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": AlphaBOLD shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     AlphaBOLD Inc., www.alphabold.com
 * Author:      mazhar@alphabold.com
 * File:        CS_BOMGenerator_Configuration.js
 * Date:        8/30/2019
 *
 *
 ***********************************************************************/
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define(['N/ui/message', 'N/currentRecord', 'N/search', 'N/record', 'N/https', '../lib/BomGenerator_lib.js'],
    function (uiMessage, currentRecord, nsSearch, nsRecord, nsHttps, library) {
        function pageInit(context) {
            fieldChanged({currentRecord:context.currentRecord , fieldId : "custrecord_ab_custom_field_type"});
        }

        function fieldChanged(context) {
            log.debug("fieldChange", "Start");
            var currentRecord = context.currentRecord;
            var fieldName = context.fieldId;
            log.debug("fieldName", fieldName);
            debugger;
            if (fieldName == "custrecord_ab_custom_field_type") {
                var segment = currentRecord.getValue({"fieldId": fieldName});
                log.debug("custrecord_ab_custom_field_type", segment);
                  switch (segment.toLowerCase()) {
                    case "5" :
                       var field = currentRecord.getField({"fieldId": 'custrecord_ab_custom_field_sourcing'});
                        field.isDisplay = true
                        break;
                    default:
                        var field = currentRecord.getField({"fieldId": 'custrecord_ab_custom_field_sourcing'});
                        field.isDisplay = false;
                        break;
                }
            }
            log.debug("fieldChange", "End");
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
        };
    }
)
;
