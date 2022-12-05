/**
* Copyright (c) 1998-2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* use for global function and variable declaration
* 
* Version   Date            Author      Remarks
* 1.00      1 Feb 2016      dgeronimo
*/

// Output Type
var OUTPUT_PDF = '1';
var OUTPUT_CSV = '2';
var OUTPUT_XML = '3';

// Return Type
var RETURN_INLINE = '1';
var RETURN_ATT = '2';
var RETURN_FILE = '3';

var CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE = "customrecord_nsts_tex_html_template";
var CUSTOMRECORD_NSTS_PDF_TRANSACTIONS  = "customrecord_nsts_pdf_transactions";
var CUSTOMRECORD_NSTS_PDF_TRANSACTION_STATUS  = "customrecord_nsts_pdf_transaction_status";

var CUSTRECORD_NSTS_TEX_RECORD_TYPE = "custrecord_nsts_tex_record_type";
var CUSTRECORD_NSTS_TEX_ENTITY_TYPE = "custrecord_nsts_tex_entity_type";
var CUSTRECORD_NSTS_TEX_CRM_TYPE = "custrecord_nsts_tex_crm_type";
var CUSTRECORD_NSTS_TEX_DATA_FEED = "custrecord_nsts_tex_data_feed";
var CUSTRECORD_NSTS_TEX_RETURN_TYPE = "custrecord_nsts_tex_return_type";
var CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT = "custrecord_nsts_tex_email_subject";
var CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE = "custrecord_nsts_tex_email_template";
var CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME = "custrecord_nsts_tex_default_file_name";
var CUSTRECORD_NSTS_TEX_BUTTON_NAME = "custrecord_nsts_tex_button_name";
var CUSTRECORD_NSTS_TEX_ALLOW_EMAILING = "custrecord_nsts_tex_allow_emailing";
var CUSTRECORD_NSTS_TEX_ALLOW_PRINTING = "custrecord_nsts_tex_allow_printing";
var CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX = "custrecord_nsts_tex_default_checkbox";
var CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY = "custrecord_nsts_tex_target_directory";
var CUSTRECORD_NSTS_TEX_TRXN_FORM = "custrecord_nsts_tex_trxn_form";
var CUSTRECORD_NSTS_TEX_SAVE_FILE = "custrecord_nsts_tex_save_file";
var CUSTRECORD_NSTS_TEX_RECORD_FIELD = "custrecord_nsts_tex_record_field";
var CUSTRECORD_NSTS_TEX_FOOTER_ID = "custrecord_nsts_tex_footer_id";
var CUSTRECORD_NSTS_TEX_HEADER_ID = "custrecord_nsts_tex_header_id";
var CUSTRECORD_NSTS_TEX_COPIES = "custrecord_nsts_tex_copies";
var CUSTRECORD_NSTS_TEX_SUBSIDIARY = "custrecord_nsts_tex_subsidiary";
var CUSTRECORD_NSTS_TEX_PAPERSIZE = "custrecord_nsts_tex_papersize";
var CUSTRECORD_NSTS_TEX_ORIENTATION = "custrecord_nsts_tex_orientation";
var CUSTRECORD_NSTS_TEX_HEADER_HEIGHT = "custrecord_nsts_tex_header_height";
var CUSTRECORD_NSTS_TEX_FOOTER_HEIGHT = "custrecord_nsts_tex_footer_height";
var CUSTRECORD_NSTS_TEX_FILTERFIELD = "custrecord_nsts_tex_filterfield";
var CUSTRECORD_NSTS_TEX_BODY = "custrecord_nsts_tex_body";
var CUSTRECORD_NSTS_TEX_HEADER = "custrecord_nsts_tex_header";
var CUSTRECORD_NSTS_TEX_STATIC = "custrecord_nsts_tex_static";
var CUSTRECORD_NSTS_PDF_TRANSACTION_TYPE = "custrecord_nsts_pdf_transaction_type";
var CUSTRECORD_NSTS_PDF_TRANSACTION_ID = "custrecord_nsts_pdf_transaction_id";
var CUSTRECORD_NSTS_PDF_STATUS_NAME = "custrecord_nsts_pdf_status_name";
var CUSTRECORD_NSTS_PDF_STATUS_VALUE = "custrecord_nsts_pdf_status_value";

var CUSTBODY_HT_TO_BE_EMAILED = "custbody_ht_to_be_emailed";
var CUSTBODY_HT_TO_ADDRESS = "custbody_ht_to_address";
var CUSTBODY_HT_CC_ADDRESS = "custbody_ht_cc_address";

var CUSTRECORD_PDF_VARIABLE_DEF_INFO = 'custrecord_pdf_variable_def_info';

//SUITELET

var CUSTPAGE_PS_ACTION = 'custpage_ps_action';
var CUSTPAGE_PS_TRANSACTION_START_DATE = 'custpage_ps_transaction_start_date';
var CUSTPAGE_PS_TRANSACTION_END_DATE = 'custpage_ps_transaction_end_date';
    

var _TEX_CONFIGURATION = null;
var _HTMLTEMPLATEID = null;

var _GET_REC_TYPE = null;
var _GET_REC_ID = 0;
var _GET_OBJ_RECORD = 0;

/**
 * @param htmlTemplateId
 * @returns {_TEX_CONFIGURATION}
 */
function getTexConfig(htmlTemplateId) {
    var arrFld = [
                  CUSTRECORD_NSTS_TEX_RECORD_TYPE,
                  CUSTRECORD_NSTS_TEX_ENTITY_TYPE, CUSTRECORD_NSTS_TEX_CRM_TYPE,
                  CUSTRECORD_NSTS_TEX_DATA_FEED,
                  CUSTRECORD_NSTS_TEX_RETURN_TYPE,
                  CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT,
                  CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE,
                  CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME,
                  CUSTRECORD_NSTS_TEX_BUTTON_NAME,
                  CUSTRECORD_NSTS_TEX_ALLOW_EMAILING,
                  CUSTRECORD_NSTS_TEX_ALLOW_PRINTING,
                  CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX,
                  CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY,
                  CUSTRECORD_NSTS_TEX_TRXN_FORM, CUSTRECORD_NSTS_TEX_SAVE_FILE,
                  CUSTRECORD_NSTS_TEX_RECORD_FIELD,
                  CUSTRECORD_NSTS_TEX_FOOTER_ID, CUSTRECORD_NSTS_TEX_HEADER_ID,
                  CUSTRECORD_NSTS_TEX_COPIES, CUSTRECORD_NSTS_TEX_SUBSIDIARY,
                  CUSTRECORD_NSTS_TEX_PAPERSIZE, CUSTRECORD_NSTS_TEX_ORIENTATION,
                  CUSTRECORD_NSTS_TEX_HEADER_HEIGHT,
                  CUSTRECORD_NSTS_TEX_FOOTER_HEIGHT,
                  CUSTRECORD_NSTS_TEX_FILTERFIELD, CUSTRECORD_NSTS_TEX_BODY,
                  CUSTRECORD_NSTS_TEX_HEADER, CUSTRECORD_NSTS_TEX_STATIC
          ];
    
    if(!isEmpty(htmlTemplateId)){
        if (_HTMLTEMPLATEID != htmlTemplateId) {
            _HTMLTEMPLATEID = htmlTemplateId;

            _TEX_CONFIGURATION = nlapiLookupField(CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE, _HTMLTEMPLATEID, arrFld);
        }
    }else{
        Function.debug('Get Config', '---Start---');
        var arrCol = [];
        var arrFil = [];
        for (var i in arrFld){
            arrCol.push(new nlobjSearchColumn(arrFld[i]));
        }
        
        var arrRec = [nlapiGetRecordType()];
        var objFilTran = new nlobjSearchFilter(CUSTRECORD_NSTS_TEX_RECORD_TYPE, null, "anyof", arrRec);
        var objFilEntity = new nlobjSearchFilter(CUSTRECORD_NSTS_TEX_ENTITY_TYPE, null, "anyof", arrRec);
        var objFilEntity = new nlobjSearchFilter(CUSTRECORD_NSTS_TEX_CRM_TYPE, null, "anyof", arrRec);
        
        objFilTran.setOr(true);
        objFilEntity.setOr(true);
        objFilEntity.setOr(true);
        
        arrFil.push(objFilTran);
        arrFil.push(objFilEntity);
        arrFil.push(objFilEntity);
        
        var resTemplates = nlapiSearchRecord(CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE, null, arrFil, arrCol);
        if(!isEmpty(resTemplates)){
            _TEX_CONFIGURATION = {};
            _TEX_CONFIGURATION['id'] = resTemplates[0].getId();
            for (var i in arrFld){
                var stFldName = arrFld[i];
                _TEX_CONFIGURATION[stFldName] = resTemplates[0].getValue(stFldName);
            }
        }
        
        Function.debug('Get Config', JSON.stringify(_TEX_CONFIGURATION));
    }

    return (_TEX_CONFIGURATION);
}

/**
 * 
 * @param recType
 * @param id
 * @returns {objtexNSRecord}
 */
function getRecord(recType, id) {
    if (_GET_REC_TYPE != recType && _GET_REC_ID != id) {
        _GET_OBJ_RECORD = nlapiLoadRecord(recType, id);
    }
    return new objtexNSRecord(_GET_OBJ_RECORD)
}

function objtexNSRecord(onjrecord) {
    var retVal = null;
    this.record = onjrecord;
    this.getValue = function(fieldName) {
        if (!isEmpty(onjrecord)) {
            retVal = onjrecord.getFieldValue(fieldName);
        }
        return retVal;
    };
    this.getValues = function(fieldName) {
        if (!isEmpty(onjrecord)) {
            retVal = onjrecord.getFieldValues(fieldName);
        }
        return retVal;
    };

    this.getText = function(fieldName) {
        if (!isEmpty(onjrecord)) {
            retVal = onjrecord.getFieldText(fieldName);
        }
        return retVal;
    };

    this.getTexts = function(fieldName) {
        if (!isEmpty(onjrecord)) {
            retVal = onjrecord.getFieldTexts(fieldName);
        }
        return retVal;
    };
}

/**
 * check if the value is empty or not
 * 
 * @param value
 * @returns {Boolean}
 */
function isEmpty(value) {
    if (value == null || value == undefined || value == '' || value.length <= 0) {
        return true;
    }
    return false;
}

/**
 * if the value is empty the replace with the other value
 * 
 * @param value
 * @param replaceWith
 * @returns
 */
function isEmptyReplaceWith(value, replaceWith) {
    if (value == null || value == undefined || value == '' || value.length <= 0) {
        value = replaceWith;
    }
    return value;
}

/**
 * Validated the folder
 * @param folderId
 * @returns {Boolean}
 */
function isFolderExist(folderId){
    
    if(isEmpty(folderId)){
        return false;
    }
    
    var arrFilters=[];
    arrFilters.push(new nlobjSearchFilter("internalid",null,"is",folderId))

    var resultFolders = nlapiSearchRecord("folder",null,arrFilters);
    if(isEmpty(resultFolders)){
        return false;
    }
    
    return true;
}

function isUsageLimitExceeded(){
    if(nlapiGetContext().getEnvironment() != 'scheduled'){
        return;
    }
    
    try{
        intCurrentUsage = parseInt(nlapiGetContext().getRemainingUsage());
        if (intCurrentUsage <= 1000)
        { 
            //return true;
            var state = nlapiYieldScript();
            if( state.status == 'FAILURE'){
                return true;
            }
        }
        return false;
    }catch(error){
        nlapiCreateError("9999", error);
    }
}