/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeSubmit(context) {
        var rec = context.newRecord;
        var title = 'beforeSubmit(::)';
        try{
            var lineCount = rec.getLineCount({
                sublistId: 'inventory'
            });
            for (var i = 0; i < lineCount; i++) {
                var inventoryDetailRecord = rec.getSublistSubrecord({
                    sublistId: 'inventory',
                    fieldId: 'inventorydetail',
                    line: i
                });
                var invDLineCount = inventoryDetailRecord.getLineCount({
                    sublistId: 'inventoryassignment'
                });
                if (invDLineCount > 0) {
                    var array = [];
                    var obj;
                    for (var inv = 0; inv < invDLineCount; inv++) {
                        obj = {};
                        obj.qty = inventoryDetailRecord.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity',
                            line: inv,
                            value: 2
                        });
                        obj.tobin = inventoryDetailRecord.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'tobinnumber',
                            line: inv,
                            value: 3
                        });
                        obj.frombin = inventoryDetailRecord.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'binnumber',
                            line: inv,
                            value: 119
                        });
                        array.push(obj);
                    }
                    log.debug('arrray',array);
                }
            }
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
    }

    return {
        beforeSubmit: beforeSubmit
    }
});
