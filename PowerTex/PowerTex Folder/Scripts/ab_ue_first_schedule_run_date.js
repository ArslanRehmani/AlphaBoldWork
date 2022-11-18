/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
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
* File:		    ab_ue_first_schedule_run_date.js 
* Date:		    29/04/2022 
* Revision:     hriaz@alphabold.com
* date:         6/14/2022
* details:      Updated script for XEdit
* 
***********************************************************************/
define(['N/record', 'N/log','N/search'], function (record, log,search) {

    function afterSubmit(context) {
        var title = 'afterSubmit()::';
        try {
            var objRecord = context.newRecord;
            var currentRecID = objRecord.id;
            var currentRecType = objRecord.type;
            log.debug('currentRecID', currentRecID);
            objRecord = record.load({
                type :currentRecType,
                id :currentRecID
            });
            var ProductionOrderID = objRecord.getValue({fieldId : 'custrecord_wipfli_prdtask_prdord'});
            log.debug('ProductionOrderID', ProductionOrderID);
            var obj;
            var customrecord_wipfli_prdtaskSearchObj = search.create({
                type: "customrecord_wipfli_prdtask",
                filters:
                [
                   ["custrecord_wipfli_prdtask_prdord.internalidnumber","equalto",ProductionOrderID]
                ],
                columns:
                [
                   search.createColumn({
                      name: "custrecord_wipfli_prdtask_prdord",
                      summary: "GROUP",
                      label: "Production Order"
                   }),
                   search.createColumn({
                      name: "custrecord_wipfli_prdtask_date",
                      summary: "MAX",
                      label: "Date"
                   }),
                   search.createColumn({
                      name: "custrecord_wipfli_prdtask_date",
                      summary: "MIN",
                      label: "Date"
                   })
                ]
             });
             var searchResultCount = customrecord_wipfli_prdtaskSearchObj.runPaged().count;
             log.debug("customrecord_wipfli_prdtaskSearchObj result count",searchResultCount);
             customrecord_wipfli_prdtaskSearchObj.run().each(function(result){
                obj={};
                var MaxDate = result.getValue({ name: 'custrecord_wipfli_prdtask_date',summary: search.Summary.MAX });
                var MinDate = result.getValue({ name: 'custrecord_wipfli_prdtask_date',summary: search.Summary.MIN });
                obj.max=MaxDate;
                obj.min=MinDate;
                return true;
             });
             log.debug({
                title: 'obj',
                details: obj
            });
          
                var productionOrderOBJ = record.load({
                    type: 'customrecord_wipfli_prd',
                    id: ProductionOrderID,
                    isDynamic: true,
                });
                if(obj.max && obj.min){
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_prd_scheduledrundate_first',
                    value: new Date(obj.min)//previous date
                });
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_prd_scheduledrundate_last',
                    value: new Date(obj.max)//most updated date
                });
            }else{
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_prd_scheduledrundate_first',
                    value: ''//previous date
                });
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_prd_scheduledrundate_last',
                    value: ''//most updated date
                });
            }
                var productionOrderOBJID = productionOrderOBJ.save();
                    log.debug('productionOrderOBJID', productionOrderOBJID);
   

        }
        catch (e) {
            log.debug(e+title, e.message);
        }
    }


    return {
        afterSubmit: afterSubmit
    }
});
