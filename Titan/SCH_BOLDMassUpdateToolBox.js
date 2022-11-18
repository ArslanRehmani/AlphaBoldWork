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
 * File:        SCH_BOLDMassUpdateToolBox.js
 * Date:        5/13/2019
 *
 *
 ***********************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/runtime', 'N/task', 'N/https', '../lib/BomGenerator_lib.js', 'N/format'],
    function (nsSearch, nsRecord, runtime, task, nsHttps, library, nsFormat) {

        var usageLimit = 150;
        var data = {};

        function logDebug(data) {
            data.error = false;
            customLoggined(data);
        }

        function logError(data) {
            data.error = true;
            data.title = "Error from " + data.title;
            customLoggined(data);
        }

        function customLoggined(data) {
            var scriptObj = runtime.getCurrentScript();
            var obj = nsRecord.create({
                type: 'customrecord_ab_custom_logging'
            });

            var current_datetime = new Date();
            var formatted_date = (current_datetime.getMonth() + 1) + "/" + current_datetime.getDate() + "/" + current_datetime.getFullYear();
            var formatted_time = current_datetime.toLocaleTimeString()//(current_datetime.getUTCHours()) + ":" + current_datetime.getUTCMinutes();

            var parsedDate = nsFormat.parse({
                value: formatted_date,
                type: nsFormat.Type.DATE
            });
            log.debug('date', parsedDate);
            log.debug('time',formatted_time);


            obj.setValue({fieldId: 'custrecord_ab_logging_error', value: data.error ? true : false});
            obj.setValue({fieldId: 'custrecord_ab_logging_title', value: data.title});
            obj.setValue({fieldId: 'custrecord_ab_logging_description', value: data.details});
            obj.setValue({fieldId: 'custrecord_ab_logging_date', value: parsedDate});
            obj.setValue({fieldId: 'custrecord_ab_logging_time', value: formatted_time});
            obj.setValue({fieldId: 'custrecord_ab_logging_type', value: data.error ? "ERROR" : "DEBUG"});
            obj.setValue({fieldId: 'custrecord_ab_logging_deployment_id', value: scriptObj.deploymentId});
            obj.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
        }

        function execute(context) {
            log.debug({title: 'execute', details: 'Start'});
            try {
                data = JSON.parse(runtime.getCurrentScript().getParameter("custscript_bold_data"));
                var method = data.method;
                log.debug({title: "data", details: data});
                log.debug({title: "method", details: method});
                switch (method) {
                    case  "delete_rec" :
                        deleteRecords(data);
                        break;
                    case  "open-and-save-transcation":
                        openAndSaveTranscation(data);
                        break;
                    case "UpdateDynamicallyFieldValues" :
                        UpdateDynamicallyFieldValues(data);
                        break;
                    case "update_record_field" :
                        UpdateRecordField(data);
                        break;
                    case "update_record_line_field" :
                        UpdateRecordLineField(data);
                        break;
                    case "update_record_line_field_dynamic" :
                        UpdateRecordLineFieldDynamic(data);
                        break;
                }
            } catch (e) {
                logError({title: 'execute method', details: e.message});
                log.error({title: 'execute method', details: e});
            }
            log.debug({title: 'execute', details: 'End'});
        }

        function UpdateRecordLineField() {
            logDebug({title: 'UpdateRecordLineField', details: "Start"});

            var recInternalId = data.recInternalId;
            var recType = data.recType;
            var savedSearchId = data.savedSearchId;
            var subListId = data.updateSublistId;
            var subListLineNumber = data.updateSublistLine;
            var updateFieldId = data.updateFieldId;
            var updateFieldValue = data.updateFieldValue;
            var sourceFieldValueType = data.sourceFieldValueType;
            if (!!savedSearchId) {
                var array = savedSearchId.split(",");
                for (var i = 0; i < array.length; i++) {
                    var records = library.loadSearch(array[i]);
                    var status = processUpdateSublistFieldValues(records, subListId, subListLineNumber, updateFieldId, updateFieldValue, sourceFieldValueType, false, null, recType);
                    if (status == false) {
                        return;
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else if (!!recType) {
                var type = recType;
                var ids = recInternalId.split(",");
                var filter = [];
                for (var i = 0; i < ids.length; i++) {
                    filter.push(["internalid", 'is', ids[i]]);
                    if (i < (ids.length - 1)) {
                        filter.push("OR")
                    }
                }
                logDebug({title: 'filter', details: JSON.stringify(filter)});
                records = library.searchRecord(type, filter, null);
                var status = processUpdateSublistFieldValues(records, subListId, subListLineNumber, updateFieldId, updateFieldValue, sourceFieldValueType, false, null, recType);
                if (status == false) {
                    return;
                }
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    return false;
                }
            }
            logDebug({title: 'UpdateRecordLineField', details: "End"});
        }

        function UpdateRecordLineFieldDynamic() {
            logDebug({title: 'UpdateRecordLineField', details: "Start"});

            var recInternalId = data.recInternalId;
            var recType = data.recType;
            var savedSearchId = data.savedSearchId;
            var subListId = data.updateSublistId;
            var subListLineNumber = data.updateSublistLine;
            var updateFieldId = data.updateFieldId;
            var updateSourceFieldId = data.updateSourceFieldId;
            var sourceFieldValueType = data.sourceFieldValueType;
            if (!!savedSearchId) {
                var array = savedSearchId.split(",");
                for (var i = 0; i < array.length; i++) {
                    var records = library.loadSearch(array[i]);
                    var status = processUpdateSublistFieldValues(records, subListId, subListLineNumber, updateFieldId, null, sourceFieldValueType, true, updateSourceFieldId, recType);
                    if (status == false) {
                        return;
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else if (!!recType) {
                var type = recType;
                var ids = recInternalId.split(",");
                var filter = [];
                for (var i = 0; i < ids.length; i++) {
                    filter.push(["internalid", 'is', ids[i]]);
                    if (i < (ids.length - 1)) {
                        filter.push("OR")
                    }
                }
                logDebug({title: 'filter', details: JSON.stringify(filter)});
                records = library.searchRecord(type, filter, null);
                var status = processUpdateSublistFieldValues(records, subListId, subListLineNumber, updateFieldId, null, sourceFieldValueType, true, updateSourceFieldId, recType);
                if (status == false) {
                    return;
                }
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    return false;
                }
            }
            logDebug({title: 'UpdateRecordLineField', details: "End"});
        }

        function UpdateRecordField() {
            logDebug({title: 'UpdateRecordField', details: "Start"});

            var recInternalId = data.recInternalId;
            var recType = data.recType;
            var savedSearchId = data.savedSearchId;
            var updateFieldId = data.updateFieldId;
            var updateFieldValue = data.updateFieldValue;
            var sourceFieldValueType = data.sourceFieldValueType;
            if (!!savedSearchId) {
                var array = savedSearchId.split(",");
                for (var i = 0; i < array.length; i++) {
                    var records = library.loadSearch(array[i]);
                    if (records.length) {
                        log.debug({title: 'records', details: records.length});
                    }
                    var status = processUpdateFieldValues(records, updateFieldId, null, sourceFieldValueType, true, updateFieldValue, recType);
                    if (status == false) {
                        return;
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else if (!!recType) {
                var type = recType;
                var ids = recInternalId.split(",");
                var filter = [];
                for (var i = 0; i < ids.length; i++) {
                    filter.push(["internalid", 'is', ids[i]]);
                    if (i < (ids.length - 1)) {
                        filter.push("OR")
                    }
                }
                logDebug({title: 'filter', details: JSON.stringify(filter)});
                records = library.searchRecord(type, filter, null);
                if (records.length) {
                    log.debug({title: 'records', details: records.length});
                }
                var status = processUpdateFieldValues(records, updateFieldId, null, sourceFieldValueType, true, updateFieldValue, recType);
                if (status == false) {
                    return;
                }
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    return false;
                }
            }
            logDebug({title: 'UpdateRecordField', details: "End"});
        }

        function UpdateDynamicallyFieldValues() {
            logDebug({title: 'UpdateDynamicallyFieldValues', details: "Start"});

            var recInternalId = data.recInternalId;
            var recType = data.recType;
            var savedSearchId = data.savedSearchId;
            var updateFieldId = data.updateFieldId;
            var updateSourceFieldId = data.updateSourceFieldId;
            var sourceFieldValueType = data.sourceFieldValueType;

            log.debug({title: 'recType', details: recType});

            if (!!savedSearchId) {
                var array = savedSearchId.split(",");
                for (var i = 0; i < array.length; i++) {
                    var records = library.loadSearch(array[i]);
                    var status = processUpdateFieldValues(records, updateFieldId, updateSourceFieldId, sourceFieldValueType, null, null, recType);
                    if (status == false) {
                        return;
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else if (!!recType) {
                var type = recType;
                var ids = recInternalId.split(",");
                var filter = [];
                for (var i = 0; i < ids.length; i++) {
                    filter.push(["internalid", 'is', ids[i]]);
                    if (i < (ids.length - 1)) {
                        filter.push("OR")
                    }
                }
                records = library.searchRecord(type, filter, null);
                var status = processUpdateFieldValues(records, updateFieldId, updateSourceFieldId, sourceFieldValueType, null, null, recType);
                if (status == false) {
                    return;
                }
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    return false;
                }
            }
            logDebug({title: 'UpdateDynamicallyFieldValues', details: "End"});
        }

        function processUpdateFieldValues(records, updateFieldId, updateSourceFieldId, sourceFieldValueType, isManual, fieldValue, recType) {
            var _totalCount = 0;
            var _successCount = 0;
            var _failCount = 0;
            if (!!records && records.length > 0) {
                log.debug({title: 'records count', details: records.length});
                for (var i = 0; i < records.length; i++) {
                    try {
                        log.debug({title: 'records[i].recordType', details: records[i].recordType});
                        log.debug({title: 'records[i].id', details: records[i].id});
                        var rec = nsRecord.load({
                            type: records[i].recordType || recType,
                            id: records[i].id,
                        });
                        if (!!isManual) {
                            if (!updateFieldId) {
                                logError({
                                    title: 'error',
                                    details: "Required parameter is missing on the script record (Field Id)"
                                });
                                return false;
                            }
                            if (!fieldValue) {
                                logError({
                                    title: 'error',
                                    details: "Required parameter is missing on the script record (Field Value)"
                                });
                                return false;
                            }

                            if (fieldValue == "true" || fieldValue == "T") {
                                fieldValue = true;
                            } else if (fieldValue == "false" || fieldValue == "F") {
                                fieldValue = false;
                            }

                            if (sourceFieldValueType == "text") {
                                rec.setText({fieldId: updateFieldId, text: fieldValue});
                            } else {
                                rec.setValue({fieldId: updateFieldId, value: fieldValue});
                            }
                        } else {
                            if (!updateFieldId) {
                                logError({
                                    title: 'error',
                                    details: "Required parameter is missing on the script record (Field Id)"
                                });
                                return false;
                            }
                            if (!updateSourceFieldId) {
                                logError({
                                    title: 'error',
                                    details: "Required parameter is missing on the script record (Source Field Id)"
                                });
                                return false;
                            }
                            rec.setValue({
                                fieldId: updateFieldId,
                                value: sourceFieldValueType == "text" ? rec.getText({fieldId: updateSourceFieldId}) : rec.getValue({fieldId: updateSourceFieldId})
                            });
                        }
                        var id = rec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        _successCount++;
                        log.debug({title: 'Update Record Type', details: records[i].recordType});
                        log.debug({title: 'Update Record Id', details: id});
                    } catch (e) {
                        _failCount++;
                        logError({title: 'while updating field value::' + records[i].id, details: e.message});
                        log.error({title: 'while updating field value::' + records[i].id, details: e});
                    }
                    _totalCount = i + 1;
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        logDebug({title: 'Number of Records Processed', details: _totalCount});
                        logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
                        logDebug({title: 'Number of Records Processed Failed', details: _failCount});
                        return false;
                    }
                }
            } else {
                log.debug({title: 'No Record found', details: ""});
            }
            logDebug({title: 'Number of Records Processed', details: _totalCount});
            logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
            logDebug({title: 'Number of Records Processed Failed', details: _failCount});
            return true;
        }

        function processUpdateSublistFieldValues(records, subListId, subListLineNumber, updateFieldId, fieldValue, sourceFieldValueType, isDynamic, updateSourceFieldId, recType) {
            var _totalCount = 0;
            var _successCount = 0;
            var _failCount = 0;
            if (!!records && records.length > 0) {
                log.debug({title: 'records count', details: records.length});
                for (var i = 0; i < records.length; i++) {
                    try {
                        var rec = nsRecord.load({
                            type: records[i].recordType || recType,
                            id: records[i].id,
                        });
                        if (!subListId) {
                            logError({
                                title: 'error',
                                details: "Required parameter is missing on the script record (SubList Id)"
                            });
                            return false;
                        }
                        if (!updateFieldId) {
                            logError({
                                title: 'error',
                                details: "Required parameter is missing on the script record (Field Id)"
                            });
                            return false;
                        }
                        if (!fieldValue && !isDynamic) {
                            logError({
                                title: 'error',
                                details: "Required parameter is missing on the script record (Field Value)"
                            });
                            return false;
                        }
                        if (!updateSourceFieldId && !!isDynamic) {
                            logError({
                                title: 'error',
                                details: "Required parameter is missing on the script record (Source Field ID)"
                            });
                            return false;
                        }
                        var count = rec.getLineCount({
                            sublistId: subListId
                        });
                        log.debug({title: 'updateFieldId', details: updateFieldId});
                        if (!!isDynamic) {
                            log.debug({title: 'updateSourceFieldId', details: updateSourceFieldId});
                        } else {
                            log.debug({title: 'fieldValue', details: fieldValue});
                        }
                        log.debug({title: 'subListLineNumber', details: subListLineNumber});
                        if (count > 0) {
                            if (isNaN(subListLineNumber) == false && parseInt(subListLineNumber) > 0) {
                                if (sourceFieldValueType == "text") {
                                    rec.setSublistText({
                                        sublistId: subListId,
                                        fieldId: updateFieldId,
                                        line: subListLineNumber,
                                        text: !!isDynamic ? rec.getSublistText({
                                            sublistId: subListId,
                                            fieldId: updateSourceFieldId,
                                            line: subListLineNumber
                                        }) : fieldValue
                                    });
                                } else {
                                    rec.setSublistValue({
                                        sublistId: subListId,
                                        fieldId: updateFieldId,
                                        line: subListLineNumber,
                                        value: !!isDynamic ? rec.getSublistValue({
                                            sublistId: subListId,
                                            fieldId: updateSourceFieldId,
                                            line: subListLineNumber
                                        }) : fieldValue
                                    });
                                }
                            } else {
                                for (var m = 0; m < count; m++) {
                                    if (sourceFieldValueType == "text") {
                                        rec.setSublistText({
                                            sublistId: subListId,
                                            fieldId: updateFieldId,
                                            line: m,
                                            text: !!isDynamic ? rec.getSublistText({
                                                sublistId: subListId,
                                                fieldId: updateSourceFieldId,
                                                line: m
                                            }) : fieldValue
                                        });
                                    } else {
                                        rec.setSublistValue({
                                            sublistId: subListId,
                                            fieldId: updateFieldId,
                                            line: m,
                                            value: !!isDynamic ? rec.getSublistValue({
                                                sublistId: subListId,
                                                fieldId: updateSourceFieldId,
                                                line: m
                                            }) : fieldValue
                                        });
                                    }
                                }
                            }
                        }
                        var id = rec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        _successCount++;
                        log.debug({title: 'Update Record Type', details: records[i].recordType});
                        log.debug({title: 'subListId', details: subListId});
                        log.debug({title: 'Update Record Id', details: id});
                    } catch (e) {
                        _failCount++;
                        logError({title: 'while updating field value::' + records[i].id, details: e.message});
                        log.error({title: 'while updating field value::' + records[i].id, details: e});
                    }
                    _totalCount = i + 1;
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        logDebug({title: 'Number of Records Processed', details: _totalCount});
                        logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
                        logDebug({title: 'Number of Records Processed Failed', details: _failCount});
                        return false;
                    }
                }
            } else {
                log.debug({title: 'No Record found', details: ""});
            }
            logDebug({title: 'Number of Records Processed', details: _totalCount});
            logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
            logDebug({title: 'Number of Records Processed Failed', details: _failCount});
            return true;
        }

        function openAndSaveTranscation(data) {
            logDebug({title: 'openAndSaveTranscation', details: "Start"});

            var recInternalId = data.recInternalId;
            var recType = data.recType;
            var savedSearchId = data.savedSearchId;
            if (!!savedSearchId) {
                var array = savedSearchId.split(",");
                for (var i = 0; i < array.length; i++) {
                    var records = library.loadSearch(array[i]);
                    var status = processTranscations(records, recType);
                    if (status == false) {
                        return;
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else if (!!recType) {
                var type = recType;
                var ids = recInternalId.split(",");
                var filter = [];
                for (var i = 0; i < ids.length; i++) {
                    filter.push(["internalid", 'is', ids[i]]);
                    if (i < (ids.length - 1)) {
                        filter.push("OR")
                    }
                }
                records = library.searchRecord(type, filter, null);
                var status = processTranscations(records, recType);
                if (status == false) {
                    return;
                }
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    return false;
                }
            }
            logDebug({title: 'openAndSaveTranscation', details: "End"});
        }

        function processTranscations(records, recType) {
            var _totalCount = 0;
            var _successCount = 0;
            var _failCount = 0;
            if (!!records && records.length > 0) {
                log.debug({title: 'records count', details: records.length});
                for (var i = 0; i < records.length; i++) {
                    try {
                        var rec = nsRecord.load({
                            type: records[i].recordType || recType,
                            id: records[i].id,
                        });
                        var id = rec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        _successCount++;
                        log.debug({title: 'records[i].recordType', details: records[i].recordType});
                        log.debug({title: 'Update Record Id', details: id});
                    } catch (e) {
                        _failCount++;
                        logError({title: 'while updating Record ::' + records[i].id, details: e.message});
                        log.error({title: 'while updating Record ::' + records[i].id, details: e});
                    }
                    _totalCount = i + 1;
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        logDebug({title: 'Number of Records Processed', details: _totalCount});
                        logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
                        logDebug({title: 'Number of Records Processed Failed', details: _failCount});
                        return false;
                    }
                }
            } else {
                log.debug({title: 'No Record found', details: ""});
            }
            logDebug({title: 'Number of Records Processed', details: _totalCount});
            logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
            logDebug({title: 'Number of Records Processed Failed', details: _failCount});
            return true;
        }

        function insertLogs(recType, ids, data) {
            try {
                var rec = nsRecord.create({
                    type: 'customrecord_ab_bold_admin_tool_logs'
                });
                var employee = !!data.employeeID ? data.employeeID.id : "";
                rec.setValue({fieldId: 'custrecord_batl_employee_id', value: employee});
                rec.setValue({fieldId: 'custrecord_batl_date_time', value: new Date().toGMTString()});
                rec.setValue({fieldId: 'custrecord_batl_record_type', value: recType});
                rec.setValue({fieldId: 'custrecord_batl_record_search_ids', value: ids});
                rec.setValue({fieldId: 'custrecord_batl_employee_json', value: JSON.stringify(data.employeeID)});
                var id = rec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            } catch (ex) {
                logError({title: 'insertLogs', details: JSON.stringify(ex)});
            }
        }

        function deleteRecords(data) {
            logDebug({title: 'deleteRecords', details: "Start"});
            var recInternalId = data.recInternalId;
            var recType = data.recType;
            var savedSearchId = data.savedSearchId;
            if (!!savedSearchId) {
                insertLogs(recType, savedSearchId, data);
                var array = savedSearchId.split(",");
                for (var i = 0; i < array.length; i++) {
                    var records = library.loadSearch(array[i]);
                    var status = processRecords(records, recType);
                    if (status == false) {
                        return;
                    }
                    if (rescheduleIfNeeded()) {
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else if (!!recType && !!recInternalId) {
                var type = recType;
                var ids = recInternalId.split(",");
                insertLogs(recType, recInternalId, data);
                var filter = [];
                for (var i = 0; i < ids.length; i++) {
                    filter.push(["internalid", 'is', ids[i]]);
                    if (i < (ids.length - 1)) {
                        filter.push("OR")
                    }
                }
                records = library.searchRecord(type, filter, null);
                var status = processRecords(records, recType);
                if (status == false) {
                    return;
                }
                if (rescheduleIfNeeded()) {
                    log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                    return false;
                }

            }
            logDebug({title: 'deleteRecords', details: "End"});
        }

        function processRecords(records, recType) {
            var _totalCount = 0;
            var _successCount = 0;
            var _failCount = 0;
            if (!!records && records.length > 0) {
                log.debug({title: 'records count', details: records.length});
                for (var i = 0; i < records.length; i++) {
                    try {
                        var deleteRecId = nsRecord.delete({
                            type: records[i].recordType || recType,
                            id: records[i].id,
                        });
                        log.debug({title: 'Delete Record Id', details: deleteRecId});
                        _successCount++;
                    } catch (e) {
                        logError({title: 'while deleting Record ::' + records[i].id, details: e.message});
                        log.error({title: 'while deleting Record ::' + records[i].id, details: e});
                        _failCount++;
                    }
                    _totalCount = i + 1;
                    if (rescheduleIfNeeded()) {
                        logDebug({title: 'Number of Records Processed', details: _totalCount});
                        logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
                        logDebug({title: 'Number of Records Processed Failed', details: _failCount});
                        log.debug({title: 'Rescheduling', details: 'Rescheduled'});
                        return false;
                    }
                }
            } else {
                log.debug({title: 'No Record found', details: ""});
            }
            logDebug({title: 'Number of Records Processed', details: _totalCount});
            logDebug({title: 'Number of Records Processed Successfully', details: _successCount});
            logDebug({title: 'Number of Records Processed Failed', details: _failCount});
            return true;
        }

        function rescheduleIfNeeded() {
            try {
                var params = {
                    "custscript_bold_data": data
                };
                var scriptObj = runtime.getCurrentScript();
                var usageRemaining = scriptObj.getRemainingUsage();
                log.debug({title: 'usageRemaining', details: usageRemaining});
                if (usageRemaining < usageLimit) {
                    rescheduleScript(scriptObj.id, scriptObj.deploymentId, params);
                    return true;
                }
            } catch (e) {
                logError({title: 'rescheduleIfNeeded', details: e.message});
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

        return {
            execute: execute
        };
    })
;