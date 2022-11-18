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
 * File:        BomGenerator_lib.js
 * Date:        4/18/2019
 *
 *
 ***********************************************************************/
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define(['N/search', 'N/record', 'N/https', 'N/runtime'],
    function (nsSearch, nsRecord, nsHttps, runtime) {

        var Location = [];
        var CSV_BODY_FIELDS = {
            itemid: 'SKU',
            description: 'Description',
            purchasedescription: 'Description',
            salesdescription: 'Description',
        };
        var CHILD_ASSEMBLY_FIELDS = {
            itemid: 'custpage_sub_sku',
            unitstype: 'custpage_sub_units',
            description: 'custpage_sub_description'
        };
        var PARENT_ASSEBMLY_FIELDS = {
            subsidiary: 'custpage_subsidiary',
            location: 'custpage_location',
            preferredlocation: 'custpage_plocation',
            costingmethod: 'custpage_costing_method',
            taxschedule: 'custpage_tax_schedule',
            cogsaccount: 'custpage_cogs_account',
            assetaccount: 'custpage_asset_account',
            incomeaccount: 'custpage_income_account',
            gainlossaccount: 'custpage_gain_loss_account',
            billpricevarianceacct: 'custpage_price_variance_account',
            billqtyvarianceacct: 'custpage_quantity_price_vari_acc',
            billexchratevarianceacct: 'custpage_exchange_rate_vari_acc',
            custreturnvarianceaccount: 'custpage_customer_return_vari_acc',
            vendreturnvarianceaccount: 'custpage_vendor_return_vari_acc',
            prodqtyvarianceacct: 'custpage_prod_qty_vari_acc',
            deferredrevenueaccount: 'custpage_deferred_rev_acc',
            prodpricevarianceacct: 'custpage_prod_price_vari_acc',
            purchasepricevarianceacct: 'custpage_purchase_price_vari_acc',
            unbuildvarianceaccount: 'custpage_unbuild_vari_acc',
            dropshipexpenseaccount: 'custpage_dropship_expense_acc',
            wipvarianceacct: 'custpage_wipe_cost_vari_acc',
            scrapacct: 'custpage_scrap_account',
            wipacct: 'custpage_wip_account'
        };
        var ASSEMBLY_FIELDS = {
            itemid: 'custpage_sku',
            unitstype: 'custpage_units',
            parent: 'custpage_parent',
            description: 'custpage_description',
            purchasedescription: 'custpage_description',
            subsidiary: 'custpage_subsidiary',
            location: 'custpage_location',
            preferredlocation: 'custpage_plocation',
            costingmethod: 'custpage_costing_method',
            taxschedule: 'custpage_tax_schedule',
            //Account Fields
            cogsaccount: 'custpage_cogs_account',
            assetaccount: 'custpage_asset_account',
            incomeaccount: 'custpage_income_account',
            gainlossaccount: 'custpage_gain_loss_account',
            billpricevarianceacct: 'custpage_price_variance_account',
            billqtyvarianceacct: 'custpage_quantity_price_vari_acc',
            billexchratevarianceacct: 'custpage_exchange_rate_vari_acc',
            custreturnvarianceaccount: 'custpage_customer_return_vari_acc',
            vendreturnvarianceaccount: 'custpage_vendor_return_vari_acc',
            prodqtyvarianceacct: 'custpage_prod_qty_vari_acc',
            deferredrevenueaccount: 'custpage_deferred_rev_acc',
            prodpricevarianceacct: 'custpage_prod_price_vari_acc',
            purchasepricevarianceacct: 'custpage_purchase_price_vari_acc',
            unbuildvarianceaccount: 'custpage_unbuild_vari_acc',
            dropshipexpenseaccount: 'custpage_dropship_expense_acc',
            wipvarianceacct: 'custpage_wipe_cost_vari_acc',
            scrapacct: 'custpage_scrap_account',
            wipacct: 'custpage_wip_account'
        };
        var COLUMNS = [
            'custrecord_ab_segment',
            'custrecord_ab_segment_value',
            'custrecord_f3_bom_config_employee',
            'custrecord_bom_config_preferred_location',
            'custrecord_bom_config_preferred_sub',
            'custrecord_bom_config_source_subsidiary',
            'custrecord_bom_config_pref_cosst_method',
            'custrecord_bom_config_cost_center',
            'custrecord_bom_config_pref_tax_sch',
            'custrecord_bom_inactivate_items',
            'custrecord_bom_cogs_account',
            'custrecord_bom_asset_account',
            'custrecord_bom_income_account',
            'custrecord_bom_gain_loss_account',
            'custrecord_bom_price_variance_account',
            'custrecord_bom_wipe_cost_vari_acc',
            'custrecord_bom_scrap_account',
            'custrecord_bom_wip_account',
            'custrecord_bom_quantity_price_vari_acc',
            'custrecord_bom_exchange_rate_vari_acc',
            'custrecord_bom_customer_return_vari_acc',
            'custrecord_bom_vendor_return_vari_acc',
            'custrecord_bom_prod_qty_vari_acc',
            'custrecord_bom_deferred_rev_acc',
            'custrecord_bom_prod_price_vari_acc',
            'custrecord_bom_purchase_price_vari_acc',
            'custrecord_bom_unbuild_vari_acc',
            'custrecord_bom_dropship_expense_acc',
        ];
        var FIELD_MAPPING_COLUMNS = [
            'custrecord_ab_custom_f_m_config',
            'custrecord_ab_bom_item_mapping_field',
            'custrecord_ab_custom_field_label',
            'custrecord_ab_custom_field_type',
            'custrecord_ab_custom_field_static_value',
            'custrecord_ab_custom_field_sourcing',
            'custrecord_ab_custom_field_mandatory',
        ];
        var ACCOUNTS_FIELDS = {
            'COGS Account': 'custpage_cogs_account',
            'Asset Account': 'custpage_asset_account',
            'Income Account': 'custpage_income_account',
            'Gain/Loss Account': 'custpage_gain_loss_account',
            'Price Variance Account': 'custpage_price_variance_account',
            'WIP Cost Variance Account': 'custpage_wipe_cost_vari_acc',
            'Scrap Account': 'custpage_scrap_account',
            'WIP Account': 'custpage_wip_account',
            'Quantity Variance Account': 'custpage_quantity_price_vari_acc',
            'Exchange Rate Variance Account': 'custpage_exchange_rate_vari_acc',
            'Customer Return Variance Account': 'custpage_customer_return_vari_acc',
            'Vendor Return Variance Account': 'custpage_vendor_return_vari_acc',
            'Production Quanity Variance Account': 'custpage_prod_qty_vari_acc',
            'Deferred Revenue Account': 'custpage_deferred_rev_acc',
            'Production Price Variance Account': 'custpage_prod_price_vari_acc',
            'Purchase Price Variance Account': 'custpage_purchase_price_vari_acc',
            'Unbuild Variance Account': 'custpage_unbuild_vari_acc',
            'Dropship Expense Account': 'custpage_dropship_expense_acc',
        };
        var COSTING_METHOD_MAP = {
            '1': 'AVG',
            '2': 'FIFO',
            '3': 'LIFO',
            '6': 'STANDARD',
        };
        var Configuration = {
            'SuitleteUrl': '/app/site/hosting/scriptlet.nl?script=customscript_se_bom_generator&deploy=1',
            'ImportBOMSuitleteUrl': '/app/site/hosting/scriptlet.nl?script=customscript_se_import_bom&deploy=1',
            BundleId: runtime.getCurrentScript().getParameter("custscript_bundleid")
        };

        function getLocation(subsidiaryId) {
            try {
                var isNonOneWorldAccount = false;
                if (!Location || Location.length == 0) {
                    try {
                        var locaitonList = searchRecord("location", ["isinactive", "is", false], ["subsidiary", "name"]);
                        if (!!locaitonList) {
                            for (var i = 0; i < locaitonList.length; i++) {
                                Location.push({
                                    "id": locaitonList[i].id,
                                    "name": locaitonList[i].getValue({name: "name"}),
                                    "subsidiary": locaitonList[i].getValue({name: "subsidiary"})
                                });
                            }
                        }
                    } catch (e) {
                        if (!!e.message && e.message.indexOf('subsidiary')) {
                            var locaitonList = searchRecord("location", ["isinactive", "is", false], ["name"]);
                            if (!!locaitonList) {
                                isNonOneWorldAccount = true;
                                for (var i = 0; i < locaitonList.length; i++) {
                                    Location.push({
                                        "id": locaitonList[i].id,
                                        "name": locaitonList[i].getValue({name: "name"}),
                                        "subsidiary": "Parent Company"
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                log.error("Error from getting location", e);
            }
            return Location.filter(function (loc) {
                if (!!subsidiaryId && subsidiaryId.toLowerCase() != "parent company") {
                    return loc.subsidiary == subsidiaryId || isNonOneWorldAccount
                } else {
                    return true;
                }
            });
        }

        function getSubsidiaries() {
            var Location = [];
            try {
                var locaitonList = searchRecord("subsidiary", ["isinactive", "is", false], ["name"]);
                if (!!locaitonList) {
                    for (var i = 0; i < locaitonList.length; i++) {
                        Location.push({
                            "id": locaitonList[i].id,
                            "name": locaitonList[i].getValue({name: "name"}),
                        });
                    }
                }
            } catch (e) {
                log.error("Error from getting location", e);
            }
            return Location;
        }

        function getDepartments() {
            var Location = [];
            try {
                var locaitonList = searchRecord("department", ["isinactive", "is", false], ["name"]);
                if (!!locaitonList) {
                    for (var i = 0; i < locaitonList.length; i++) {
                        Location.push({
                            "id": locaitonList[i].id,
                            "name": locaitonList[i].getValue({name: "name"}),
                        });
                    }
                }
            } catch (e) {
                log.error("Error from getting location", e);
            }
            return Location;
        }

        function getClasses() {
            var Location = [];
            try {
                var locaitonList = searchRecord("classification", ["isinactive", "is", false], ["name"]);
                if (!!locaitonList) {
                    for (var i = 0; i < locaitonList.length; i++) {
                        Location.push({
                            "id": locaitonList[i].id,
                            "name": locaitonList[i].getValue({name: "name"}),
                        });
                    }
                }
            } catch (e) {
                log.error("Error from getting location", e);
            }
            return Location;
        }

        function addTextField(form, id, type, label, tab) {
            return form.addField({
                id: id,
                type: type,
                label: label,
                container: tab,
            });
        }

        function addSelectField(form, id, label, source, options, tab) {
            var selectField = form.addField({
                id: id,
                type: "select",
                label: label,
                source: source ? source : null,
                container: tab
            });
            selectField = addSelectOPtions(selectField, options);
            return selectField;
        }

        function addSelectOPtions(selectField, options) {
            if (!!options && options.length > 0) {
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    selectField.addSelectOption({
                        value: option.id,
                        text: option.name,
                    });
                }
            }
            return selectField;
        }

        function insertSelectOPtions(selectField, options) {
            if (!!options && options.length > 0) {
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    selectField.insertSelectOption(option.id, option.name);
                }
            }
            return selectField;
        }

        function addTab(form, id, label) {
            form.addTab({
                id: id,
                label: label,
            });
        }

        function addAccountFields(form, tab, configuration) {
            var accountFields = ACCOUNTS_FIELDS;
            for (var label in accountFields) {
                var fld = form.addField({
                    id: accountFields[label],
                    type: "select",
                    source: 'account',
                    label: label,
                    container: tab,
                });
                var key = accountFields[label].replace('custpage', 'custrecord_bom');
                fld.defaultValue = configuration[key];
            }
        }

        function addButton(form, id, label, functionName, tab) {
            return form.addButton({
                id: id,
                label: label,
                functionName: functionName,
                container: tab
            });
        }

        function getConfiguration(params) {
            var parsedResults = [];
            try {
                var results = searchRecord('customrecord_bom_configuration', null, COLUMNS);
                var columns = !!results && results.length > 0 && results[0].columns;
                for (var i = 0; i < results.length; i++) {
                    var obj = {};
                    for (var j = 0; j < columns.length; j++) {
                        var colName = columns[j].name;
                        var val = results[i].getValue({
                            name: colName,
                        });
                        obj[colName] = val || '';
                    }
                    obj.recordType = results[i].type;
                    obj.id = results[i].id;
                    obj.customFields = [];
                    log.debug('customFields', 'Start');
                    var fieldsMapping = searchRecord('customrecord_ab_custom_field_mapping', ['custrecord_ab_custom_f_m_config', 'anyof', obj.id], FIELD_MAPPING_COLUMNS);
                    var _columns = !!fieldsMapping && fieldsMapping.length > 0 && fieldsMapping[0].columns;
                    log.debug('fieldsMapping.length', fieldsMapping.length);
                    for (var o = 0; o < fieldsMapping.length; o++) {
                        var _obj = {};
                        for (var m = 0; m < _columns.length; m++) {
                            var _colName = _columns[m].name;
                            var _val = fieldsMapping[o].getValue({
                                name: _colName,
                            });
                            if (_colName === 'custrecord_ab_custom_field_type' || _colName === 'custrecord_ab_bom_item_mapping_field') {
                                _val = fieldsMapping[o].getText({
                                    name: _colName,
                                });
                            }
                            _obj[_colName] = _val || '';
                        }
                        obj.customFields.push(_obj);
                    }
                    log.debug('customFields', 'End');
                    parsedResults.push(obj);
                }
            } catch (e) {
                log.error('Error -- getConfiguration', e);
            }
            log.debug('parsed Results', parsedResults);
            var configuration = [];
            if (!!params) {
                var subsidiary = params.subsidiary || params.sourceSubsidiary;
                var location = params.location || params.sourceLocation;
                var department = params.department;
                var classification = params.classification;
                var configurationId = params.configId;

                var employee = runtime.getCurrentUser(); //config.custrecord_f3_bom_config_employee;
                log.debug("currentUser", employee);
                if (!!employee && !subsidiary) {
                    var objRecord = nsRecord.load({
                        type: nsRecord.Type.EMPLOYEE,
                        id: employee.id,
                    });
                    subsidiary = objRecord.getValue({fieldId: "subsidiary"})
                    department = objRecord.getValue({fieldId: "department"})
                    classification = objRecord.getValue({fieldId: "class"})
                    location = objRecord.getValue({fieldId: "location"})
                }

                log.debug("subsidiary", subsidiary);
                log.debug("classification", classification);
                log.debug("department", department);
                log.debug("location", location);

                configuration = parsedResults.filter(function (config) {

                    log.debug("config.custrecord_ab_segment", config.custrecord_ab_segment);
                    log.debug("config.custrecord_ab_segment_value", config.custrecord_ab_segment_value);

                    if(!!configurationId && parseInt(configurationId) > 0 && parseInt(configurationId) === parseInt(config.id)){
                        return true;
                    }
                    if(!configurationId) {
                        switch (parseInt(config.custrecord_ab_segment)) {
                            case 1:
                                if (config.custrecord_ab_segment_value == subsidiary) {
                                    return true;
                                }
                                break;
                            case 2:
                                if (config.custrecord_ab_segment_value == classification) {
                                    return true;
                                }
                                break;
                            case 3:
                                if (config.custrecord_ab_segment_value == department) {
                                    return true;
                                }
                                break;
                            case 4:
                                if (config.custrecord_ab_segment_value == location) {
                                    return true;
                                }
                                break;
                            default:
                                return false;
                                break;
                        }
                    }
                });
            } else {
                configuration = parsedResults;
            }
            return configuration.length > 0 ? configuration[0] : {};
        }

        function searchRecord(type, filters, columns) {
            var search = nsSearch.create({
                type: type,
                filters: filters,
                columns: columns,
            });
            var start = 0;

            var searchResults = [];
            var tempResults = search.run().getRange({
                start: start,
                end: start + 1000,
            });

            while (tempResults.length > 0) {
                start = start + 1000;
                searchResults = searchResults.concat(tempResults);
                tempResults = search.run().getRange({
                    start: start,
                    end: start + 1000,
                });
            }

            return searchResults || [];
        }

        function addSublistToForm(form, tab, subIdentity) {

            var sublist = form.addSublist({
                id: 'custpage' + subIdentity + 'sublist',
                type: "inlineeditor",
                label: 'Lines (Components)',
                tab: tab,
            });

            var subListItem = sublist.addField({
                id: 'custpage' + subIdentity + 'item',
                type: 'select',
                label: 'Item',
                source: 'item',
            });
            subListItem.updateDisplayType({
                displayType: "disabled"
            });
            sublist.addField({
                id: 'custpage' + subIdentity + 'qty',
                type: "integer",
                label: 'Qty',
            });
            sublist.addField({
                id: 'custpage' + subIdentity + 'yield',
                type: "text",
                label: 'Yield',
            });
            var cost = sublist.addField({
                id: 'custpage' + subIdentity + 'partcost',
                type: "text",
                label: 'Part Cost',
            });
            cost.updateDisplayType({
                displayType: 'disabled'
            });
            var hidden = sublist.addField({
                id: 'custpage' + subIdentity + 'hidden',
                type: "text",
                label: 'Yield',
            });
            hidden.updateDisplayType({
                displayType: "hidden"
            });

            addSelectField(sublist, 'custpage' + subIdentity + 'item_source', 'Item Source', null, [
                {'id': 'STOCK', 'name': 'Stock'},
                {'id': 'PURCHASE_ORDER', 'name': 'Purchase Order'}]);

            return sublist;
        }

        function isEmpty(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        }

        return {
            CSV_BODY_FIELDS: CSV_BODY_FIELDS,
            CHILD_ASSEMBLY_FIELDS: CHILD_ASSEMBLY_FIELDS,
            PARENT_ASSEBMLY_FIELDS: PARENT_ASSEBMLY_FIELDS,
            ASSEMBLY_FIELDS: ASSEMBLY_FIELDS,
            ACCOUNTS_FIELDS: ACCOUNTS_FIELDS,
            COLUMNS: COLUMNS,
            COSTING_METHOD_MAP: COSTING_METHOD_MAP,
            Configuration: Configuration,
            FIELD_MAPPING_COLUMNS: FIELD_MAPPING_COLUMNS,
            searchRecord: searchRecord,
            getConfiguration: getConfiguration,
            addTextField: addTextField,
            addSelectField: addSelectField,
            insertSelectOPtions: insertSelectOPtions,
            addTab: addTab,
            addAccountFields: addAccountFields,
            addButton: addButton,
            addSublistToForm: addSublistToForm,
            isEmpty: isEmpty,
            getLocation: getLocation,
            getSubsidiaries: getSubsidiaries,
            getDepartments: getDepartments,
            getClasses: getClasses

        };
    });


