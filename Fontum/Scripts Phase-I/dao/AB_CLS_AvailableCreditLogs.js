// eslint-disable-next-line no-undef
define(['N/log', 'N/record', 'N/search', '../Common/AB_LIB_Common.js','../dao/AB_CLS_ErrorLogs.js'], function (log, record, search, LIB_Common,CLSErrorlogs) {
    return {
        internalid: 'customrecord_ab_available_credit_log',
        fields: {
            CUSTOMER_SAP_ID: {
                id: 'custrecord_ab_sap_id'
            },
            CUSTOMER_NS_ID: {
                id: 'custrecord_ab_ns_customer_id'
            },
            DATE_TIME: {
                id: 'custrecord_ab_date_time'
            },
            NS_EXPOSURE: {
                id: 'custrecord_ab_ns_exposure'
            },
            AVAILABLE_CREDIT: {
                id: 'custrecord_ab_available_credit'
            },
            UPDATE_STATUS: {
                id: 'custrecord_ab_update_credit_status'
            },
            GROUP_CREDIT_ACC: {
                id: 'custrecord_ab_group_credit_acc'
            }
        },

       /**
         * @param  {} obj
         * Details : To Created Available credit logs form inbound csv file data
         */
        create: function (obj) {
            var title = 'create()::';
            try {
                var logRec = record.create({
                    type: this.internalid,
                    isDynamic: true
                });
                logRec.setValue({
                    fieldId: this.fields.CUSTOMER_SAP_ID.id,
                    value: obj['Customer SAP ID']
                });
                logRec.setValue({
                    fieldId: this.fields.CUSTOMER_NS_ID.id,
                    value: obj['NS Customer ID']
                });
                logRec.setValue({
                    fieldId: this.fields.DATE_TIME.id,
                    value: parseFloat(obj['Date and Time']).toFixed()
                });
                logRec.setValue({
                    fieldId: this.fields.NS_EXPOSURE.id,
                    value: obj['NS Exposure']
                });
                logRec.setValue({
                    fieldId: this.fields.AVAILABLE_CREDIT.id,
                    value: obj['Available Credit - Group']
                });
                logRec.setValue({
                    fieldId: this.fields.GROUP_CREDIT_ACC.id,
                    value: obj['Group Credit Account']
                });
                logRec.setValue({
                    fieldId: this.fields.UPDATE_STATUS.id,
                    value: obj['updateStatus']
                });
                logRec.save();
            } catch (error) {
                CLSErrorlogs.create(error.message,obj['Customer SAP ID'],obj['NS Customer ID']);
                log.error(title + error.name, error.message);
            }
        },


        /**
         * @param  {} {vartitle='getTransactionLog(
         * Details : return todays transactions logs data
         */
        getTransactionLog: function getTransactionLog(operator, period) {
            var title = 'getTransactionLog()::';
            try {
                var customrecord_ab_available_credit_log = search.create({
                    type: this.internalid,
                    filters: [
                        ["created", operator, period]
                    ],
                    columns: [
                        search.createColumn({
                            name: this.fields.CUSTOMER_NS_ID.id,
                        }),
                        search.createColumn({
                            name: this.fields.CUSTOMER_SAP_ID.id,
                        }),
                        search.createColumn({
                            name: this.fields.DATE_TIME.id,
                        }),
                        search.createColumn({
                            name: this.fields.NS_EXPOSURE.id,
                        }),
                        search.createColumn({
                            name: this.fields.AVAILABLE_CREDIT.id,
                        }),
                        search.createColumn({
                            name: this.fields.UPDATE_STATUS.id,
                        }),
                        search.createColumn({
                            name: this.fields.GROUP_CREDIT_ACC.id,
                        })
                    ]
                });

                var searchResult = LIB_Common.searchAll(customrecord_ab_available_credit_log);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return searchResult || [];
        },

        /**
         * @param  {} id
         * @param  {} {vartitle='deleteRec(
         * @param  {id}} id
         * Details : Deleted transaction log record and return deleted rec Id
         */
        deleteRec: function deleteRec(id) {
            var title = 'deleteRec()::';
            try {
                var deletedrecId = record.delete({
                    type: this.internalid,
                    id: id
                });
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return deletedrecId || '';
        }
    };
});