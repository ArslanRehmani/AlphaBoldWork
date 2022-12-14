/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */

 /* 
*********************************************************************** 
* 
* The following javascript code is created by ALPHABOLD Consultants LLC, 
* a NetSuite Partner. It is a SuiteFlex component containing custom code 
* intended for NetSuite (www.netsuite.com) and use the SuiteScript API. 
* The code is provided "as is": ALPHABOLD Inc. shall not be liable 
* for any damages arising out the intended use or if the code is modified 
* after delivery. 
* 
* Company:		ALPHABOLD Consultants LLC, www.AlphaBOLDconsultants.com 
* Author:		marslan@AlphaBOLD.com 
* File:		    UE_Deployed_uescriptOnRec.js 
* Date:		    01/09/2022 
* 
***********************************************************************/ 
 
define(['N/log', '../Common/AB_Lib_Common.js','../dao/AB_CLS_Error.js'],
    /**
    * @param{log} log
    * @param{DoClass} DoClass //Calling Class that contains functions
    */
    function (log, Common,error) {
        function beforeLoad(context) {
            var title = 'beforeLoad(::)';
            try {
                var rec = context.newRecord;
                var RecId = rec.id;
                var RecType = rec.type;
                Common.addTab(context, RecId, RecType);
            } catch (e) {
                log.debug('Exception ' + title, e.message);
                error.createError(e.name, e.message, title);
            }

        }
        return {
            beforeLoad: beforeLoad
        }
    });
