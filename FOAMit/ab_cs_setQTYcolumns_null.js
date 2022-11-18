/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(['N/log', 'N/currentRecord', 'N/record'], function (log, currentRecord, record) {

  
    function clearQTY(e) {
        var title = 'clearQTY()::';
        try {
            var curRec = currentRecord.get();
            for (var i = 1; i < 10; i++) {
                var sublist = curRec.getSublist({
                    sublistId: 'price'+i
                });

                if (sublist) {
                    var lines = curRec.getLineCount({
                        sublistId: 'price'+i
                    });
                    log.debug(title + 'Lins', lines);
                    for (var x = 0; x < lines; x++) {
                        curRec.selectLine({
                            sublistId: 'price'+i,
                            line: x
                        });
                        // var discount = curRec.getCurrentSublistValue({
                        //     sublistId: 'price'+i,
                        //     fieldId: 'discount',
                        // });
                        // log.debug(title + 'discount', discount);
                        // curRec.setCurrentSublistValue({
                        //     sublistId: 'price'+i,
                        //     fieldId: 'discount',
                        //     value: '',
                        //     ignoreFieldChange: false
                        // });
                        // log.debug(title + 'discount after', discount);
                        var amount = curRec.getCurrentSublistValue({
                            sublistId: 'price'+i,
                            fieldId: 'price_1_'
                        });
                          log.debug(title + 'amount', amount);
                        curRec.setCurrentSublistValue({
                            sublistId:'price'+i,
                            fieldId: 'price_1_',
                            value: '',
                            ignoreFieldChange: false
                        });
                        log.debug(title + 'amount after', amount);
                        curRec.commitLine({
                            sublistId: 'price'+i
                        });
                    }
                }
            }
            // curRec.save();
            // location.reload();
        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }
    function pageInit(context) {
        var title = 'pageInit()::';
        try {
            // window.clearPrice = clearPrice;
        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }


    return {
        pageInit: pageInit,
        clearQTY:clearQTY
    }
});