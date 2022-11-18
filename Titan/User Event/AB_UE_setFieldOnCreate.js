/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/runtime'], function(runtime) {

    function beforeLoad(context) {
        
    }

    function beforeSubmit(context) {
        var title = 'beforeSubmit(::)';
        try{
            var rec = context.newRecord;
            log.debug('context.type',context.type);
                // var subsidiary = rec.getValue({fieldId: 'subsidiary'});
                // if(subsidiary == 2){
                //     rec.setValue({fieldId: 'taxable',value: true});
                //     rec.setValue({fieldId: 'taxitem',value: 4904});
                // }
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
    }

    function afterSubmit(context) {
        log.debug('runtime.ContextType',runtime.ContextType);
        log.debug('context.type',context.type);
        var title = 'afterSubmit(::)';
        try{
            var rec = context.newRecord;
                // var subsidiary = rec.getValue({fieldId: 'subsidiary'});
                // if(subsidiary == 2){
                //     rec.setValue({fieldId: 'taxable',value: true});
                //     rec.setValue({fieldId: 'taxitem',value: 4904});
                // }
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
    }

    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit
        afterSubmit: afterSubmit
    }
});
