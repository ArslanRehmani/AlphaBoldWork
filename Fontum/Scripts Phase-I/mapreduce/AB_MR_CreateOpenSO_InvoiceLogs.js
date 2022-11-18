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
     * File:        AB_MR_CreateOpenSO_InvoiceLogs.js
     * Date:        06/21/2022
     *
     *
     ***********************************************************************/
    /**
     *@NApiVersion 2.0
     *@NScriptType MapReduceScript
     */
    // eslint-disable-next-line no-undef
    define(['N/log', 'N/search', 'N/record','../dao/AB_CLS_OpenTransactionLogs.js','../Common/AB_LIB_Common.js','N/task','N/runtime'], function (log, search, record,CLS_OpenTransactionLog,LIB_Common,task,runtime) {


        /**
         * @param  {} {vartitle='getInputData(
         * @param  {} {Details = 'Fetch open salesorder and invoice amount and pass it to map function'}
         */
        function getInputData() {
            var title = 'getInputData()::';
            try {
               
           
            var searchResult =  LIB_Common.searchOpenTransaction();
            if(!searchResult.length){
                log.error(title +'Search Result Null', "SearchResult is Empty");
            }
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return searchResult || [];
        }


        /**
         * @param  {} context
         * @param  {} {vartitle='map(
         * @param  {} {Details  = 'Create Custom transaction log record
         */
        function map(context) {
            var title = 'map()::';
            try {

                var recValues = JSON.parse(context.value);
                log.debug(title + 'recValues', recValues);
                CLS_OpenTransactionLog.create(recValues);

            } catch (error) {
                log.error(title + error.name, error.message);
            }
        }
        /**
         * @param  {} _summary
         * @param  {} {vartitle='summarize(
         * @param  {mapReduceScriptId} scriptId
         * @param  {'customdeploy_test_mapreduce_script'}} deploymentId
         * Details :  Kickoff CSV creation and upload SFPT Mapreduce SCRIPT
         */
        function summarize(_summary){
            var title = 'summarize()::';
            var scriptContext = runtime.getCurrentScript();
            var CSV_ScriptId = scriptContext.getParameter({name:'custscript_ab_csv_creation_script_id'});
            var CSV_ScriptDeploymentId = scriptContext.getParameter({name:'custscript_ab_csv_creation_deployment_id'});

             try{
                var mrTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: CSV_ScriptId,
                    deploymentId: CSV_ScriptDeploymentId
                });
            
                // Submit the map/reduce task
                var mrTaskId = mrTask.submit();
                log.debug(title + 'CSV CREATION SCRIPT TASKId', mrTaskId);
                }catch(error){
                    log.error(title+error.name,error.message);
            } 
        }

        return {
            getInputData: getInputData,
            map: map,
            summarize : summarize
        };
    });