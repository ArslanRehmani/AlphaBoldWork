// eslint-disable-next-line no-undef
define(['N/log','N/record','../dao/AB_CLS_ErrorLogs.js','N/search'], function(log,record,CLS_ErrorLogs,search) {
    return {
        internalid: 'customer',
        fields: {
            creditLimit: {id: 'custentityab_creditlimit_available'},
            groupId: {id: 'custentityab_group_credit_account'},
            remainingCredit: {id: 'custentityab_creditlimit_remaining'},
        },
        
        /**
         * @param  {} custId
         * @param  {} amount
         * @param  {} sapid
         * @param  {} {vartitle='update(
         * @param  {custId} id
         * @param  {true}} isDynamic
         * @returns false
         * Detials : Update Customer credit amount
         */
        update:function(custId,amount,sapid,groupId){
            var title = 'update()::';
             try{
                var customerRec = record.load({
                    type: record.Type.CUSTOMER,
                    id: custId,
                    isDynamic: true
                });
                customerRec.setValue({
                    fieldId: this.fields.creditLimit.id,
                    value: amount
                });
                customerRec.setValue({
                    fieldId: this.fields.remainingCredit.id,
                    value: amount
                });
               var custRecId =  customerRec.save({
                    ignoreMandatoryFields: true
                });
                }catch(error){

                    CLS_ErrorLogs.create(error.message,sapid,custId);
                    log.error(title+error.name,error.message);
            } 
            return custRecId ? true:false; 
        },


        checkCustomerBalance:function checkCustomerBalance(customer,total){
            var title = 'checkCustomerBalance()::';
             try{
                    var creditBalObj = this.getCustomerCredit(customer);
                    if(creditBalObj.sapNbr && creditBalObj.sapNbr != ''){
                        var totalbalacne = parseFloat(total);
                        log.debug(title+'totalbalacne',totalbalacne); //SO total
                        log.debug(title+'remainingCredit',creditBalObj.remainingCredit);
                        return parseFloat(totalbalacne) > parseFloat(creditBalObj.remainingCredit) ? false : true;
                    }else{
                        return true;
                    }
                }catch(error){
                    log.error(title+error.name,error.message);
            } 
        },
        getCustomerCredit:function getCustomerCredit(customer){
            var title = 'getCustomerCredit()::';
            var obj = {};
             try{
                var customerRec = record.load({type: record.Type.CUSTOMER,id: customer,isDynamic: true});
                    obj.remainingCredit = customerRec.getValue({fieldId:'custentityab_creditlimit_remaining'}) || 0;
                    obj.creditLimit = customerRec.getValue({fieldId:'custentityab_creditlimit_available'}) || 0;
                    obj.sapNbr = customerRec.getValue({fieldId:'custentity_sap_id'}) || '';
                }catch(error){
                    log.error(title+error.name,error.message); 
            } 
            return obj || {};
        },
        updateCustomer:function updateCustomer(customer,total){
            var title = 'updateCustomer()::';
             try{  
                var customerRec = record.load({type: record.Type.CUSTOMER,id: customer,isDynamic: true});
                var availableCreditLimit = customerRec.getValue({fieldId :'custentityab_creditlimit_available'}) || 0;
                var groupId = customerRec.getValue({fieldId :'custentityab_group_credit_account'});
                var remainingCredit = parseFloat(availableCreditLimit) - parseFloat(total);
                log.debug(title+'groupId',groupId);
                if(groupId){
                    var customerList = this.getCustomer(groupId);
                    for(var x = 0 ; x < customerList.length;x++){
                        this.setRemainingCredit(customerList[x],remainingCredit);
                    }
                }else{
                    this.setRemainingCredit(customer,remainingCredit);
                }
                }catch(error){
                    log.error(title+error.name,error.message);
            } 
        },
        getCustomer:function getCustomer(groupId){
                var title = 'getCustomer()::';
                var customers = [];
                try{
                    var customerSearchObj = search.create({
                        type: "customer",
                        filters:
                        [
                           ["stage","anyof","CUSTOMER"], 
                           "AND", 
                           ["custentityab_group_credit_account","is",groupId],
                           "AND",
                           ["custentity_sap_id","isnotempty",""]
                        ],
                        columns:
                        [
                           search.createColumn({name: "internalid", label: "Internal ID"}),
                           search.createColumn({name: "custentityab_group_credit_account", label: "Group Credit Account- SAP"})
                        ]
                     });
                     customerSearchObj.run().each(function(result){
                        customers.push(result.id);
                        return true;
                     });                 
                    }catch(error){
                        log.error(title+error.name,error.message);
                }
                return customers || []; 
        },
        setRemainingCredit:function setRemainingCredit(customer,remainingCredit){
            var title = 'setRemainingCredit()::';
             try{
               var customerRec =  record.load({
                    type: record.Type.CUSTOMER,
                    id: customer,
                    isDynamic: true
                });
                var sapNbr =  customerRec.getValue({fieldId:'custentity_sap_id'});
                if(sapNbr){
                    customerRec.setValue({fieldId:'custentityab_creditlimit_remaining',value:remainingCredit});
                    customerRec.save();
                }else{
                    CLS_ErrorLogs.createCreaditCustomerError("REMAINING BALANCE NOT SET AS SAP CUSTOMER ID NOT SET ON THIS CUSTOMER",customer);
                }
                }catch(error){
                    CLS_ErrorLogs.createCreaditCustomerError(error.message,customer);
                    log.error(title+error.name,error.message); 
            } 
        },
        updateCustomerCredits:function updateCustomerCredits(customer,total){
            var title = 'setRemainingCredit()::';
             try{
               var customerRec =  record.load({
                    type: record.Type.CUSTOMER,
                    id: customer,
                    isDynamic: true
                });
                var sapNbr =  customerRec.getValue({fieldId:'custentity_sap_id'});
                if(sapNbr){
                    customerRec.setValue({fieldId:'custentityab_creditlimit_available',value:total});
                    customerRec.setValue({fieldId:'custentityab_creditlimit_remaining',value:total});
                    customerRec.save();
                }else{
                    CLS_ErrorLogs.createCreaditCustomerError("REMAINING/TOTAL BALANCE NOT SET AS SAP CUSTOMER ID NOT SET ON THIS CUSTOMER",customer);
                }
                }catch(error){
                    CLS_ErrorLogs.createCreaditCustomerError(error.message,customer);
                    log.error(title+error.name,error.message); 
            } 
        }
    };
});