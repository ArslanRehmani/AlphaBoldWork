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
    * File:        AB_MR_DeleteAvailableCreditLogs.js
    * Date:        07/05/2022
    *
    *
    ***********************************************************************/
/**
 *@NApiVersion 2.0
 *@NScriptType MapReduceScript
 */
// eslint-disable-next-line no-undef
define(['N/log','N/record','N/runtime','../dao/AB_CLS_AvailableCreditLogs.js','N/search'], function(log,record,runtime,CLS_AvailableCreditLogs,search) {
    /**
     * @param  {} filter
     * @param  {} operator
     * @param  {} {vartitle='getfilterFormate(
     * Details : return filter date against internalId of custom list value
     */
    function getfilterFormate(filter,operator){
        var title = 'getfilterFormate()::';
         try{
            var listType = operator ? 'customlist_ab_filter_operator' :'customlist_ab_filter_period';
            var fieldLookUp = search.lookupFields({
                type: listType,
                id: filter,
                columns:['name']
            });       
            log.debug(title+'fieldLookUp',fieldLookUp);
            return fieldLookUp.name.split(" ").join('').toLowerCase();
            }catch(error){
                log.error(title+error.name,error.message);
        } 
    }


    
    /**
     * @param  {} {vartitle='getInputData(
     * Details : Fetch Available Credit logs record that is are going to be deleted
     */
    function getInputData() {
        var title = 'getInputData()::';
         try{
            var availableCreditLogs;
            var scriptObj = runtime.getCurrentScript();
            var dateOperator = scriptObj.getParameter({name: 'custscript_ab_filter_operator'});
            var datePeriod = scriptObj.getParameter({name: 'custscript_ab_filter_period'});
            dateOperator = getfilterFormate(dateOperator,true);
            datePeriod =  getfilterFormate(datePeriod,false);
            availableCreditLogs = CLS_AvailableCreditLogs.getTransactionLog(dateOperator,datePeriod);
          
            }catch(error){
                log.error(title+error.name,error.message);
        } 
        return availableCreditLogs;
    }


    /**
     * @param  {} context
     * @param  {} {vartitle='map(
     * Details : Deleted transaction log record
     */
    function map(context) {
        var title = 'map()::';
        var recObj ;
        var delId ;
         try{
            recObj = JSON.parse(context.value);
            delId = CLS_AvailableCreditLogs.deleteRec(recObj.id);
            log.debug(title+'delId',delId);
            }catch(error){
                log.error(title+error.name,error.message);
        } 
    }

 
    return {
        getInputData: getInputData,
        map: map
    };
});
