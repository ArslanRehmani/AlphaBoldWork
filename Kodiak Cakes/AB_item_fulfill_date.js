    /**
     *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */
    define(['N/log','N/record','N/format'], function(log,record,format) {

        function afterSubmit(context) {
        // function beforeLoad(context) {
            var title = 'afterSubmit :: ()';
            try{
                    var rec = context.newRecord;
                var SaleOrderId = rec.getValue({
                    fieldId: 'createdfrom'
                });
                log.debug({
                    title: 'SaleOrderId',
                    details: SaleOrderId
                });
                var ItemFulfillDate = rec.getValue({
                    fieldId: 'trandate'
                });
                var date = new Date(ItemFulfillDate);
                var SORec = record.load({
                    type: record.Type.SALES_ORDER,
                    id: SaleOrderId,
                    isDynamic: true,
                });
                var SOdateSet = SORec.setValue({
                    fieldId: 'custbody_ab_actual_date',
                    value: date, 
                    ignoreFieldChange: true
                });

                log.debug({
                    title: 'Sodate',
                    details: date
                });
                if(context.type == 'create'){
                    var ShipDate = SORec.getValue({
                        fieldId: 'shipdate'
                    });
                    var OriginalDate = SORec.setValue({
                        fieldId: 'custbodycustbody_ab_original_date',
                        value: new Date(ShipDate), 
                        ignoreFieldChange: true
                    });
                }
                SORec.save();
            }catch(e){
                log.debug({
                    title: title + ' ' + e.message,
                    details: e.error
                });
            }
        }


        return {
            afterSubmit: afterSubmit
        }
    });
