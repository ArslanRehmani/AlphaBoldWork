/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/log','N/search','N/record','N/error'], function(log,search,record,error) {


    function afterSubmit(context) {
        var Rec = context.newRecord;
        try {
            log.debug({
                title: 'Rec.getValue({fieldId})',
                details: Rec.getValue({fieldId: 'name'})
            });
            // var filters = [];
            // filters[0] = search.createFilter({name: 'name',operator: search.Operator.IS,values: Rec.getValue({fieldId: 'name'})}); //This filters out the field to be set unique assuming name is our unique Field.
            // var column = [];
            // column[0] = search.createColumn({name: 'name'});
            var rec = search.create({
                type: 'customrecord_cap_server_cust',
                columns: [
                    search.createColumn({name: 'name'})
                ],
                filters: [
                    search.createFilter({name: 'name',operator: search.Operator.IS,values: Rec.getValue({fieldId: 'name'})})
                ]
                    
            });
            log.debug({
                title: 'rec.length',
                details: rec.length
            });
            for(var i = 0; i<rec.length&&rec!=null; i++){
                if(rec[i].getValue(column[0])== Rec.getValue({fieldId: 'name'})){
                
                var custom_error = error.create({
                    name: 'ERROR',
                    message: 'Server Name already Exist',
                    notifyOff: false
                });
            return false;
            }else{
                alert('heloo');
            }
        }
            return true;
        } catch (error) {
            log.debug({
                title: error.title,
                details: error.message
            })
        }
    }
    return {
        afterSubmit: afterSubmit
    }
});
