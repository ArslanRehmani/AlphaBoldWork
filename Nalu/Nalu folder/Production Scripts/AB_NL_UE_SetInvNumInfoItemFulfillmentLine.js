/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/record','N/search','N/log'], function(record,search,log) {


    function afterSubmit(context) {
        var title = 'afterSubmit::()';
        try{
            var rec = context.newRecord;
            var recID = rec.id;
            var invDetailArray = [];
            var nsTranRec = record.load({type: context.newRecord.type, id: recID, isDynamic: true});
            var saveRecord = false;
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                   ["internalid","anyof","288695"], 
                   "AND", 
                   ["inventorydetail.inventorynumber","noneof","@NONE@"]
                ],
                columns:
                [
                   search.createColumn({
                      name: "inventorynumber",
                      join: "inventoryDetail",
                      label: " Number"
                   }),
                   search.createColumn({
                      name: "expirationdate",
                      join: "inventoryDetail",
                      label: "Expiration Date"
                   })
                ]
             });
             var searchResultCount = transactionSearchObj.runPaged().count;
             log.debug("transactionSearchObj result count",searchResultCount);
             transactionSearchObj.run().each(function(result){
                invDetailArray.push({
                    date: result.getValue({name: "expirationdate", join: "inventoryDetail"}),
                    number: result.getText({name: "inventorynumber", join: "inventoryDetail"})
                });
                return true;
             });
             log.debug("invDetailArray", invDetailArray);
             for(var i = 0 ; i<=searchResultCount; i++){
                nsTranRec.selectLine({sublistId: "item", line: i});
                if (!!invDetailArray && invDetailArray.length > 0) {
                    nsTranRec.setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_invnuminfo",
                        value: JSON.stringify(invDetailArray)
                    });
                    nsTranRec.commitLine({sublistId: "item"});
                    saveRecord = true;
                } else {
                    log.debug("Setting custcol_invnuminfo empty");
                    nsTranRec.setCurrentSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_invnuminfo",
                        value: ""
                    });
                    nsTranRec.commitLine({sublistId: "item"});
                    saveRecord = true;
                }
             }
             if (saveRecord) nsTranRec.save();

        }catch(e){
            log.debug({
                title: title + e.message,
                details: e.error
            })
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});
