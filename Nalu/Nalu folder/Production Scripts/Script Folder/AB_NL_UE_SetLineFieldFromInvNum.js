/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
/***********************************************************************
 *
 * The following javascript code is created by Shoaib Mehmood (Independent Consultant).,
 * It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": Shoaib Mehmood shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     Alphabold
 * Author:      Shoaib Mehmood
 * File:        AB_NL_UE_SetLineFieldFromInvNum.js
 * Date:        2/11/2020
 ***********************************************************************/
define(['N/record', 'N/search', 'N/runtime', 'N/currentRecord', '../utils/AB_NL_UTL_SetInventoryNumberValues'],
    function (record, search, runtime, currentRecord, mUtil) {
        function afterSubmit(context) {
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                var currentRecordId = context.newRecord.id;
                var nsRec = record.load({type: context.newRecord.type, id: currentRecordId, isDynamic: true});
                var scriptObject = runtime.getCurrentScript();
                var lineCount = nsRec.getLineCount({sublistId: "item"});
                var hasSubrecord, objSubRecord, inventoryNumber, subRecLineCount, invNumber, invNumInfo;
                var saveRecord = false;
                var inventoryNumbersInfo = mUtil.getInventoryNumberOnTransactionInvnumbased(currentRecordId);
                var lineItem;

                log.debug("inventoryNumbersInfo", JSON.stringify(inventoryNumbersInfo));

                for (var i = 0; i < lineCount; i++) {
                    hasSubrecord = false;
                    try {
                        hasSubrecord = nsRec.hasSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                            line: i
                        });
                    } catch (ex) {
                        //log.error("error", ex.toString());
                    }

                    if (hasSubrecord) {
                        nsRec.selectLine({sublistId: "item", line: i});
                        lineItem = nsRec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });

                        objSubRecord = nsRec.getCurrentSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                            line: i
                        });

                        subRecLineCount = objSubRecord.getLineCount({sublistId: "inventoryassignment"});
                        if (subRecLineCount > 0) {
                            invNumber = objSubRecord.getSublistValue({
                                sublistId: "inventoryassignment",
                                fieldId: "issueinventorynumber",
                                line: 0
                            });

                            if (!invNumber) {
                                invNumber = inventoryNumbersInfo[objSubRecord.getSublistValue({
                                    sublistId: "inventoryassignment",
                                    fieldId: "receiptinventorynumber",
                                    line: 0
                                }) + "|" + lineItem];

                                log.debug("Collecting inventory number info from inventoryNumbersInfo", invNumber);
                            }

                            if (!!invNumber) {
                                invNumInfo = search.lookupFields({
                                    type: "inventorynumber",
                                    id: invNumber,
                                    columns: ["custitemnumber_nm_item_revision"]
                                });

                                if (!!invNumInfo && !!invNumInfo.custitemnumber_nm_item_revision &&
                                    invNumInfo.custitemnumber_nm_item_revision.length > 0) {
                                    nsRec.setCurrentSublistValue({
                                        sublistId: "item",
                                        fieldId: "custcol_nm_item_rev",
                                        value: invNumInfo.custitemnumber_nm_item_revision[0].value
                                    });
                                    nsRec.commitLine({sublistId: "item"});
                                    saveRecord = true;
                                }
                            }
                        }
                    }
                }
                if (saveRecord) nsRec.save();
            }
        }

        return {
            afterSubmit: afterSubmit
        };
    });