    /* eslint-disable no-extra-boolean-cast */
    /*
    ***********************************************************************
    *
    * The following javascript code is created by AlphaBOLD Inc.,
    * a NetSuite Partner. It is a SuiteCloud component containing custom code
    * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
    * The code is provided "as is": AlphaBOLD shall not be liable
    * for any damages arising out the intended use or if the code is modified
    * after delivery.
    *
    * Company:     AlphaBOLD Inc., www.alphabold.com
    * Author:      hriaz@alphabold.com
    * File:        AB_MR_UpdateCustomersCreditAmount.js
    * Date:        07/26/2022
    *
    *
    ***********************************************************************/
/**
 *@NApiVersion 2.0
 *@NScriptType MapReduceScript
 */
// eslint-disable-next-line no-undef
define(['N/log','../Common/AB_LIB_Common.js','../dao/AB_CLS_Customer.js','../dao/AB_CLS_AvailableCreditLogs.js','../dao/AB_CLS_AvailableCreditLogs.js','../dao/AB_CLS_Email.js','N/runtime','N/task'], function(log,LIB_Common,CLS_Customer,CLS_CreditLimitLogs,CLSAvailableCreditLogs,CLSEmail,runtime,task) {
    var FOLDERFIELD = 'custscript_ab_inbound_csv_folder';
    /**
     * @param  {} {vartitle='getInputData(
     * Details : Get SFTP server file and convert it to JSON Array
     */
    function getInputData() {
        var title = 'getInputData()::';
         try{
            var sapFile = LIB_Common.getSapFile(FOLDERFIELD);
     
            }catch(error){
                log.error(title+error.name,error.message);
        }
        return sapFile || []
    }
    /**
     * @param  {} context
     * @param  {} {vartitle='map(
     * Details : Create Available Credit logs from SFTP server file data
     */
    function map(context) {
        var title = 'map()::';
         try{
            log.debug(title+'JSON.parse(context.value)',JSON.parse(context.value));
            var obj = JSON.parse(context.value);
            var customer = obj['NS Customer ID']; //sap file customer id header
            var amount = obj['Available Credit - Group']; //sap file Exposure amount header
            var SAPId = obj['Customer SAP ID'];   //sap file SAP customer ID
            var groupId = obj['Group Credit Account'];   //sap file credit group
            log.debug(title+'customer:amount:SAPId:groupId',customer+':'+amount+':'+SAPId+':'+groupId);
            var updateStatus = CLS_Customer.update(customer,amount,SAPId,groupId);
            obj.updateStatus = updateStatus;
            CLS_CreditLimitLogs.create(obj);
            }catch(error){
                log.error(title+error.name,error.message);
        } 
    }
    /**
     * @param  {} summary
     * @param  {} {vartitle="Summary(
     * Details : Send Email Summary of todays created customer available credit logs custom record
     */
    function summarize(summary) {
        var title = "Summary() :: ";
        var logs,status ;
        var scriptContext = runtime.getCurrentScript();
        var approval_ScriptId = scriptContext.getParameter({name:'custscript_ab_approval_task_scriptid'});
        var approval_ScriptDeploymentId = scriptContext.getParameter({name:'custscript_ab_approval_task_deployment'});
        try {
            logs = CLSAvailableCreditLogs.getTransactionLog('on','today');
            status = CLSEmail.sendEmail(logs);
            log.debug({
                title: title + "Email Status",
                details: "Email Sent :" + status
            });
            if(approval_ScriptId && approval_ScriptDeploymentId){
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: approval_ScriptId,
                    deploymentId: approval_ScriptDeploymentId
                });
                // Submit the map/reduce task
                var mrTaskId = mrTask.submit();
                log.debug(title + 'Auto Approval Schedule Script TASKId', mrTaskId);
            }else{
                log.error(title + 'PHASE(2)',' Approval Script Id,s Missing');
            }



        } catch (error) {
            log.error({
                title: title + 'Error',
                details: error.message
            });
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize:summarize
    };
});
