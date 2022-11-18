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
 * Author:      mazhar@alphabold.com
 * File:        CS_DisableFieldsOfQuote.js
 * Date:        11/1/2019
 *
 *
 ***********************************************************************/
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define(['N/ui/message', 'N/currentRecord', 'N/search', 'N/record'],
    function (uiMessage, currentRecord, nsSearch, nsRecord) {
        function lineInit(context) {
            var currentRecord = context.currentRecord;
            var sublistId = context.sublistId;
            if (currentRecord.type === 'estimate' && sublistId === 'item') {
                setTimeout(function () {
                    var count = currentRecord.getLineCount({sublistId: 'item'});
                    var line = currentRecord.getCurrentSublistIndex({sublistId: 'item'});
                    if (line < count) {
                        try {
                            var rate = currentRecord.getSublistField({sublistId: 'item', fieldId: "rate", line: line});
                            var priceLevel = currentRecord.getSublistField({
                                sublistId: 'item',
                                fieldId: "pricelevels",
                                line: line
                            });
                            rate.isDisabled = true;
                            priceLevel.isDisabled = true;
                        } catch (e) {
                        }
                        try {
                            jQuery("[name=inpt_price]").replaceWith('<span>' + jQuery("[name=inpt_price]").attr('title') + '</span>');
                        }catch (e) {
                        }
                    }
                }, 500)
            }
        }

        function validateField(context) {
            var currentRecord = context.currentRecord;
            var fieldName = context.fieldId;
            var sublistId = context.sublistId;
            if (currentRecord.type === 'estimate' && sublistId === 'item') {
                var count = currentRecord.getLineCount({sublistId: 'item'});
                var line = currentRecord.getCurrentSublistIndex({sublistId: 'item'});
                try {
                    var rate = currentRecord.getSublistField({sublistId: 'item', fieldId: "rate", line: line});
                    var priceLevel = currentRecord.getSublistField({
                        sublistId: 'item',
                        fieldId: "pricelevels",
                        line: line
                    });
                    rate.isDisabled = true;
                    priceLevel.isDisabled = true;
                } catch (e) {
                }
                try {
                    jQuery("[name=inpt_price]").replaceWith('<span>' + jQuery("[name=inpt_price]").attr('title') + '</span>');
                }catch (e) {
                }
                if (fieldName === 'rate' || fieldName === 'privelevels') {
                    return false;
                }
            }
            return true;
        }

        function validateLine(context) {
            var currentRecord = context.currentRecord;
            var sublistId = context.sublistId;
            if (currentRecord.type === 'estimate' && sublistId === 'item') {
                var count = currentRecord.getLineCount({sublistId: 'item'});
                var line = currentRecord.getCurrentSublistIndex({sublistId: 'item'});
                if (line < count) {
                    try {
                        var rate = currentRecord.getSublistField({sublistId: 'item', fieldId: "rate", line: line});
                        var priceLevel = currentRecord.getSublistField({
                            sublistId: 'item',
                            fieldId: "pricelevels",
                            line: line
                        });
                        rate.isDisabled = true;
                        priceLevel.isDisabled = true;
                    } catch (e) {
                    }
                    try {
                        jQuery("[name=inpt_price]").replaceWith('<span>' + jQuery("[name=inpt_price]").attr('title') + '</span>');
                    }catch (e) {
                    }
                }
            }
            return true;
        }

        return {
            validateField: validateField,
            lineInit: lineInit,
            validateLine: validateLine
        };
    }
)
;
