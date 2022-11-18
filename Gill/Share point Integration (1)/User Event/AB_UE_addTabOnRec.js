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
 
// eslint-disable-next-line no-undef
define(['N/log', '../Common/AB_Lib_Common.js','../dao/AB_CLS_Error.js','../dao/AB_CLS_Sharepoint.js','N/ui/serverWidget','N/config'],
    /**
    * @param{log} log
    * @param{DoClass} DoClass //Calling Class that contains functions
    */
    function (log, Common,AB_CLS_error,AB_CLS_Sharepoint,serverWidget,config) {
        function beforeLoad(context) {
            var title = 'beforeLoad(::)';
            try {
                if(context.type == context.UserEventType.VIEW || context.type == context.UserEventType.EDIT)
                var rec = context.newRecord;
                var recId = rec.id;
                var recType = rec.type;
                var token  = AB_CLS_Sharepoint.getAccessToken();
                if(token){
                   var files =  AB_CLS_Sharepoint.getFolderDetails(recId,recType,token);
                   log.debug(title+'files',files);
                }
                // log.debug(title+'token',token);
                var info = config.load({type:config.Type.COMPANY_INFORMATION});
                var companyID = info.getValue({fieldId:'companyid'});
                Common.addTab(context, recId, recType,files,companyID,token);
            } catch (e) {
                log.error(title+'Exception ', e.message);
                AB_CLS_error.createError(e.name, e.message, title);
            }

        }
        return {
            beforeLoad: beforeLoad
        };
    });
