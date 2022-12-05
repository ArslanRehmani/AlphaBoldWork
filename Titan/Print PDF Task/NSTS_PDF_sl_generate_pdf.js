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
* use for generating the downloadable pdf file via suitelet
* 
* Version   Date            Author      Remarks
* 1.00                      APAC TEAM   initial Version
* 2.00      1 Feb 2016      dgeronimo
*/

var RESPONSE = '';

/**
 * Template_GeneratePDF(request, response) as entry to the all scripts
 * 
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function Template_GeneratePDF(request, response)
{
	RESPONSE = response;
	var scriptParamTransactionId = request.getParameter('param_transaction_id');
	var paramRecordType = request.getParameter('param_transaction_record_type');
	var paramRecordTypeID = request.getParameter('param_record_type_id');
	var intHTMLTemplateID = request.getParameter('param_template_id');
	var strFileName = request.getParameter('param_filename');
	var intSubsidiaryID = request.getParameter('param_subsidiary');
	var intReturnType = request.getParameter('param_return_type');
	var intTargetDirectory = request.getParameter('param_target_directory');

	var scriptParamHTMLTemplateId = '';
	scriptParamHTMLTemplateId = (!isNullOrEmpty(intHTMLTemplateID)) ? intHTMLTemplateID : Function.getDefaultHTMLTemplate(paramRecordType, paramRecordTypeID);

	Function.debug('Start', scriptParamTransactionId + ':' + scriptParamHTMLTemplateId);
	
	// setFormController(request, response, scriptParamTransactionId, scriptParamHTMLTemplateId, strFileName, intSubsidiaryID);
	setFormController(request, response, scriptParamTransactionId, scriptParamHTMLTemplateId, strFileName, intSubsidiaryID, intReturnType, intTargetDirectory, paramRecordType);
}

/*
 * NOTE: indicate which step needs to be taken next TODO: All actions stored in global variables, so that all name changing can be done in one place
 */
function setAction(psForm, psAction)
{
	psForm.addField('custpage_ps_action', 'text', 'Action Taken').setDisplayType('hidden').setDefaultValue(psAction);
}

function setFormController(request, response, transactionId, htmlTemplateId, strFileName, intSubsidiaryID, intReturnType, intTargetDirectory, paramRecordType)
{
	var actionTaken = request.getParameter('custpage_ps_action');
	switch (actionTaken)
	{
	default:
		createDefaultPageNEW(request, response, transactionId, htmlTemplateId, strFileName, intSubsidiaryID, intReturnType, intTargetDirectory, paramRecordType);
	}
}

/**
 * Default action page,generate PDF(s)
 */
function createDefaultPageNEW(request, response, transactionId, htmlTemplateId, strFileName, intSubsidiaryID, intReturnType, intTargetDirectory, paramRecordType)
{
	var arRequestData = [];
	var attachment = new Library.XMLToPDF();
	var bShowXml = true;
	// we need to know the return type and send it to the generatePDF method because we do not always need the xml headers that are used for pdf
	// we need to get that from the same place we got the htmlTemplateId
	// var objTemplate = attachment.getTemplatingDetails(htmlTemplateId);
	var objTemplate = attachment.getTemplatingDetails(htmlTemplateId, paramRecordType, intSubsidiaryID);

	// try to convert the request to a generic array
	var arRequestParameters = [];
	arRequestParameters = request.getAllParameters();
	var strParamName = '';
	var strParamValue = '';
	var strNewParamName = '';
	var strCustParamPrefix = 'param_cust_';

	// nlapiLogExecution('debug', '*** ARREQUESTPARAMETERS ***', JSON.stringify(arRequestParameters));

	// TODO: Loop through the "custom" parameters
	for ( var param in arRequestParameters)
	{
		strParamName = '';
		strNewParamName = '';

		strParamName = param;
		strParamValue = request.getParameter(strParamName);// arRequestParameters[strParamName];

		arRequestData[strParamName] = strParamValue;
	}

	var strTemplate = attachment.getOutput(objTemplate, transactionId, arRequestData, intSubsidiaryID);
	var objAtt = attachment.getObject(strTemplate, request.getParameter('showXml'), objTemplate.outputtype, intSubsidiaryID);

	try
	{

	    var strDisplayType = null;
        var intOutputType = objTemplate.outputtype;
        var strOutputType = objTemplate.stoutputtype;
        var strDefaultFileName = objTemplate.defaultfilename;
        var strSaveFile = objTemplate.savefile;
        var strTrxnField = objTemplate.trxnfield;
        var recordType = objTemplate.recordtype;
        
        var intFileID = '';

        intReturnType = (isNullOrEmpty(intReturnType)) ? objTemplate.returntype : intReturnType;
        intDefaultDirectory = (isNullOrEmpty(intTargetDirectory)) ? objTemplate.defaultdirectory : intTargetDirectory;
        strDefaultFileName = ((!isNullOrEmpty(strDefaultFileName)) ? strDefaultFileName + '_type_' + recordType  + '_id_' + transactionId : recordType + '_id_' + transactionId);
        strDefaultFileName = strDefaultFileName + ".pdf"
        
        var stContent = '';
        switch (intReturnType)
        {
        case RETURN_INLINE:
            strDisplayType = 'inline';
            stContent = objAtt.getValue();
            response.setContentType('PDF', strDefaultFileName, strDisplayType);
            break;
        case RETURN_ATT:
            strDisplayType = 'attachment';
            stContent = objAtt.getValue();
            response.setContentType('PDF', strDefaultFileName, strDisplayType);
            break;
        case RETURN_FILE:
            if(!isFolderExist(intDefaultDirectory)){
                throw nlapiCreateError('99999', "Target Directory or Folder does not Exist!");
            }
            var recFile = nlapiCreateFile(strDefaultFileName, 'PDF', objAtt.getValue());// .getValue());
            recFile.setFolder(intDefaultDirectory);
            intFileID = nlapiSubmitFile(recFile);
            
            recFile = nlapiLoadFile(intFileID);
            
            stContent = '<b>FILE ID: </b>' + intFileID +'</br>';
            stContent += '<b>FILENAME: </b> <a href="' + recFile.getURL() +'">' + strDefaultFileName + '</a></br>';
            
            Function.debug('strTrxnField', strTrxnField);

            if (!isNullOrEmpty(strTrxnField)) {
                strTrxnField = strTrxnField.toLowerCase();
                try{
                    nlapiSubmitField(recordType, transactionId, strTrxnField, intFileID + "");
                }catch(e){
                    Function.errorLog('CREATEDEFAULTPAGEPDF', 'ERROR: ' + e);
                }
            }
            break;
        default:

            strDisplayType = 'inline';
            response.setContentType('PDF', strDefaultFileName, strDisplayType);
            stContent = objAtt.getValue();
            break;
        }
        response.write(stContent)
        return;
	} catch (ex)
	{
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		Function.errorLog('CREATEDEFAULTPAGEPDF', 'ERROR: ' + errorStr)
        throw ex;
	       
	}
}

/**
 * Default action page,generate PDF(s)
 */
function createDefaultPage(request, response, transactionId, htmlTemplateId)
{
	var attachment = new Library.XMLToPDF();

	// we need to know the return type and send it to the generatePDF method because we do not always need the xml headers that are used for pdf
	// we need to get that from the same place we got the htmlTemplateId

	var objAtt = attachment.generatePDF(htmlTemplateId, transactionId, request.getParameter('showXml'));
	if (Function.isUndefinedNullOrEmpty(htmlTemplateId))
	{
		response.write('Cannot find the default selected transaction type in HTML Templates record');
	} else
	{
		if (request.getParameter('showXml') == 'T')
		{
			response.write(objAtt);
		} 
		else
		{
			response.setContentType('PDF', "rctibill.pdf", 'inline');
			response.write(objAtt.getValue());
		}
	}
}
