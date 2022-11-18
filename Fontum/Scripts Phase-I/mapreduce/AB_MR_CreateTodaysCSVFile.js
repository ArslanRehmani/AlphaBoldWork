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
    * File:        AB_MR_CreateTodaysCSVFile.js
    * Date:        06/21/2022
    *
    *
    ***********************************************************************/
/**
 *@NApiVersion 2.0
 *@NScriptType MapReduceScript
 */
// eslint-disable-next-line no-undef
define(['N/log','N/record','N/file','N/search','N/runtime','../dao/AB_CLS_OpenTransactionLogs.js','../Common/AB_LIB_Common.js','../dao/AB_CLS_SFTPConnection.js'], function(log,record,file,search,runtime,CLS_OpenTransaction,LIB_Common,CLSConnection) {

/**
 * @param  {} {vartitle='getInputData(
 * @param  {} {Details = 'Fetached today's transaction log custom record data and generate CSV file and placed into file cabinet}
 */

    function getInputData() {
        var title = 'getInputData()::';
        var content = '';
         try{          
            var searchResult = CLS_OpenTransaction.getTransactionLog('on','today');
            if(searchResult.length){
                content = CLS_OpenTransaction.getCSVContent(searchResult);
                if(content != ''){
                   var csvID = LIB_Common.createCSV(content);
                   if(csvID){
                    var upload = CLSConnection.uploadFile(csvID);
                    log.debug(title+'uploadFile :',upload);
                   }
            }
        }
            }catch(error){
                log.error(title+error.name,error.message);
        } 
    }
    function map(context) {

    }

    return {
        getInputData: getInputData,
        map:map
    };
});
