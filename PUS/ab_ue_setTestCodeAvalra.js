    /*
    ***********************************************************************
    *
    * The following javascript code is created by AlphaBOLD Inc.,
    * a NetSuite Partner. It is a SuiteCloud component containing custom code
    * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
    * The code is provided "as is": AlphaBOLD shall not be liable
    * for any damages arising out the intended use or if the code is modified
    * after delivery.
    *
    * Company:     AlphaBOLD Inc., www.alphabold.com
    * Author:      hriaz@alphabold.com
    * File:        ab_ue_setTestCodeAvalra.js
    * Date:        7/19/2022
    *
    *
    ***********************************************************************/
/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
// eslint-disable-next-line no-undef
define(['N/runtime', 'N/log', 'N/record'], function (runtime, log, record) {

    function afterSubmit(context) {
        var title = 'afterSubmit()::';
        var taxCodeInternalId =  runtime.getCurrentScript().getParameter({ name: 'custscript_ab_avalara_taxcode'});
        var customFormId = runtime.getCurrentScript().getParameter({ name: 'custscript_ab_sales_order_form_id' });
        try {
            var ItemRec = context.newRecord;
            var createdFromSaleOrderID = ItemRec.getValue({
                fieldId: 'createdfrom'
            });
            var createdFromText = ItemRec.getText({
                fieldId: 'createdfrom'
            });
            var saleOrder = createdFromText.slice(0, 11);
            log.debug('saleOrder', saleOrder);
            if (saleOrder == 'Sales Order') {
                var SaleOrderOBJ = record.load({
                    type: 'salesorder',
                    id: createdFromSaleOrderID
                });
                var lineCount = SaleOrderOBJ.getLineCount({
                    sublistId: 'item'
                });
                var customform = SaleOrderOBJ.getValue({
                    fieldId: 'customform'
                });
                log.debug('customform', customform);
               
                log.debug('scriptObject', customFormId);
                if (customform == customFormId) {
                    for (var i = 0; i < lineCount; i++) {
                        SaleOrderOBJ.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            line: i,
                            value: taxCodeInternalId
                        });
                    }
                }
                SaleOrderOBJ.save();
            }
        } catch (e) {
            log.debug({
                title: title + e.name,
                details: e.message
            });
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});