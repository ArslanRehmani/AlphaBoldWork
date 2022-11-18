/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/log'], function (log) {

    function beforeLoad(context) {
        var title = 'beforeLoad()::';
        try {
            var form = context.form;
            if(context.type == context.UserEventType.CREATE  || context.type == context.UserEventType.COPY){

                var priceList = form.getSublist({
                    id: "price1"
                });
                log.debug('price1',priceList);
                form.addButton({
                    id: "custpage_clear_price",
                    label: "Clear QTY",
                    functionName: "clearQTY"
                });
                form.clientScriptModulePath = 'SuiteScripts/AlphaBold/PriceClearButtonCustomization/ab_cs_setQTYcolumns_null.js';
            }
 
        } catch (error) {
            log.error(title + error.name, error.message);
        }

    }
    return {
        beforeLoad: beforeLoad
    };
});