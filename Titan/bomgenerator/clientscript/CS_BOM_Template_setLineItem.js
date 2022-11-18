/**
 *@NApiVersion 2.0
*@NScriptType ClientScript
*
*/
define(['N/log', 'N/runtime', 'N/record', 'N/search'],
    /**
     * @param{runtime} runtime
    */
    function (log, runtime, record, search) {

        function fieldChanged(context) {
            var title = 'lineInit::()';
            try {
                if (context.sublistId == "line" && context.fieldId == "custcol_bomtemplateitem") {
                    var BOMobj = context.currentRecord;
                    console.log('testing');
                    // log.debug('testing');

                    var accId = runtime.getCurrentScript().getParameter({
                        name: 'custscript2'
                    });
                    // log.debug({
                    //     title: 'accId12',
                    //     details: accId
                    // });
                    console.log({
                        title: 'accId12',
                        details: accId
                    });
                    var account = BOMobj.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account'
                    });
                    if (!account) {
                        BOMobj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: accId
                        });
                        console.log({
                            title: 'account set in subfield',
                            details: accId
                        });
                    }
                    var amount = BOMobj.getCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'amount'
                    });
                    if (!amount) {
                        BOMobj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'amount',
                            value: 1
                        });
                    }
                }
            } catch (e) {
                log.debug({
                    title: title + e.message,
                    details: e.message
                });
            }
        }
        return {
            fieldChanged: fieldChanged
        }
    });
