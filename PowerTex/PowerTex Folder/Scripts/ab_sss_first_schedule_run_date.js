/**
 *@NApiVersion 2.0
 *@NScriptType ScheduledScript
 */
define(['N/record', 'N/log', 'N/search'], function (record, log, search) {

    function execute(context) {
        var title = 'execute()::';
        try {
            var MaxDateArray = [];
            var objIDArray = [];
            var obj;
            var customrecord_wipfli_prdtaskSearchObj = search.create({
                type: "customrecord_wipfli_prdtask",
                filters:
                    [
                        ["custrecord_wipfli_prdtask_prdord", "anyof", '1024']
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_wipfli_prdtask_duedate", label: "Production Order Due Date" }),
                        search.createColumn({ name: "custrecord_wipfli_prdtask_prdord", label: "Production Order" })
                    ]
            });
            var searchResultCount = customrecord_wipfli_prdtaskSearchObj.runPaged().count;
            log.debug("customrecord_wipfli_prdtaskSearchObj result count", searchResultCount);
            customrecord_wipfli_prdtaskSearchObj.run().each(function (result) {
                obj = {};
                var dueDate = result.getValue({ name: 'custrecord_wipfli_prdtask_duedate' });
                obj.id = result.getValue({ name: 'custrecord_wipfli_prdtask_prdord' });
                MaxDateArray.push(dueDate);
                objIDArray.push(obj);
                return true;
            });
            log.debug({
                title: 'MaxDateArray',
                details: MaxDateArray
            });
            log.debug({
                title: 'objIDArray',
                details: objIDArray
            });
            if (objIDArray.length>0) {
                var recIDOBJ = objIDArray[0];
                var recID = recIDOBJ.id;
                log.debug('recID', recID);
                var sortArray = MaxDateArray.sort();
                log.debug('sortArray', sortArray);
                var latestDate = sortArray[sortArray.length - 1];
                log.debug('latestDate', latestDate);
                var FirstDate = sortArray[0];
                log.debug('FirstDate', FirstDate);
                var productionOrderOBJ = record.load({
                    type: 'customrecord_wipfli_prd',
                    id: recID,
                    isDynamic: true,
                });
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_prd_scheduledrundate_first',
                    value: new Date(FirstDate)
                });
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_prd_scheduledrundate_last',
                    value: new Date(latestDate)
                });
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord_ab_test_date',
                    value: new Date(FirstDate)
                });
                productionOrderOBJ.setValue({
                    fieldId: 'custrecord6',
                    value: new Date(latestDate)
                });
                var mid = productionOrderOBJ.save();
                log.debug('mid', mid);
            }
        }
        catch (e) {
            log.debug(e + title, e.message);
        }
    }


    return {
        execute: execute
    }
});
