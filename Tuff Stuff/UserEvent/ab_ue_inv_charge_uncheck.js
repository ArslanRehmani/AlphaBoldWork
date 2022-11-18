/*
 ***********************************************************************
 *
 * The following javascript code is created by AlphaBOLD Inc.,
 * a NetSuite Partner. It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": AlphaBOLD Inc. shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:		AlphaBOLD Inc., www.alphabold.com
 * Author:		ibudimir@fmtconsultants.com
 * File:		AB_SUE_UncheckChargeInterest.js
 * Date:		06/07/2022
 *
 ***********************************************************************/


/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/log'], function (record, log) {
    function afterSubmit_uncheckChargeInterest(context) {
        var title = 'afterSubmit()::';
        try {
            var thisRecord = context.newRecord;
            var invNums = thisRecord.getValue({
                fieldId: 'memo'
            });
            log.debug({
                title: 'invNums',
                details: invNums
            });
            if (invNums) {
                var arr = invNums.split(',');
                log.debug({
                    title: 'arr',
                    details: JSON.stringify(arr)
                });

                for (var i = 0; i < arr.length; i++) {
                    var oldInvoice = record.load({
                        type: record.Type.INVOICE,
                        id: arr[i],
                        isDynamic: true,
                    });

                    oldInvoice.setValue({
                        fieldId: 'custbody_charge_interest',
                        value: false
                    });

                    var oldInvoiceId = oldInvoice.save({
                        nableSourcing: false,
                        ignoreMandatoryFields: true
                    });

                    log.debug({
                        title: 'oldInvoiceId',
                        details: oldInvoiceId
                    });
                }
            } else {
                log.debug({
                    title: 'No data in Memo',
                    details: 'No data'
                });
            }
        } catch (e) {
            log.debug({
                title: title + e.message,
                details: e.error
            });
        }
    }

    return {
        afterSubmit: afterSubmit_uncheckChargeInterest
    }
});
