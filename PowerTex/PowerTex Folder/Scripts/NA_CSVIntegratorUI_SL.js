/***********************************************************************
 *
 * The following javascript code is created by Shoaib Mehmood (Independent Consultant).,
 * It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": Shoaib Mehmood shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     Shoaib Mehmood (Independent Consultant)
 * Author:      Shoaib Mehmood
 * File:        NA_CSVIntegratorUI_SL.js
 * Date:        04/23/2019
 ***********************************************************************/
var NACSVIntegratorUISL = (function () {
    return {
        SCHEDULE_SCRIPT_ID: 'customscript_sss_csv_import_tool_ext',
        SCHEDULE_SCRIPT_DEPLOYMENT_ID: 'customdeploy_sss_csv_import_tool_ext',
        CONTEXT: null,
        NETSUITE_HOST: '',
        DATA_FILE_FOALDER: '',
        FILE_TYPES_ALLOWED: ['CSV'],
        main: function (request, response) {
            nlapiLogExecution('debug', 'request.getMethod()', request.getMethod());
            var formObject = nlapiCreateForm('Custom CSV Import'), recordTypeFld, fileObj, fileid, recordType, fileType;
            var jqRecordObject, redirectPage = false, suiteletErrorText = '', errorField;
            var context = nlapiGetContext();
            this.CONTEXT = context;
            this.NETSUITE_HOST = this.CONTEXT.getSetting('SCRIPT', 'custscript_nshost');
            this.DATA_FILE_FOALDER = this.CONTEXT.getSetting('SCRIPT', 'custscript_dfuf');

            if (request.getMethod() == 'GET') {
                this.designForm(formObject, context);
                response.writePage(formObject);
            } else if (request.getMethod() == 'POST') {
                fileObj = request.getFile('custpage_file');
                if (!!fileObj) {
                    if (this.FILE_TYPES_ALLOWED.indexOf(fileObj.getType()) > -1) {
                        recordType = request.getParameter('custpage_trtype');
                        fileObj.setFolder(this.DATA_FILE_FOALDER);
                        fileid = nlapiSubmitFile(fileObj);
                        jqRecordObject = {};
                        jqRecordObject['recordtype'] = recordType;
                        jqRecordObject['file'] = fileid;
                        jqRecordObject['processstatus'] = 'Queue';
                        jqRecordObject['processnote'] = 'Your file is in Queue... ';
                        jqRecordObject['requester'] = context.getUser();
                        NAScriptedCSVImportJQ.upsert(jqRecordObject);
                        redirectPage = true;
                        nlapiScheduleScript(this.SCHEDULE_SCRIPT_ID, this.SCHEDULE_SCRIPT_DEPLOYMENT_ID);
                    } else {
                        suiteletErrorText = 'This file is not allowed. Only CSV file is allowed to upload';
                    }
                }

                if (redirectPage) {
                    response.sendRedirect('SUITELET', context.getScriptId(), context.getDeploymentId());
                } else {
                    errorField = formObject.addField('custpage_error', 'inlinehtml');
                    errorField.setDefaultValue('<font color="red">' + suiteletErrorText + '</font>');
                    errorField.setLayoutType('outsideabove');
                    this.designForm(formObject, context);
                    response.writePage(formObject);
                }
            }
        },
        designForm: function (formObject, context) {
            var recordTypeFld = formObject.addField('custpage_trtype', 'select', 'Record Type').setLayoutType('normal', 'startcol');
            var fileIds = [], dataFileId, logFileId, fileObjects, dfurlfld, lfurlfld;
            this.addSelectOptions(recordTypeFld);
            formObject.addField('custpage_file', 'file', 'Choose File').setMandatory(true);
            recordTypeFld.setMandatory(true);

            var queRecords = NAScriptedCSVImportJQ.getList(null, context.getUser(), true);

            if (!!queRecords && queRecords.length > 0) {
                var qList = formObject.addSubList('custpage_queue', 'staticlist', 'CSV Process Status');
                qList.addField('custpage_recordtype', 'text', 'Record Type');
                qList.addField('custpage_prstatus', 'text', 'Process Status');
                qList.addField('custpage_prnote', 'textarea', 'Process Notes');
                qList.addField('custpage_upfile', 'text', 'Uploaded File').setDisplayType('hidden');
                qList.addField('custpage_upfilename', 'text', 'Uploaded File Name');
                dfurlfld = qList.addField('custpage_upfileurl', 'url', 'Uploaded File Link');
                dfurlfld.setLinkText('Download');
                qList.addField('custpage_logfile', 'text', 'Log File').setDisplayType('hidden');
                lfurlfld = qList.addField('custpage_logfileurl', 'url', 'Log File');
                lfurlfld.setLinkText('Download');
                qList.addField('custpage_dtcr', 'text', 'Date Created');
                for (var q = 0; q < ((queRecords.length > 20) ? 20 : queRecords.length); q++) {
                    dataFileId = queRecords[q]['file'];
                    logFileId = queRecords[q]['processlogfile'];

                    qList.setLineItemValue('custpage_recordtype', q + 1, queRecords[q]['recordtype']);
                    qList.setLineItemValue('custpage_prstatus', q + 1, queRecords[q]['processstatus']);
                    qList.setLineItemValue('custpage_prnote', q + 1, queRecords[q]['processnote']);
                    qList.setLineItemValue('custpage_upfile', q + 1, dataFileId);
                    qList.setLineItemValue('custpage_logfile', q + 1, logFileId);
                    qList.setLineItemValue('custpage_dtcr', q + 1, queRecords[q]['created']);
                    if (dataFileId) fileIds.push(dataFileId);
                    if (logFileId) fileIds.push(logFileId);
                }
                fileObjects = NACsvUtils.getFilesInfo(fileIds);
                nlapiLogExecution('debug', 'fileObjects', JSON.stringify(fileObjects));

                for (var q = 0; q < ((queRecords.length > 10) ? 10 : queRecords.length); q++) {
                    //.setLinkText( "Click Here to Enter Employee Records").setDefaultValue( "https://system.netsuite.com" + nlapiResolveURL( 'tasklink', 'EDIT_EMPLOYEE')
                    dataFileId = queRecords[q]['file'];
                    logFileId = queRecords[q]['processlogfile'];

                    nlapiLogExecution('debug', 'queRecords[q][file]', queRecords[q]["file"]);
                    nlapiLogExecution('debug', 'queRecords[q][processlogfile]', queRecords[q]["processlogfile"]);

                    if (!!fileObjects[dataFileId]) {
                        qList.setLineItemValue('custpage_upfileurl', q + 1, this.NETSUITE_HOST +
                            fileObjects[dataFileId].url);
                        qList.setLineItemValue('custpage_upfilename', q + 1, fileObjects[dataFileId].name);
                    }

                    if (!!fileObjects[logFileId])
                        qList.setLineItemValue('custpage_logfileurl', q + 1, this.NETSUITE_HOST +
                            fileObjects [logFileId].url);
                }

                fileObjects = NACsvUtils.getFilesInfo(fileIds);
            }

            formObject.addButton('custpage_refreshbutton', 'Refresh', 'location.reload();');
            queRecords = NAScriptedCSVImportJQ.getList('Queue', context.getUser());
            if (!queRecords || queRecords.length <= 0){
                formObject.addSubmitButton('Submit');
            }

        },
        addSelectOptions: function (recordTypeFld) {
            var srch = nlapiSearchRecord('customrecord_csv_import_config', null, null,
                [new nlobjSearchColumn('custrecord_csvc_transaction_type', null, 'group')]);
            if (!!srch && srch.length > 0) {
                for (var s = 0; s < srch.length; s++) {
                    recordTypeFld.addSelectOption(
                        srch[s].getValue('custrecord_csvc_transaction_type', null, 'group'),
                        srch[s].getValue('custrecord_csvc_transaction_type', null, 'group'));
                }
            }
        }
    }
})();


function main(request, response) {
    return NACSVIntegratorUISL.main(request, response);
}