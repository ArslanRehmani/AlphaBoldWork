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
 * File:        SE_BomGenerator.js
 * Date:        4/18/2019
 *
 *
 ***********************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget', 'N/record', '../lib/BomGenerator_lib.js', 'N/runtime'],
    function (nsSearch, ui, nsRecord, library, runtime) {

        function onRequest(context) {
            try {
                var params = context.request.parameters;
                log.debug('context.request.method', context.request.method);

                if (context.request.method == 'GET') {
                    var configuration = library.getConfiguration(params);
                    showForm(context, configuration, params);
                } else {
                    log.debug('Body', context.request.body);
                    var body = JSON.parse(context.request.body);
                    var result = createBOM(body, context);

                    context.response.write({
                        output: JSON.stringify(result),
                    });
                }
            } catch (e) {
                log.error('Error on Request', e);
            }
        }

        //Craete Bom Item Record
        function createBOM(boomList, context) {
            var recordId;
            var result = [], objRecord;
            log.debug('createBOM', boomList);

            var fields = library.ASSEMBLY_FIELDS;
            for (var itemName in boomList) {
                try {
                    var resultObj = {};
                    var params = boomList[itemName];
                    if (!params) {
                        continue;
                    }
                    if (!params.lines || params.lines.length == 0) {
                        resultObj = {
                            assemblyitemId: '',
                            location: '',
                            description: '',
                            error: 'Lines not found',
                        };
                        result.push(resultObj);
                        continue;
                    }
                    objRecord = nsRecord.create({
                        type: nsRecord.Type.ASSEMBLY_ITEM,
                        isDynamic: false,
                    });
                    // objRecord.setValue({
                    //     fieldId: "includechildren",
                    //     value: true
                    // });
                    for (var field in fields) {
                        var sField = fields[field];
                        var val = params[field] || '';
                        if (!!val) {
                            objRecord.setValue({
                                fieldId: field,
                                value: val,
                            });
                        }
                    }
                    log.debug("customFields", JSON.stringify(params.customFields));
                    if (!!params.customFields && Object.keys(params.customFields).length > 0) {
                        var keys = Object.keys(params.customFields);
                        log.debug("keys", JSON.stringify(keys));
                        for (var _field in keys) {
                            var val = params.customFields[keys[_field]] || '';
                            if (!!val && !!_field) {
                                try {
                                    objRecord.setValue({
                                        fieldId: keys[_field],
                                        value: val,
                                    });
                                } catch (e) {
                                }
                            }
                        }
                    }
                    for (var i = 0; i < params.lines.length; i++) {
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'item',
                            line: i,
                            value: params.lines[i].item
                        });
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'quantity',
                            line: i,
                            value: params.lines[i].qty
                        });
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'componentyield',
                            line: i,
                            value: params.lines[i].yield
                        });
                        objRecord.setSublistValue({
                            sublistId: 'member',
                            fieldId: 'itemsource',
                            line: i,
                            value: params.lines[i].item_source
                        });
                    }
                    try {
                        log.debug({
                            title: 'creating child BOM',
                            details: 'start'
                        });
                        var childs = boomList[itemName].childs;
                        if (!!childs) {
                            var childsFields = library.CHILD_ASSEMBLY_FIELDS;
                            for (var child in childs) {
                                var childParams = childs[child];
                                var childRec = nsRecord.create({
                                    type: nsRecord.Type.ASSEMBLY_ITEM,
                                    isDynamic: false,
                                });
                                childRec.setValue({
                                    fieldId: "includechildren",
                                    value: true
                                });
                                for (var field in childsFields) {
                                    var sField = childsFields[field];
                                    var val = childParams[field] || '';
                                    if (!!val) {
                                        childRec.setValue({
                                            fieldId: field,
                                            value: val,
                                        });
                                    }
                                }
                                for (var field in library.PARENT_ASSEBMLY_FIELDS) {
                                    var sField = library.PARENT_ASSEBMLY_FIELDS[field];
                                    var val = params[field] || '';
                                    if (!!val) {
                                        childRec.setValue({
                                            fieldId: field,
                                            value: val,
                                        });
                                    }
                                }
                                for (var i = 0; i < childParams.lines.length; i++) {
                                    childRec.setSublistValue({
                                        sublistId: 'member',
                                        fieldId: 'item',
                                        line: i,
                                        value: childParams.lines[i].item
                                    });
                                    childRec.setSublistValue({
                                        sublistId: 'member',
                                        fieldId: 'quantity',
                                        line: i,
                                        value: childParams.lines[i].qty
                                    });
                                    childRec.setSublistValue({
                                        sublistId: 'member',
                                        fieldId: 'componentyield',
                                        line: i,
                                        value: childParams.lines[i].yield
                                    });
                                    childRec.setSublistValue({
                                        sublistId: 'member',
                                        fieldId: 'itemsource',
                                        line: i,
                                        value: childParams.lines[i].item_source
                                    });
                                }
                                var childRecordId = childRec.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true,
                                });
                                log.debug({
                                    title: 'childRecordId',
                                    details: 'childRecordId' + childRecordId,
                                });
                                objRecord.setSublistValue({
                                    sublistId: 'member',
                                    fieldId: 'item',
                                    line: i,
                                    value: childRecordId
                                });
                                objRecord.setSublistValue({
                                    sublistId: 'member',
                                    fieldId: 'quantity',
                                    line: i,
                                    value: 1
                                });
                            }
                        }
                        log.debug({
                            title: 'creating child BOM',
                            details: 'end'
                        });
                    } catch (ex) {
                        log.error('Error in creating Child BOM', ex);
                    }

                    recordId = objRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true,
                    });

                    log.debug({
                        title: 'New record saved',
                        details: 'New record ID: ' + recordId,
                    });

                    objRecord = nsRecord.load({
                        type: nsRecord.Type.ASSEMBLY_ITEM,
                        id: recordId,
                        isDynamic: true
                    });

                    if (!!params.priceInfo) {
                        var priceInfo = params.priceInfo;
                        for (var p = 0; p < priceInfo.length; p++) {
                            if (!!priceInfo[p].currency && !!priceInfo[p].priceLevel && !!priceInfo[p].rate) {
                                objRecord.selectLine({sublistId: "price" + priceInfo[p].currency, line: 0});
                                objRecord.setCurrentSublistValue({
                                    sublistId: "price" + priceInfo[p].currency,
                                    fieldId: "pricelevel",
                                    value: priceInfo[p].priceLevel,
                                });
                                objRecord.setCurrentSublistValue({
                                    sublistId: "price" + priceInfo[p].currency,
                                    fieldId: "price_1_",
                                    value: priceInfo[p].rate
                                });
                                objRecord.commitLine({sublistId: "price" + priceInfo[p].currency});
                            }
                        }
                    }
                    recordId = objRecord.save({
                        ignoreMandatoryFields: true
                    });

                    resultObj = {
                        assemblyitemId: recordId,
                        location: params.location,
                        description: params.description,
                        error: '',
                    };
                    log.debug({
                        title: 'resultObj',
                        details: resultObj,
                    });

                } catch (e) {
                    if (!!recordId)
                        nsRecord.delete({
                            type: nsRecord.Type.ASSEMBLY_ITEM,
                            id: recordId
                        });

                    log.error('Error in creating BOM', e);
                    resultObj = {
                        assemblyitemId: '',
                        location: '',
                        description: '',
                        error: e.message,
                    };
                }
                result.push(resultObj);
            }
            log.debug({
                title: 'result',
                details: result,
            });
            return result;
        }

        function getFileUrl() {
            try {
                var bundleId = library.Configuration.BundleId;
                if (!bundleId || bundleId.length <= 0) {
                    return "SuiteScripts/bomgenerator/util/";
                } else {
                    return "SuiteBundles/Bundle " + bundleId.replace('suitebundle', '') + '/bomgenerator/';
                }
            } catch
                (e) {
                log.error('Error', e);
            }
        }

        function isShowConfigurationDropDown() {
            //custscript_bundle_show_config_record
            var userObj = runtime.getCurrentUser();
            return userObj.getPreference({name: "custscript_bundle_show_config_record"});
        }

        //Create Form Controls
        function showForm(context, configuration, params) {

            var form = ui.createForm({
                title: 'Create BOM',
            });

            var entity = params.entity;
            var salesOrderSubsidiary = params.subsidiary;
            var salesOrderLocation = params.location;

            var tempSubsidiary = library.addTextField(form, 'custpage_hidden_subsidiary', ui.FieldType.TEXT, 'Source Subsidiary');
            tempSubsidiary.defaultValue = subsidiary;
            tempSubsidiary.updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
            var tempEntity = library.addTextField(form, 'custpage_hidden_entity', ui.FieldType.TEXT, 'Source Customer');
            tempEntity.defaultValue = entity;
            tempEntity.updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            if (!configuration.custrecord_bom_config_preferred_sub || !configuration.custrecord_bom_cogs_account) {
                var errorText = library.addTextField(form, 'custpage_hidden_error', ui.FieldType.TEXT, 'Source Subsidiary');
                errorText.defaultValue = "Some configurations are missing, Please assgin default configuration otherwise you may get inconvenience while creating BOM";
                errorText.updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
            }

            //Client Script ID
            form.clientScriptModulePath = '../clientscript/CS_BomGenerator.js';
            var customFields = configuration.customFields;
            library.addTab(form, "custpage_tabline", "Lines");
            library.addTab(form, "custpage_tabaccount", "Accounts");
            library.addTab(form, "custpage_tabsubbom", "Sub-Assembly");
            if (!!customFields && customFields.length) {
                library.addTab(form, "custpage_tabcustomfields", "Dynamic Fields");
                for (var c = 0; c < customFields.length; c++) {
                    var _field = customFields[c];
                    var _itemName = null;
                    _field.id = 'custpage_customfield_' + c.toString();
                    if (!!_field.custrecord_ab_custom_field_sourcing && _field.custrecord_ab_custom_field_type.toLowerCase() == "select") {
                        var source = _field.custrecord_ab_custom_field_sourcing;
                        _itemName = library.addSelectField(form, 'custpage_customfield_' + c.toString(), _field.custrecord_ab_custom_field_label, source, null, 'custpage_tabcustomfields');
                    } else {
                        _itemName = library.addTextField(form, 'custpage_customfield_' + c.toString(), _field.custrecord_ab_custom_field_type, _field.custrecord_ab_custom_field_label, 'custpage_tabcustomfields');
                    }
                    if (!!_field.custrecord_ab_custom_field_static_value) {
                        if (_field.custrecord_ab_custom_field_type.toLowerCase() == "checkbox") {
                            if (_field.custrecord_ab_custom_field_static_value.toLowerCase() === 't' || _field.custrecord_ab_custom_field_static_value.toLowerCase() == 'true' || !!_field.custrecord_ab_custom_field_static_value) {
                                _field.custrecord_ab_custom_field_static_value = true;
                            }
                        } else {
                            _itemName.defaultValue = _field.custrecord_ab_custom_field_static_value;
                        }
                    }
                    _itemName.isMandatory = _field.custrecord_ab_custom_field_mandatory == 'T' || _field.custrecord_ab_custom_field_mandatory == true;

                }
                var _customFields = library.addTextField(form, 'custpage_customfields', ui.FieldType.TEXTAREA, 'customFields');
                _customFields.defaultValue = JSON.stringify(customFields);
                _customFields.updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
            }

            var itemName = library.addTextField(form, 'custpage_sku', ui.FieldType.TEXT, 'Item/BOM Name');
            itemName.isMandatory = true;
            var unitType = library.addSelectField(form, 'custpage_units', 'Unit Type', 'unitstype', null);
            unitType.defaultValue = "4"; //Each
            var parent = library.addSelectField(form, 'custpage_parent', 'Subitem Of', 'item', null);
            var description = library.addTextField(form, 'custpage_description', ui.FieldType.TEXTAREA, 'Description');
            var totalCost = library.addTextField(form, "custpage_totalcost", ui.FieldType.TEXT, 'Total Cost');
            var subsidiary = library.addSelectField(form, 'custpage_subsidiary', 'Subsidiary', 'subsidiary', null);

            subsidiary.isMandatory = true;
            totalCost.updateDisplayType({
                displayType: ui.FieldDisplayType.DISABLED
            });
            //select Default subsidary from configuration
            if (configuration.custrecord_bom_config_source_subsidiary == true ||
                configuration.custrecord_bom_config_source_subsidiary == 'T') {
                subsidiary.defaultValue = params.subsidiary || configuration.custrecord_bom_config_preferred_sub;
            } else {
                subsidiary.defaultValue = configuration.custrecord_bom_config_preferred_sub;
            }
            var selectedSubsidiary = subsidiary.getSelectOptions().filter(function (sub) {
                return sub.value == subsidiary.defaultValue
            });

            if (!!selectedSubsidiary && selectedSubsidiary.length > 0) {
                selectedSubsidiary = selectedSubsidiary[0].text;
                var subs = selectedSubsidiary.split(":");
                selectedSubsidiary = subs[subs.length - 1].trim();
                log.debug("selectedSubsidiary", selectedSubsidiary);
            } else {
                selectedSubsidiary = null;
            }
            var locationList = library.getLocation(selectedSubsidiary);
            var location = library.addSelectField(form, 'custpage_location', 'Location', null, locationList);
            location.isMandatory = true;
            var prefLocation = library.addSelectField(form, 'custpage_plocation', 'Preferred Location', null, locationList);

            if ((configuration.custrecord_bom_config_source_subsidiary == true ||
                configuration.custrecord_bom_config_source_subsidiary == 'T') && !!salesOrderLocation) {
                location.defaultValue = salesOrderLocation;
                prefLocation.defaultValue = salesOrderLocation;
            } else {
                prefLocation.defaultValue = configuration.custrecord_bom_config_preferred_location;
                location.defaultValue = configuration.custrecord_bom_config_preferred_location;
            }
            var costingMethod = library.addSelectField(form, 'custpage_costing_method', 'Costing Method', null, [
                {'id': 'STANDARD', 'name': 'Standard'},
                {'id': 'AVG', 'name': 'Average'},
                {'id': 'FIFO', 'name': 'FIFO'},
                {'id': 'LIFO', 'name': 'LIFO'},
            ]);
            var costingMethodDefault = library.COSTING_METHOD_MAP[configuration.custrecord_bom_config_pref_cosst_method];
            costingMethod.defaultValue = costingMethodDefault || 'AVG';

            var taxSch = library.addSelectField(form, 'custpage_tax_schedule', 'Tax Schedule', null, [
                {'id': '', 'name': ''},
                {'id': '3', 'name': 'ns_pos_taxschedule'},
                {'id': '1', 'name': 'S1'},
                {'id': '2', 'name': 'S2'},
            ]);
            taxSch.defaultValue = configuration.custrecord_bom_config_pref_tax_sch;

            if (!salesOrderSubsidiary && isShowConfigurationDropDown() === 'T') {
                var config = library.addSelectField(form, 'custpage_config', 'Configuration', 'customrecord_bom_configuration', null);
                if (!!configuration) {
                    config.defaultValue = configuration.id;
                }
            }

            library.addAccountFields(form, 'custpage_tabaccount', configuration);
            if (!entity) {
                library.addButton(form, "custpage_commit", "Commit", "commitItem");
            }
            if (!!entity) {
                library.addButton(form, "custpage_save", "Add BOM", "saveItem");
            } else {
                library.addButton(form, "custpage_save", "Save", "saveItem");
            }
            var sublist = library.addSublistToForm(form, 'custpage_tabline', "_");
            library.addButton(sublist, "custpage_add_items", "Add Items", "showPopup", "custpage_tabline");
            library.addButton(sublist, "custpage_add_assembly_items", "Create Sub-Assembly", "showSubAssemblyTab", "custpage_tabline");

            var tempField = library.addTextField(form, 'custpage_bom_names', ui.FieldType.TEXT, 'Committed BOM List');
            if (!!entity) {
                tempField.updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });
            } else {
                tempField.updateDisplayType({
                    displayType: ui.FieldDisplayType.DISABLED
                });
            }

            var JSONTempField = library.addTextField(form, 'custpage_json', ui.FieldType.TEXTAREA, 'Committed BOM List');
            JSONTempField.updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });

            createFormControl(context, form, configuration, params, true, "custpage_tabsubbom");

            library.addSelectField(form, 'custpage_template', 'Template');
            // Code addition for Pricing
            library.addSelectField(form, 'custpage_currency', 'Currency', 'currency', null);
            library.addSelectField(form, 'custpage_pricelevel', 'Price Level', 'pricelevel', null);
            library.addTextField(form, 'custpage_rate', 'text', 'Rate');
            context.response.writePage({pageObject: form});
        }

        function createFormControl(context, form, configuration, params, isChild, tab) {
            var subIdentity = "_";
            if (isChild) {
                subIdentity = "_sub_";
            }
            //BOM Item
            var _sublist = library.addSublistToForm(form, tab, subIdentity);
            var _itemName = library.addTextField(form, 'custpage' + subIdentity + 'sku', ui.FieldType.TEXT, 'Item/BOM Name', tab);
            _itemName.isMandatory = true;
            var _unitType = library.addSelectField(form, 'custpage' + subIdentity + 'units', 'Unit Type', 'unitstype', null, tab);
            var _description = library.addTextField(form, 'custpage' + subIdentity + 'description', ui.FieldType.TEXTAREA, 'Description', tab);
            var _totalCost = library.addTextField(form, "custpage" + subIdentity + "totalcost", ui.FieldType.TEXT, 'Total Cost', tab);
            var _tempField = library.addTextField(form, 'custpage' + subIdentity + 'bom_names', ui.FieldType.TEXT, 'Committed BOM List', tab);
            _totalCost.updateDisplayType({
                displayType: ui.FieldDisplayType.DISABLED
            });
            _tempField.updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
            var _JSONTempField = library.addTextField(form, 'custpage' + subIdentity + 'json', ui.FieldType.TEXTAREA, 'Committed BOM List', tab);
            _JSONTempField.updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
            library.addButton(_sublist, "custpage" + subIdentity + "add_items", "Add Components", "showPopupForSubBOM", tab);
            library.addButton(_sublist, "custpage" + subIdentity + "commit", "Commit", "commitChildItem", tab);
        }

        return {
            onRequest: onRequest,
        };
    });
