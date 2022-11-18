/*
 ***********************************************************************
 * The following javascript code is created by Shoaib Mehmood (Independent Consultant).,
 * It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": Shoaib Mehmood shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     AlphaBOLD Inc.
 * Author:      Shoaib Mehmood & Ilija Budimir
 * File:		AB_SSS_CsvImportTool.js
 * Date:     12/02/2017
 *
 * Revisions:
 * 12/04/2017 | Made modifications to set field function. External ID must be set as -nlapiSetFieldValue-
 * 12/04/2017 | Extra cleanup of strings
 * 12/11/2017 | Overriding transaction numbers is sometimes challenging. Added a routine to clear the existing transaction number and set the new one.
 * 03/25/2019 | Major rework of the code to support many transaction types and line / sublist handling.
 * 04/10/2019 | Made adjustments to the line processing logic
 * 08/15/2019 | Added support for Vendor Payment record.
 * 08/16/2019 | Changed mapping in -processNetSuiteLine-. Referencing 'netsuite' obj. property on the following line -lookupRecordInNetSuite-.
 *               Added additional validation for sublist lines that do not have reference values.
 *
 ***********************************************************************/

//Constants
var SCRIPT_ID = 'AB_SSS_CsvImportTool_Extended.js';
var NS_MAX_SEARCH_RESULT = 1000;
var MINIMUM_UNITS_AND_RECOVERY_POINT = 180;
var LOG_ARRAY = [];
var ERROR_LOG_FOLDER = null;
var SS_LOOKUP_FIELDTYPE_MAPPING = {
    item : 'itemid',
    discount : 'itemid',
    entity : 'entityid',
    partner : 'entityid',
    employee : 'entityid',
    createdfrom : 'numbertext',
    location : 'name',
    account : 'number'
};
var QUEUE_RECORD_ID;

/**
 * Main SSS function. it uses 3 script record parameters.
 * It will do the following:
 * 1. Get the required parameters
 * 2. Load csv file from file cabinet
 * 3. Get the configuration / mapping objects - custom record -customrecord_csv_import_config-
 * 4. Loop to through all the CSV Lines and generate ungrouped lines
 * 5. Group Lines by transaction grouping field.
 * 6. Process lines, create transactions + generate error logs.
 *
 * @ibudimir@alphabold.com
 * @params {string} custscript_transaction_type; {string} custscript_file_id; {string} custscript_log_folder
 * @returns null
 */
function getCsvFile() {
    //1. Get the required parameters: transaction type + file internalid
    var queRecToProcess = getFileToProcess();

    if (!!queRecToProcess) {


        var ctx = nlapiGetContext();
        var transactionType = queRecToProcess.recordtype;
        var fileId = queRecToProcess.file;
        QUEUE_RECORD_ID = queRecToProcess.id;

        NAScriptedCSVImportJQ.upsert({
            id: QUEUE_RECORD_ID,
            processnote: 'Start of File Processing.',
            processstatus: 'Queue'
        });

        ERROR_LOG_FOLDER = ctx.getSetting('SCRIPT', 'custscript_log_folderid');
        nlapiLogExecution('DEBUG', 'ERROR_LOG_FOLDER',ERROR_LOG_FOLDER);
        if (isEmpty(transactionType) || isEmpty(fileId) || isEmpty(ERROR_LOG_FOLDER)) {
            nlapiLogExecution('error', 'Required parameters are missing from the script record deployment. ' + SCRIPT_ID);
            NAScriptedCSVImportJQ.upsert({
                id: QUEUE_RECORD_ID,
                processnote: 'Required parameters are missing from the script record deployment. ' + SCRIPT_ID,
                processstatus: 'Executed'
            });
            return;
        }

        //2. load csv file from file cabinet
        //var cleanFile = nlapiLoadFile(fileId).getValue().replace(/(\n)+/g, '');
        var cleanFile = nlapiLoadFile(fileId).getValue().replace(/\n$\B/, '');
        var csvLines = cleanFile.split(/\n/);
        //nlapiLogExecution('DEBUG','csvLines12',csvLines);
        if (!Array.isArray(csvLines)) {
            nlapiLogExecution('error', 'Lines in the CSV file are not an Array. ' + SCRIPT_ID);
            NAScriptedCSVImportJQ.upsert({
                id: QUEUE_RECORD_ID,
                processnote: 'Lines in the CSV file are not an Array.',
                processstatus: 'Executed'
            });
            return;
        }

        //3. Get the configuration / mapping objects (array)
        var mappingObjects = getConfigurationMapping(transactionType);

        if (isEmpty(mappingObjects)) {
            nlapiLogExecution('error', 'Mapping Objects were NOT found for this transaction type. ' + SCRIPT_ID);
            NAScriptedCSVImportJQ.upsert({
                id: QUEUE_RECORD_ID,
                processnote: 'Mapping Objects were NOT found for this transaction type.',
                processstatus: 'Executed'
            });
            return;
        }

        //3.1 Check if any of the fields is used to group CSV lines (usually externalid, tranid or internalid)

        var groupingFieldFound = findObj(mappingObjects, 'isGroupingField', 'T');

        if (isEmpty(groupingFieldFound)) {
            nlapiLogExecution('error', 'No grouping field identified, this CSV import cannot be completed. ' + SCRIPT_ID);
            NAScriptedCSVImportJQ.upsert({
                id: QUEUE_RECORD_ID,
                processnote: 'No grouping field identified, this CSV import cannot be completed.',
                processstatus: 'Executed'
            });
            return;
        }

        //4. loop to through all the CSV Lines and generate ungrouped lines
        var ungroupedLines = [];
        var groupingField = groupingFieldFound.netsuite;
        var groupingFieldPosition = groupingFieldFound.position;

        nlapiLogExecution('DEBUG','csvLines',JSON.stringify(csvLines));

        for (var i = 1; i < csvLines.length ; i++) {
            var csvLineContent = csvLines[i].split(',');
            var newClonedMappingObjects = [];
            try {
                //4.1 Populate the -externalValue- property of the objects in the array
                for (var j = 0; j < mappingObjects.length; j++) {
                    var clonedMappingObject = cloneObject(mappingObjects[j]);
                    clonedMappingObject.externalValue = (typeof csvLineContent[clonedMappingObject.position] == 'string') ? csvLineContent[clonedMappingObject.position].replace(/,/g, '_') : "";
                    clonedMappingObject[groupingField] = csvLineContent[groupingFieldPosition];
                    newClonedMappingObjects.push(clonedMappingObject);
                }
                ungroupedLines.push(newClonedMappingObjects);
            } catch (err) {
                nlapiLogExecution('error', 'Populating objects with external values failed, line: ' + i + ' script: ' + SCRIPT_ID, err.toString());
                NAScriptedCSVImportJQ.upsert({
                    id: QUEUE_RECORD_ID,
                    processnote: 'Populating objects with external values failed, line: ' + i + err.toString(),
                    processstatus: 'Queue'
                });
            }
        }

       // nlapiLogExecution('DEBUG','ungroupedLines',JSON.stringify(ungroupedLines));
        //5. Group lines by grouping field, these are typically CSV lines that belong to a single transaction
        var groupedLines = groupBy(ungroupedLines, function (group) {
            return [group[0][groupingField]];
        });

       // nlapiLogExecution('DEBUG','groupedLInes',JSON.stringify(groupedLines));
       // nlapiLogExecution('DEBUG','groupingField',JSON.stringify(groupingField));

        //6. Process lines, create transactions
        createTransactions(transactionType, groupedLines, groupingField);
        NAScriptedCSVImportJQ.upsert({
            id: QUEUE_RECORD_ID,
            processnote: 'End of File Processing.',
            processstatus: 'Executed'
        });
        queRecToProcess = getFileToProcess();
        if (!!queRecToProcess)// Further files in Queue
            nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId());

    }
}

/**
 * Function to Reterive File from Queue
 *
 */
function getFileToProcess() {
    var queRecords = NAScriptedCSVImportJQ.getList('Queue');
    var result;

    if (!!queRecords && queRecords.length > 0) {
        result = queRecords[0];
        nlapiLogExecution('debug', 'Queue Record', JSON.stringify(result));
    }
    return result;
}

/**
 * Final function that generates transaction from the array of object and grouping field that is passed.
 * This function will log errors and generate a log file, similar to what NS CSV tool does. Note, this function yields
 * the process when the governance limits are reached.
 *
 * @ibudimir@alphabold.com
 * @params {string} type; [{object}] lines; {string} groupingField
 * @returns null;
 */
function createTransactions(type, lines, groupingField) {
    var ctx = nlapiGetContext();
    //loop first through the parent array - list of multiple records / transactions
   // nlapiLogExecution('DEBUG','lines.length',lines.length);
    //nlapiLogExecution('DEBUG','lines',lines);
    if (!!lines && lines.length > 0) {
        for (var i = 0; i < lines.length; i++) {
            var transactionLines = lines[i];

            try {
                //load record
                var record = nlapiCreateRecord(type, {recordmode: 'dynamic'});
                var documentNumber = null;

                //process transaction
                var foundLineReferenceField = false;
                var referenceField = null;
                var AddressObj = {};
                for (var s = 0; s < transactionLines.length; s++) {
                    var singleLine = transactionLines[s];
                    //set record fields
                    for (var k = 0; k < singleLine.length; k++) {
                        var fieldObject = singleLine[k];
                        if (s == 0) {//first CSV line
                            if (fieldObject.isHeader == 'T') {
                                //validate if the value in the object is a string
                                if (fieldObject.netsuite == 'tranid' && isEmpty(documentNumber)) {
                                    documentNumber = fieldObject.externalValue;
                                }

                                if (fieldObject.isLookup == 'T') {
                                    var fieldToQuery = SS_LOOKUP_FIELDTYPE_MAPPING[fieldObject.netsuite];
                                    if (!isEmpty(fieldToQuery)) {
                                        var recordInternalId = lookupRecordInNetSuite(fieldObject.netsuite, fieldToQuery, fieldObject.externalValue);
                                        if (!isEmpty(recordInternalId)) {
                                            record.setFieldValue(fieldObject.netsuite, recordInternalId);
                                        } else {
                                            throw nlapiCreateError('SSS_CANNOT_FIND_REFERENCED_RECORD', 'Record cannot be found in NetSuite ' + fieldObject.externalValue);
                                            NAScriptedCSVImportJQ.upsert({
                                                id: QUEUE_RECORD_ID,
                                                processnote: 'Record cannot be found in NetSuite ' + fieldObject.externalValue,
                                                processstatus: 'Queue'
                                            });
                                        }
                                    } else {
                                        throw nlapiCreateError('SSS_CANNOT_FIND_REFERENCED_RECORD', 'Mapping Object not correctly configured for: ' + fieldObject.netsuite);
                                        NAScriptedCSVImportJQ.upsert({
                                            id: QUEUE_RECORD_ID,
                                            processnote: 'Mapping Object not correctly configured for: ' + fieldObject.netsuite,
                                            processstatus: 'Queue'
                                        });
                                    }
                                }

                                if (!isNumber(fieldObject.externalValue) && fieldObject.text == 'T') {
                                   // record.setFieldText(fieldObject.netsuite, fieldObject.externalValue);
                                    if(fieldObject.netsuite == 'shipaddr1'){
                                        AddressObj.shipaddr1 = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipaddr2'){
                                        AddressObj.shipaddr2 = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipaddressee'){
                                        AddressObj.shipaddressee = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipattention'){
                                        AddressObj.shipattention = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipcity'){
                                        AddressObj.shipcity = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipcountry'){
                                        AddressObj.shipcountry = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipisresidential'){
                                        AddressObj.shipisresidential = fieldObject.externalValue;
                                    }
                                    if(fieldObject.netsuite == 'shipstate'){
                                        AddressObj.shipstate = fieldObject.externalValue;
                                    }
                                    nlapiLogExecution('DEBUG','fieldObject.netsuite',fieldObject.netsuite);
                                    nlapiLogExecution('DEBUG','fieldObject.externalValue',fieldObject.externalValue);
                                    if (fieldObject.netsuite == 'externalid') {
                                        record.setFieldValue(fieldObject.netsuite, fieldObject.externalValue);
                                    }else if (fieldObject.netsuite == 'trandate') {
                                        record.setFieldValue(fieldObject.netsuite, fieldObject.externalValue);
                                    }
                                    record.setFieldText(fieldObject.netsuite, fieldObject.externalValue);
                                   // nlapiLogExecution('audit', fieldObject.netsuite, fieldObject.externalValue);
                                } else {
                                    if(!isEmpty(fieldObject.externalValue)){
                                    record.setFieldValue(fieldObject.netsuite, fieldObject.externalValue);
                                    }
                                    //nlapiLogExecution('audit', fieldObject.netsuite, fieldObject.externalValue);
                                }
                            }

                            if (k == (singleLine.length - 1)) {//end of the line, process column fields of the first line now
                                //process the 1st line
                                try {
                                    processNetSuiteLine(record, singleLine);
                                } catch (err) {
                                    nlapiLogExecution('debug', 'could not process the line or the line field' + (fieldObject.hasOwnProperty(groupingField) ? fieldObject[groupingField] : ""), err.toString());
                                    var errorLogLine = new Object();
                                    errorLogLine.groupingId = (fieldObject.hasOwnProperty(groupingField) ? fieldObject[groupingField] : "") + ' (error)';
                                    errorLogLine.description = err.toString().replace(/(\n\r|\n|\r|,)/gm, '');
                                    LOG_ARRAY.push(errorLogLine);
                                }
                            }

                        } else {//other transaction lines
                            //process next line
                            try {
                                processNetSuiteLine(record, singleLine);
                                break;
                            } catch (err) {
                                nlapiLogExecution('debug', 'could not process the line or the line field' + (fieldObject.hasOwnProperty(groupingField) ? fieldObject[groupingField] : ""), err.toString());
                                var errorLogLine = new Object();
                                errorLogLine.groupingId = (fieldObject.hasOwnProperty(groupingField) ? fieldObject[groupingField] : "") + ' (error)';
                                errorLogLine.description = err.toString().replace(/(\n\r|\n|\r|,)/gm, '');
                                LOG_ARRAY.push(errorLogLine);
                            }
                        }
                    }
                }
                //Overriding transaction numbers is sometimes challenging
                if (!isEmpty(documentNumber)) {
                    record.setFieldValue('tranid', "");
                    record.setFieldValue('tranid', documentNumber);
                    nlapiLogExecution('audit', 'tranid', documentNumber);
                }

                nlapiLogExecution('DEBUG','records',JSON.stringify(record));
                // submit record
                var id = nlapiSubmitRecord(record);
                //nlapiLogExecution('debug', 'addresssobj', AddressObj);
                if (type == 'salesorder'){          
                var updatedRecID = updateShipAddress(id,AddressObj);
               // nlapiLogExecution('DEBUG','sales order update RecID',updatedRecID);
                }
                nlapiLogExecution('audit', 'Transaction successfully submitted ' + id + '.', JSON.stringify(singleLine));
                NAScriptedCSVImportJQ.upsert({
                    id: QUEUE_RECORD_ID,
                    processnote: 'Transaction successfully submitted ' + id,
                    processstatus: 'Queue'
                });
            } catch (err) {
                nlapiLogExecution('error', 'CRITICAL ERROR! Could not create transaction ' + (fieldObject.hasOwnProperty(groupingField) ? fieldObject[groupingField] : ""), err.toString());
                var errorLogLine = new Object();
                errorLogLine.groupingId = (fieldObject.hasOwnProperty(groupingField) ? fieldObject[groupingField] : "") + ' (error)';
                errorLogLine.description = err.toString().replace(/(\n\r|\n|\r|,)/gm, '');
                LOG_ARRAY.push(errorLogLine);
            }
            checkUsage(ctx, MINIMUM_UNITS_AND_RECOVERY_POINT);
        }
    } else {
        NAScriptedCSVImportJQ.upsert({
            id: QUEUE_RECORD_ID,
            processnote: 'No Valid Line Found in File to Process',
            processstatus: 'Queue'
        });
    }

    if (!isEmpty(LOG_ARRAY) && LOG_ARRAY.length > 0) {
        nlapiLogExecution('debug', 'LOG_ARRAY', JSON.stringify(LOG_ARRAY));
        var properties = Object.keys(LOG_ARRAY[0]);
        nlapiLogExecution('debug', 'properties', JSON.stringify(properties));

        var csvFileCreated = createCSVFile(LOG_ARRAY, properties);
        nlapiLogExecution('debug', 'created and saved the log file: ', csvFileCreated);
        NAScriptedCSVImportJQ.upsert({
            id: QUEUE_RECORD_ID,
            processnote: 'Execution completed with errors. See Log File.',
            processlogfile: csvFileCreated,
            processstatus: 'Queue'
        });
    }
    nlapiLogExecution('audit', 'Completed CSV Import.', SCRIPT_ID);
}

function updateShipAddress(id,obj){
    var recId ;
    try{
        var SO = nlapiLoadRecord('salesorder',id);

    
            SO.setFieldValue('shipcountry', obj.shipcountry);
            SO.setFieldValue('shipisresidential', obj.shipisresidential);
            SO.setFieldValue('shipattention', obj.shipattention);
            SO.setFieldValue('shipaddressee', obj.shipaddressee);
            // SO.setFieldValue('shipaddrphone', obj.addrphone);
            SO.setFieldValue('shipaddr1', obj.shipaddr1);
            SO.setFieldValue('shipaddr2', obj.shipaddr2);
            SO.setFieldValue('shipcity', obj.shipcity);
            SO.setFieldValue('shipstate', obj.shipstate);
            // SO.setFieldValue('shipzip', obj.zip);
            recId = nlapiSubmitRecord(SO);
           
       
    }catch(error){
        nlapiLogExecution('DEBUG', 'error', error.message);
    }
    return recId;
}

/**
 * This function adds sublist liens to the record. The calling function will
 * pass the nlObj record and an array of CSV Line objects. This function process the entire line.
 *
 * @ibudimir@alphabold.com
 * @param record
 * @param csvLine
 * @returns null
 */
function processNetSuiteLine(record, csvLine) {

    //A. Transform CSV line. Group by sublist - in case there are 2 or more reference fields and multiple sublists on one line
    var groupedLines = groupBy(csvLine, function (group) {
        return [group['sublist']];
    });

    //B. Remove the array that is not part of the sublist
    var len = groupedLines.length;
    var netSuiteLinesToAdd = [];
    for (var i = 0; i < len; i++) {
        var sublistValue = groupedLines[i][0].sublist;
        if (isEmpty(sublistValue)) {
            continue;
        }
        netSuiteLinesToAdd.push(groupedLines[i]);
    }

    //C. Set lines
    var sublistNumber = netSuiteLinesToAdd.length;
    for (var j = 0; j < sublistNumber; j++) {
        var lineCounter = 1;
        var referenceField = null;
        var searchReferenceValue = null;
        var sublistLine = netSuiteLinesToAdd[j];

        var len = sublistLine.length;
        //C.1 Find Reference Value
        var referenceObject = findObj(sublistLine, 'isLineReference', 'T');
        if (!isEmpty(referenceObject)) {
            //get reference value
            referenceField = referenceObject.netsuite;
            searchReferenceValue = referenceObject.externalValue;
        } else {
            throw nlapiCreateError('SSS_NO_REFERENCE_FIELD_FOUND', 'Please check the import template.');
            
        }

        var isLookupFieldObject = findObj(sublistLine, 'isLookup', 'T');

        //C.2 Set Lines / Insert Lines
        if (!isEmpty(isLookupFieldObject) && !isEmpty(isLookupFieldObject.externalValue)) {
            /*group of transactions where we are
             adding new lines and NOT referencing the existing ones.*/


            //C.3.0 Set first the reference field such as the 'item'
            var firstFieldToSet = findObj(sublistLine, 'isLineReference', 'T');
            var fieldToQuery = SS_LOOKUP_FIELDTYPE_MAPPING[firstFieldToSet.netsuite];


            if (!isEmpty(fieldToQuery)) {
                var recordInternalId = lookupRecordInNetSuite(firstFieldToSet.netsuite, fieldToQuery, firstFieldToSet.externalValue);
                if (!isEmpty(recordInternalId)) {
                    record.selectNewLineItem(firstFieldToSet.sublist);
                    record.setCurrentLineItemValue(firstFieldToSet.sublist, firstFieldToSet.netsuite, recordInternalId);
                } else {
                    throw nlapiCreateError('SSS_CANNOT_FIND_REFERENCED_RECORD', 'Record cannot be found in NetSuite ' + firstFieldToSet.externalValue);
                }
            } else {
                //no value found in -SS_LOOKUP_FIELDTYPE_MAPPING- object.
                throw nlapiCreateError('SSS_FIELD_MAPPING_MISSING', 'no value found in -SS_LOOKUP_FIELDTYPE_MAPPING- object' + firstFieldToSet.netsuite);
            }

            //C.3.1 Set the rest of the fields on a new line
            var len = sublistLine.length;
            for (var l = 0; l < len; l++) {
                //set sublist / line field values
                var fieldObject = sublistLine[l];
                if (fieldObject.isLineReference != 'T') {
                    record.setCurrentLineItemValue(fieldObject.sublist, fieldObject.netsuite, fieldObject.externalValue);
                }
                if (l == (len - 1)) {//c. commit line
                    record.commitLineItem(fieldObject.sublist);
                }
            }
        } else {//transactions where we reference lines and don't insert them
            if (!isEmpty(searchReferenceValue)) {
                var lineCount = record.getLineItemCount(sublistLine[0].sublist);
                var currentLine = 0;
                //check the reference field on each line
                var lineReferenceValue = null;
                for (var x = 1; x <= lineCount; x++) {
                    record.selectLineItem(sublistLine[0].sublist, x);
                    lineReferenceValue = isNumber(record.getCurrentLineItemValue(sublistLine[0].sublist, referenceField)) ? parseInt(record.getCurrentLineItemValue(sublistLine[0].sublist, referenceField), 10) : record.getCurrentLineItemValue(sublistLine[0].sublist, referenceField);
                    if (searchReferenceValue == lineReferenceValue) {
                        currentLine = x;
                        break;
                    }
                }

                if (currentLine == 0) {
                    //currentLine is 0, this means that the reference value on the transaction line was not found.
                    throw nlapiCreateError('SSS_LINE_REFENCE_NOT_FOUND', 'no line reference found on this transaction ' + record.getFieldValue('tranid'));
                }

                //C.3.2 Set the rest of the fields on this line
                var len = sublistLine.length;
                for (var m = 0; m < len; m++) {
                    //set sublist / line field values
                    var fieldObject = sublistLine[m];

                    if (fieldObject.netsuite != referenceField) {
                        try {
                            record.setCurrentLineItemValue(fieldObject.sublist, fieldObject.netsuite, fieldObject.externalValue);
                        } catch (err) {
                            nlapiLogExecution('debug', 'could not process -setCurrentLineItemValue- method, attempting -setLineItemValue-' + lineReferenceValue, err.toString());
                            var errorLogLine = new Object();
                            errorLogLine.groupingId = lineReferenceValue + '(error)';
                            errorLogLine.description = err.toString().replace(/(\n\r|\n|\r|,)/gm, '');
                            LOG_ARRAY.push(errorLogLine);

                            record.setLineItemValue(fieldObject.sublist, fieldObject.netsuite, currentLine, fieldObject.externalValue);
                        }
                    }

                    if (m == (len - 1)) {//c. commit line
                        record.commitLineItem(fieldObject.sublist);
                    }
                }
            }
        }
    }
    if (sublistValue == 'apply' || sublistValue == 'credit') {
        if (record.getRecordType() != 'vendorpayment') {
            record.setFieldValue('autoapply', 'F');
            var paymentValue = findObj(csvLine, 'netsuite', 'payment');
            if (!isEmpty(paymentValue)) {
                record.setFieldValue(paymentValue.netsuite, paymentValue.externalValue);
                var appliedValue = findObj(csvLine, 'netsuite', 'applied');
                if (!isEmpty(appliedValue)) {
                    record.setFieldValue(appliedValue.netsuite, appliedValue.externalValue);
                    var unappliedValue = findObj(csvLine, 'netsuite', 'unapplied');
                    if (!isEmpty(unappliedValue)) {
                        record.setFieldValue('unapplied', unappliedValue.externalValue);
                    } else {
                        record.setFieldValue('unapplied', '0.00');
                    }
                }
            } else {
                var appliedValue = findObj(csvLine, 'netsuite', 'applied');
                if (!isEmpty(appliedValue)) {
                    record.setFieldValue(appliedValue.netsuite, appliedValue.externalValue);
                    var unappliedValue = findObj(csvLine, 'netsuite', 'unapplied');
                    if (!isEmpty(unappliedValue)) {
                        record.setFieldValue('unapplied', unappliedValue.externalValue);
                    } else {
                        record.setFieldValue('unapplied', '0.00');
                    }
                }
            }
        }
    }
}


/**
 * Gets CSV mapping for the transaction type. Note, they are some rules to setting up the custom record
 * instances and they should be clarified by a separate document.
 * The results are pushed into an array of objects and returned to the calling function.
 *
 * @ibudimir@alphabold.com
 * @param {string} type;
 * @returns [{object}] arrayOfMappingObjects;
 */
function getConfigurationMapping(type) {
    var filters = [];
    var columns = [];

    filters.push(new nlobjSearchFilter('custrecord_csvc_transaction_type', null, 'is', type));
    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

    columns.push(new nlobjSearchColumn('custrecord_csvc_position').setSort(false));
    columns.push(new nlobjSearchColumn('custrecord_csvc_transaction_type'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_field_name'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_is_header'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_is_line'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_line_reference'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_is_lookup'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_sublist'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_text'));
    columns.push(new nlobjSearchColumn('custrecord_csvc_is_grouping'));

    var searchResults = getSearchResults('customrecord_csv_import_config', null, filters, columns);
    var arrayOfMappingObjects = [];
    if (!isEmpty(searchResults) && !!searchResults.length && searchResults.length > 0) {


        for (var i = 0; i < searchResults.length; i++) {
            var mappingObject = new Object();
            mappingObject.transactionType = searchResults[i].getValue("custrecord_csvc_transaction_type");
            mappingObject.position = parseInt(searchResults[i].getValue("custrecord_csvc_position"), 10);
            mappingObject.netsuite = searchResults[i].getValue("custrecord_csvc_field_name");
            mappingObject.isHeader = searchResults[i].getValue("custrecord_csvc_is_header");
            mappingObject.isLine = searchResults[i].getValue("custrecord_csvc_is_line");
            mappingObject.isLineReference = searchResults[i].getValue("custrecord_csvc_line_reference");
            mappingObject.isLookup = searchResults[i].getValue("custrecord_csvc_is_lookup");
            mappingObject.sublist = searchResults[i].getValue("custrecord_csvc_sublist");
            mappingObject.text = searchResults[i].getValue("custrecord_csvc_text");
            mappingObject.isGroupingField = searchResults[i].getValue("custrecord_csvc_is_grouping");
            mappingObject.externalValue = null;

            arrayOfMappingObjects.push(mappingObject);
        }

    }
    return (arrayOfMappingObjects.length > 0) ? arrayOfMappingObjects : null;
}


//Helper functions

/**
 * This function overcomes NetSuite's limitation of 1000 results per Saved Search.
 *
 * @author eolguin@alphabold.com
 * @param {Object} type
 * @param {String} searchId
 * @param {Object} filters
 * @param {Object} columns
 */
function getSearchResults(type, searchId, filters, columns) {
    var results = [];
    if (type != null && type != '' && typeof type !== 'undefined') {
        if (searchId != null && searchId != '') {
            //Load the search to obtain an nlobjSearch Object
            var searchObject = nlapiLoadSearch(type, searchId);
            if (searchObject != null) {
                //Add filters/columns (override default ones)
                if (filters != null) {
                    search.setFilters(filters);
                }
                if (columns != null) {
                    search.setColumns(columns);
                }
                //Use the nlobjSearchObject to retrieve the nlobjSearchResultSet object
                searchResultsSets = searchObject.runSearch();
            }
        } else {
            var searchObject = nlapiCreateSearch(type, filters, columns);
            searchResultsSets = searchObject.runSearch();
        }

        var allResultsFound = false;
        var resultsSetsCounter = 0;
        while (!allResultsFound) {
            var resultsSet = searchResultsSets.getResults(resultsSetsCounter * NS_MAX_SEARCH_RESULT, NS_MAX_SEARCH_RESULT + NS_MAX_SEARCH_RESULT * resultsSetsCounter);
            if (resultsSet == null || resultsSet == '') {
                allResultsFound = true;
            } else {
                if (resultsSet.length < NS_MAX_SEARCH_RESULT) {
                    results = results.concat(resultsSet);
                    allResultsFound = true;
                } else {
                    results = results.concat(resultsSet);
                    resultsSetsCounter++;
                }
            }
        }
    } else {
        throw nlapiCreateError('SSS_MISSING_REQD_ARGUMENT', 'Missing a required argument : type');
    }
    return results;
}

/**
 * Simple object grouping function that is to be used with
 * -groupBy- function, it browses through and object and creates a new
 * array of objects.
 *
 * @author ibudimir@alphabold.com
 * @parameter {object} obj
 * @returns [object] arr
 */
function arrayFromObject(obj) {
    var arr = [];
    for (var i in obj) {
        arr.push(obj[i]);
    }
    return arr;
}

/**
 * Used with -arrayFromObject-. Accepts
 * list array of objects and a function that pushes properties
 * that need to be used for grouping (i.e.):
 *
 * groupBy(soObject.soLines, function(item) {
 return [item.custcol_item_supplier, item.location];
 });
 *
 * The function will group by the property name just like
 * in the example above.
 *
 * @author ibudimir@alphabold.com
 * @parameter [{object}] list
 * @returns [function] arrayFromObject
 */
function groupBy(list, fn) {
    var groups = {};
    for (var i = 0; i < list.length; i++) {
        var group = JSON.stringify(fn(list[i]));
        if (group in groups) {
            groups[group].push(list[i]);
        } else {
            groups[group] = [list[i]];
        }
    }
    return arrayFromObject(groups);
}

/**
 * Returns an object that matches the value specified
 * @author : elean.olguin@gmail.com
 * @param : {Object} a, {String} id, {String} v
 * @return :{Object}/Null
 */
function findObj(a, id, v) {
    for (var k = 0; k < a.length; k++) {
        if (a[k].hasOwnProperty(id)) {
            if (a[k][id] == v) {
                return a[k];
            }
        }
    }
    return null;
}

/**
 * Clones the object passed, recursively.
 *
 * @author ibudimir@alphabold.com
 * @param {object} obj
 * @returns {object} temp / obj
 */
function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor();
    // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = cloneObject(obj[key]);
    }

    return temp;
}

/**
 * Return True/False if a value is empty
 *
 * @param : {String} val
 * @return : {Boolean} True/False
 * @author : elean.olguin@gmail.com
 */
function isEmpty(val) {
    return (val == null || val == '') ? true : false;
}

/**
 * @author : eolguin@alphabold.com
 * @param {Object} val
 * @return {Boolean}
 */
function isNumber(val) {
    return !isNaN(val) ? true : false;
}

/**
 * yieldScript : Calls the API to yield the current script (equivalent to reschedule basically).
 * Logs information depending on returned state.
 *
 * @author frederic.jannelle@erpguru.com
 */
function yieldScript() {
    var state = nlapiYieldScript();
    if (state.status == 'FAILURE') {
        nlapiLogExecution("ERROR", "Failed to yield script, exiting: Reason = " + state.reason + " / Size = " + state.size);
        throw "Failed to yield script";
    } else if (state.status == 'RESUME') {
        nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason + ".  Size = " + state.size);
    }
    // state.status will never be SUCCESS because a success would imply a yield has occurred.  The equivalent response would be yield
}

/**
 * setRecoveryPoint : Calls the API to resume the execution of the scheduled script execution
 * exactly where it left off before the interruption.
 *
 * @author ibudimir@alphabold.com
 */

function setRecoveryPoint() {
    var state = nlapiSetRecoveryPoint();
    //100 point governance
    if (state.status == 'SUCCESS') {
        return;
    }//we successfully create a new recovery point
    if (state.status == 'RESUME') {//a recovery point was previously set, we are resuming due to some unforeseen error
        nlapiLogExecution("ERROR", "Resuming script because of " + state.reason + ".  Size = " + state.size);
    } else if (state.status == 'FAILURE') {//we failed to create a new recovery point
        nlapiLogExecution("ERROR", "Failed to create recovery point. Reason = " + state.reason + " / Size = " + state.size);
    }
}

/**
 * Key function that looks up the internalid of the record in NetSuite
 * based on the recordType, fieldType (NS field 'name' NOT internalid) and the value
 * that is essentially a string that we are basing our lookup on.
 *
 * If the record id found in NetSuite, the function will return its internalid,
 * otherwise it will return -null-
 *
 * @author ibudimir@alphabold.com
 * @param {string} recordType
 * @param {string} fieldType
 * @param {string} value
 * @returns {integer} recordInternalId / null
 */
function lookupRecordInNetSuite(recordType, fieldType, value) {
    var filters = [];
    var recordInternalId = null;

    filters.push(new nlobjSearchFilter(fieldType, null, 'is', value));
    var searchResult = nlapiSearchRecord(recordType, null, filters, null);

    if (!isEmpty(searchResult)) {
        recordInternalId = searchResult[0].getId();
    }

    return recordInternalId;
}


/**
 * Creates Error Log CSV file. it dynamically parses the object properties and uses them as headers.
 *
 * @ibudimir@alphabold.com
 * @param errorArray {array}
 * @returns {integer} id
 */
function createCSVFile(errorArray, properties) {
    try {
        if (isEmpty(properties) || properties.length == 0) {
            nlapiLogExecution('debug', 'the CSV log cannot be generated, -properties- attribute is missing');
            return;
        }

        //loop through the property array, build a header
        var csvHeader = '';

        for (var i = 0; i < properties.length; i++) {
            csvHeader += properties[i] + ',';
        }
        csvHeader += '\n';
        var csvDetails = '';

        for (var j = 0; j < errorArray.length; j++) {
            var csvLine = '';
            var counter = 0;
            while (counter != properties.length) {
                csvLine += errorArray[j][properties[counter]] + ',';
                counter++;
            }
            csvLine += '\n';
            csvDetails += csvLine;
        }

        var csvFullData = csvHeader + csvDetails;
        var fileNamePrefix = 'csv_log_';
        var currentTimestamp = new Date().getTime();

        var csvFile = nlapiCreateFile(fileNamePrefix + currentTimestamp + '.csv', 'CSV', csvFullData);
        nlapiLogExecution('DEBUG','folder ID',ERROR_LOG_FOLDER);
        csvFile.setFolder(ERROR_LOG_FOLDER);
        //internal id of the folder in the file cabinet
        var id = nlapiSubmitFile(csvFile);
        return id;
    } catch (err) {
        nlapiLogExecution('error', 'The script failed to submit a csv file.' + err.toString());
    }
}

/**
 * This function will work with 2 helpers, yieldScript & setRecoveryPoint
 * to yield the script and restart when gov. limits are almost reached.
 *
 * @param : {nlObj} ctx | NS Context Object
 * @param : {integer} | Minimums required to run one iteration of the script
 * @return : null
 * @author : ibudimir@alphabold.com
 */
function checkUsage(ctx, minimumLimit) {
    if (isNaN(minimumLimit) == true) {
        minimumLimit = 100;
    }
    //nlapiLogExecution('debug', 'remaining usage: ', ctx.getRemainingUsage());
    // If we don't have enough usage to process one more record we yield
    //the script to continue in a new execution where we left off
    if (!isEmpty(ctx) && (ctx.getRemainingUsage() < minimumLimit)) {
        setRecoveryPoint();
        yieldScript();
    }
}

/**
 * yieldScript : Calls the API to yield the current script (equivalent to reschedule basically).
 * Logs information depending on returned state.
 *
 * @author frederic.jannelle@erpguru.com
 */
function yieldScript() {
    var state = nlapiYieldScript();
    if (state.status == 'FAILURE') {
        nlapiLogExecution("ERROR", "Failed to yield script, exiting: Reason = " + state.reason + " / Size = " + state.size);
        throw "Failed to yield script";
    } else if (state.status == 'RESUME') {
        nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason + ".  Size = " + state.size);
    }
    // state.status will never be SUCCESS because a success would imply a yield has occurred.  The equivalent response would be yield
}

/**
 * setRecoveryPoint : Calls the API to resume the execution of the scheduled script execution
 * exactly where it left off before the interruption.
 *
 * @author ibudimir@alphabold.com
 */

function setRecoveryPoint() {
    var state = nlapiSetRecoveryPoint();
    //100 point governance
    if (state.status == 'SUCCESS') {
        return;
    }//we successfully create a new recovery point
    if (state.status == 'RESUME') {//a recovery point was previously set, we are resuming due to some unforeseen error
        nlapiLogExecution("ERROR", "Resuming script because of " + state.reason + ".  Size = " + state.size);
    } else if (state.status == 'FAILURE') {//we failed to create a new recovery point
        nlapiLogExecution("ERROR", "Failed to create recovery point. Reason = " + state.reason + " / Size = " + state.size);
    }
}