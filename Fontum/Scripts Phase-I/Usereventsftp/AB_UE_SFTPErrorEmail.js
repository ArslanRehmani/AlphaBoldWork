/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
// eslint-disable-next-line no-undef
define(['../dao/AB_CLS_Email.js','N/log'], function(CLSEmail,log) {

    function afterSubmit(context) {
        var title = 'afterSubmit()::';
         try{
            if(context.type == context.UserEventType.CREATE){
                var rec = context.newRecord;
                var recid = rec.id;
                var customer = rec.getValue('custrecord_ab_customer');
                var sapId = rec.getValue('custrecord_ab_customer_sap_id');
                var msg = rec.getValue('custrecord_ab_error_message');
                log.debug(title+'customer:sapId:msg',customer+':'+sapId+':'+msg);
                if(!customer && !sapId && msg){
                    CLSEmail.sendConnectionErrorEmail(recid,msg);
                }
            }

         
            }catch(error){
                log.error(title+error.name,error.message);
        } 
    }

    return {
        afterSubmit: afterSubmit
    };
});
