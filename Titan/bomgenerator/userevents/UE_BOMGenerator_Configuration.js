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
 * File:        UE_OpenBomGenerator.js
 * Date:        4/18/2019
 *
 *
 ***********************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/search'],
    function (nsRecord, nsSearch) {
        function beforeLoad(context) {

            var segment = context.newRecord.getValue({"fieldId": "custrecord_ab_segment"});
            var segmentValue  = context.newRecord.getValue({"fieldId": "custrecord_ab_segment_value"});

            var source =  "subsidiary";
            switch (segment) {
                case "1" :
                    source =  "subsidiary";
                    break;
                case "2" :
                    source =  "classification";
                    break;
                case "3" :
                    source =  "department";
                    break;
                case "4" :
                    source =  "location";
                    break;
            }
            var field = context.form.addField({
                id: 'custpage_segment_ddl_value',
                type: 'select',
                label: 'Segment Value',
                source: source
            });
            field.isMandatory = true;
            if(!!segmentValue) {
                field.defaultValue = segmentValue;
            }
        }

        function beforeSubmit(scriptContext) {
            // log.debug("beforeSubmit" , 'Start');
            //
            // var rec = scriptContext.newRecord;
            // var value = rec.getValue({fieldId: "custpage_segment_value"});
            // log.debug("custpage_segment_value" , value);
            // rec.setValue({fieldId: "custrecord_ab_segment_value", value: value});
            //
            // log.debug("beforeSubmit" , 'End');
        }

        //custrecord_ab_segment_value
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit
        };
    });
