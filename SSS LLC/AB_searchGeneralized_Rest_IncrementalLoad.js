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
* Author:      ilija@alphabold.com
* File:        AB_WorkbookGeneralized_Rest.js
* Date:        02/15/2021
*
*
***********************************************************************/
/**
 * @NApiVersion 2.0
 * @NScriptType Restlet
 */
// eslint-disable-next-line no-undef
define(['N/record', 'N/search', 'N/runtime', 'N/query', 'N/error', 'N/dataset', 'N/log'],
        /**
         * @param{record} record
         * @param{search} search
         * @param{runtime} runtime,
         * @param{query} query,
         * @param{error} error,
         * @param{dataset} dataset
         */
        function (record, search, runtime, query, error, dataset, log) {
                function searchAll(resultset, cols, offset) {

                        var PageNo = !!offset ? (offset / 1000) : 0;
                        var allResults = [];
                        var startIndex = 0;
                        var RANGECOUNT = 1000;
                        var grandtotal = 0;
                        var returnObj = {};
                        var pages = [];
                        var PAGE_SIZE = 1000;
                        var page = 0;
                        var resultLine, lineResult, resultLines = [];
                        var columns = cols;
                        var resultStartIndex = PageNo * RANGECOUNT;
                        try {
                                //         if(searchId == '1660'){
                                //       resultset = nsQuery.run();
                                //         }else{
                                //        resultset = nsQuery. nsQuery.runPaged({
                                //         pageSize: PAGE_SIZE
                                //         });
                                //         }
                                // columns = nsQuery.columns;

                                log.debug({
                                        title: 'columns',
                                        details: columns
                                });
                                log.debug({
                                        title: 'columns.length',
                                        details: columns.length
                                });
                                do {
                                        var pagedResults = resultset.getRange({
                                                start: parseInt(startIndex),
                                                end: parseInt(startIndex + RANGECOUNT)
                                        });
                                        pages.push(pagedResults);
                                        grandtotal += pagedResults.length;
                                        var pagedResultsCount = pagedResults != null ? pagedResults.length : 0;
                                        startIndex += pagedResultsCount;
                                        page++;
                                        log.debug({
                                                title: 'loop',
                                                details: pagedResultsCount + ' = ' + RANGECOUNT
                                        });

                                } while (pagedResultsCount == RANGECOUNT);
                                // do {

                                pagedResults = resultset.getRange({
                                        start: parseInt(resultStartIndex),
                                        end: parseInt(resultStartIndex + RANGECOUNT)
                                });
                                //         grandtotal += pagedResults.length;

                                //         allResults = allResults.concat(pagedResults);
                                // if (PageNo == page) {
                                for (var i = 0; i < pagedResults.length; i++) {
                                        resultLine = {};
                                        lineResult = pagedResults[i];
                                        columns.forEach(function (column) {
                                                if (lineResult.getText(column)) {
                                                        resultLine[column.label] = lineResult.getText(column);
                                                } else {
                                                        resultLine[column.label] = lineResult.getValue(column);
                                                }
                                        });
                                        resultLines.push(resultLine);
                                }
                                // }
                                //         var pagedResultsCount = pagedResults != null ? pagedResults.length : 0;
                                //         startIndex += pagedResultsCount;
                                //         page++;
                                // }
                                // while (pagedResultsCount == RANGECOUNT);
                                if (PageNo > pages.length) {
                                        throw error.create({
                                                name: 'INVALID OFFSET',
                                                message: 'Invalid offset'
                                        });
                                }
                                //     var pagedResults = resultset.getRange({
                                //         start: 2000,
                                //         end: 3000
                                //     });
                                //     grandtotal += pagedResults.length;
                                //     allResults = allResults.concat(pagedResults);
                                returnObj.resultset = resultLines;
                                returnObj.page = page;
                                returnObj.grandtotal = grandtotal;
                        } catch (error) {
                                log.error({
                                        title: error.name,
                                        details: error.message
                                });
                                throw new Error(error.name, error.message);
                        }
                        return returnObj;
                }
                function allInternalId(savedSearchId) {
                        var title = 'allInternalId(::)';
                        try {
                                var allInternalIdArray = [];
                                var allINternalIdSearch = search.load({
                                        id: savedSearchId
                                });
                                allINternalIdSearch.filters.push(search.createFilter({
                                        name: "mainline",
                                        operator: "is",
                                        values: "T"
                                }));
                                allINternalIdSearch.columns = search.createColumn({
                                        name: "internalid",
                                        summary: "GROUP",
                                        label: "Internal ID"
                                });
                                log.debug('allINternalIdSearch.columns', allINternalIdSearch.columns);
                                var allResults = [];
                                var startIndex = 0;
                                var RANGECOUNT = 1000;
                                do {
                                        var pagedResults = allINternalIdSearch.run().getRange({
                                                start: parseInt(startIndex),
                                                end: parseInt(startIndex + RANGECOUNT)
                                        });
                                        allResults = allResults.concat(pagedResults);
                                        var pagedResultsCount = pagedResults != null ? pagedResults.length : 0;
                                        startIndex += pagedResultsCount;
                                }
                                while (pagedResultsCount == RANGECOUNT);
                                var internalIdArray = [];
                                for (var k = 0; k < allResults.length; k++) {
                                        var result = allResults[k];
                                        obj = {};
                                        obj.id = result.getValue({ name: 'internalid', summary: "GROUP" });
                                        internalIdArray.push(obj);
                                }
                                for (var j = 0; j < internalIdArray.length; j++) {
                                        var recordID = internalIdArray[j];
                                        var allRecordsIDs = Object.keys(recordID).map(function (k) { return recordID[k] }).join(",");
                                        allInternalIdArray.push(allRecordsIDs);
                                }
                                return allInternalIdArray;

                        } catch (e) {
                                log.debug('Exception ' + title, e.message);
                        }
                }
                function get(context) {
                        var title = 'get()::';
                        var result;
                        try {
                                log.debug("In get().", "context is: " + JSON.stringify(context));
                                var resultLines = [],
                                        results = [],
                                        label, columns, resultLine;
                                var nsQuery;
                                // var scriptObj = runtime.getCurrentScript();
                                var workbookId = context.wbid;
                                var savedSearchId = context.ssid;
                                var metaData = context.metaData;
                                var type = context.type;
                                var offset = context.offset;
                                var date = context.date;
                                var dateField = context.dateField ? context.dateField : 'trandate';
                                // var dateRange = context.daterange;
                                var dateTo = context.dateto;
                                var dateFrom = context.datefrom;
                                var totalPages = 0;
                                var totalRecordsCount = 0;
                                var pageNo;
                                var PAGE_SIZE = 1000;
                                var searchResultSet;
                                var searchObject, lineResult;
                                log.debug(title + 'savedSearchId', savedSearchId);
                                log.debug(title + 'dateTo', dateTo);
                                log.debug(title + 'dateFrom', dateFrom);
                                if (type && (type.toLowerCase() === "dataset")) {
                                        nsQuery = dataset.load({
                                                id: workbookId
                                        });
                                } else if (workbookId) {
                                        nsQuery = query.load({
                                                id: workbookId
                                        });
                                }
                                if (savedSearchId) {
                                        nsQuery = search.load({
                                                id: savedSearchId
                                        });
                                }

                                log.debug({
                                        title: "Fresh Filters",
                                        details: nsQuery.condition
                                });


                                if (date) {
                                        log.debug({
                                                title: "Conditions",
                                                details: nsQuery.condition
                                        });

                                        var myDatesAgo = query.createRelativeDate({
                                                dateId: query.DateId.DAYS_AGO,
                                                value: parseInt(date)
                                        });

                                        var addCondition = nsQuery.createCondition({
                                                fieldId: "lastmodifieddate",
                                                operator: query.Operator.WITHIN,
                                                values: myDatesAgo
                                        });

                                        // var addCondition = nsQuery.createCondition({
                                        //         fieldId: "lastmodifieddate",
                                        //         operator: query.Operator.ON,
                                        //         values: query.RelativeDateRange.TODAY
                                        // });

                                        nsQuery.condition = addCondition;
                                }

                                if (dateTo && dateFrom) {
                                        if (savedSearchId) {
                                                var searchFilters = nsQuery.filters;
                                                log.debug({
                                                        title: "searchFilters",
                                                        details: searchFilters
                                                });
                                                searchFilters.push(search.createFilter({
                                                        name: dateField,
                                                        operator: query.Operator.WITHIN,
                                                        values: [dateTo, dateFrom]
                                                }));
                                                log.debug({
                                                        title: "after push searchFilters",
                                                        details: searchFilters
                                                });
                                                nsQuery.filters = searchFilters;

                                        } else {

                                                log.debug({
                                                        title: "nsQuery",
                                                        details: nsQuery
                                                });
                                                var myCondition = nsQuery.createCondition({
                                                        fieldId: dateField,
                                                        operator: query.Operator.WITHIN,
                                                        values: [dateTo, dateFrom]
                                                });

                                                var oldConditions = nsQuery.condition;

                                                nsQuery.condition = nsQuery.and([oldConditions, myCondition]);


                                                log.debug({
                                                        title: "Workbook Updated",
                                                        details: nsQuery.condition
                                                });
                                        }
                                }
                                log.debug({
                                        title: "nsQuery",
                                        details: nsQuery
                                });
                                if (savedSearchId != '1660') {
                                        searchResultSet = nsQuery.runPaged({
                                                pageSize: PAGE_SIZE
                                        });

                                        log.debug({
                                                title: "Search Result Set",
                                                details: searchResultSet
                                        });
                                        pageNo = !!offset ? (offset / PAGE_SIZE) : 0;
                                        if (!!searchResultSet) {
                                                totalPages = searchResultSet.pageRanges.length;
                                                totalRecordsCount = searchResultSet.count;
                                        }
                                        log.debug({
                                                title: "Page No",
                                                details: pageNo
                                        });
                                        log.debug({
                                                title: "totalPages",
                                                details: totalPages
                                        });
                                        log.debug({
                                                title: "totalRecordsCount",
                                                details: totalRecordsCount
                                        });
                                        if (pageNo < 0 || pageNo >= totalPages) {
                                                totalPages = totalPages > 0 ? totalPages : 0;
                                                totalRecordsCount = totalRecordsCount > 0 ? totalRecordsCount : 0;
                                                resultLines = 0;
                                                //     throw error.create({
                                                //             name: 'INVALID OFFSET',
                                                //             message: 'Invalid offset'
                                                //     });
                                        }
                                        if (totalRecordsCount > 0) {
                                                var currentPage = searchResultSet.fetch(pageNo);
                                                log.debug({
                                                        title: "Current Page",
                                                        details: currentPage
                                                });
                                                if (savedSearchId) {
                                                        results = currentPage.data;
                                                } else {
                                                        results = currentPage.data.results;
                                                }
                                                if (!!results && results.length > 0) {
                                                        columns = nsQuery.columns;
                                                        if ((metaData == 'true' || metaData == true)) {
                                                                resultLines = allInternalId(savedSearchId);
                                                        } else {
                                                                for (var i = 0; i < results.length; i++) {
                                                                        resultLine = {};
                                                                        lineResult = results[i];
                                                                        if (savedSearchId) {
                                                                                columns.forEach(function (column) {
                                                                                        if (lineResult.getText(column)) {
                                                                                                resultLine[column.label] = lineResult.getText(column);
                                                                                        } else {
                                                                                                resultLine[column.label] = lineResult.getValue(column);
                                                                                        }
                                                                                });
                                                                        }
                                                                        else {
                                                                                for (var c = 0; c < columns.length; c++) {
                                                                                        label = columns[c].label;
                                                                                        label = label.replace(/\s/g, "");
                                                                                        resultLine[label] = results[i].values[c];
                                                                                }
                                                                        }

                                                                        resultLines.push(resultLine);
                                                                }
                                                        }
                                                }

                                        }
                                } else {
                                        var allresultSet = nsQuery.run();
                                        columns = nsQuery.columns;
                                        searchObject = searchAll(allresultSet, columns, offset);
                                        log.debug({
                                                title: "searchObject",
                                                details: searchObject
                                        });
                                        totalPages = searchObject.page;
                                        totalRecordsCount = searchObject.grandtotal;
                                        resultLines = searchObject.resultset;
                                }

                                result = {
                                        "error": {
                                                "code": "0",
                                                "message": ""
                                        },
                                        "data": {
                                                totalPages: totalPages,
                                                grandCountRecords: totalRecordsCount,
                                                "lines": (!!resultLines ? resultLines.length : 0),
                                                dataLines: resultLines
                                        }
                                };
                        } catch (ex) {
                                log.debug("Error", ex.type + " " + ex.name + " " + ex.message);
                                result = {
                                        "error": {
                                                "code": ex.name,
                                                "message": ex.message
                                        }
                                };
                        }
                        return result;
                }
                return {
                        get: get
                };
        });