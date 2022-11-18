/**
 *@NApiVersion 2.0
 *@NScriptType MapReduceScript
 *
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
 * File:		ab_mr_updateSerialItemID10.js 
 * Date:		15/06/2022 
 * 
 ***********************************************************************/ 
 
define(['N/log', 'N/search', 'N/record'], function (log, search, record) {

    function getInputData() {
        var title = 'getInputData::()';
        var inventorynumberSearchObj, obj;
        var SerialArray = [];
        try {
            inventorynumberSearchObj = search.create({
                type: "inventorynumber",
                filters:
                    [
                        ["formulatext: SUBSTR({inventorynumber}, 25,2)", "contains", "10"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({ name: "custitemnumber_lot", label: "Lot" }),
                        search.createColumn({ name: "custitemnumber_serial", label: "Serial" }),
                        search.createColumn({
                            name: "isserialitem",
                            join: "item",
                            label: "Is Serialized Item"
                        }),
                        search.createColumn({
                            name: "inventorynumber",
                            sort: search.Sort.ASC,
                            label: "Number"
                        }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            inventorynumberSearchObj.run().each(function (result) {
                obj = {};
                obj.isserialitem = result.getValue({ name: 'isserialitem', join: 'item' });
                obj.custitemnumber_serial = result.getValue({ name: 'inventorynumber' });
                obj.internalid = result.getValue({ name: 'internalid' });
                SerialArray.push(obj);
                return true;
            });
            return SerialArray;
        } catch (e) {
            log.debug('error in ' + title, e.message);
        }
    }

    function map(context) {
        try {
            var itemArray = JSON.parse(context.value);
            var isserialitem = itemArray.isserialitem;
            var fieldval = itemArray.custitemnumber_serial;//serialnumber
            var internalidInventoryNumber = itemArray.internalid;
            var InventoryNumberOBJ = record.load({
                type: 'inventorynumber',
                id: internalidInventoryNumber,
                isDynamic: true
            });
            var bExpires = false;
            var strGTIN = "-none-";
            var strMfg = "N/A";
            var strExp = "N/A";
            var strSerial = "N/A";
            var strLot = "N/A";
            // UDI's start with Nalu signature string and will have a manufacturing date ("11" code) in positions [16:17]
            var isUDI = ((fieldval.substring(0, 12) == "010081253703") && (fieldval.substring(16, 18) == "11"));
            if (isUDI) {
                strGTIN = fieldval.substring(0, 16);
                strMfg = fieldval.substring(18, 24);
                // next tag will encode Expiry Date (Sterile=17), Use By Date (Adhesive=15) or a Lot Number (10)
                var strTag3 = fieldval.substring(24, 26);
                log.debug('strTag3', strTag3);
                if ((strTag3 == "15") || (strTag3 == "17")) {
                    bExpires = true;
                    strExp = fieldval.substring(26, 32);
                    // next tag will encode a Serial Number (21) or a Lot Number (10)
                    var strTag4 = fieldval.substring(32, 34);
                    var strTail = fieldval.substring(34);
                    if (strTag4 == "21") {
                        strSerial = strTail;
                    } else if (strTag4 == "10") {
                        strLot = strTail;
                    }
                    // else this is just a non-sterile lot or serial encoded UDI (e.g. MODEL_34009, MODEL_34001-001_US, MODEL_74001-US)
                } if (strTag3 == "10") {
                    if (isserialitem == "true" || isserialitem == true) {
                        strSerial = fieldval.substring(26);
                    } else {
                        strLot = fieldval.substring(26);
                    }
                } if (strTag3 == "21") {
                    strSerial = fieldval.substring(26);
                }
                // Bulk adhesive clip boxes (e.g. PD-290) follow "Eyymmdd#L<LOT>" format
            } else if ((fieldval.substring(0, 1) == "E") && (fieldval.substring(7, 9) == "#L")) {
                strLot = fieldval.substring(9);
                strExp = fieldval.substring(1, 7);
            } else {
                strLot = fieldval;
            }
            if (isserialitem == "true" || isserialitem == true) {
                InventoryNumberOBJ.setValue({
                    fieldId: 'custitemnumber_gtn',
                    value: strGTIN,
                    ignoreFieldChange: true
                });
                var Mfgyear = strMfg.substring(0, 2);
                var Mfgmonth = strMfg.substring(2, 4);
                var Mfgday = strMfg.substring(4, 6);
                var MfgformateDate = Mfgmonth + '/' + Mfgday + '/' + '20' + Mfgyear;
                if (MfgformateDate) {
                    InventoryNumberOBJ.setValue({
                        fieldId: 'custitemnumber_mfgdate',
                        value: new Date(MfgformateDate),
                        ignoreFieldChange: true
                    });
                }
                var Expyear = strExp.substring(0, 2);
                var Expmonth = strExp.substring(2, 4);
                var Expday = strExp.substring(4, 6);
                var ExpformateDate = Expmonth + '/' + Expday + '/' + '20' + Expyear;
                if (strExp != 'N/A') {
                    InventoryNumberOBJ.setValue({
                        fieldId: 'custitemnumber_serexpdate',
                        value: new Date(ExpformateDate),
                        ignoreFieldChange: true
                    });
                }
                if (strLot == 'N/A') {
                    InventoryNumberOBJ.setValue({
                        fieldId: 'custitemnumber_lot',
                        value: "",
                        ignoreFieldChange: true
                    });
                } else {
                    InventoryNumberOBJ.setValue({
                        fieldId: 'custitemnumber_lot',
                        value: strLot,
                        ignoreFieldChange: true
                    });
                }
                if (strSerial == 'N/A') {
                    InventoryNumberOBJ.setValue({
                        fieldId: 'custitemnumber_serial',
                        value: "",
                        ignoreFieldChange: true
                    });
                } else {
                    InventoryNumberOBJ.setValue({
                        fieldId: 'custitemnumber_serial',
                        value: strSerial,
                        ignoreFieldChange: true
                    });
                }
                var id = InventoryNumberOBJ.save();
                log.debug('id', id);
            }
        } catch (e) {
            log.debug('MapReduce Error', e.message);
        }

    }

    function reduce(context) {

    }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
