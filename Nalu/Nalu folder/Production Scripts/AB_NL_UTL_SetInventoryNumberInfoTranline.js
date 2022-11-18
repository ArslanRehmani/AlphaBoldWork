/***********************************************************************
 *
 * The following javascript code is created by Shoaib Mehmood (Independent Consultant).,
 * It is a SuiteFlex component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": Shoaib Mehmood shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     Alphabold
 * Author:      Shoaib Mehmood
 * File:        AB_NL_UTL_SetInventoryNumberValues.js
 * Date:        07/20/2020
 ***********************************************************************/

define(['N/search', 'N/record', 'N/runtime', 'N/task', 'N/file', 'N/format'],
    function (search, record, runtime, task, file, format) {
        return {
            searchAll: function (resultset) {
                var allResults = [];
                var startIndex = 0;
                var RANGECOUNT = 1000;
                do {
                    var pagedResults = resultset.getRange({
                        start: parseInt(startIndex),
                        end: parseInt(startIndex + RANGECOUNT)
                    });

                    allResults = allResults.concat(pagedResults);

                    var pagedResultsCount = pagedResults != null ? pagedResults.length : 0;
                    startIndex += pagedResultsCount;

                }
                while (pagedResultsCount == RANGECOUNT);
                return allResults;
            },
            getInventoryNumberOnTransaction: function (tranInternalId) {
                var invNumberArray = [];
                var invNumber;
                var allInventoryNumbers = [];
                var items = [];
                var result = {};

                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters: [
                        //["mainline", "is", "F"],
                        //"AND",
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["inventorydetail.inventorynumber", "noneof", "@NONE@"],
                        "AND",
                        ["internalid", "is", tranInternalId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "inventorynumber",
                            join: "inventoryDetail",
                            label: " Number"
                        }),
                        search.createColumn({name: "item", label: "Item"})
                    ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count", searchResultCount);

                transactionSearchObj.run().each(function (result) {
                    invNumberArray = [];
                    allInventoryNumbers.push({
                        id: result.getValue({name: "inventorynumber", join: "inventoryDetail"}),
                        number: result.getText({name: "inventorynumber", join: "inventoryDetail"})
                    });
                    items.push(result.getValue({name: "item"}));
                    return true;
                });
                result.items = items;
                result.inventoryNumbers = allInventoryNumbers;

                return result;
            },
            getInvNumByTranInvIdWise: function (tranInternalId) {
                var invNumber;
                var allInventoryNumbers = {};
                var result = {};
                var key, custlot, custserial, isLot, isSerial;

                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters: [
                        ["shipping", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["inventorydetail.inventorynumber", "noneof", "@NONE@"],
                        "AND",
                        ["internalid", "is", tranInternalId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "inventorynumber",
                            join: "inventoryDetail",
                            label: " Number"
                        }),
                        search.createColumn({name: "item", label: "Item"}),
                        search.createColumn({
                            name: "custitemnumber_gtn",
                            join: "itemNumber",
                            label: "Gtn"
                        }),
                        search.createColumn({
                            name: "custitemnumber_lot",
                            join: "itemNumber",
                            label: "Lot"
                        }),
                        search.createColumn({
                            name: "custitemnumber_mfgdate",
                            join: "itemNumber",
                            label: "MfgDate"
                        }),
                        search.createColumn({
                            name: "custitemnumber_serial",
                            join: "itemNumber",
                            label: "Serial"
                        }),
                        search.createColumn({
                            name: "expirationdate",
                            join: "itemNumber",
                            label: "Expiration Date"
                        }),
                        search.createColumn({
                            name: "custitemnumber_serexpdate",
                            join: "itemNumber",
                            label: "Serial Expiration Date"
                        }),
                        search.createColumn({
                            name: "inventorynumber",
                            join: "itemNumber",
                            label: "Number"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "itemNumber",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "islotitem",
                            join: "item",
                            label: "Is Lot Numbered Item"
                        }),
                        search.createColumn({
                            name: "isserialitem",
                            join: "item",
                            label: "Is Serialized Item"
                        })

                    ]
                });
                var searchResultCount = transactionSearchObj.runPaged().count;
                log.debug("transactionSearchObj result count", searchResultCount);

                transactionSearchObj.run().each(function (result) {
                    key = result.getValue({name: "inventorynumber", join: "itemNumber"});
                    allInventoryNumbers[key] = {};

                    allInventoryNumbers[key]["gtn"] = result.getValue({
                        name: "custitemnumber_gtn",
                        join: "itemNumber"
                    });
                    allInventoryNumbers[key]["mfgdate"] = result.getValue({
                        name: "custitemnumber_mfgdate",
                        join: "itemNumber"
                    });
                    custlot = result.getValue({
                        name: "custitemnumber_lot",
                        join: "itemNumber"
                    });

                    custserial = result.getValue({
                        name: "custitemnumber_serial",
                        join: "itemNumber"
                    });

                        allInventoryNumbers[key]["number"] = !!custlot ? custlot : (!!custserial ? custserial : "");
                        // allInventoryNumbers[key]["number"] = !!custlot ? custlot : (!!key ? key : "");
                        
                    

                    isLot = result.getValue({
                        name: "islotitem",
                        join: "item"
                    });

                    isSerial = result.getValue({
                        name: "isserialitem",
                        join: "item"
                    });

                    if (isLot)
                        allInventoryNumbers[key]["expirationdate"] = result.getValue({
                            name: "expirationdate",
                            join: "itemNumber"
                        });

                    if (isSerial)
                        allInventoryNumbers[key]["expirationdate"] = result.getValue({
                            name: "custitemnumber_serexpdate",
                            join: "itemNumber"
                        });

                    return true;
                });

                return allInventoryNumbers;
            },
            saveProcessInfo: function (recordId, dataObject) {
                log.debug("recordId", recordId);
                log.debug("dataObject", JSON.stringify(dataObject));
                var nsRec = record.load({type: "customrecord_invnumupdque", id: recordId});

                for (var f in dataObject) {
                    nsRec.setValue({fieldId: f, value: dataObject[f]});
                }
                nsRec.save();
            },
            getInventoryNumberRecords: function (inventoryNumberInfo, saveSearch) {
                var srch = search.create({
                    type: "inventorynumber",
                    columns: [search.createColumn({name: "inventorynumber"})]
                });
                var filters = [];
                var searchResults;
                var results = [];
                var mainFilterExpression = [];

                mainFilterExpression.push(["item", "anyof", inventoryNumberInfo.items]);
                mainFilterExpression.push("and");

                for (var f = 0; f < inventoryNumberInfo.inventoryNumbers.length; f++) {
                    filters.push(["inventorynumber", "is", inventoryNumberInfo.inventoryNumbers[f]]);
                    filters.push("or");
                }
                filters.pop();
                mainFilterExpression.push(filters);

                srch.filterExpression = mainFilterExpression;

                searchResults = this.searchAll(srch.run());

                if (!!searchResults) {
                    for (var r = 0; r < searchResults.length; r++) {
                        results.push({
                            id: searchResults[r].id,
                            number: searchResults[r].getValue({name: "inventorynumber"})

                        });
                    }
                }
                //if (saveSearch) {
                //    srch.title = "ItemReceipt_" + inventoryNumberInfo.itemReceiptId + "_" + (new Date()).toISOString();
                //    var srchid = srch.save();
                //    log.debug("srchid", srchid);
                //}
                return results;
            },

            parseUDI: function (sourceValue) {
                var parseValuesObject = {};
                var bExpires = false;
                var strGTIN = "-none-";
                var strMfg = "N/A";
                var strExp = "N/A";
                var strSerial = "N/A";
                var strLot = "N/A";
                // UDI's start with Nalu signature string and will have a manufacturing date ("11" code) in positions [16:17]
                var isUDI = ((sourceValue.substring(0, 12) == "010081253703") && (sourceValue.substring(16, 18) == "11"));
                if (isUDI) {
                    strGTIN = sourceValue.substring(0, 16);
                    strMfg = sourceValue.substring(18, 24);
                    // next tag will encode Expiry Date (Sterile=17), Use By Date (Adhesive=15) or a Lot Number (10)
                    var strTag3 = sourceValue.substring(24, 26);
                    if ((strTag3 == "15") || (strTag3 == "17")) {
                        bExpires = true;
                        strExp = sourceValue.substring(26, 32);
                        // next tag will encode a Serial Number (21) or a Lot Number (10)
                        var strTag4 = sourceValue.substring(32, 34);
                        var strTail = sourceValue.substring(34);
                        if (strTag4 == "21") {
                            strSerial = strTail;
                        } else if (strTag4 == "10") {
                            strLot = strTail;
                        }
                        // else this is just a non-sterile lot encoded UDI (e.g. MODEL_34009)
                    }
                    if (strTag3 == "10") {
                        strLot = sourceValue.substring(26);
                    }
                    // Bulk adhesive clip boxes (e.g. PD-290) follow "Eyymmdd#L<LOT>" format
                } else if ((sourceValue.substring(0, 1) == "E") && (sourceValue.substring(7, 9) == "#L")) {
                    strLot = sourceValue.substring(9);
                    strExp = sourceValue.substring(1, 7);
                } else {
                    strLot = sourceValue;
                }

                parseValuesObject.gtn = strGTIN;
                parseValuesObject.MfgDate = strMfg;
                if (!!parseValuesObject.MfgDate && parseValuesObject.MfgDate != "N/A") {
                    parseValuesObject.MfgDateFormatted = this.getFormattedDate(strMfg);
                }

                parseValuesObject.ExpDate = strExp;
                if (!!parseValuesObject.ExpDate && parseValuesObject.ExpDate != "N/A") {
                    parseValuesObject.ExpDateFormatted = this.getFormattedDate(strExp);
                }

                parseValuesObject.Lot = strLot;
                parseValuesObject.Serial = strSerial;

                return parseValuesObject;
            },
            //Get Formatted Date
            getFormattedDate: function (dateString) {
                var yr = dateString.substring(0, 2);
                var month = dateString.substring(2, 4);
                var day = dateString.substring(4, 6);
                var currentDate = new Date();
                var newDateString = month + "/" + day + "/" + ((currentDate.getFullYear()).toString()).substring(0, 2) + yr;
                var formattedDate = this.formatStringToDate(newDateString);
                return formattedDate;
            },
            getSourceTargetMap: function () {
                var map = {};
                map["custitemnumber_gtn"] = "gtn";
                map["custitemnumber_mfgdate"] = "MfgDateFormatted";
                map["custitemnumber_lot"] = "Lot";
                map["custitemnumber_serial"] = "Serial";
                map["expirationdate"] = "ExpDateFormatted";
                return map;
            },
            //Format Date to String Field
            formatDateToString: function (input) {
                return (input.getMonth() + 1) + "/" + input.getDate() + "/" + input.getFullYear();
            },
            //Format String to Date Field(input)
            formatStringToDate: function (input) {
                return format.parse({
                    value: input,
                    type: format.Type.DATE
                });
            },
        }
    });