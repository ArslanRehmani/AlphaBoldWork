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
 * File:        AB_NL_UE_SetInventoryNumberValues.js
 * Date:        2/10/2020
 ***********************************************************************/
define(['N/record', 'N/search', 'N/runtime', 'N/https', 'N/url', '../utils/AB_NL_UTL_SetInventoryNumberValues'],
    function (record, search, runtime, https, url, mUtil) {
        function afterSubmit(context) {
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                var currentRecordId = context.newRecord.id, currentRecordType = context.newRecord.type;
                var nsRec = record.load({type: context.newRecord.type, id: currentRecordId});
                var scriptObject = runtime.getCurrentScript();
                var scheduledScriptId = scriptObject.getParameter({name: "custscript_ab_schscriptid"});
                var scheduledScriptDepId = scriptObject.getParameter({name: "custscript_schscrdepid"});
                var inventoryNumbersInfo;
                var invNumberRecs;
                var MAX_INVENTORYNUMBER_TO_UPDATE = 80;
                var udiParsedValues, valuesToSet = {}, fieldsMap, itemRevId;
                var logTitle = "[AB] Update Inventory Numbers - " + currentRecordType + " - " + currentRecordId;
                var logs = [];
                try {
                    if (!validateTransaction(nsRec)) {
                        log.error("No need to update inventory numbers.");
                        return;
                    }
                    inventoryNumbersInfo = mUtil.getInventoryNumberOnTransaction(currentRecordId);
                    log.debug("inventoryNumbersInfo", JSON.stringify(inventoryNumbersInfo));
                    logs.push({
                        title: logTitle,
                        details: JSON.stringify(inventoryNumbersInfo)
                    });
                    if (!!inventoryNumbersInfo && !!inventoryNumbersInfo.inventoryNumbers
                        && inventoryNumbersInfo.inventoryNumbers.length > 0) {

                        if (inventoryNumbersInfo.inventoryNumbers.length <= MAX_INVENTORYNUMBER_TO_UPDATE) {
                            fieldsMap = mUtil.getSourceTargetMap();
                            for (var i = 0; i < inventoryNumbersInfo.inventoryNumbers.length; i++) {
                                log.debug("Going to set values on Inventory Number Record for :" +
                                    JSON.stringify(inventoryNumbersInfo.inventoryNumbers[i]));

                                logs.push({
                                    title: logTitle,
                                    details: "Going to set values on Inventory Number Record for :" +
                                        JSON.stringify(inventoryNumbersInfo.inventoryNumbers[i])
                                });

                                udiParsedValues = mUtil.parseUDI(inventoryNumbersInfo.inventoryNumbers[i].number,
                                    inventoryNumbersInfo.inventoryNumbers[i]["islotitem"], inventoryNumbersInfo.inventoryNumbers[i]["isserialitem"]);


                                if (mUtil.allowedTransactionsToSaveItemRevision().indexOf(context.newRecord.type) > -1) {
                                    if (!udiParsedValues) udiParsedValues = {};
                                    udiParsedValues["ItemRevision"] = inventoryNumbersInfo.inventoryNumbers[i].itemrevision;

                                    if (context.newRecord.type == record.Type.ASSEMBLY_BUILD) {
                                        itemRevId = nsRec.getValue({fieldId: "custbody_nm_item_revision"});
                                        udiParsedValues["ItemRevision"] = itemRevId;
                                    }
                                }

                                log.debug("udiParsedValues : ", JSON.stringify(udiParsedValues));
                                logs.push({
                                    title: logTitle + " udiParsedValues : ",
                                    details: JSON.stringify(udiParsedValues)
                                });

                                for (var f in fieldsMap) {
                                    //if (!!udiParsedValues[fieldsMap[f]])
                                    valuesToSet[f] = !!udiParsedValues[fieldsMap[f]] ? udiParsedValues[fieldsMap[f]] : "";
                                }

                                log.debug("valuesToSet", JSON.stringify(valuesToSet));
                                log.debug("Submitting Inventory Number Record ", JSON.stringify(inventoryNumbersInfo.inventoryNumbers[i]));

                                logs.push({
                                    title: logTitle + " valuesToSet : ",
                                    details: JSON.stringify(valuesToSet)
                                });

                                record.submitFields({
                                    type: "inventorynumber", id: inventoryNumbersInfo.inventoryNumbers[i].id,
                                    values: valuesToSet
                                });
                                log.debug("Inventory Number Record Saved");
                                logs.push({
                                    title: logTitle + " valuesToSet : ",
                                    details: "Inventory Number Record Saved"
                                });
                            }
                        } else {
                            log.debug(" Inventory Numbers are greather than allowed limit of " + MAX_INVENTORYNUMBER_TO_UPDATE);
                            log.debug(" Adding Item Receipt to be processed by Scheduled Script");
                            mUtil.addItemReceiptToQue(currentRecordId);
                            mUtil.callScheduledScriptToSetInvNumValues(scheduledScriptId, scheduledScriptDepId);
                            logs.push({
                                title: logTitle,
                                details: " Inventory Numbers are greather than allowed limit of " + MAX_INVENTORYNUMBER_TO_UPDATE
                            });
                        }
                    }

                    log.debug("Record Type : ", context.newRecord.type);
                    //Handle Assembly Build On Item Receipt
                    if (context.newRecord.type == record.Type.ITEM_RECEIPT) {
                        log.debug("Calling handler for Assembly Build on Item Receipt Lines.");
                        logs.push({
                            title: logTitle,
                            details: "Calling handler for Assembly Build on Item Receipt Lines."
                        });
                        handleAssemblyBuildOnItemReceipt(nsRec);
                    }

                    mUtil.addLogs(logs);
                } catch (ex) {
                    logs.push({
                        title: logTitle,
                        details: ex.toString()
                    });
                    mUtil.addLogs(logs);
                }
            }
        }

        function validateTransaction(nsRec) {
            var result = true;
            if (!!nsRec && nsRec.type == record.Type.ITEM_RECEIPT) {
                var createdFrom = nsRec.getValue({fieldId: "createdfrom"});
                var createdFromType = search.lookupFields({
                    type: "transaction",
                    id: createdFrom,
                    columns: ["type"]
                });
                if (createdFromType.type[0].value != "PurchOrd") {
                    result = false;
                }
            }
            return result;
        }

        function handleAssemblyBuildOnItemReceipt(nsRec) {
            var lineCount = nsRec.getLineCount({sublistId: "item"});
            var MAX_LINES_TO_HANDLE = 10;
            var linesHandled = 0, linkedassemblybuild;
            var ASSEMBLY_BUILD_RECORD_TYPE = "assemblybuild";


            for (var i = 0; i < lineCount; i++) {
                linkedassemblybuild = nsRec.getSublistValue({
                    sublistId: "item",
                    fieldId: "linkedassemblybuild",
                    line: i
                });

                if (!!linkedassemblybuild) {
                    https.request({
                        method: https.Method.GET,
                        url: url.resolveScript({
                                scriptId: 'customscript_ab_loadsaverecord',
                                deploymentId: 'customdeploy_ab_loadsaverecord',
                                returnExternalUrl: true
                            }) + "&rectype=" + ASSEMBLY_BUILD_RECORD_TYPE
                            + "&recid=" + linkedassemblybuild
                    });
                    linesHandled++;
                }
            }
        }

        return {
            afterSubmit: afterSubmit
        };
    });