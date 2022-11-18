// eslint-disable-next-line no-undef
define(['N/log','N/search','N/record','N/runtime'], function(log,search,record,runtime) {
    return {
        internalid: 'customrecord_ab_sap_integration_errorlog',
        scriptFieldProcessId:'custscript_ab_processflow', //To be created
        fields: {
            PROCESS: {
                id: 'custrecord_ab_process'
            },
            ERROR_MSG: {
                id: 'custrecord_ab_error_message'
            },
            NS_CUSTOMER: {
                id: 'custrecord_ab_customer'
            },
            SAP_CUSTOMER_ID: {
                id: 'custrecord_ab_customer_sap_id'
            },
        },
        
        /**
         * @param  {} errorMsg
         * @param  {} sapCustomerId
         * @param  {} NSCustomerId
         * @param  {} {vartitle='create(
         * Details : Create Error Log custom record 
         */
        create:function create(errorMsg,sapCustomerId,NSCustomerId){
            var title = 'create()::';
            log.debug(title+"errorMsg | sapCustomerId | NSCustomerId",errorMsg+' | '+sapCustomerId + ' | '+NSCustomerId);
            var scriptObj = runtime.getCurrentScript();
            var process = scriptObj.getParameter({name: this.scriptFieldProcessId}) || 2;//outBound by default
            
            try{

                var errRec = record.create({
                    type: this.internalid,
                    isDynamic: true
                });
                errRec.setValue({
                    fieldId: this.fields.PROCESS.id,
                    value: process
                });
                errRec.setValue({
                    fieldId: this.fields.ERROR_MSG.id,
                    value: errorMsg
                });
                errRec.setValue({
                    fieldId: this.fields.NS_CUSTOMER.id,
                    value: NSCustomerId
                });
                errRec.setValue({
                    fieldId: this.fields.SAP_CUSTOMER_ID.id,
                    value: sapCustomerId
                });
                errRec.save();
                }catch(error){
                    log.error(title+error.name,error.message);
            } 
        },
        createCreaditCustomerError:function  createCreaditCustomerError(errorMsg,NSCustomerId){
            var title = 'createCreaditCustomerError()::';
             try{
                var errRec = record.create({
                    type: this.internalid,
                    isDynamic: true
                });
                errRec.setValue({
                    fieldId: this.fields.PROCESS.id,
                    value: 1 //inbound
                });
                errRec.setValue({
                    fieldId: this.fields.ERROR_MSG.id,
                    value: errorMsg
                });
                errRec.setValue({
                    fieldId: this.fields.NS_CUSTOMER.id,
                    value: NSCustomerId
                });
                errRec.save();
                }catch(error){
                    log.error(title+error.name,error.message) 
            } 
         } ,    
        /**
         * @param  {} {vartitle="getList()
         * @param  {} description ="Custom Function get custom records 'Logs' list of last day"
         * @returns varlogList
         */
         getList : function(){
            var title ="getList() ::";
            var logList =[];
            var obj ={};
            var self = this;
            var searchResult;
            try {
            searchResult = search.create({
                type: this.internalid,
                filters:
                [["isinactive","is","F"],"AND",["created","on","today"]],
                columns:
                [
                   search.createColumn({name: this.fields.PROCESS.internalid}),
                   search.createColumn({name: this.fields.ERROR_MSG.internalid}),
                   search.createColumn({name: this.fields.NS_CUSTOMER.internalid}),
                   search.createColumn({name: this.fields.SAP_CUSTOMER_ID.internalid})
                ]
             });

             searchResult.run().each(function(result){

                obj ={};
              obj.id = result.id;
              obj.process = result.getText({name: self.fields.PROCESS.internalid});
              obj.errorMsg =  result.getText({name: self.fields.ERROR_MSG.internalid});
              obj.nsCustomer = result.getText({name: self.fields.NS_CUSTOMER.internalid});
              obj.sapCustomer = result.getValue({name: self.fields.SAP_CUSTOMER_ID.internalid});
              logList.push(obj);
                return true;
             });
            } catch (error) {
                log.error({
                    title:title+"Error",
                    details: error.message
                });
            }
            return logList;
        }
    };
});