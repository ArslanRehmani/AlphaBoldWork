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
 * Date:        5/8/2019
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
        var Configuration = {
            ScriptId: 'customscript_se_bold_mass_update_tool',
            DeploymentId: 'customdeploy_se_bold_mass_update_dep',
            BundleId: runtime.getCurrentScript().getParameter("custscript_bundleid"),
            ExternalSystemConfig: [{
                internalId: "1",
                systemDisplayName: "BOLD Mass Update Tool",
                systemType: "dashboard",
                url: ""
            }],
            BaseURL: "/c." + runtime.accountId + '/' + getBundleId(),
            AccountId: runtime.accountId
        };

        function getBundleId() {
            try {
                var scriptObj = runtime.getCurrentScript();
                var bundleArr = scriptObj.bundleIds;
                var bundleId = !!bundleArr && bundleArr.length > 0 ? bundleArr[0] : 0;
                if (!bundleId || bundleId.length <= 0) {
                    return "suitebundle000001/util/";
                } else {
                    return "suitebundle" + bundleId.replace('suitebundle', '') + '/boldmassupdatetool/util/';
                }
            } catch
                (e) {
                log.error('Error', e);
            }
        }

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
                                        "subsidiary": "1"
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
                if (!!subsidiaryId) {
                    return loc.subsidiary == subsidiaryId || isNonOneWorldAccount
                } else {
                    return true;
                }
            });
        }

        function addTextField(form, id, type, label) {
            return form.addField({
                id: id,
                type: type,
                label: label,
            });
        }

        function addSelectField(form, id, label, source, options) {
            var selectField = form.addField({
                id: id,
                type: "select",
                label: label,
                source: source ? source : null
            });
            selectField = addSelectOPtions(selectField, options);
            return selectField;
        }
        function addMultiSelectField(form, id, label, source, options) {
            var selectField = form.addField({
                id: id,
                type: "multiselect",
                label: label,
                source: source ? source : null
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

        function getConfiguration() {
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

                    parsedResults.push(obj);
                }
            } catch (e) {
                log.error('Error -- getConfiguration', e);
            }

            log.debug('parsed Results', parsedResults);

            return parsedResults.length > 0 ? parsedResults[0] : {};
        }

        function loadSearch(id) {
            if (!!id) {
                var search = nsSearch.load({
                    id: id,
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

                    log.debug('loadSearch', "End");
                    return searchResults || [];
                }
            } else {
                log.debug("Error", "Saved Search id is not valid");
                return [];
            }
        }

        function searchRecord(type, filters, columns) {
            if (!!type) {
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
            } else {
                log.debug("Error", "Record Type is not valid");
                return [];
            }
        }

        function addSublistToForm(form, tab) {

            var sublist = form.addSublist({
                id: 'custpage_sublist',
                type: "inlineeditor",
                label: 'Lines (Components)',
                tab: tab,
            });

            sublist.addField({
                id: 'custpage_item',
                type: 'select',
                label: 'Item',
                source: 'item',
            });
            sublist.addField({
                id: 'custpage_qty',
                type: "integer",
                label: 'Qty',
            });
            sublist.addField({
                id: 'custpage_yield',
                type: "text",
                label: 'Yield',
            });
            var hidden = sublist.addField({
                id: 'custpage_hidden',
                type: "text",
                label: 'Yield',
            });
            hidden.updateDisplayType({
                displayType: "hidden"
            });

            addSelectField(sublist, 'custpage_item_source', 'Item Source', null, [
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

        /**
         * Gets the value of object, based on row and column
         * @param records
         * @returns {*}
         */
        function getObjects(records) {
            var result = [];
            if (!!records && records.length > 0) {
                var cols = records[0].getAllColumns();
                var columnNames = [];
                for (var j = 0; j < cols.length; j++) {
                    var item = cols[j];
                    var label = item.getLabel();
                    var nm = null;
                    if (!!label) {
                        label = label.toLowerCase();
                        label = label.indexOf('_') == 0 ? label.substr(1) : label;
                        label = label.trim().replace(/ /gi, '_');
                        nm = label;
                    } else {
                        nm = item.getName();
                    }
                    columnNames.push(nm);
                }
                for (var x = 0; x < records.length; x++) {
                    result.push(this.getObject(records[x], cols, columnNames));
                }
            }
            return result;
        }

        /**
         * Gets the value of object, based on row and column
         * @param row
         * @param cols
         * @param columnNames
         * @returns {*}
         */
        function getObject(row, cols, columnNames) {
            var obj = null;
            if (row) {
                obj = {id: row.getId(), recordType: row.getRecordType()};
                var nm = null, item, val, text;
                for (var x = 0; x < cols.length; x++) {
                    item = cols[x];
                    nm = (columnNames && columnNames[x]) || item.getName();
                    val = row.getValue(item);
                    text = row.getText(item);

                    if (!!text && val != text) {
                        obj[nm] = {text: text, value: val};
                    } else {
                        obj[nm] = val;
                    }
                }
            }
            return obj;
        }


        return {
            Configuration: Configuration,
            searchRecord: searchRecord,
            getObjects: getObjects,
            getObject: getObject,
            getConfiguration: getConfiguration,
            addTextField: addTextField,
            addSelectField: addSelectField,
            insertSelectOPtions: insertSelectOPtions,
            addTab: addTab,
            loadSearch: loadSearch,
            addAccountFields: addAccountFields,
            addButton: addButton,
            addSublistToForm: addSublistToForm,
            addMultiSelectField: addMultiSelectField,
            isEmpty: isEmpty,
            getLocation: getLocation

        };
    }
);


