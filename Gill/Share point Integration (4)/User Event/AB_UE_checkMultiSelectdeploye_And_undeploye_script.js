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
* File:		    UE_check_box_deploye_script.js 
* Date:		    01/09/2022 
* 
***********************************************************************/ 
 

define(['N/log', 'N/record', 'N/search','../dao/AB_CLS_deployConfigurationRecord.js','../dao/AB_CLS_Integration_ConfigrationRecord.js','../dao/AB_CLS_Error.js'],
 /**
* @param{log} log
* @param{record} record
* @param{search} search
*/
 function (log, record, search,CLS_Rec_Config, CLS_IntegrationConfigration,error) {

    function afterSubmit(context) {
        var title = 'afterSubmit(::)';
        try {
            var rec = context.newRecord;
            var multiSelectArray = rec.getValue({
                fieldId: 'custrecord_multiselectrec_field'
            });
            //Deploye Script to Selected record in Multiselect field
            if(multiSelectArray && multiSelectArray.length){
                CLS_Rec_Config.deployeScriptOnRecords(multiSelectArray);
            }
            //get all record internal Id on which script needs to be deployed
            var deployConfigurationArray = CLS_Rec_Config.deployConfigugationRecordsArray();
            //exclude multiselect array from DeployConfigurationArray
            if(multiSelectArray && multiSelectArray.length){
                for( var i = 0; i < deployConfigurationArray.length; i++){ 
                    for(var j = 0; j<multiSelectArray.length; j++){
                        if ( deployConfigurationArray[i] === multiSelectArray[j]) { 
                
                            deployConfigurationArray.splice(i, 1);
                        }
                    }
                }
            }
            //undeploy script for remaining records
            if(deployConfigurationArray && deployConfigurationArray.length){
                CLS_Rec_Config.unDedloyeScriptOnRecord(deployConfigurationArray);
            }
        } catch (e) {
            log.debug('Exception ' + title, e.message);
            error.createError(e.name, e.message, title);
        }
    }
    function beforeSubmit(context) {
        var title = 'beforeSubmit(::)';
        try {
            var rec = context.newRecord;
            if (context.type == context.UserEventType.EDIT) {
                var inactive = rec.getValue({
                    fieldId: 'isinactive'
                });
                if (inactive == false) {
                    rec.setValue({
                        fieldId: 'isinactive',
                        value: false
                    });
                    return true;
                } else {
                    rec.setValue({
                        fieldId: 'isinactive',
                        value: false
                    });
                    //onEdit Inactive previous Records
                    CLS_IntegrationConfigration.inActivePreviousRecords();
                }
            }
            //onCreate Inactive Previous Records
            CLS_IntegrationConfigration.inActivePreviousRecords();
        } catch (e) {
            log.debug('Exception ' + title, e.message);
            error.createError(e.name, e.message, title);
        }
    }
    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
