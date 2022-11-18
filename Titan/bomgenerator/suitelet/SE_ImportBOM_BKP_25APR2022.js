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
 * Author:      mazhar@alphabold.com
 * File:        SE_ImportBOM.js
 * Date:        5/22/2019
 *
 *
 ***********************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget', 'N/record', '../lib/BomGenerator_lib.js', 'N/url', 'N/file', 'N/runtime'],
    function (nsSearch, ui, nsRecord, library, nsURL, nsFile, runtime) {

        function onRequest(context) {
            try {
                var params = context.request.parameters;
                log.debug('params', params);
                log.debug('context.request.method', context.request.method);

                if (context.request.method == 'GET') {
                    showUploadControl(context, params);
                } else if (params.getAssemblyData) {
                    var assemblyitemId = params.id;
                    var response = [];
                    if (!!assemblyitemId) {
                        getAssemblyData(assemblyitemId, response, "assemblyitem","");
                        context.response.write({
                            output: JSON.stringify({"results": response, "unitList": getUnitList()})
                        });
                    }
                }
                else if (params.parseCSV) {
                    var result = [];
                    var ids = params.ids.split(",");
                    var keys = params.keys.split(",");
                    var customFields = getCustomFields(keys);
                    var filter = [];
                    for (var o = 0; o < ids.length; o++) {
                        filter.push(["name", "is", ids[o]]);
                        if (o < ids.length - 1) {
                            filter.push("OR");
                        }
                    }
                    log.debug('filter', filter);
                    var columns = ["itemid"];
                    if (filter.length > 0) {
                        var records = library.searchRecord("item", filter, columns);
                        if (!!records && records.length > 0) {
                            for (var i = 0; i < records.length; i++) {
                                result.push({id: records[i].id, sku: records[i].getValue({name: "itemid"})});
                            }
                        }
                    }
                    try {
                        var temp = library.searchRecord("item", ['itemtype', 'is', 'Assembly'], null);
                        if (!!temp && temp.length > 0) {
                            var recObj = nsRecord.load({
                                type: temp[0].type,
                                id: temp[0].id
                            });
                            if (!!recObj) {
                                for (var m = 0; m < customFields.length; m++) {
                                    var field = recObj.getField({"fieldId": customFields[m].name});
                                    if (!!field) {
                                        customFields[m].status = true;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                    }
                    context.response.write({
                        output: JSON.stringify({unitList: getUnitList(), result: result, customFields: customFields}),
                    });
                }
                else if (params.generatorBOM) {
                    try {
                        var subsidiary = params.sourceSubsidiary;
                        var sourceLocation = params.sourceLocation;
                        var configuration = library.getConfiguration(params);
                        var itemList = JSON.parse(params.data.replace(/BOMemperson/g, "&").replace(/BOMhash/g, "#"));
                        var units = library.searchRecord("unitstype", null, ["name"]);
                        log.debug("units", units);
                        log.debug("sourceSubsidiary", subsidiary);
                        for (var i = 0; i < itemList.length; i++) {
                            var item = itemList[i];
                            item = CreatItem(item, configuration, units, subsidiary, sourceLocation);
                        }
                        context.response.write({
                            output: JSON.stringify({items: itemList, error: null})
                        });
                    } catch (e) {
                        context.response.write({
                            output: JSON.stringify({items: itemList, error: true, message: e.message})
                        });
                    }
                }
            } catch (e) {
                log.error('Error on Request', e);
            }
        }

        function getAssemblyData(assemblyitemId, response, assemblyType, parentItemId) {
            var assemblyData = nsRecord.load({
                type: assemblyType,
                id: assemblyitemId
            });
            if (!!assemblyData) {
                if (!parentItemId) {
                    var assembly = {};
                    //assembly["id"] = assemblyitemId;
                    assembly["SKU"] = assemblyData.getValue({"fieldId": "itemid"});
                    assembly.Parent = parentItemId;
                    assembly["Type"] = assemblyData.getValue({"fieldId": "itemtype"});
                    assembly["Item Type"] = assemblyData.type;
                    assembly["Description"] = assemblyData.getValue({"fieldId": "description"});
                    assembly["Assembly Unit Type"] = assemblyData.getValue({"fieldId": "unitstype"});
                    assembly["Compnonents Item Source"] = " ";
                    assembly["Compnonents YIELD"] = " ";
                    assembly["Compnonents Qty"] = "1";
                    assembly["InternalId"] = assemblyitemId;
                    response.push(assembly);
                }
                var count = assemblyData.getLineCount({
                    sublistId: 'member'
                });
                for (var i = 0; i < count; i++) {
                    var itemInternalId = assemblyData.getSublistValue({
                        sublistId: 'member',
                        fieldId: 'item',
                        line: i
                    });
                    var itemType = getRecordType(assemblyData.getSublistValue({
                        sublistId: 'member',
                        fieldId: 'sitemtype',
                        line: i
                    }));
                    if (!!itemInternalId) {
                        var childItem = nsRecord.load({
                            type: itemType,
                            id: itemInternalId
                        });
                    }
                    var member = {};
                    //member["id"] = itemInternalId;
                    member["SKU"] = childItem.getValue({"fieldId": "itemid"});
                    member["Parent"] = assemblyData.getValue({"fieldId": "itemid"});
                    member["Type"] = childItem.getValue({"fieldId": "itemtype"});
                    member["Item Type"] = childItem.type;
                    member["Description"] = childItem.getValue({"fieldId": "description"}) || childItem.getValue({"fieldId": "salesdescription"});
                    member["Assembly Unit Type"] = childItem.getValue({"fieldId": "unitstype"});
                    member["Compnonents Item Source"] = assemblyData.getSublistValue({
                        sublistId: 'member',
                        fieldId: 'itemsource',
                        line: i
                    });
                    member["Compnonents Item Source"] = member["Compnonents Item Source"] === "STOCK" ? "Stock" : "Purchase Order";
                    member["Compnonents YIELD"] = assemblyData.getSublistValue({
                        sublistId: 'member',
                        fieldId: 'componentyield',
                        line: i
                    });
                    member["Compnonents Qty"] = assemblyData.getSublistValue({
                        sublistId: 'member',
                        fieldId: 'quantity',
                        line: i
                    });
                    member["InternalId"] = itemInternalId;
                    response.push(member);
                    if (itemType === 'assemblyitem') {
                        getAssemblyData(itemInternalId, response, itemType, assemblyData.getValue({"fieldId": "itemid"}));
                    }
                }
            }
        }

        function getCustomFields(keys) {
            var temp = "SKU,Parent,Type,Item Type,Description,Assembly Unit Type,Compnonents Item Source,Compnonents YIELD,Compnonents Qty";
            var keyArray = temp.split(",");
            var newArray = [];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var result = keyArray.filter(function (k) {
                    return k.toLowerCase() === key.toLowerCase();
                });
                if (!result || result.length == 0) {
                    //if (key.toLowerCase().trim().indexOf("custitem") == 0) {
                        newArray.push({
                            'fieldId': key.toLowerCase().trim().replace(/ /g, '_'),
                            'name': key.toLowerCase().trim().replace(/ /g, '_'),
                            'status': false
                        });
                    // } else {
                    //     newArray.push({
                    //         'fieldId': key.toLowerCase().trim().replace(/ /g, '_'),
                    //         'name': 'custitem_' + key.toLowerCase().trim().replace(/ /g, '_'),
                    //         'status': false
                    //     });
                    // }
                }
            }
            return newArray;
        }

        function getRecordType(itmeType) {
            switch (itmeType) {
                case "InvtPart" :
                    return "inventoryitem";
                case "Assembly" :
                    return "assemblyitem";
                case "OthCharge" :
                    return "otherchargeitem";
                case "NonInvtPart" :
                    return "noninventoryitem";
                case "Kit" :
                    return "kititem";
                default:
                    return "inventoryitem"
            }
        }

        function getUnitList() {
            var result = [];
            var units = library.searchRecord("unitstype", null, ["name"]);
            for (var i = 0; i < units.length; i++) {
                var unit = units[i];
                result.push({id: unit.id, name: unit.getValue({name: "name"})});
            }
            return result;
        }

        function showUploadControl(context, params) {
            var form = ui.createForm({
                title: 'Import BOM',
            });
            form.clientScriptModulePath = '../clientscript/CS_BOMGenerator_Configuration.js';
            var configuration = library.getConfiguration(params);
            var errorMessage = "";
            if (configuration.custrecord_bom_config_source_subsidiary == true ||
                configuration.custrecord_bom_config_source_subsidiary == 'T') {
                if (!configuration["custrecord_bom_config_preferred_location"]) {
                    errorMessage = "Some configurations are missing, Please assgin default configuration otherwise you may get inconvenience while importing BOM";
                }
            } else {
                if (!configuration["custrecord_bom_config_preferred_location"] && !configuration["custrecord_bom_config_preferred_sub"]) {
                    errorMessage = "Some configurations are missing, Please assgin default configuration otherwise you may get inconvenience while importing BOM";
                }
            }

            var error = false;
            if (!errorMessage) {
                var accountFields = library.ACCOUNTS_FIELDS;
                for (var label in accountFields) {
                    var key = accountFields[label].replace('custpage', 'custrecord_bom');
                    var temp = configuration[key];
                    if (!temp && key !== "custrecord_bom_scrap_account" &&
                        key !== "custrecord_bom_wip_account" &&
                        key !== "custrecord_bom_wipe_cost_vari_acc") {
                        error = true;
                    }
                }
                if (error) {
                    errorMessage = "Please configure BOM default Accounts list otherwise you may get inconvenience while importing BOM."
                }
            }
            var subsidiary = params.subsidiary;
            var location = params.location;
            if (!subsidiary && isShowConfigurationDropDown() === 'T') {
                var config = library.addSelectField(form, 'custpage_config', 'Select Configuration', 'customrecord_bom_configuration', null);
                config.updateLayoutType({
                    layoutType: ui.FieldLayoutType.OUTSIDE
                });
                config.updateBreakType({
                    breakType: ui.FieldBreakType.STARTROW
                });
                config.updateDisplaySize({
                    width: 500,
                    height: 50
                });
                if (!!configuration) {
                    config.defaultValue = configuration.id;
                }
            }
            var assemblyItems = library.searchRecord('item', [["type", "anyof", "Assembly"], "AND", ["isinactive", "is", "F"]], ['itemid', 'internalid']);
            var options = [];
            log.debug("assemblyItems.length", assemblyItems.length);
            if (!!assemblyItems && assemblyItems.length) {
                options.push({
                    "id": "",
                    "name": "Select BOM"
                });
                for (var i = 0; i < assemblyItems.length; i++) {
                    options.push({
                        "id": assemblyItems[i].getValue({"name": "internalid"}),
                        "name": assemblyItems[i].getValue({"name": "itemid"})
                    });
                }
            }
            // var ItemsDropDown = library.addSelectField(form, 'custpage_boomitems', 'Select BOOM', '', options);
            // ItemsDropDown.updateLayoutType({
            //     layoutType: ui.FieldLayoutType.OUTSIDE
            // });
            // ItemsDropDown.updateBreakType({
            //     breakType: ui.FieldBreakType.STARTROW
            // });
            // ItemsDropDown.updateDisplaySize({
            //     width: 500,
            //     height: 50
            // });

            var html = library.addTextField(form, 'custpage_inlinehtml', ui.FieldType.INLINEHTML, 'HTML');

            var indexPageValue = extractPageContent(params);
            indexPageValue = indexPageValue.replace("[errorMessage]", errorMessage);
            indexPageValue = indexPageValue.replace("[BoomAssembly]", JSON.stringify(options));
            html.defaultValue = indexPageValue;
            context.response.writePage({pageObject: form});
        }

        function isShowConfigurationDropDown() {
            //custscript_bundle_show_config_record
            var userObj = runtime.getCurrentUser();
            var obj = userObj.getPreference({name: "custscript_bundle_show_config_record"});
            log.debug('obj', obj);
            return obj;
        }

        function extractPageContent(params) {
            var indexPageValue = '';
            var entity = params.entity;
            var subsidiary = params.subsidiary;
            var location = params.location;
            var configId = params.configId;
            var data = nsFile.load({id: getFileUrl()});
            indexPageValue = data.getContents();
            indexPageValue = indexPageValue.replace("[URL]", library.Configuration.ImportBOMSuitleteUrl);
            indexPageValue = indexPageValue.replace("[sourceSubsidiary]", !!subsidiary ? subsidiary : "");
            indexPageValue = indexPageValue.replace("[sourceLocation]", !!location ? location : "");
            indexPageValue = indexPageValue.replace("[configId]", !!configId ? configId : "");
            return indexPageValue;
        }

        function getFileUrl() {
            try {
                var scriptObj = runtime.getCurrentScript();
                var bundleArr = scriptObj.bundleIds;
                var bundleId = !!bundleArr && bundleArr.length > 0 ? bundleArr[0] : 0;
                log.debug("bundleArr", bundleArr);
                if (!bundleId || bundleId.length <= 0) {
                    return "SuiteScripts/BoldMan/bomgenerator/lib/DragDropFile.html";
                } else {
                    return "SuiteBundles/Bundle " + bundleId.replace('suitebundle', '') + '/bomgenerator/lib/DragDropFile.html';
                }
            } catch
                (e) {
                log.error('Error', e);
            }
        }

        function CreatItem(item, configuration, units, subsidiary, sourceLocation) {
            try {
                if (!item) {
                    return item;
                }
                var isAlreadyExists = false;
                var objRecord = null;
                if (parseInt(item.InternalId) > 0) {
                    isAlreadyExists = true;
                    objRecord = nsRecord.load({
                        type: item["Item Type"],
                        id: item.InternalId,
                        isDynamic: false,
                    });
                } else {
                    objRecord = nsRecord.create({
                        type: item["Item Type"],
                        isDynamic: false,
                    });
                }
                objRecord.setValue({
                    fieldId: "includechildren",
                    value: true
                });

                if (item.Type == "Assembly" && item.isParent) {
                    log.debug("customFields", JSON.stringify(configuration.customFields));
                    if (!!configuration.customFields && configuration.customFields.length > 0) {
                        for (var c = 0; c < configuration.customFields.length; c++) {
                            var obj = configuration.customFields[c] || '';
                            if (!!obj.custrecord_ab_bom_item_mapping_field && !!obj.custrecord_ab_custom_field_static_value) {
                                try {
                                    if (obj.custrecord_ab_custom_field_static_value.toLowerCase() === 't' || obj.custrecord_ab_custom_field_static_value.toLowerCase() == 'true') {
                                        obj.custrecord_ab_custom_field_static_value = true;
                                    }
                                    objRecord.setValue({
                                        fieldId: obj.custrecord_ab_bom_item_mapping_field,
                                        value: obj.custrecord_ab_custom_field_static_value,
                                    });
                                } catch (e) {
                                }
                            }
                        }
                    }
                }

                if (!!item["Assembly Unit Type"]) {
                    var _unit = item["Assembly Unit Type"];
                    log.debug("_unit", _unit.toLowerCase());
                    if (!!units && units.length > 0) {
                        var val = units.filter(function (u) {
                            return u.id == _unit
                        });
                        log.debug("val", val);
                        if (!!val && val.length > 0) {
                            objRecord.setValue({
                                fieldId: "unitstype",
                                value: val[0].id
                            });
                        }
                    }
                }
                var fields = library.CSV_BODY_FIELDS;
                for (var field in fields) {
                    var sField = fields[field];
                    var val = item[sField] || '';
                    //log.debug("item[sField]", val);
                    if (!!val) {
                        objRecord.setValue({
                            fieldId: field,
                            value: val,
                        });
                    }
                }
                var accountFields = library.PARENT_ASSEBMLY_FIELDS;
                for (var label in accountFields) {
                    if (label == "subsidiary" && !isAlreadyExists) {
                        objRecord.setValue({
                            fieldId: label,
                            value: (configuration.custrecord_bom_config_source_subsidiary == true && !!subsidiary ? subsidiary : configuration["custrecord_bom_config_preferred_sub"])
                        });
                    } else if (label == "location" && !isAlreadyExists) {
                        item["location"] = configuration.custrecord_bom_config_source_subsidiary == true && !!subsidiary ? sourceLocation : configuration["custrecord_bom_config_preferred_location"];
                        objRecord.setValue({
                            fieldId: label,
                            value: configuration.custrecord_bom_config_source_subsidiary == true && !!subsidiary ? sourceLocation : configuration["custrecord_bom_config_preferred_location"]
                        });
                    } else if (label == "preferredlocation" && !isAlreadyExists) {
                        objRecord.setValue({
                            fieldId: label,
                            value: configuration.custrecord_bom_config_source_subsidiary == true && !!subsidiary ? sourceLocation : configuration["custrecord_bom_config_preferred_location"]
                        });
                    } else if (label == "costingmethod" && !isAlreadyExists) {
                        objRecord.setValue({
                            fieldId: label,
                            value: library.COSTING_METHOD_MAP[configuration["custrecord_bom_config_pref_cosst_method"]]
                        });
                    } else if (label == "taxschedule" && !isAlreadyExists) {
                        objRecord.setValue({
                            fieldId: label,
                            value: configuration["custrecord_bom_config_pref_tax_sch"]
                        });
                    }
                   else {
                       if(!isAlreadyExists) {
                          // try{
                           objRecord.setValue({
                               fieldId: label,
                               value: configuration[accountFields[label].replace('custpage', 'custrecord_bom')],
                           });
                          // }catch (e) {
                           //}
                       }
                    }
                }
                if (item.Type == "Assembly") {
                    for (var i = 0; i < item.compnonets.length; i++) {
                        var childId = item.compnonets[i].InternalId;
                        //if (childId === 0 || childId === "0") {
                            item.compnonets[i] = CreatItem(item.compnonets[i], configuration, units, subsidiary, sourceLocation);
                            if (!!item.compnonets[i].error) {
                                item.error = item.compnonets[i].error;
                                item.message = item.compnonets[i].message;
                                if (parseInt(item.compnonets[i].InternalId) == 'NaN' || parseInt(item.compnonets[i].InternalId) == 0) {
                                    return item;
                                }
                            }
                        //}
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'item',
                            line: i,
                            value: item.compnonets[i].InternalId
                        });
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'quantity',
                            line: i,
                            value: item.compnonets[i]["Compnonents Qty"]
                        });
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'componentyield',
                            line: i,
                            value: item.compnonets[i]["Compnonents YIELD"]
                        });
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'itemsource',
                            line: i,
                            value: (item.compnonets[i]["Compnonents Item Source"].toLocaleLowerCase() == "stock" ? "STOCK" : "PURCHASE_ORDER")
                        });
                    }
                }

                log.debug({
                    title: 'item',
                    details: item
                });
                log.debug({
                    title: 'New record Object',
                    details: objRecord
                });
                item.InternalId = objRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true,
                });
                log.debug({
                    title: 'New record saved',
                    details: 'New record ID: ' + item.InternalId,
                });
                item.message = "success";
            } catch (e) {
                log.error('Error in creating BOM', e);
                item.error = true;
                item.message = e.message;
            }
            delete item.Status;
            return item;
        }

        return {
            onRequest: onRequest,
        };
    });
