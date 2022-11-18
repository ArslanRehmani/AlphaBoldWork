/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(['N/log','N/ui/dialog'], function(log,dialog) {

    function fieldChanged(context) {
        var title = 'fieldChanged(::)';
        try{
            var rec = context.currentRecord;
            var fieldId = context.fieldId;
            if(fieldId == 'isinactive'){
                    dialog.confirm({
                        title: '<span>STOP ?</span>',
                        message: '<b>If you change this field Previous Records are inactive!</b>'
                    }).then(function (option) {
                        if (option) {
                            rec.setValue({
                                fieldId: 'isinactive',
                                value: false,
                                ignoreFieldChange: true
                            });
                        }
                    }).catch(function (e) {
                        throw new Error('ERROR', e.message);
                    });
                }else {
                    return true;
                }
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
        
    }

    
    return {
        fieldChanged: fieldChanged
    }
});
