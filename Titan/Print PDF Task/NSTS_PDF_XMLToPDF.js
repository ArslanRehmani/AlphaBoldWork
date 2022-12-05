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
* use for generating pdf
* 
* Version   Date            Author      Remarks
* 1.00                      APAC team   initial version
* 2.00      1 Feb 2016      dgeronimo
*/

var stLogTitle = "PDF GENERATOR!"

var OUTPUT_PDF = 1;
var OUTPUT_CSV = 2;
var OUTPUT_XML = 3;

var Library;
if (!Library)
{
    Library = {};
}

Library.XMLToPDF = function()
{
    
    _.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;
    this.OBJTEMPLATERECORD = null;
    
    this.getTemplatingDetails = function(htmlTemplateId, intRecordTypeID, intSubsidiaryID)
    {
        var objTemplate = null;
        stLogTitle = "GETTEMPLATINGDETAILS";
        Function.debug(stLogTitle, 'START');

        if (!isNullOrEmpty(intSubsidiaryID))
        {
            objTemplate = new Object();
            // do a search first
            objTemplate = this.getTemplatingDetailsViaSavedSearch(htmlTemplateId, intRecordTypeID, intSubsidiaryID);
        }

        if (isNullOrEmpty(objTemplate))
        {

            var recTemplate = nlapiLoadRecord(CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE, htmlTemplateId);
            objTemplate = new Object();
            objTemplate.header = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_HEADER);

            objTemplate.datasource = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_DATA_FEED);
            objTemplate.recordtype = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_RECORD_TYPE);
            objTemplate.body = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_BODY);
            objTemplate.outputtype = OUTPUT_PDF; 
            objTemplate.returntype = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_RETURN_TYPE);
            objTemplate.stoutputtype = OUTPUT_PDF; 
            objTemplate.streturntype = recTemplate.getFieldText(CUSTRECORD_NSTS_TEX_RETURN_TYPE);
            objTemplate.defaultfilename = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME);
            objTemplate.defaultdirectory = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY);
            objTemplate.savefile = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_SAVE_FILE);
            objTemplate.trxnfield = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_RECORD_FIELD);
            objTemplate.staticcontent = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_STATIC);
            objTemplate.copies = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_COPIES);
            objTemplate.headerid = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_HEADER_ID);
            objTemplate.footerid = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_FOOTER_ID);
            objTemplate.filterfield = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_FILTERFIELD);
            objTemplate.papersize = recTemplate.getFieldText(CUSTRECORD_NSTS_TEX_PAPERSIZE);
            objTemplate.orientation = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_ORIENTATION);
            objTemplate.headerheight = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_HEADER_HEIGHT);
            objTemplate.footerheight = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_FOOTER_HEIGHT);
            objTemplate.recordtype = intRecordTypeID;
            objTemplate.emailSubject = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_EMAIL_SUBJECT);
            objTemplate.emailTemplate = recTemplate.getFieldValue(CUSTRECORD_NSTS_TEX_EMAIL_TEMPLATE);
        }
        
        return objTemplate;
    };

    this.getTemplatingDetailsViaSavedSearch = function(htmlTemplateId, intRecordTypeID, intSubsidiaryID)
    {
        stLogTitle = "GETTEMPLATINGDETAILSVIASAVEDSEARCH";
        Function.debug(stLogTitle, 'START');
        
        var objTemplate = null;
        
        var processMessage = 'Init';
        var arSavedSearchFilters = [];
        var arSavedSearchColumns = [];
        var arSavedSearchResults = [];
        var objSavedSearchResult = new Object()
        var stFieldName = '';
        var stFieldJoin = '';
        var stFieldSummary = '';
        var stFieldValue = '';
        var stFieldText = '';
        var stLabel = '';
        var bWithResults = true;
        var strProcessMessage = '';
        var strSavedSearchID = null;//
        var strTransactionType = '';

        try
        {
            arSavedSearchFilters.push(new nlobjSearchFilter(CUSTRECORD_NSTS_TEX_RECORD_TYPE, null, 'anyof', intRecordTypeID));
            arSavedSearchFilters.push(new nlobjSearchFilter(CUSTRECORD_NSTS_TEX_SUBSIDIARY, null, 'anyof', intSubsidiaryID));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_HEADER));

            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_DATA_FEED));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_RECORD_TYPE));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_BODY));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_RETURN_TYPE));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_RETURN_TYPE));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_SAVE_FILE));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_RECORD_FIELD));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_STATIC));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_COPIES));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_HEADER_ID));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_FOOTER_ID));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_FILTERFIELD));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_PAPERSIZE));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_ORIENTATION));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_HEADER_HEIGHT));
            arSavedSearchColumns.push(new nlobjSearchColumn(CUSTRECORD_NSTS_TEX_FOOTER_HEIGHT));

            arSavedSearchResults = nlapiSearchRecord(CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE, strSavedSearchID, arSavedSearchFilters, arSavedSearchColumns);

            if (isNullOrEmpty(arSavedSearchResults))
            {
                nlapiLogExecution('debug', 'Warning:  Problem getting HTML Template Record', 'HTML Template Record for Record Type (' + intRecordTypeID + ') and Subsidiary (' + intSubsidiaryID + ')');
            } else
            {
                bWithResults = (!isNullOrEmpty(arSavedSearchResults) && arSavedSearchResults.length > 0) ? true : false;
                if (bWithResults)
                {
                    objTemplate = new Object();
                    objSavedSearchResult = arSavedSearchResults[0];

                    objTemplate.header = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_HEADER);

                    objTemplate.datasource = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_DATA_FEED);
                    objTemplate.recordtype = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_RECORD_TYPE);
                    objTemplate.body = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_BODY);
                    objTemplate.outputtype = OUTPUT_PDF;
                    objTemplate.returntype = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_RETURN_TYPE);
                    objTemplate.stoutputtype = OUTPUT_PDF;
                    objTemplate.streturntype = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_RETURN_TYPE);
                    objTemplate.defaultfilename = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_DEFAULT_FILE_NAME);
                    objTemplate.defaultdirectory = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_TARGET_DIRECTORY);
                    objTemplate.savefile = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_SAVE_FILE);
                    objTemplate.trxnfield = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_RECORD_FIELD);
                    objTemplate.staticcontent = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_STATIC);
                    objTemplate.copies = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_COPIES);
                    objTemplate.filterfield = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_FILTERFIELD);
                    objTemplate.papersize = objSavedSearchResult.getText(CUSTRECORD_NSTS_TEX_PAPERSIZE);
                    objTemplate.orientation = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_ORIENTATION);
                    objTemplate.headerheight = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_HEADER_HEIGHT);
                    objTemplate.footerheight = objSavedSearchResult.getValue(CUSTRECORD_NSTS_TEX_FOOTER_HEIGHT);
                }
            }
        } catch (ex)
        {
            var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            strProcessMessage = 'An error has occurred getTemplatingDetailsViaSavedSearch()';
            nlapiLogExecution('debug', 'ERROR: getTemplatingDetailsViaSavedSearch() ', errorStr);
            bSuccess = false;
        }

        return objTemplate;
    };

    this.getOutput = function(objTemplate, transactionId, request, intSubsidiaryID, staticContent, intNoCopies)
    {
        stLogTitle = "GETTEMPLATINGDETAILS";
        Function.debug(stLogTitle, 'START');
        
        var templateHeader = objTemplate.header;
        var intOutputTypeID = objTemplate.outputtype;
        var dataFeed = objTemplate.datasource;
        var recordType = objTemplate.recordtype;
        var templateBody = objTemplate.body;
        var staticContent = objTemplate.staticcontent;
        var intNoCopies = objTemplate.copies;
        var strFilterField = objTemplate.filterfield;

        var template = '';
        template = this.generateOutput(transactionId, intOutputTypeID, templateHeader, transactionId, dataFeed, recordType, templateBody, request, intSubsidiaryID, objTemplate, staticContent, intNoCopies, strFilterField);

        return template;
    };

    this.getOutputForAttachment = function(objTemplate, transactionId, arParams, intSubsidiaryID)
    {
        var templateHeader = objTemplate.header;
        var intOutputTypeID = objTemplate.outputtype;
        var dataFeed = objTemplate.datasource;
        var recordType = objTemplate.recordtype;
        var templateBody = objTemplate.body;
        var strFilterField = objTemplate.filterfield;

        var template = '';

        template = this.generateOutput(transactionId, intOutputTypeID, templateHeader, transactionId, dataFeed, recordType, templateBody, request, intSubsidiaryID, objTemplate, strFilterField);

        return template;
    };

    this.preserveFreeMarkerVariable = function(templateBody,arrData)
    {
        var arrReplaceVarKeys = [];
        var excludeVarName = ["line"]

        var arrMatchVar = templateBody.match(/\$\{(.*?)\}/g);
        if(!isEmpty(arrMatchVar)){
            arrMatchVar.map(function(varKey) {
                var _varKey = varKey.replace(/\$\{|\}/g, '');
                var _arrBarKey = isEmptyReplaceWith(_varKey, '').split("|")[0].split('.');
                var _varName = _arrBarKey[0];
                if (excludeVarName.indexOf(_varName)< 0){
                    Function.debug("processTemplateString:Process FreeMarker Var", "varKey:" + varKey + " _varName:" + _varName + " _varKey:" + _varKey);
                    if (arrReplaceVarKeys.indexOf(varKey) < 0) {
                        Function.debug("processTemplateString:Process FreeMarker Var name","varKey:" + varKey + " _varName:"+ _varName +  " _varKey:" + _varKey);
                        if(!isEmpty(arrData)){
                            if (isEmpty(arrData[_arrBarKey])) {
                                var regexVarKey = varKey.replace(/([.*+?^=!:${}()|\[\]\/\\])/g,  "\\$1");
                                templateBody = templateBody.replace( new RegExp(regexVarKey,"g"), "@(" + _varKey + ")");
                                Function.debug("processTemplateString:templateBody",regexVarKey);
                            }
                        }
                    }
                }
                arrReplaceVarKeys.push(varKey);
            });
        }
        return templateBody;
    }
    
    this.restoreFreeMarkerVariable = function(templateBody){
        var arrReplaceVarKeys = [];
        var arrMatchVar = templateBody.match(/\@\((.*?)\)/g);
        if(!isEmpty(arrMatchVar)){
            arrMatchVar.map(function(varKey) {
                var _varKey = varKey.replace(/@\(|\)/g, '');
                
                if (arrReplaceVarKeys.indexOf(varKey) < 0) {
                    var regexVarKey = varKey.replace(/([.*+?^=!:${}()|\[\]\/\\])/g,  "\\$1");
                    templateBody = templateBody.replace( new RegExp(regexVarKey,"g"), "${" + _varKey + "}");
                }
                arrReplaceVarKeys.push(varKey);
            });
        }
        return templateBody;
    }
    
    this.fixUrlString = function(templateBody){        
        var urlArr = templateBody.match(/src(\s*)?=(\s*)?".*?"/gi);

        if (!isEmpty(urlArr)) {
            urlArr.map(function(url) {
                var _url = url.replace(/src\s*=\s*"(.*?)"/gi,"$1");
                var rgx_ld = /\.*?<\%(.*?)\%\>.*?/gi;
                var arrurlVar = _url.match(rgx_ld);
                if(!isEmpty(arrurlVar)){
                    
                    //preserve the define variable <% variablename %> by replacing it by preserve<n>preserve
                    for (var url_i in arrurlVar){
                        var url_i_tmp = arrurlVar[url_i];
                        _url = _url.replace(new RegExp(url_i_tmp,'g'), 'preserve' + url_i + 'preserve');
                    }
                    
                    //escape the url string 
                    _url = nlapiEscapeXML(_url);
                    
                  //restore the preserve<n>preserve to the original variable definition <% variablename %>
                    for (var url_i in arrurlVar){
                        var url_i_tmp = arrurlVar[url_i];
                        _url = _url.replace(new RegExp('preserve' + url_i + 'preserve','g'),url_i_tmp);                      
                    }
                    
                    //finalize the templateBody
                    templateBody = templateBody.replace(url, 'src="' + _url +'"');
                }else{
                    templateBody = templateBody.replace(url, 'src="' + nlapiEscapeXML(_url) +'"');
                }
            });
            
            templateBody = templateBody.replace(/\&amp\;amp\;/g,"&amp;");
        }
        return templateBody;
    };
    
    this.fixHtmlComment = function (templateBody){
        if (!isEmpty(templateBody)) {
            templateBody = templateBody.replace(/(?=<!--)([\s\S]*?)-->/g, '');
            return templateBody
        }
        return templateBody
    }
    
    this.generateOutput = function(transactionId, intOutputTypeID, templateHeader, transactionId, dataFeed, recordType, templateBody, request, intSubsidiaryID, objTemplate, staticContent, intNoCopies, strFilterField)
    {
        stLogTitle = 'GENERATEOUTPUT';
        Function.debug(stLogTitle, "START : generateOutput" );
        
        
        var template = '';
        var strOutput = '';
        var strHeaderID = '';
        var strFooterID = '';
        var strHeaderString = '';
        var strFooterString = '';
        var strPaperSize = '';
        var strOrientation = '';
        var strPaperSizeString = '';
        var strHeaderHeight = '';
        var strFooterHeight = '';
        var strPbr = '';

        strHeaderID = objTemplate.headerid;
        strFooterID = objTemplate.footerid;
        strPaperSize = objTemplate.papersize;
        strOrientation = objTemplate.orientation;
        strHeaderHeight = objTemplate.headerheight;
        strFooterHeight = objTemplate.footerheight;

        strHeaderString = (!isNullOrEmpty(strHeaderID)) ? "header='" + strHeaderID + "'" : '';
        strFooterString = (!isNullOrEmpty(strFooterID)) ? "Footer='"  + strFooterID + "'"  : '';

        strPaperSize = objTemplate.papersize;
        strPaperSize = (isNullOrEmpty(strPaperSize)) ? 'A4' : strPaperSize;
        
        strOrientation = objTemplate.orientation;
        strOrientation = (strOrientation == 2) ? '-landscape' : '';

        strPaperSizeString = "size='" + strPaperSize + strOrientation + "'";
        strPaperSize = (isNullOrEmpty(strPaperSize)) ? 'A4' : strPaperSize;

        strHeaderHeight = objTemplate.headerheight;
        strHeaderHeightString = (isNullOrEmpty(strHeaderHeight)) ? "header-height='60mm'" : "header-height='" + strHeaderHeight + "mm'";

        strFooterHeight = objTemplate.footerheight;
        strFooterHeightString = (isNullOrEmpty(strFooterHeight)) ? "footer-height='10mm'" : "footer-height='" + strFooterHeight + "mm'";
        templateHeader = !isNullOrEmpty(templateHeader) ? templateHeader : '';

        strPbr = strPaperSizeString + " " + strFooterString + " " + strFooterHeightString + " " + strHeaderString + " " + strHeaderHeightString;

        var stProcessedXML = '';
        template = "";
        
        var stODataSrource = {};
        var tranIds = transactionId.split(',');
        var totalTrans = tranIds.length;
        var arrxmlText = [];
        arrxmlText.push('<?xml version=\"1.0\"?>');
        arrxmlText.push('<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">');
        
        arrxmlText.push('<pdfset>');
        for ( var i = 0; i < totalTrans; i++)
        {
            
            if (!Function.isUndefinedNullOrEmpty(tranIds[i]))
            {
                var arrxmlTextBuff = []
                
                Function.debug(stLogTitle, 'intSubsidiaryID: ' + intSubsidiaryID);


                arrxmlTextBuff.push('<pdf>');
                arrxmlTextBuff.push('<head>');
                arrxmlTextBuff.push(templateHeader);
                arrxmlTextBuff.push('</head>');
                arrxmlTextBuff.push("<body " + strPaperSizeString + " " + strFooterString  + " " + strFooterHeightString + " "  + strHeaderString + " " + strHeaderHeightString + ">");

                //arrxmlText.push(stProcessedXML);
                arrxmlTextBuff.push(templateBody);
                
                arrxmlTextBuff.push('</body>');
                arrxmlTextBuff.push('</pdf>');
                
                
   
                stProcessedXML = arrxmlTextBuff.join('\n');
                stProcessedXML = this.processTemplateString(tranIds[i], dataFeed, recordType, stProcessedXML, request, intSubsidiaryID, strFilterField);// + '<pbr size="A4" margin="0"/>';
                arrxmlText.push(stProcessedXML);
            }
        }
        arrxmlText.push('</pdfset>');

        template = isNullOrEmpty(arrxmlText)? "" : arrxmlText.join("\n");
        strOutput = template;
        Function.debug(stLogTitle, 'strOutput: generated : JSON:' + JSON.stringify(this.OBJTEMPLATERECORD));
        strOutput = this.fixUrlString(strOutput);
        
        return strOutput;
    };

    this.processTemplateString = function(transactionId, dataFeed, recordType, templateBody, request, intSubsidiaryID, strFilterField)
    {
        stLogTitle = 'PROCESSTEMPLATESTRING';
        Function.debug(stLogTitle, "START : PROCESSTEMPLATESTRING" );
        
        if (isNullOrEmpty(templateBody)){
            return '<pdf><body><p color="red">Empty [HTML TEMPLATE BODY] in your PDF Template Record!</p></body></pdf>';
        }
        
        var psObjectArray = {};

        this.PS_ObjectArray = psObjectArray;

        var lineArr = [];
        var bLinesSet = false;
        var strProcessMessage = 'Init processTemplateString';

        var recObj = {};
        var arLineGroups = {};
        var arGroup = [];

        var objLine2 = {};
        var objLine = {};
        var arLines = [];
        var arLines2 = [];
        var bIsMultiLine = false;

        var objDataFeedSearchResultSet = '';// this.getSaveSearchResult(dataFeed, transactionId, Function.getTransactionTypeId(recordType));

        nlapiLogExecution('debug', 'transactionId', transactionId);

        if (!isNullOrEmpty(strFilterField))
        {
            objDataFeedSearchResultSet = this.getSaveSearchResultJOINED(dataFeed, transactionId, Function.getTransactionTypeId(recordType), strFilterField);
        } else
        {
            objDataFeedSearchResultSet = this.getSaveSearchResult(dataFeed, transactionId, Function.getTransactionTypeId(recordType));
        }

        this.generateSaveSearchObject(objDataFeedSearchResultSet, recObj);
        var intRecInternalID = '';
        var lineType = '';

        try
        {

            var strParamName = '';
            var strParamValue = '';
            var strNewParamName = '';
            var strCustParamPrefix = 'param_cust_';

            // TODO: Loop through the "custom" parameters
            for ( var param in request)
            {
                strParamName = '';
                strNewParamName = '';

                strParamName = param;
                strParamValue = request[strParamName];

                if (strParamName.indexOf(strCustParamPrefix) >= 0)
                {
                    strNewParamName = strParamName.substring(strCustParamPrefix.length, strParamName.length);
                    nlapiLogExecution('debug', '*** PARAMS ***', strParamName + ' ---' + strNewParamName + ' --- ' + strParamValue);
                    recObj[strNewParamName] = strParamValue;
                }

            }

            if (!isNullOrEmpty(intSubsidiaryID))
            {
                var objSubsidiaryDetails = this.getSubsidiaryDetails(intSubsidiaryID);
                recObj['subsidiaryRecord'] = objSubsidiaryDetails;
            }

            var objCompanyDetails = this.getCompanyDetails();
            recObj['companyRecord'] = objCompanyDetails;
            
            this.OBJTEMPLATERECORD = recObj;
            
            templateBody = this.fixHtmlComment(templateBody);
            var objTemplate = _.template(templateBody);
            templateBody = objTemplate(recObj);
            //templateBody = this.fixUrlString(templateBody);
            
            nlapiLogExecution("debug", "JSON OBJ", JSON.stringify(recObj));
            
            var objnlRecord = getRecord(recordType, transactionId);
            if (!isEmpty(templateBody)) 
            {
                var renderer = nlapiCreateTemplateRenderer();
                renderer.setTemplate(templateBody);
                
                renderer.addRecord("record", objnlRecord.record);
                templateBody = renderer.renderToString();
            }

            USAGE_LIMIT = 200;
            var intCurrentUsage = nlapiGetContext().getRemainingUsage();
            if (intCurrentUsage <= USAGE_LIMIT) {
                nlapiYieldScript();
            }
 
            return templateBody;
        } 
        catch (ex)
        {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            Function.debug('processTemplateString', 'processTemplateString : ' + strError + ' : ' + strProcessMessage);
            templateBody = '<pdf><body><p color="Red">Error in Template Syntax</p><hr/>';
            templateBody += ex + '</body></pdf>';
            return templateBody;
        } 

    };

    this.getCompanyDetails = function()
    {
        stLogTitle = 'GETCOMPANYDETAILS';
        Function.debug(stLogTitle,'START GETCOMPANYDETAILS');
        var objCompanyDetails = new Object();

        try
        {
            var recCompanyPref = nlapiLoadConfiguration('companyinformation');

            var arCompanyFields = [];
            arCompanyFields = recCompanyPref.getAllFields();

            for ( var w = 0; w < arCompanyFields.length; w++)
            {
                stFieldName = '';
                stFieldValue = '';
                stFieldText = '';
                stFieldName = arCompanyFields[w];
                stFieldValue = recCompanyPref.getFieldValue(stFieldName);
                stFieldText = recCompanyPref.getFieldText(stFieldName);

                 if (stFieldName == 'pagelogo')
                 {
                 var objLogo = nlapiLoadFile(stFieldValue);
                 stFieldText = objLogo.getURL();
                 }

                if (!isNullOrEmpty(stFieldValue))
                {
                    objCompanyDetails[stFieldName] = stFieldValue;
                }
                if (!isNullOrEmpty(stFieldText))
                {
                    objCompanyDetails['text_' + stFieldName] = stFieldText;
                }
            }
            
            Function.debug(stLogTitle,'objCompanyDetails: ' + JSON.stringify(objCompanyDetails));

        } catch (ex)
        {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            Function.debug(stLogTitle, strError);
        }

        return objCompanyDetails;

    };

    this.getSubsidiaryDetails = function(intSubsidiaryID)
    {
        stLogTitle = 'GETSUBSIDIARYDETAILS';
        Function.debug(stLogTitle,'START GETSUBSIDIARYDETAILS intSubsidiaryID:' + intSubsidiaryID);
        
        var objSubsidiaryDetails = new Object();
        var recSubsidiary = '';// nlapiLoadRecord('subsidiary',intSubsidiaryID);

        try
        {
            recSubsidiary = nlapiLoadRecord('subsidiary', intSubsidiaryID);

            var arSubsidiaryFields = [];
            arSubsidiaryFields = recSubsidiary.getAllFields();

            for ( var w = 0; w < arSubsidiaryFields.length; w++)
            {
                stFieldName = '';
                stFieldValue = '';
                stFieldText = '';
                stFieldName = arSubsidiaryFields[w];
                stFieldValue = recSubsidiary.getFieldValue(stFieldName);
                stFieldText = recSubsidiary.getFieldText(stFieldName);

                if (!isNullOrEmpty(stFieldValue))
                {
                    objSubsidiaryDetails[stFieldName] = stFieldValue;
                }
                if (!isNullOrEmpty(stFieldText))
                {
                    objSubsidiaryDetails['text_' + stFieldName] = stFieldText;
                }
            }
            
            Function.debug(stLogTitle,'objSubsidiaryDetails: ' + JSON.stringify(objSubsidiaryDetails));

        } catch (ex)
        {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            Function.debug('getSubsidiaryDetails', strError);
            
            Function.debug(stLogTitle,strError);
        }

        return objSubsidiaryDetails;

    };

    this.createEmptySaveSearchObject = function(saveSearch,psObjectArray) {

        //var psObjectArray = {};
        var IntArrIndex = 0;
        var OBJSEARCHDATAFEED = {};
        
        
        try{
            if(!isEmpty(saveSearch)){
                var rsDataFeed = saveSearch
                
                var arColumns = rsDataFeed.getColumns();
                for (var col = 0; col < arColumns.length; col++) {
                    var objCol = arColumns[col];
                    
                    var stColName = objCol.getName();
                    var stColJoin = objCol.getJoin();
                    var stColSum = objCol.getSummary()
                    
                    var stDefaultFieldLabel = objCol.getLabel();
                    stDefaultFieldLabel = stDefaultFieldLabel;
                    var strFieldLabel = stDefaultFieldLabel;
                    strFieldLabel = strFieldLabel.replace(/\s/g,'');
                    strFieldLabel = (!isEmpty(strFieldLabel)) ? strFieldLabel : stColName;
                    
                    var stFldValue = '';
                    if(strFieldLabel.indexOf('text_') == 0){                    
                        strFieldLabel = strFieldLabel.replace(/^text_/g,'');
                    }
                    
                    if(strFieldLabel.indexOf('line.') == 0){
                        if(isEmpty(psObjectArray['line'])){
                            psObjectArray['line'] = [];
                           
                        }

                        
                    }else if(strFieldLabel.indexOf('line|') == 0){
                        strFieldLabel = strFieldLabel.replace(/^line\|/g,'');
                        var arLineFld = strFieldLabel.split('.');
                        
                        if(isEmpty(psObjectArray[arLineFld[0]])){
                            psObjectArray[arLineFld[0]] = [];
                        }
                                                
                    }else{
                        
                        strFieldLabel = isEmpty(strFieldLabel) ? stColName : strFieldLabel;
                        strFieldLabel = validVariableName(strFieldLabel)
                        
                        psObjectArray[strFieldLabel] = stFldValue
                    }
                    
                }
                
                OBJSEARCHDATAFEED = psObjectArray;
            }
        }catch(e){
            OBJSEARCHDATAFEED = {};
            Function.debug("Error createEmptySaveSearchObject", e);
        }//try
        
        Function.debug("1 createEmptySaveSearchObject", JSON.stringify(OBJSEARCHDATAFEED));
        return OBJSEARCHDATAFEED;
    }

    this.generateSaveSearchObject = function(saveSearch, psObjectArray) {
        
        stLogTitle = 'GENERATESAVESEARCHOBJECT';
        Function.debug(stLogTitle,'START GENERATESAVESEARCHOBJECT');
        
        var strProcessMessage = 'init generateSaveSearchObject';
        
        if(isNullOrEmpty(psObjectArray)){
            psObjectArray = {};
        }
        
        if(isNullOrEmpty(saveSearch)){
            return;
        }

        Function.debug('generateSaveSearchObject A', objSearchResultSet);
        try {
            var IntArrIndex = 0;
            
            var objSearchResultSet = saveSearch.runSearch();
            var arColumns = saveSearch.getColumns();
            if(!isEmpty(objSearchResultSet)){
                Function.debug("generateSaveSearchObject", "generateSaveSearchObject has Data...");
                
                var bIsSaveSearchHasResult = false;
                objSearchResultSet.forEachResult(function(searchResult) {
                    try {
                        for (var col = 0; col < arColumns.length; col++) {
                            var objCol = arColumns[col];
                            
                            var stColName = objCol.getName();
                            var stColJoin = objCol.getJoin();
                            var stColSum = objCol.getSummary()
                            
                            var stDefaultFieldLabel = objCol.getLabel();
                            var strFieldLabel = stDefaultFieldLabel;
                            strFieldLabel = strFieldLabel.replace(/\s/g,'');
                            strFieldLabel = (!isNullOrEmpty(strFieldLabel)) ? strFieldLabel : stColName;
       
                            var strFieldValue = searchResult.getValue(objCol);        
                            var strFieldText = searchResult.getText(stColName ,stColJoin ,stColSum);
                            
                            var stFldValue = strFieldValue;
                        
                            if(strFieldLabel.indexOf('text_') == 0){
                                stFldValue = isNullOrEmpty(strFieldText)? strFieldValue : strFieldText;
                                
                                strFieldLabel = strFieldLabel.replace(/^text_/g,'');
                            }else{
                                stFldValue = isNullOrEmpty(strFieldValue)? strFieldText : strFieldValue;
                            }
                            
                            if(strFieldLabel.indexOf('line.') == 0){
                                if(isNullOrEmpty(psObjectArray['line'])){
                                    psObjectArray['line'] = [{}];
                                   
                                }
                                if(isNullOrEmpty( psObjectArray['line'][IntArrIndex])){
                                    psObjectArray['line'][IntArrIndex] = {};
                                }
                                
                                strFieldLabel = strFieldLabel.replace(/^line./g,'');
                                strFieldLabel = isNullOrEmpty(strFieldLabel)?stColName : strFieldLabel;
                                strFieldLabel = validVariableName(strFieldLabel);
                                
                                psObjectArray['line'][IntArrIndex][strFieldLabel] = stFldValue;
                            }else if(strFieldLabel.indexOf('line|') == 0){
                                strFieldLabel = strFieldLabel.replace(/^line\|/g,'');
                                var arLineFld = strFieldLabel.split('.');
                                
                                if(isNullOrEmpty(psObjectArray[arLineFld[0]])){
                                    psObjectArray[arLineFld[0]] = [{}];
                                }
                                
                                if(isNullOrEmpty( psObjectArray[arLineFld[0]][IntArrIndex] )){
                                    psObjectArray[arLineFld[0]][IntArrIndex] = {};
                                }
                                strFieldLabel = arLineFld[1];
                                strFieldLabel = isNullOrEmpty(strFieldLabel)?stColName : strFieldLabel;
                                strFieldLabel = validVariableName(strFieldLabel);
                                psObjectArray[arLineFld[0]][IntArrIndex][strFieldLabel] = stFldValue;
                                
                            }else{
                                strFieldLabel = isNullOrEmpty(strFieldLabel) ? stColName : strFieldLabel;
                                strFieldLabel = validVariableName(strFieldLabel);
                                psObjectArray[strFieldLabel] = stFldValue
                            }
                        }
                        IntArrIndex++;
                        
                        
                    } catch (ex) {
                        var strError = (ex.getCode != null) ? ex.getCode()  + '\n'  + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
                        Function.debug( stLogTitle + " #1",'ERROR: GENERATESAVESEARCHOBJECT : ' + strError );
                    }

                    
                    bIsSaveSearchHasResult = true;
                    return true;
                });
                
                if(!bIsSaveSearchHasResult){
                    Function.debug("generateSaveSearchObject", "Has no Data...");
                    this.createEmptySaveSearchObject(saveSearch,psObjectArray);
                    Function.debug("#2 createEmptySaveSearchObject", JSON.stringify(psObjectArray));
                    
                }
            }else{
                psObjectArray = {};
            }

            
        } catch (ex) {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n'  + ex.getDetails() + '\n' + ex.getStackTrace().join( '\n') : ex.toString();
            Function.debug( stLogTitle + " #2",'ERROR: GENERATESAVESEARCHOBJECT : ' + strError );
        }
        
        Function.debug(stLogTitle + ":RESULT",  JSON.stringify(psObjectArray));
    };

    this.getObject = function(template, isShowXML, intOutputTypeID, intSubsidiaryID)
    {
        var objPdf = null;

        if (isShowXML == 'T')
        {
            objPdf = template;
        } else
        {
            if (intOutputTypeID == OUTPUT_PDF)
            {
                objPdf = nlapiXMLToPDF(template);
            } else
            {
                objPdf = template;
            }
        }
        return objPdf;
    };


    this.PS_ObjectArray = null;

    // *** new not deployed ***
    this.updateRecords = function()
    {
        try
        {

            nlapiLogExecution('debug', 'TRACE Update records', JSON.stringify(this.PS_ObjectArray));

            for ( var i in this.PS_ObjectArray)
            {
                var singleObject = this.PS_ObjectArray[i];

                var intLeadInternalID = '';
                intLeadInternalID = singleObject['internalid'];
                nlapiLogExecution('debug', 'TRACE Int Lead INternal ID', intLeadInternalID);

                nlapiSubmitField('lead', intLeadInternalID, 'custentity_last_print_date', nlapiDateToString(new Date()));

            }
            isSuccess = true;
        } catch (ex)
        {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            Function.debug('updateRecords', strError);
        }

    };


    this.getSaveSearchResultJOINED = function(saveSearchId, transactionIds, recordtype, strFilterField)
    {
        Function.debug('getSaveSearchResultJOINED', saveSearchId + ':' + transactionIds + ':' + recordtype);

        try
        {
            var saveSearch = nlapiLoadSearch('', saveSearchId);
            var filters = new Array();
            // filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', transactionIds);
            filters[0] = new nlobjSearchFilter(strFilterField, null, 'anyof', transactionIds); // always is?

            saveSearch.addFilters(filters);
            //var arResults = saveSearch.runSearch();
            if (!Function.isUndefinedNullOrEmpty(saveSearch))
            {
                return saveSearch;
            }
            return null;
        } catch (ex)
        {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            Function.debug('getSaveSearchResultJOINED', strError);
        }
    };

    this.getSaveSearchResult = function(saveSearchId, transactionIds, recordtype)
    {
        Function.debug('getSaveSearchResult', saveSearchId + ':' + transactionIds + ':' + recordtype);

        try
        {
            var saveSearch = nlapiLoadSearch(null, saveSearchId);
            transactionIds = transactionIds.split(',');
            var filters = new Array();
            filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', transactionIds);

            saveSearch.addFilters(filters);
            //var arResults = saveSearch.runSearch();
            if (!Function.isUndefinedNullOrEmpty(saveSearch))
            {
                return saveSearch;
            }
            return null;
        } catch (ex)
        {
            var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
            Function.debug('getSaveSearchResult', strError);
        }
    };

};
    