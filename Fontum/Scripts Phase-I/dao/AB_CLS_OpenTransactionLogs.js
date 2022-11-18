// eslint-disable-next-line no-undef
define(['N/log', 'N/search', 'N/record', '../dao/AB_CLS_ErrorLogs.js', '../Common/AB_LIB_Common.js'], function (log, search, record, CLS_ErrorLogs, LIB_Common) {
    return {
        internalid: 'customrecord_ab_open_transaction_log',
        fields: {
            CUSTOMER_NS_ID: {
                id: 'custrecord_ab_ns_customer'
            },
            CUSTOMER_SAP_ID: {
                id: 'custrecord_ab_sap_customer_id'
            },
            DATE_TIME: {
                id: 'custrecord_ab_datetime_stamp'
            },
            NS_EXPOSURE: {
                id: 'custrecord_ab_total_open_amount'
            },
            CREATED_TIME: {
                id: 'custrecord_ab_created_time'
            },
            OPEN_ORDER_AMOUNT: {
                id: 'custrecord_ab_ns_open_order_amt'
            },
            OPEN_INVOICE_AMOUNT: {
                id: 'custrecord_ns_open_invoice_amt'
            },
        },
        /**
         * @param  {} recValues
         * @param  {} {vartitle='create(
         * Details : Create Open Transaction Logs Custom record
         */
        create: function (recValues) {
            var title = 'create()::';
            try {
                var timeStemp = new Date();
                var logRec = record.create({
                    type: this.internalid,
                    isDynamic: true
                });
                logRec.setValue({
                    fieldId: this.fields.CUSTOMER_NS_ID.id,
                    value: recValues['customer_id']
                });
                logRec.setValue({
                    fieldId: this.fields.CUSTOMER_SAP_ID.id,
                    value: recValues['sap_customer_id']
                });
                logRec.setValue({
                    fieldId: this.fields.OPEN_INVOICE_AMOUNT.id,
                    value: recValues['invoice_amt']
                });
                logRec.setValue({
                    fieldId: this.fields.OPEN_ORDER_AMOUNT.id,
                    value: recValues['salesorder_amt']
                });
                logRec.setValue({
                    fieldId: this.fields.DATE_TIME.id,
                    value: timeStemp
                });
                logRec.setValue({
                    fieldId: this.fields.CREATED_TIME.id,
                    value: timeStemp.getTime()
                });
                logRec.setValue({
                    fieldId: this.fields.NS_EXPOSURE.id,
                    value: recValues['total_amt']
                });
                var recId = logRec.save();
                log.debug(title + 'recId', recId);
            } catch (error) {
                CLS_ErrorLogs.create(error.message, recValues['sap_customer_id'], recValues['customer_id']);
                log.error(title + error.name, error.message);
            }
        },



        /**
         * @param  {} {vartitle='getTransactionLog(
         * Details : return todays transactions logs data
         */
        getTransactionLog: function getTransactionLog(operator,period) {
            var title = 'getTransactionLog()::';
            try {
                var customrecord_ab_open_transaction_logSearchObj = search.create({
                    type: this.internalid,
                    filters: [
                        ["created", operator, period]
                    ],
                    columns: [
                        search.createColumn({
                            name: this.fields.CUSTOMER_NS_ID.id,
                            label: "Customer Name/ID"
                        }),
                        search.createColumn({
                            name: this.fields.CUSTOMER_SAP_ID.id,
                            label: "Customer SAP ID"
                        }),
                        search.createColumn({
                            name: this.fields.DATE_TIME.id,
                            label: "Date/Time Stamp"
                        }),
                        search.createColumn({
                            name: this.fields.NS_EXPOSURE.id,
                            label: "NS EXPOSURE AMT"
                        }),
                        search.createColumn({
                            name: this.fields.CREATED_TIME.id,
                            label: "Created Time Stamp"
                        }),
                        search.createColumn({
                            name: this.fields.OPEN_ORDER_AMOUNT.id,
                            label: "NS OPEN ORDERS AMT"
                        }),
                        search.createColumn({
                            name: this.fields.OPEN_INVOICE_AMOUNT.id,
                            label: "NS OPEN INVOICES AMT"
                        })
                    ]
                });

                var searchResult = LIB_Common.searchAll(customrecord_ab_open_transaction_logSearchObj);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return searchResult || [];
        },

        /**
         * @param  {} searchResult
         * @param  {} {varresult=searchResult[x];if(addHeader
         * @param  {} {content+=HEADER;addHeader=false;}content+='\n';varid=result.id;content+=id+'
         * Details : Map search data into CSV (comma saperate value) Structure
         */
        getCSVContent: function getCSVContent(searchResult) {
            var title = 'getCSVContent()::';
            var HEADER = 'TRANSACTION LOG ID,SAP CUSTOMER ID,NS OPEN ORDER AMOUNT,NS OPEN INVOICE AMOUNT,TOTAL AMOUNT,DATE-TIME,NETSUITE CUSTOMER ID';
            var content = '';
            try {
                log.debug('searchResult', searchResult);
                var addHeader = true;

                for (var x = 0; x < searchResult.length; x++) {
                    var result = searchResult[x];
                    if (addHeader) {
                        content += HEADER;
                        addHeader = false;
                    }
                    content += '\n';
                    var id = result.id;
                    content += id + ',';
                    var sap_customer = result.getValue({
                        name: "custrecord_ab_sap_customer_id"
                    });
                    content += sap_customer + ',';
                    var openOrderAmt = result.getValue({
                        name: this.fields.OPEN_ORDER_AMOUNT.id
                    });
                    content += openOrderAmt + ',';
                    var openInvAmt = result.getValue({
                        name: this.fields.OPEN_INVOICE_AMOUNT.id
                    });
                    content += openInvAmt + ',';
                    var nsExposureAmt = result.getValue({
                        name: this.fields.NS_EXPOSURE.id
                    });
                    content += nsExposureAmt + ',';
                    var dateTime = result.getValue({
                        name: this.fields.DATE_TIME.id
                    });
                    content += dateTime + ',';
                    // var timeStamp = result.getValue({
                    //     name: "custrecord_ab_created_time"
                    // });
                    // content += timeStamp + ',';
                    // var customer = result.getText({
                    //     name: this.fields.CUSTOMER_NS_ID.id
                    // });
                    // customer = '"' + customer + '"';
                    // content += customer + ',';
                    var customerId = result.getValue({
                        name: this.fields.CUSTOMER_NS_ID.id
                    });
                    content += customerId ;
                }

            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return content || '';
        },

        /**
         * @param  {} id
         * @param  {} {vartitle='deleteRec(
         * @param  {id}} id
         * Details : Deleted transaction log record and return deleted rec Id
         */
        deleteRec : function deleteRec(id){
            var title = 'deleteRec()::';
             try{
                    var deletedrecId = record.delete({
                        type: this.internalid,
                        id: id
                    });
                }catch(error){
                    log.error(title+error.name,error.message);
            }
           return deletedrecId || ''; 
        }
    };
});