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
var Library;
if (!Library){ Library = {}; }

Library.Search = function(){

		var arFilters = new Array();
		var arColumns = new Array();
		var strType = '';
		var intSavedSearch = null;

		/*
		 * test
		 */
		this.addFilter = function(name, join, operator, value1, value2, summary) {
			if (summary) {
				arFilters[arFilters.length] = new nlobjSearchFilter(name, join,
						operator, value1, value2).setSummaryType(summary);
			} else {
				arFilters[arFilters.length] = new nlobjSearchFilter(name, join,
						operator, value1, value2);
			}
		}

		/*
		 * 
		 */
		this.addOrFilters = function(orFilter1, orFilter2) {
			arFilters[arFilters.length] = orFilter1;
			arFilters[arFilters.length] = orFilter2;
		}
		
		/*
		 * 
		 */
		this.addColumn = function(name, join, summary, label) {
			if(label != null){
				arColumns[arColumns.length] = new nlobjSearchColumn(name, join,
						summary).setLabel(label);
			}else{
			arColumns[arColumns.length] = new nlobjSearchColumn(name, join,
					summary);
			}
		}
		
		/*
		 * 
		 */
		this.clearParams = function() {
			arFilters = new Array();
			arColumns = new Array();
			strType = '';
			intSaveSearch = null;
		}

		/*
		 * 
		 */
		this.setType = function(typeName) {
			strType = typeName;
		}

		/*
		 * 
		 */
		this.setFilter = function(filter) {
			arFilters = filter;
		}

		/*
		 * 
		 */
		this.setSort = function(columnIndex) {
			arColumns[columnIndex].setSort();
		}

		/*
		 * 
		 */
		this.setSavedSearch = function(savedSearchId) {
			intSavedSearch = savedSearchId;
		}

		/*
		 * 
		 */
		this.setFunction = function(func, columnIndex) {
			arColumns[columnIndex].setFunction(func);
		}
		
		this.setFormula = function(formula, columnIndex) {
			arColumns[columnIndex].setFormula(formula);
		}

		/*
		 * 
		 */
		this.execute = function() {
			if (strType == '') {
				return null;
			}
			var result = nlapiSearchRecord(strType, intSavedSearch, arFilters, arColumns);

			return result ? result : new Array();
		}

		/*
		 * 
		 */
		this.removeLastFilter = function() {
			arFilters.pop();
		}

		/*
		 * 
		 */
		this.setOr = function(filterIndex, setOr) {
			arFilters[filterIndex].setOr(setOr);
		}

		/*
		 * 
		 */
		this.setLeftParens = function(filterIndex, numParens) {
			arFilters[filterIndex].setLeftParens(numParens);
		}

		/*
		 * 
		 */
		this.setRightParens = function(filterIndex, numParens) {
			arFilters[filterIndex].setRightParens(numParens);
		}
};


var NARTA = {};
NARTA.BulkTransaction = function ()
{
    var internalId;
    var tranId;
    var entityId;
    var entityName;
    var amount;
    var paymentDate;
    var date;
    var recordTypeId;
    var recordTypeName;
    var statusId;
    var statusName;
    var creditNo;
    var memo;
    var comment;
    var toEmail;
    
    this.setInternalID = function(value){ this.internalId = value; }
    this.getInternalID = function(){return this.internalId; }
    
    this.setTranID = function(value){ this.tranId = value; }
    this.getTranID = function(){return this.tranId; }

    this.setEntityID = function(value){ this.entityId = value; }
    this.getEntityID = function(){return this.entityId; }
    
    this.setEntityName = function(value){ this.entityName = value; }
    this.getEntityName = function(){return this.entityName; }
    
    this.setAmount = function(value){ this.amount = value; }
    this.getAmount = function(){return this.amount; }
    
    this.setPaymentDate = function(value){ this.paymentDate = value; }
    this.getPaymentDate = function(){return this.paymentDate; }

    this.setDate = function(value){ this.date = value; }
    this.getDate = function(){return this.date; }
    
    this.setRecordTypeID = function(value){ this.recordTypeId = value; }
    this.getRecordTypeID = function(){return this.recordTypeId; }
    
    this.setRecordTypeName = function(value){ this.recordTypeName = value; }
    this.getRecordTypeName = function(){return this.recordTypeName; }
    
    this.setStatusID = function(value){ this.statusId = value; }
    this.getStatusID = function(){return this.statusId; }
    
    this.setStatusName = function(value){ this.statusName = value; }
    this.getStatusName = function(){return this.statusName; }
    
    this.setCreditNumber = function(value){ this.creditNo = value; }
    this.getCreditNumber = function(){return this.creditNo; }
    
    this.setMemo = function(value){ this.memo = value; }
    this.getMemo = function(){return this.memo; }
    
    this.setComment = function(value){ this.comment = value; }
    this.getComment = function(){return this.comment; }
    
    this.setToEmail = function(value){ this.toEmail = value; }
    this.getToEmail = function(){return this.toEmail; }
};