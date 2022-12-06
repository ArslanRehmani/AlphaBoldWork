/**
 * @NApiVersion 2.0
 */
 define(['N/log', 'N/record',],
 /**
  * @param{log} log
  * @param{record} record
  */
 function (log, record) {
     return {
         internalID: {
             reccordType: 'customrecord_ab_sp_error_log'
         },
         fields: {
             nameField: 'custrecord_ab_error_name',
             messageField: 'custrecord_ab_error_name',
             triggerPiontField: 'custrecord_ab_error_name'
         },
         createError: function(name,message,title){
            var title = 'createError(::)';
            try{
                var errorRecord = record.create({
                    type: this.internalID.reccordType
                });
                if(name){
                    errorRecord.setValue({
                        fieldId: this.fields.nameField,
                        value: name
                    });
                }
                errorRecord.setValue({
                    fieldId: this.fields.messageField,
                    value: message
                });
                errorRecord.setValue({
                    fieldId:  this.fields.triggerPiontField,
                    value: title
                });
                var errorRecId = errorRecord.save();
                return errorRecId;
            } catch(e) {
                log.debug('Exception ' +title, e.message);
            }
            
         },
         getList: function(){
            var title = 'getList(::)';
            try{
                // Something
            } catch(e) {
                log.debug('Exception ' +title, e.message);
            }
            
         }
     }

 });