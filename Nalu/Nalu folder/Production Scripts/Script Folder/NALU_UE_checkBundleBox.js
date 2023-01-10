/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeSubmit(context) {
        var title = 'afterSubmit(::)';
        try{
            var rec = context.newRecord;
            var state = rec.getValue({
                fieldId: 'shipstate'
            });
            if(state == "CA" || state =="IL" || state == "NJ" || state =="AZ"){
                rec.setValue({
                    fieldId: 'custbody5',
                    value: false
                });
            }else{
                rec.setValue({
                    fieldId: 'custbody5',
                    value: true
                });
            }
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
    }

    return {
        beforeSubmit: beforeSubmit
    }
});
