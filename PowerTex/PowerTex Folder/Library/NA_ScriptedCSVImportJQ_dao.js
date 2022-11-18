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
 * File:        NA_ScriptedCSVImportJQ_dao.js
 * Date:        02/08/2019
 *
 ***********************************************************************/

var NAScriptedCSVImportJQ = (function () {
    return {
        Internalid: 'customrecord_scsvijq',
        Fields: {
            RecordType: {id: 'custrecord_jqrecordtype', source: 'recordtype', setDynamic: true},//Record Type
            File: {id: 'custrecord_jqfile', source: 'file', setDynamic: true},//File
            ProcessStatus: {id: 'custrecord_jqprocessstatus', source: 'processstatus', setDynamic: true},//Process Status
            ProcessNote: {id: 'custrecord_jqprocessnote', source: 'processnote', setDynamic: false},  //Process Note
            ProcessLogFile: {id: 'custrecord_plogfile', source: 'processlogfile', setDynamic: true},  //Process Log File
            Requester: {id: 'custrecord_qrequester', source: 'requester', setDynamic: true}   //Requester
        },
        //Get list of Package Contents  for a ItemFulfillment
        getList: function (processStatus, userId, sortByDateCreated) {
            var recs = null;
            var filters = [];
            var cols = [];
            var result = [];
            if (!!processStatus) {
                filters.push(new nlobjSearchFilter(this.Fields.ProcessStatus.id, null, 'is', processStatus));
            }

            if (!!userId) {
                filters.push(new nlobjSearchFilter(this.Fields.Requester.id, null, 'is', userId));
            }

            cols.push(new nlobjSearchColumn(this.Fields.RecordType.id));
            cols.push(new nlobjSearchColumn(this.Fields.File.id));
            cols.push(new nlobjSearchColumn(this.Fields.ProcessStatus.id));
            cols.push(new nlobjSearchColumn(this.Fields.ProcessNote.id));
            cols.push(new nlobjSearchColumn(this.Fields.ProcessLogFile.id));
            cols.push(new nlobjSearchColumn('created'));
            if (sortByDateCreated) {
                cols[cols.length - 1].setSort(true);
            }

            recs = nlapiSearchRecord(this.Internalid, null, filters, cols);

            if (!!recs && recs.length > 0) {
                for (var i = 0; i < recs.length; i++) {
                    result.push({
                        id: recs[i].getId(),
                        recordtype: recs[i].getValue(this.Fields.RecordType.id),
                        file: recs[i].getValue(this.Fields.File.id),
                        processlogfile: recs[i].getValue(this.Fields.ProcessLogFile.id),
                        processstatus: recs[i].getValue(this.Fields.ProcessStatus.id),
                        processnote: recs[i].getValue(this.Fields.ProcessNote.id),
                        created: recs[i].getValue('created')

                    });
                }
            }

            return result;
        },

        //Upsert function to create/update records
        upsert: function (dataObject) {
            var nsObject, id, processNote;

            if (!!dataObject) {
                if (!!dataObject.id) {
                    nsObject = nlapiLoadRecord(this.Internalid, dataObject.id);
                } else {
                    nsObject = nlapiCreateRecord(this.Internalid);
                }

                for (var f in this.Fields) {
                    if (!!this.Fields[f].source && this.Fields[f].setDynamic) {

                        nlapiLogExecution('debug', this.Fields[f].id + '  ' + this.Fields[f].source, dataObject[this.Fields[f].source]);

                        if (!!dataObject[this.Fields[f].source]) {
                            nsObject.setFieldValue(
                                this.Fields[f].id,
                                dataObject[this.Fields[f].source]
                            );
                        }
                    }
                }
                processNote = nsObject.getFieldValue(this.Fields.ProcessNote.id);
                nsObject.setFieldValue(this.Fields.ProcessNote.id,
                    dataObject['processnote'] + (!!processNote ? '\n' + processNote : ''));


                id = nlapiSubmitRecord(nsObject);

            } else {
                throw new nlapiCreateError('INVALID_DATA', 'Invalid Data Object to Create/Update record ' + this.Internalid);
            }
            return id;
        }
    };
})();