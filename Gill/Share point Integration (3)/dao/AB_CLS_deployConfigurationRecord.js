/**
 * @NApiVersion 2.0
 */
define(['N/log', 'N/record', 'N/runtime', 'N/search', 'N/file', 'N/ui/serverWidget', '../Common/AB_Lib_Common.js','../dao/AB_CLS_Error.js'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{file} file
     * @param{serverWidget} serverWidget
     */
    function (log, record, runtime, search, file, serverWidget, common,error) {
        return {
            internalID: {
                reccordType: 'customrecord_ab_deploye_conf_rec'
            },
            fields: {
                recid: 'custrecord_rec_id'
            },
            deployeScriptOnRecords: function (array) {
                var title = 'deployeScriptOnRecords(::)';
                try {
                    for (var i = 0; i < array.length; i++) {
                        var seclectRecToApplayScript = record.load({
                            type: this.internalID.reccordType,
                            id: parseInt(array[i])
                        });
                        var recType = seclectRecToApplayScript.getValue({
                            fieldId: this.fields.recid
                        });
                        var recTypeUpperCase = recType.toUpperCase();
                        log.debug('recTypeUpperCase', recTypeUpperCase);
                        common.deployedScript(recTypeUpperCase);
                    }
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            },
            unDedloyeScriptOnRecord: function (array) {
                var title = 'unDedloyeScriptOnRecord(::)';
                try {
                    for (var i = 0; i < array.length; i++) {
                        var seclectRecTounActiveScript = record.load({
                            type: this.internalID.reccordType,
                            id: parseInt(array[i])
                        });
                        var recType = seclectRecTounActiveScript.getValue({
                            fieldId: this.fields.recid
                        });
                        var recTypeUpperCaeUNactive = recType.toUpperCase();
                        log.debug('recTypeUpperCaeUNactive unactive', recTypeUpperCaeUNactive);
                        common.unDeployedScript(recTypeUpperCaeUNactive);
                    }
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            },
            deployConfigugationRecordsArray: function () {
                var title = 'deployConfigugationRecordsArray(::)';
                try {
                    var deployConfigurationArray = [];
                    var deployConfigurationSearch = search.create({
                        type: this.internalID.reccordType,
                        filters:
                            [
                            ],
                        columns:
                            [
                                search.createColumn({ name: this.fields.recid, label: "Rec ID" })
                            ]
                    });
                    deployConfigurationSearch.run().each(function (result) {
                        deployConfigurationArray.push(result.id);
                        return true;
                    });
                    log.debug('deployConfigurationArray', deployConfigurationArray);
                    return deployConfigurationArray;
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            },
        }

    });