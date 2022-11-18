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
 * File:        AB_NL_UE_SetInventoryNumberInfoOnLines.js
 * Date:        12/12/2020
 ***********************************************************************/
define(['N/record', 'N/search', 'N/runtime', 'N/https', 'N/url', '../utils/AB_NL_UTL_SetInventoryNumberInfoTranline'],
    function (record, search, runtime, https, url, mUtil) {
        function afterSubmit(context) {
            try{
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                    var scriptObject = runtime.getCurrentScript();
                    var currentRecordId = context.newRecord.id;
                    var nsTranRec = record.load({type: context.newRecord.type, id: currentRecordId, isDynamic: true});
                    var invNumInfo = mUtil.getInvNumByTranInvIdWise(currentRecordId);
                    var lineCount = nsTranRec.getLineCount({sublistId: "item"});
                    var hasSublistRec, sublistRec, sublistRecLineCount;
                    var lineInvNum, lineInvDetailInfo, saveRecord = false;
                    var lineInvQty;
               
                    for (var i = 0; i < lineCount; i++) {
                        lineInvDetailInfo = [];
                        nsTranRec.selectLine({sublistId: "item", line: i});
                        hasSublistRec = nsTranRec.hasCurrentSublistSubrecord({
                            sublistId: "item",
                            fieldId: "inventorydetail"
                        });
                    
                        if (hasSublistRec) {
                            sublistRec = nsTranRec.getCurrentSublistSubrecord({
                                sublistId: "item",
                                fieldId: "inventorydetail"
                            });
                            sublistRecLineCount = sublistRec.getLineCount({sublistId: "inventoryassignment"});
                            for (var s = 0; s < sublistRecLineCount; s++) {
                                lineInvNum = sublistRec.getSublistText({
                                    sublistId: "inventoryassignment",
                                    fieldId: "issueinventorynumber",
                                    line: s
                                });
                                lineInvQty = sublistRec.getSublistValue({
                                    sublistId: "inventoryassignment",
                                    fieldId: "quantity",
                                    line: s
                                });
                               
                                if(lineInvNum){
                                    invNumInfo[lineInvNum].qty = lineInvQty;
                                    
                                    if (!!invNumInfo[lineInvNum]) {
                                        lineInvDetailInfo.push(invNumInfo[lineInvNum]);
                                    }
                                } 
                            }
                        }
    
                        log.debug("lineInvDetailInfo at line " + i, JSON.stringify(lineInvDetailInfo));
                        if (!!lineInvDetailInfo && lineInvDetailInfo.length > 0) {
                            log.debug("Settingggggg Valeeee========================= " , JSON.stringify(lineInvDetailInfo));
                            nsTranRec.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "custcol_invnuminfo",
                                value: JSON.stringify(lineInvDetailInfo)
                            });
                            nsTranRec.commitLine({sublistId: "item"});
                            saveRecord = true;
                        }
                         else {
                            log.debug("Setting custcol_invnuminfo empty");
                            nsTranRec.setCurrentSublistValue({
                                sublistId: "item",
                                fieldId: "custcol_invnuminfo",
                                value: ""
                            });
                            nsTranRec.commitLine({sublistId: "item"});
                            saveRecord = true;
                        }
                    }
                    if (saveRecord) nsTranRec.save();
                }
            }catch(e){
                log.debug({
                    title: e.message,
                    details: e.error
                })
            }
            
        }

        return {
            afterSubmit: afterSubmit
        };
    });