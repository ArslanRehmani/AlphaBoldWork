/**
 *@NApiVersion 2.0
 *@NScriptType MapReduceScript
 */
/* 
*********************************************************************** 
* 
* The following javascript code is created by ALPHABOLD Consultants LLC, 
* a NetSuite Partner. It is a SuiteFlex component containing custom code 
* intended for NetSuite (www.netsuite.com) and use the SuiteScript API. 
* The code is provided "as is": ALPHABOLD Inc. shall not be liable 
* for any damages arising out the intended use or if the code is modified 
* after delivery. 
* 
* Company:		ALPHABOLD Consultants LLC, www.AlphaBOLDconsultants.com 
* Author:		marslan@AlphaBOLD.com 
* File:		    ab_mr_first_schedule_run_date.js 
* Date:		    15/04/2022 
* 
***********************************************************************/

define(['N/record', 'N/log', 'N/search'], function (record, log, search) {

    function getInputData() {
        var title = 'getInputData::()';
        try {
            var customrecord_wipfli_prdSearchObj = search.create({
                type: "customrecord_wipfli_prd",
                filters:
                    [
                        ["custrecord_wipfli_prdtask_prdord.lastmodified", "within", "today"]
                    ]
            });
            return customrecord_wipfli_prdSearchObj;
        } catch (e) {
            log.debug({
                title: title + e.message,
                details: e.error
            });
        }
    }

    function map(context) {
        var title = 'map::()';
        try {
            log.debug({ title: 'Map', details: 'Context value is ' + context.value });
            var LastModifiedProdOrder = JSON.parse(context.value);
            var Modifiedid = LastModifiedProdOrder.id;
            log.debug('Modifiedid', Modifiedid);
            /* @author marslan@AlphaBOLD.com
            * @param [number] Modifiedid*/
            updateProductionOrderDateField(Modifiedid);
        } catch (e) {
            log.debug({
                title: title + e.message,
                details: e.error
            });
        }

    }
    function updateProductionOrderDateField(id) {
        var title = 'updateProductionOrderDateField::()';
        try {
            var MaxDateArray = [];
            var obj;
            var customrecord_wipfli_prdtaskSearchObj = search.create({
                type: "customrecord_wipfli_prdtask",
                filters:
                    [
                        ["custrecord_wipfli_prdtask_prdord", "anyof", id]
                    ],
                columns:
                    // [
                    //     search.createColumn({ name: "custrecord_wipfli_prdtask_date", label: "Date" })
                    // ]
                    [
                        search.createColumn({
                           name: "custrecord_wipfli_prdtask_date",
                           summary: "MIN",
                           label: "Date"
                        }),
                        search.createColumn({
                           name: "custrecord_wipfli_prdtask_date",
                           summary: "MAX",
                           label: "Date"
                        })
                     ]
            });
            customrecord_wipfli_prdtaskSearchObj.run().each(function (result) {
                obj={};
                var MaxDate = result.getValue({ name: 'custrecord_wipfli_prdtask_date',summary: search.Summary.MAX });
                var MinDate = result.getValue({ name: 'custrecord_wipfli_prdtask_date',summary: search.Summary.MIN });
                obj.max=MaxDate;
                obj.min=MinDate;
                MaxDateArray.push(obj);
                return true;
            });
            log.debug({
                title: 'MaxDateArray',
                details: MaxDateArray
            });
            log.debug({
                title: 'obj',
                details: obj
            });
            if (obj) {
                var productionOrderOBJ = record.load({
                    type: 'customrecord_wipfli_prd',
                    id: id,
                    isDynamic: true,
                });
                if(obj.min){
                    productionOrderOBJ.setValue({
                        fieldId: 'custrecord_prd_scheduledrundate_first',
                        value: new Date(obj.min)//previous date
                    });
                }
                if(obj.max){
                    productionOrderOBJ.setValue({
                        fieldId: 'custrecord_prd_scheduledrundate_last',
                        value: new Date(obj.max)//most updated date
                    });
                }
                var ProductionOrderSaveID = productionOrderOBJ.save();
                log.debug('ProductionOrderSaveID', ProductionOrderSaveID);
            }
        } catch (e) {
            log.debug({
                title: title + e.message,
                details: e.error
            });
        }
    }

    function reduce(context) {

    }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
