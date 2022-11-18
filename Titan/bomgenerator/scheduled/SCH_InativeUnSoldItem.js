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
 * File:        SCH_InativeUnSoldItem.js
 * Date:        4/24/2019
 *
 *
 ***********************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/runtime', 'N/task'],
    function (nsSearch, record, runtime, task) {

        var SavedSearchTransactionId = '2763';
        var SavedSearchItemId = '2764';
        var usageLimit = 150;
        var currentProcessingCategoryId = "";
        var lastProcessedItemRecordItemIndex = "";
        var configurationRecId = "1";
        var isLastChunk = false;
        var CategoryId = {
            Transaction: 2,
            Items: 1,
        };

        function getAllCategories(InactiveTime) {
            var categories = [];
            categories.push({
                id: CategoryId.Items,
                name: 'items',
                savedSearchId: SavedSearchItemId,
                filter: ["AND", ["created", "before", "monthsago" + InactiveTime]]
            });
            categories.push({
                id: CategoryId.Transaction,
                name: 'transaction',
                savedSearchId: SavedSearchTransactionId,
                filter: ["And", ["trandate", "within", "monthsago" + InactiveTime]],
            });
            return categories;
        }

        function execute(context) {
            log.debug({title: 'execute', details: 'Start'});
            try {
                var currentCategoryId = runtime.getCurrentScript().getParameter("custscript_cate_id");
                var lastProcessedItemIndex = runtime.getCurrentScript().getParameter("custscript_lasst_item_processed") || 0;
                var InactiveTimeField = nsSearch.lookupFields({
                    "type": "customrecord_bom_configuration",
                    "id": configurationRecId,
                    "columns": ['custrecord_bom_inactivate_items']
                });
                log.debug("inactiveTime", JSON.stringify(InactiveTimeField));
                var InactiveTime = parseInt(InactiveTimeField.custrecord_bom_inactivate_items[0].value);

                log.debug({title: "currentCategoryId", details: currentCategoryId});
                log.debug({title: "lastProcessedItemIndex", details: lastProcessedItemIndex});
                log.debug({title: "InactiveTimeField", details: InactiveTime});

                var categories = getAllCategories(InactiveTime);
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];
                    if (!!currentCategoryId && category.id < currentCategoryId) {
                        continue;
                    }
                    currentProcessingCategoryId = category.id;
                    if (currentProcessingCategoryId != category.id) {
                        currentProcessingCategoryId = category.id;
                        lastProcessedItemRecordItemIndex = 0;
                    } else {
                        lastProcessedItemRecordItemIndex = lastProcessedItemIndex;
                    }

                    log.debug({title: "currentProcessingCategoryId", details: currentProcessingCategoryId});
                    log.debug({title: "category", details: JSON.stringify(category)});

                    var moreRecordsExpected = true;
                    while (moreRecordsExpected) {
                        isLastChunk = false;
                        var records = searchRecord(category.savedSearchId, category.filter, lastProcessedItemRecordItemIndex);
                        if (!records || records.length === 0) {
                            break;
                        }
                        if (records.length == 1000) {
                            moreRecordsExpected = true;
                        } else {
                            moreRecordsExpected = false;
                        }
                        if (!moreRecordsExpected) {
                            isLastChunk = true;
                        }

                        log.debug({title: "moreRecordsExpected", details: moreRecordsExpected});
                        log.debug({title: "isLastChunk", details: isLastChunk});

                        processItem(records, category, lastProcessedItemRecordItemIndex);
                        if (rescheduleIfNeeded()) {
                            log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                            moreRecordsExpected = false;
                            return;
                        }
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        moreRecordsExpected = false;
                        return;
                    }
                }

            } catch (e) {
                log.error({title: 'execute', details: JSON.stringify(e)});
            }
            log.debug({title: 'execute', details: 'End'});
        }

        function rescheduleIfNeeded() {
            try {
                var params = {
                    "custscript_cate_id": currentProcessingCategoryId,
                    "custscript_lasst_item_processed": lastProcessedItemRecordItemIndex
                };
                var scriptObj = runtime.getCurrentScript();
                var usageRemaining = scriptObj.getRemainingUsage();
                log.debug({title: 'usageRemaining', details: usageRemaining});
                if (usageRemaining < usageLimit) {
                    rescheduleScript(scriptObj.id, scriptObj.deploymentId, params);
                    return true;
                }
            } catch (e) {
                log.error({title: 'rescheduleIfNeeded', details: JSON.stringify(e)});
            }
            return false;
        }

        function rescheduleScript(scriptID, deploymentId, params) {

            log.debug({title: 'scriptID', details: scriptID});
            log.debug({title: 'deploymentId', details: deploymentId});

           var ScheduledScriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                deploymentId: deploymentId,
                scriptId: scriptID,
                params: params
            });
            ScheduledScriptTask.submit();
        }

        function processItem(records, category, lastProcessedItemIndex) {
            for (var i = 0; i < records.length; i++) {
                var r = records[i];
                if (category.id === CategoryId.Items) {
                    log.debug({title: r.id + " : " + r.recordType, details: 'isinactive: true'});
                    try {
                        record.submitFields({
                            type: r.recordType,
                            id: r.id,
                            values: {
                                isinactive: true
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                    } catch (e) {
                        log.error("Error", e);
                    }
                } else {
                    try {
                        var internalid = r.getValue({
                            name: "internalid",
                            join: "item",
                            summary: "GROUP"
                        });
                        var parent = r.getValue({
                            name: "parent",
                            join: "item",
                            summary: "GROUP"
                        });
                        var recType = createSearch({
                            "searchType": "item",
                            "columns": null
                        }, ["internalid", "is", internalid], 0)[0].recordType;
                        log.debug({title: internalid + " : " + recType, details: 'isinactive: false'});
                        if (!!parent) {
                            parent = parent.split(":");
                            parent = parent[0].trim();
                            log.debug({title: "parent", details: parent});
                            parent = createSearch({
                                "searchType": "item",
                                "columns": null
                            }, [["itemid", "is", parent], "OR", ["internalid", "is", parent]], 0)[0];
                            log.debug({
                                title: "parent : " + parent.id + " : " + parent.recordType,
                                details: 'isinactive: false'
                            });
                            record.submitFields({
                                type: parent.recordType,
                                id: parent.id,
                                values: {
                                    isinactive: false
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        } else {
                            record.submitFields({
                                type: recType,
                                id: internalid,
                                values: {
                                    isinactive: false
                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                        }
                    } catch (e) {
                        log.error("Error", e);
                    }
                }
                lastProcessedItemRecordItemIndex = parseInt(lastProcessedItemIndex) + parseInt(i + 1);
                log.debug({title: "lastProcessedItemRecordItemIndex", details: lastProcessedItemRecordItemIndex});
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    break;
                    return;
                }
            }
        }

        function searchRecord(id, filter, lastRecordIndex) {
            var old = nsSearch.load({
                id: id,
            });
            var filterExpression = old.filterExpression;
            if (!!filter && filter.length > 0) {
                for (var i = 0; i < filter.length; i++) {
                    filterExpression.push(filter[i]);
                }
            }
            log.debug("filterExpression", filterExpression);
            return createSearch(old, filterExpression, lastRecordIndex);
        }

        function createSearch(old, filterExpression, lastRecordIndex) {
            var search = nsSearch.create({
                type: old.searchType,
                filters: filterExpression,
                columns: old.columns,
            });
            var result = search.run().getRange({
                start: lastRecordIndex,
                end: parseInt(lastRecordIndex) + 1000
            });
            return result;
        }

        return {
            execute: execute
        };
    })
;