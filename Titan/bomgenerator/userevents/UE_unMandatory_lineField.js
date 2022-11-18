/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/log', 'N/ui/serverWidget'], function (log, serverWidget) {

    function beforeLoad(context) {
        var title = 'beforeLoad::()';
        try {
            var form = context.form;
            var sublistObj = form.getSublist({
                id: 'line'
            });
            var account = sublistObj.getField({
                id: 'account'
            });
            account.isMandatory = false;
            account.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            var amount = sublistObj.getField({
                id: 'amount'
            });
            amount.isMandatory = false;
            amount.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
        } catch (e) {
            log.debug({
                title: title + e.mesage,
                details: e.error
            });
        }
    }   


    return {
        beforeLoad: beforeLoad
    }
});