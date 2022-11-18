/**
 * @NApiVersion 2.0
 */
define(['N/log', 'N/record', 'N/runtime', 'N/search', 'N/file', 'N/ui/serverWidget','../dao/AB_CLS_Error.js'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{file} file
     * @param{serverWidget} serverWidget
     */
    function (log, record, runtime, search, file, serverWidget,error) {
        return {
            internalID: {
                reccordType: 'customrecord_ab_add_subtab_inti_confi'
            },
            fields: {
                inactiveField: 'isinactive'
            },
            inActivePreviousRecords: function () {
                var title = 'inActivePreviousRecords(::)';
                try {
                    var obj;
                    var inactiveRecArray = [];
                    var recordSearch = search.create({
                        type: this.internalID.reccordType,
                        filters:
                            [
                                ["isinactive", "is", "F"]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),
                                search.createColumn({ name: "scriptid", label: "Script ID" }),
                                search.createColumn({ name: "isinactive", label: "Inactive" })
                            ]
                    });
                    recordSearch.run().each(function (result) {
                        obj = {};
                        obj.id = result.id;
                        obj.isinactive = result.getValue({ name: 'isinactive' });
                        inactiveRecArray.push(obj);
                        return true;
                    });
                    if (inactiveRecArray && inactiveRecArray.length) {
                        for (var i = 0; i < inactiveRecArray.length; i++) {
                            var Id = inactiveRecArray[i].id;
                            if (Id) {
                                var customRecTab = record.load({
                                    type: this.internalID.reccordType,
                                    id: Id
                                });
                                customRecTab.setValue({
                                    fieldId: this.fields.inactiveField,
                                    value: true
                                });
                                customRecTab.save();
                            }
                        }
                    }
                    return true;
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            }
        }

    });