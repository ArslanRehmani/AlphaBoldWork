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
*/

Function.isUndefinedNullOrEmpty = function(obj){
	return (obj == null || !obj || obj == '' || obj == undefined);
}

Function.debug = function(title, msg){
	nlapiLogExecution( 'DEBUG', title, msg );
}

Function.audit = function(title, msg){
    nlapiLogExecution('AUDIT', title, msg );
}
Function.errorLog = function(title, msg){
    nlapiLogExecution('ERROR', title, msg );
    try{
        return nlapiCreateError('9999', title + ": " + msg);
    }catch(e){
    }
    return title + ": " + msg;

}

Function.getTransactionRecodType = function(id){
	var recordType = '';
	switch(id){
		case '1'  : recordType = 'journalentry'; break;
		case '2'  : recordType = 'inventorytransfer'; break;
		case '3'  : recordType = 'check'; break;
		case '5'  : recordType = 'cashsale'; break;
		case '6'  : recordType = 'estimate'; break;
		case '7'  : recordType = 'invoice';	break;
		case '9'  : recordType = 'customerpayment'; break;
		case '10' : recordType = 'creditmemo'; break;
		case '11' : recordType = 'inventoryadjustment'; break;
		case '15' : recordType = 'purchaseorder'; break;
		case '16' : recordType = 'itemreceipt'; break;
		case '17' : recordType = 'vendorbill'; break;
		case '18' : recordType = 'vendorpayment'; break;
		case '20' : recordType = 'vendorcredit'; break;
		case '28' : recordType = 'expensereport'; break;
		case '29' : recordType = 'cashrefund'; break;
		case '30' : recordType = 'customerrefund'; break;
		case '31' : recordType = 'salesorder'; break;
		case '32' : recordType = 'itemfulfillment'; break;
		case '33' : recordType = 'returnauthorization'; break;
		case '34' : recordType = 'assemblybuild'; break;	
		case '37' : recordType = 'opportunity'; break;
		case '40' : recordType = 'customerdeposit'; break;	
		case '42' : recordType = 'binworksheet'; break;	
		case '43' : recordType = 'vendorreturnauthorization'; break;
		case '45' : recordType = 'bintransfer'; break;	
		case '48' : recordType = 'transferorder'; break;
		default:
		    recordType = id;
	}
	return recordType;
}

Function.getTransactionTypeId = function(id){
	var tranID = '';
	try {
        var objRes = nlapiSearchRecord(CUSTOMRECORD_NSTS_PDF_TRANSACTIONS, null, 
                                        [new nlobjSearchFilter(CUSTRECORD_NSTS_PDF_TRANSACTION_TYPE, null, 'is', id), new nlobjSearchFilter('isinactive', null, 'is', 'F')], 
                                        [new nlobjSearchColumn(CUSTRECORD_NSTS_PDF_TRANSACTION_ID)]);
        if(!isEmpty(objRes)) {
            tranID = objRes[0].getValue(CUSTRECORD_NSTS_PDF_TRANSACTION_ID);
        }
    } catch(e) {
        nlapiLogExecution('DEBUG', 'getTransactionTypeId', e.toString());
    }
	/*switch(id){
		case '1'  : tranID = 'Journal'; break;
		case '2'  : tranID = 'InvTrnfr'; break;
		case '3'  : tranID = 'Check'; break;		
		case '5'  : tranID = 'CashSale'; break;
		case '6'  : tranID = 'Estimate'; break;
		case '7'  : tranID = 'CustInvc'; break;
		case '9'  : tranID = 'customerpayment';	break;
		case '10' : tranID = 'CustCred'; break;
		case '11' : tranID = 'InvAdjst'; break;
		case '15' : tranID = 'PurchOrd'; break;
		case '16' : tranID = 'ItemRcpt';	break;
		case '17' : tranID = 'VendBill'; break;
		case '18' : tranID = 'VendPymt'; break;
		case '20' : tranID = 'VendCred'; break;
		case '28' : tranID = 'ExpRept'; break;
		case '29' : tranID = 'CashRfnd';	break;	
		case '30' : tranID = 'CustRfnd'; break;
		case '31' : tranID = 'SalesOrd'; break;
		case '32' : tranID = 'ItemShip';	break;
		case '33' : tranID = 'RtnAuth';	break;		
		case '34' : tranID = 'Build'; break;
		case '37' : tranID = 'Opprtnty'; break;
		case '40' : tranID = 'CustDep';	break;
		case '42' : tranID = 'binworksheet'; break;	
		case '43' : tranID = 'VendAuth'; break;		
		case '45' : tranID = 'BinTrnfr';	break;		
		case '48' : tranID = 'Transfer'; break;
	    default:
	        tranID = id;
	}*/
	return tranID;
}

Function.getTransactionRecordId = function(rectype){
	var idRecType = 0;
	nlapiLogExecution('debug', 'TRACE C', rectype+'-- '+rectype.toLowerCase());
	switch(rectype.toLowerCase()){
		case 'purchaseorder': idRecType = 15; break;
		case 'cashsale'     : idRecType = 5; break;
		case 'invoice'      : idRecType = 7; break;
		case 'creditmemo'   : idRecType = 10; break;
		case 'salesorder'   : idRecType = 31; break;
		case 'estimate'     : idRecType = 6; break;
		case 'opportunity'  : idRecType = 37; break;
		case 'itemfulfillment': idRecType = 32; break;
		case 'itemreceipt'    : idRecType = 16; break;
		case 'vendorbill'     : idRecType = 17; break;
		case 'vendorcredit'   : idRecType = 20; break;
		case 'vendorpayment'  : idRecType = 18; break;
		case 'inventorytransfer': idRecType = 2; break;
		case 'inventoryadjustment': idRecType = 11; break;
		case 'transferorder'      : idRecType = 48; break;
		case 'expensereport'      : idRecType = 28; break;
		case 'journalentry'       : idRecType = 1; break;
		case 'vendorreturnauthorization': idRecType = 43; break;		
		case 'returnauthorization'      : idRecType = 33; break;		
		case 'customerdeposit'          : idRecType = 40; break;
		case 'customerpayment'          : idRecType = 9; break;
		case 'customerrefund'           : idRecType = 30; break;		
		case 'check'                    : idRecType = 3; break;							
		case 'cashrefund'               : idRecType = 29; break;							
		case 'bintransfer'              : idRecType = 45; break;		
		case 'binworksheet'             : idRecType = 42; break;							
		case 'assemblybuild'            : idRecType = 34; break;		
		case 'assemblyunbuild'          : idRecType = 34; break;		
		case 'job'          : idRecType = 6; break;		
		case 'projecttask'          : idRecType = -27; break;		
		case 'customer'          : idRecType = 2; break;	
	      default:
	          idRecType = rectype;
	}
	
	
	return idRecType;
}

Function.getRecordTypeField = function(rectype){
	var strRecordTypeField = '';
	var strTransactionTypeField = CUSTRECORD_NSTS_TEX_RECORD_TYPE;
	var strEntityTypeField = CUSTRECORD_NSTS_TEX_RECORD_TYPE;
	var strCRMTypeField = CUSTRECORD_NSTS_TEX_CRM_TYPE;

	switch(rectype){
		case 'purchaseorder': strRecordTypeField = strTransactionTypeField; break;
		case 'cashsale'     : strRecordTypeField = strTransactionTypeField; break;
		case 'invoice'      : strRecordTypeField = strTransactionTypeField; break;
		case 'creditmemo'   : strRecordTypeField = strTransactionTypeField; break;
		case 'salesorder'   : strRecordTypeField = strTransactionTypeField; break;
		case 'estimate'     : strRecordTypeField = strTransactionTypeField; break;
		case 'opportunity'  : strRecordTypeField = strTransactionTypeField; break;
		case 'itemfulfillment': strRecordTypeField = strTransactionTypeField; break;
		case 'itemreceipt'    : strRecordTypeField = strTransactionTypeField; break;
		case 'vendorbill'     : strRecordTypeField = strTransactionTypeField; break;
		case 'vendorcredit'   : strRecordTypeField = strTransactionTypeField; break;
		case 'vendorpayment'  : strRecordTypeField = strTransactionTypeField; break;
		case 'inventorytransfer': strRecordTypeField = strTransactionTypeField; break;
		case 'inventoryadjustment': strRecordTypeField = strTransactionTypeField; break;
		case 'transferorder'      : strRecordTypeField = strTransactionTypeField; break;
		case 'expensereport'      : strRecordTypeField = strTransactionTypeField; break;
		case 'journalentry'       : strRecordTypeField = strTransactionTypeField; break;
		case 'vendorreturnauthorization': strRecordTypeField = strTransactionTypeField; break;		
		case 'returnauthorization'      : strRecordTypeField = strTransactionTypeField; break;		
		case 'customerdeposit'          : strRecordTypeField = strTransactionTypeField; break;
		case 'customerpayment'          : strRecordTypeField = strTransactionTypeField; break;
		case 'customerrefund'           : strRecordTypeField = strTransactionTypeField; break;		
		case 'check'                    : strRecordTypeField = strTransactionTypeField; break;							
		case 'cashrefund'               : strRecordTypeField = strTransactionTypeField; break;							
		case 'bintransfer'              : strRecordTypeField = strTransactionTypeField; break;		
		case 'binworksheet'             : strRecordTypeField = strTransactionTypeField; break;							
		case 'assemblybuild'            : strRecordTypeField = strTransactionTypeField; break;		
		case 'assemblyunbuild'          : strRecordTypeField = strTransactionTypeField; break;		
		case 'job'          : strRecordTypeField = strEntityTypeField; break;		
		case 'projectTask'          : strRecordTypeField = strCRMTypeField; break;		
		case 'customer'          : strRecordTypeField = strEntityTypeField; break;		
        default:
            strRecordTypeField = strTransactionTypeField;
	}
	
	if (isNullOrEmpty(strRecordTypeField))
	{
		strRecordTypeField = strCRMTypeField;
	}
	
	return strRecordTypeField;
}

Function.getDefaultHTMLTemplate = function(rectype,recTypeID){
	try{
		var search = new Library.Search();
		search.setType(CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE);
		search.addColumn('internalid');
		search.addFilter(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX,null,'is', 'T');
		
		//we need to determine if this is an entity or a transaction
		var strRecordTypeField =Function.getRecordTypeField(rectype);
		
		nlapiLogExecution('debug', 'recTypeID', recTypeID);
		search.addFilter(strRecordTypeField,null,'anyof',(isNullOrEmpty(recTypeID)) ? Function.getTransactionRecordId(rectype) : recTypeID);
		
		var arResults = search.execute();
		
		if (!Function.isUndefinedNullOrEmpty(arResults)) {
			return arResults[0].getValue('internalid');
		}
		return null;
	} catch(ex){
		var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		Function.debug('getDefaultHTMLTemplate', strError);
	}
	
}

Function.addSelectOptions = function(sublist){
	try{
		var search = new Library.Search();
		search.setType(CUSTOMRECORD_NSTS_TEX_HTML_TEMPLATE);
		search.addColumn(CUSTRECORD_NSTS_TEX_RECORD_TYPE);
		search.addFilter(CUSTRECORD_NSTS_TEX_DEFAULT_CHECKBOX,null,'is', 'T');
		search.addFilter(CUSTRECORD_NSTS_TEX_RECORD_TYPE,null,'noneof', '@NONE@');
		search.addFilter('isinactive',null,'is', 'F');
		var arResults = search.execute();
		
		if (!Function.isUndefinedNullOrEmpty(arResults)) {
			sublist.addSelectOption('','');
			for(var i in arResults){
				 var singleSearchResult = arResults[i];
				 var arColumns = singleSearchResult.getAllColumns();
				 var strFieldValue = singleSearchResult.getValue(arColumns[0]);
				 var strFieldText = singleSearchResult.getText(arColumns[0].getName(), arColumns[0].getJoin(), arColumns[0].getSummary());
				 sublist.addSelectOption(strFieldValue,strFieldText);
			}
		}
		return null;
	} catch(ex){
		var strError = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		Function.debug('addSelectOptions', strError);
	}
}
