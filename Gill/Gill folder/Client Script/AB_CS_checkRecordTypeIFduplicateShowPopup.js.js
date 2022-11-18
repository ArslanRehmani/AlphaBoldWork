/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(['N/log', 'N/search', 'N/ui/dialog','../dao/AB_CLS_Error.js'], function (log, search, dialog,error) {


    function fieldChanged(context) {
        var title = 'fieldChanged(::)';
        var rec = context.currentRecord;
        var field = context.fieldId;
        try {
            if (field === 'custrecord_slct_rec_type') {
                // var RecordType = rec.getValue({ fieldId: 'custrecord_slct_rec_type' });
                var recordType = rec.getValue({ fieldId: 'custrecord_slct_rec_type1' });
                log.debug('RecordType',recordType);
                //if this record is select previoly a popup message is shown
                var customrecord_ab_deploye_conf_recSearchObj = search.create({
                    type: "customrecord_ab_deploye_conf_rec",
                    filters:
                        [
                            ["custrecord_slct_rec_type","anyof",recordType]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_rec_id", label: "Rec ID" })
                        ]
                });
                customrecord_ab_deploye_conf_recSearchObj.run().each(function (result) {
                    var id = result.getValue({ name: 'custrecord_rec_id' });
                    if (id) {
                        dialog.confirm({
                            title: '<span>STOP ?</span>',
                            message: '<b>Script is Deployd on this Record! Record Type is always Unique!</b>'
                        }).then(function (option) {
                            if (option) {
                                rec.setValue({
                                    fieldId: 'custrecord_slct_rec_type',
                                    value: '',
                                    ignoreFieldChange: true
                                });
                                rec.setValue({
                                    fieldId: 'custrecord_rec_id',
                                    value: '',
                                    ignoreFieldChange: true
                                });
                                return true;
                            }
                        }).catch(function (e) {
                            throw new Error('ERROR', e.message);
                        });
                    } else {
                        return true;
                    }
                    return true;
                });
            }
        } catch (e) {
            log.debug('Exception ' + title, e.message);
            var id = error.createError(e.name, e.message, title);
            log.debug('Exception ' + title + 'errorRecId', id);
        }

    }


    return {
        fieldChanged: fieldChanged
    }
});
