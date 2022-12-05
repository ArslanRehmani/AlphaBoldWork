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

function getRecordType(strItemType)
{
	var strRecordType = '';

	try
	{

		switch (strItemType)
		{

		case 'Assembly/Bill of Materials':// , '5',
			strRecordType = 'assemblybuild';
			break;
		case 'Description':// , '11',
			strRecordType = 'descriptionitem';
			break;
		case 'Discount':// , '8',
			strRecordType = 'discountitem';
			break;
		case 'Download Item':// , '17',
			strRecordType = 'downloaditem';
			break;
		case 'Gift Certificate':// , '18',
			strRecordType = 'giftcertificate';
			break;
		case 'Inventory Item':// , '1',
			strRecordType = 'inventoryitem';
			break;
		case 'Item Group':// , '7',
			strRecordType = 'itemgroup';
			break;
		case 'Kit/Package':// , '6',
			strRecordType = 'kititem';
			break;
		case 'Markup':// , '9',
			strRecordType = 'markupitem';
			break;
		case 'Non-inventory Item':// , '2',
			strRecordType = 'noninventoryitem';
			break;
		case 'Other Charge':// , '4',
			strRecordType = 'otherchargeitem';
			break;
		case 'Payment':// , '12',
			strRecordType = 'paymentitem';
			break;
		case 'Sales Tax Group':// , '14',
			strRecordType = 'salestaxgroup';
			break;
		case 'Sales Tax Item':// , '13',
			strRecordType = 'salestaxitem';
			break;
		case 'Service':// , '3',
			strRecordType = 'serviceitem';
			break;

		case 'Subtotal':// , '10'
			strRecordType = 'subtotalitem';
			break;

		}

	} catch (ex)
	{
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
		alert('getRecordType Exception error : ' + errorStr + ' - ' + processMessage);
	}
	return strRecordType;
}

/**
 * This function will get the value of the specified field from the specified record via suitlet. This is important because the user running the client script might not have access to the record.
 */
function GetFieldValue(recordType, internalID, strField, strRequestorType)
{
	var processMessage = 'Init';
	var strValue = '';
	var jsonMainURL = '';
	var jsonURL = '';
	var strJSONSLScriptID = '';
	var strJSONSLDeploymentID = '';
	var strParams = '';

	try
	{

		if (strRequestorType != 'cs')
		{
			// get flStatFactor from Suitelet user might not have access to items
		    var recObj = getRecord(recordType, idinternalID);
			strValue = recObj.getValue(strField);
		} else
		{
			jsonMainURL = '';
			jsonURL = '';
			jsonMainURLINternal = '';
			jsonURLInternal = '';
			strThisSLURL = '';

			strJSONSLScriptID = 'customscript_sl_request_utility';
			strJSONSLDeploymentID = 'customdeploy_sl_request_utility';
			strParams = '&custpage_action=getfieldvalue&custpage_type=' + recordType + '&custpage_id=' + internalID + '&custpage_ret_type=value&custpage_field=' + strField

			jsonMainURL = nlapiResolveURL('SUITELET', strJSONSLScriptID, strJSONSLDeploymentID, true);
			jsonURL = jsonMainURL + strParams;

			strValue = nlapiRequestURL(jsonURL).getBody();
		}

	} catch (ex)
	{
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
		alert('GetFieldValue Exception error : ' + errorStr + ' - ' + processMessage);
	}
	return strValue;
}

// *** Utility functions START ***

function isNullOrEmpty(value)
{
    if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { return true; }
    return false;
}


/*
 * This function will return the object if it exists in an associative array specified by the stIndex
 */
function getExistingObject(arCollection, stIndex)
{
	var objObject = null;
	var objExistObject = '';
	var stExistIndex = '';

	try
	{
		if (!isNullOrEmpty(arCollection))
		{
			for ( var t = 0; t < arCollection.length; t++)
			{
				objExistObject = arCollection[t];
				stExistIndex = '';
				stExistIndex = objExistObject.id;
				if (stExistIndex == stIndex)
				{
					objObject = objExistObject.obj;
					break;
				}
			}
		}
	} catch (ex)
	{
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' + ex.getStackTrace().join('\n') : ex.toString();
		nlapiLogExecution('debug', 'getExistingObject e ', errorStr);

	}
	return objObject;
}

/*
 * This function will replace an existing object inside an associative array
 */
function replaceArrayContent(arJournalGroups, index, object)
{
	for ( var i = 0; i < arJournalGroups.length; i++)
	{
		if (arJournalGroups[i].id == index)
			arJournalGroups.splice(i, 1,
			{
				'id' : index,
				'obj' : object
			});

	}
}

function roundDec(value)
{
	return Math.round(value * 100) / 100;
}

function log(title, details)
{
	details = (isNullOrEmpty(details)) ? title : details;
	var context = nlapiGetContext();
	var execContext = context.getExecutionContext();
	
	if (execContext == 'suitelet')
	{
		RESPONSE.write('<br/><font face="arial" size="5" color="blue"><b>' + title + ' :</b></font> <font face="arial" size="5">' + details + "</font>");
	}
	nlapiLogExecution('debug', title, title + ' : ' + details);
}

// *** Utility functions END ***

function sortByItemID(a, b) {
	var x = a.itemid;
	var y = b.itemid;
	return sortalphanum(x, y);//((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function sortalphanum(a, b) {
  
  var aa = chunkify(a);
  var bb = chunkify(b);

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]), d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else return (aa[x] > bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
}

function chunkify(t) {
    var tz = [], x = 0, y = -1, n = 0, i, j;
	t = isNullOrEmpty(t) ? ' ' : t;
    while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      var m = (i == 46 || (i >=48 && i <= 57));
      if (m !== n) {
        tz[++y] = "";
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  }


function validVariableName(value){
    value = isNullOrEmpty(value)? "variable" : value.replace(/[\s\(\)\{\}\+\+\-\|\'\"\;\:\<\>\,\/\\\=\[\]\@\!\%\^\&\*\?\/\.\#]/g,"");
    return value;
}

function jsonToULLI(obj){
    var arrXmlData = [];

    if(typeof obj == "object"){
        arrXmlData.push('<ul>')
        arrXmlData = arrXmlData.concat(getObjectElementULLI(obj));
        arrXmlData.push('</ul>')
    }
    
    return arrXmlData.join("\n");
}

function getObjectElementULLI(obj){
    var arrObjEle = [];
    
    if(typeof obj == "object"){
        for(var ele in obj){
            var objEle = obj[ele];
            if(typeof objEle == "object"){
                
                if(objEle instanceof Array){
                    var stTagName = ele;
                    arrObjEle.push("<li><b>" +stTagName+':(Array)</b>')
                    arrObjEle.push("<ul>");
                    var arrFetchEle = getObjectElementULLI(objEle);
                    arrObjEle =arrObjEle.concat(arrFetchEle);
                    arrObjEle.push("</ul>" );
                    arrObjEle.push("</li>" );
                }else{
                    var arrFetchEle = getObjectElementULLI(objEle);
                    arrObjEle =arrObjEle.concat(arrFetchEle);
                }

            }else{
                arrObjEle.push("<li>" + ele + "</li>"  )
            }
        }
    }

    return arrObjEle;
}
