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
 * Date:        8/20/2019
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
        }
        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        }
        function fieldChanged(context) {
            log.debug("fieldChange", "Start");
            var currentRecord = context.currentRecord;
            var fieldName = context.fieldId;
            log.debug("fieldName", fieldName);
            if (fieldName === 'custpage_config') {
                var configuration = currentRecord.getValue({"fieldId": fieldName});
                window.location = updateQueryStringParameter(window.location.href, 'configId', configuration);
                return;
            }
            else if (fieldName === 'custpage_boomitems') {
                var assemblyItem = currentRecord.getValue({"fieldId": fieldName});
                if(!!assemblyItem) {
                    window.loadAssemblyChild(assemblyItem);
                }
                return;
            }
            else if (fieldName == "custrecord_ab_segment") {
                var segment = currentRecord.getValue({"fieldId": fieldName});
                var segmentValueField = currentRecord.getField({"fieldId": 'custpage_segment_ddl_value'});
                log.debug("segment", segment);

                switch (segment) {
                    case "1" :
                       // try {
                            segmentValueField.removeSelectOption(null);
                        //}catch (e) {
                       // }
                        var subsidiaries = library.getSubsidiaries();
                        segmentValueField = library.insertSelectOPtions(segmentValueField, subsidiaries);
                        //segmentValueField.source = 'subsidiary';
                        break;
                    case "2" :
                        segmentValueField.removeSelectOption(null);
                        var classes = library.getClasses();
                        segmentValueField = library.insertSelectOPtions(segmentValueField, classes);
                        break;
                    case "3" :
                        segmentValueField.removeSelectOption(null);
                        var departments = library.getDepartments();
                        segmentValueField = library.insertSelectOPtions(segmentValueField, departments);
                        break;
                    case "4" :
                        segmentValueField.removeSelectOption(null);
                        var location = library.getLocation();
                        segmentValueField = library.insertSelectOPtions(segmentValueField, location);
                        break;
                    default:
                        break;
                }
                currentRecord.setValue({"fieldId": "custrecord_ab_segment_value" , value: ""});
            } else if (fieldName === "custpage_segment_ddl_value") {
                var value = currentRecord.getValue({fieldId: "custpage_segment_ddl_value"});
                log.debug("custpage_segment_ddl_value", value);
                if(!!value) {
                    currentRecord.setValue({fieldId: "custrecord_ab_segment_value", value: value});
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
