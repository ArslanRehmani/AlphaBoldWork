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
 * File:        CS_BomGenerator.js
 * Date:        4/18/2019
 *
 *
 ***********************************************************************/
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define(['N/ui/message', 'N/currentRecord', 'N/search', 'N/record', 'N/https', '../lib/BomGenerator_lib.js'],
    function (uiMessage, currentRecord, nsSearch, nsRecord, nsHttps, library) {

        var locations = [];
        var subListItems = [];
        var _totalCost = [];
        var _totalCostSubBOM = [];
        var _errorMsg = null;
        var loaderDiv = null;

        /**
         * Sets the quantity by default 1 for components item.
         *
         * @author xxxxxx xxxxxx
         * @param context scriptcontext
         * @returns {boolean} void
         */
        function pageInit(context) {
            locations = library.getLocation();
            context.currentRecord.setCurrentSublistValue({
                sublistId: 'custpage_sublist',
                fieldId: 'custpage_qty',
                value: 1,
                ignoreFieldChange: true,
            });

            var iframe = window.document.createElement("iframe");
            iframe.id = "server_commands";
            iframe.name = "server_commands";
            iframe.style = "display: block; position: absolute; visibility: hidden; height: 0px; width: 0px";
            iframe.height = "0";
            iframe.title = "0";
            window.document.body.appendChild(iframe);

            loaderDiv = window.document.createElement("div");
            loaderDiv.name = "loaderDiv";
            //loaderDiv.innerText = "Please Wait.."
            loaderDiv.style = "display:none;position:fixed; z-index:1000;top:0;left:0;height:100%;width:100%;background: rgba( 255, 255, 255, .8 ) url('https://www.point-s.co.uk/application/themes/point-sv2/assets/img/ajax_loader_green_128.gif')50% 50%no-repeat;";
            window.document.body.appendChild(loaderDiv);

            var error = context.currentRecord.getValue({fieldId: "custpage_hidden_error"});
            if (!!error) {
                var titleHeading = jQuery('.uir-page-title-firstline');
                var errorDiv = window.document.createElement("p");
                errorDiv.name = "txt_error";
                errorDiv.id = "txt_error";
                errorDiv.innerText = error;
                errorDiv.style = "color: red;font-size: 25px;text-align: left;";
                titleHeading.append(errorDiv);
            }

            var temp = context.currentRecord.getValue({fieldId: "custpage_customfields"});
            if (!!temp) {
                var _fields = JSON.parse(temp);
                for (var i = 0; i < 10000; i++) {
                    var id = "custpage_customfield_" + i.toString();
                    var field = context.currentRecord.getField({fieldId: id});
                    if (!!field) {
                        if (_fields[i].custrecord_ab_custom_field_type.toLowerCase() == "checkbox" && _fields[i].custrecord_ab_custom_field_static_value === true) {
                            context.currentRecord.setValue({
                                fieldId: id,
                                value: _fields[i].custrecord_ab_custom_field_static_value
                            })
                        }
                    } else {
                        break;
                    }
                }
            }


        }

        function validateLine(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var item = currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: sublistName == "custpage_sub_sublist" ? "custpage_sub_item" : 'custpage_item'
            });
            if (!item) {
                return false;
            } else {
                return true;
            }
        }

        function validateDelete(context) {
            setTimeout(function () {
                if (context.sublistId === "custpage_sublist") {
                    var count = context.currentRecord.getLineCount({sublistId: context.sublistId});
                    _totalCost = [];
                    if (count == 0) {
                        context.currentRecord.setValue({"fieldId": "custpage_totalcost", value: 0})
                    }
                    for (var i = 0; i < count; i++) {
                        context.currentRecord.selectLine({
                            sublistId: context.sublistId,
                            line: i
                        });
                        var _qty = context.currentRecord.getCurrentSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custpage_qty',
                        });
                        var itemId = context.currentRecord.getCurrentSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custpage_item',
                        });
                        var averagecost = context.currentRecord.getCurrentSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custpage_partcost'
                        });
                        if (!!itemId && !!averagecost) {
                            averagecost = parseFloat(averagecost).toFixed(2);
                            var totalCost = (i === 0 ? 0 : parseFloat(context.currentRecord.getValue({"fieldId": "custpage_totalcost"}) || "0"));
                            var previousCost = _totalCost[itemId];
                            if (!!previousCost) {
                                totalCost -= previousCost;
                            } else {
                                _totalCost[itemId] = parseFloat(averagecost * _qty).toFixed(2);
                            }
                            totalCost += parseFloat(averagecost * _qty)
                            context.currentRecord.setValue({
                                "fieldId": "custpage_totalcost",
                                value: totalCost.toFixed(2)
                            })
                        }
                    }
                } else if (context.sublistId === "custpage_sub_sublist") {
                    var count = context.currentRecord.getLineCount({sublistId: context.sublistId});
                    _totalCostSubBOM = [];
                    if (count == 0) {
                        context.currentRecord.setValue({"fieldId": "custpage_sub_totalcost", value: 0})
                    }
                    for (var i = 0; i < count; i++) {
                        context.currentRecord.selectLine({
                            sublistId: context.sublistId,
                            line: i
                        });
                        var _qty = context.currentRecord.getCurrentSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custpage_sub_qty',
                        });
                        var itemId = context.currentRecord.getCurrentSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custpage_sub_item',
                        });
                        var averagecost = context.currentRecord.getCurrentSublistValue({
                            sublistId: context.sublistId,
                            fieldId: 'custpage_sub_partcost'
                        });
                        if (!!itemId && !!averagecost) {
                            averagecost = parseFloat(averagecost).toFixed(2);
                            var totalCost = (i === 0 ? 0 : parseFloat(context.currentRecord.getValue({"fieldId": "custpage_sub_totalcost"}) || "0"));
                            var previousCost = _totalCostSubBOM[itemId];
                            if (!!previousCost) {
                                totalCost -= previousCost;
                            } else {
                                _totalCostSubBOM[itemId] = parseFloat(averagecost * _qty).toFixed(2);
                            }
                            totalCost += parseFloat(averagecost * _qty);
                            context.currentRecord.setValue({
                                "fieldId": "custpage_sub_totalcost",
                                value: totalCost.toFixed(2)
                            })
                        }
                    }
                }
            }, 500);
            return true;
        }

        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        }

        /**
         * Sets the location list with filter subsidiary.
         *
         * @author xxxxxx xxxxxx
         * @param context scriptcontext
         * @returns {boolean} void
         */
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var fieldName = context.fieldId;
            if (fieldName === 'custpage_config') {
                var configuration = currentRecord.getValue({"fieldId": fieldName});
                window.location = updateQueryStringParameter(window.location.href, 'configId', configuration);
                return;
            } else if (fieldName == "custpage_subsidiary") {
                debugger;
                if (locations.length > 0) {
                    var subsidiary = currentRecord.getText({"fieldId": "custpage_subsidiary"});
                    var subs = subsidiary.split(":");
                    subsidiary = subs[subs.length - 1].trim();
                    var temp = library.getLocation(subsidiary);
                    var locationField = currentRecord.getField({"fieldId": "custpage_location"});
                    locationField.removeSelectOption(null);
                    locationField = library.insertSelectOPtions(locationField, temp);

                    var pLocationField = currentRecord.getField({"fieldId": "custpage_plocation"});
                    pLocationField.removeSelectOption(null)
                    pLocationField = library.insertSelectOPtions(pLocationField, temp);
                }
            } else if (fieldName === 'custpage_qty') {
                currentRecord.selectLine({
                    sublistId: context.sublistId,
                    line: context.line
                });
                var _qty = currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custpage_qty',
                });
                var itemId = currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custpage_item',
                });
                var averagecost = currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custpage_partcost'
                });
                if (!!itemId && !!averagecost) {
                    averagecost = parseFloat(averagecost).toFixed(2);
                    var totalCost = parseFloat(currentRecord.getValue({"fieldId": "custpage_totalcost"}) || "0");
                    var previousCost = _totalCost[itemId];
                    if (!!previousCost) {
                        totalCost -= previousCost;
                    }
                    _totalCost[itemId] = parseFloat(averagecost * _qty);
                    totalCost += parseFloat(averagecost * _qty);
                    currentRecord.setValue({"fieldId": "custpage_totalcost", value: totalCost})
                }
            } else if (fieldName === 'custpage_sub_qty') {
                currentRecord.selectLine({
                    sublistId: context.sublistId,
                    line: context.line
                });
                var _qty = currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custpage_sub_qty',
                });
                var itemId = currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custpage_sub_item',
                });
                var averagecost = currentRecord.getCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'custpage_sub_partcost'
                });
                if (!!itemId && !!averagecost) {
                    averagecost = parseFloat(averagecost).toFixed(2);
                    var totalCost = parseFloat(currentRecord.getValue({"fieldId": "custpage_sub_totalcost"}) || "0");
                    var previousCost = _totalCostSubBOM[itemId];
                    if (!!previousCost) {
                        totalCost -= previousCost;
                    }
                    _totalCostSubBOM[itemId] = parseFloat(averagecost * _qty).toFixed(2);
                    totalCost += parseFloat(averagecost * _qty);
                    currentRecord.setValue({"fieldId": "custpage_sub_totalcost", value: totalCost.toFixed(2)})
                }
            }
        }

        /**
         * Sets the quantity by default 1 for components item.
         *
         * @author xxxxxx xxxxxx
         * @param context scriptcontext
         * @returns {boolean} void
         */
        function lineInit(context) {
            if (context.sublistId == 'custpage_sublist') {
                // context.currentRecord.setCurrentSublistValue({
                //     sublistId: 'custpage_sublist',
                //     fieldId: 'custpage_qty',
                //     value: 1,
                //     ignoreFieldChange: true,
                // });
            }
        }

        /**
         * Commit BOM record into JSON
         *
         * @author xxxxxx xxxxxx
         * @param currentRecord nlobjRecord
         * @returns {boolean} void
         */
        function commitItem(currentRecord, doNotShowMessage, doNotReset) {
            try {
                var oldJSON = currentRecord.getValue({
                    fieldId: 'custpage_json',
                }) || {};
                var itemSku = currentRecord.getValue({
                    fieldId: 'custpage_sku',
                });
                var SubBomJSON = null;
                if (!itemSku) {
                    var message = "";
                    if (!itemSku) {
                        message = "BOM name cannot be empty.";
                    }
                    var saveMsg = uiMessage.create({
                        title: 'Error',
                        message: message,
                        type: uiMessage.Type.ERROR,
                    });
                    saveMsg.show({
                        duration: 5000,
                    });
                    return false;
                }
                if (!library.isEmpty(oldJSON)) {
                    oldJSON = JSON.parse(oldJSON);
                }
                var status = true;
                try {
                    var subItemSku = currentRecord.getValue({
                        fieldId: 'custpage_sub_sku',
                    });
                    if (!!subItemSku) {
                        var result = confirm("We found uncommitted Sub-Assembly data, Do you want to commit Sub-Assembly data before commit BOM?");
                        if (result) {
                            status = commitChildItem(currentRecord, true, true);
                            return false;
                        }
                    }
                    // if (!status) {
                    //     return status;
                    // }
                    // SubBomJSON = currentRecord.getValue({
                    //     fieldId: 'custpage_sub_json',
                    // }) || null;
                    // if (!!SubBomJSON && !library.isEmpty(SubBomJSON)) {
                    //     SubBomJSON = JSON.parse(SubBomJSON);
                    // }
                } catch (ex) {
                    console.log(JSON.stringify(ex));
                }
                var itemCount = currentRecord.getLineCount({
                    sublistId: 'custpage_sublist',
                });
                var bomJSON = createBOMJSON(currentRecord);
                if (bomJSON.lines.length == 0) {
                    var saveMsg = uiMessage.create({
                        title: 'Error',
                        message: "BOM Compnonents is mandatory",
                        type: uiMessage.Type.ERROR,
                    });
                    saveMsg.show({
                        duration: 5000,
                    });
                    return false;
                }
                if (!!SubBomJSON) {
                    bomJSON.childs = SubBomJSON;
                    //currentRecord.setValue({"fieldId": "custpage_totalcost", value: totalCost})
                }
                oldJSON[itemSku] = bomJSON;
                if (!doNotReset) {
                    page_reset();
                }
                var oldData = currentRecord.getValue({"fieldId": "custpage_bom_names"});
                oldData = Object.keys(oldJSON).join();
                currentRecord.setValue({"fieldId": "custpage_bom_names", value: oldData});
                currentRecord.setValue({
                    fieldId: 'custpage_json',
                    value: JSON.stringify(oldJSON),
                });
                if (!doNotShowMessage) {
                    var saveMsg = uiMessage.create({
                        title: 'Success',
                        message: "BOM is committed successfully...",
                        type: uiMessage.Type.INFORMATION,
                    });
                    saveMsg.show({
                        duration: 2000,
                    });
                }
                _totalCost = [];
                _totalCostSubBOM = [];
                return true;
            } catch (e) {
                console.log(JSON.stringify(e));
                var errorMsg = uiMessage.create({
                    title: 'ERRPR',
                    message: e.message,
                    type: uiMessage.Type.ERROR,
                });
                errorMsg.show({
                    duration: 10000,
                });
                return false;
            }
        }

        /**
         * Commit Sub BOM record into JSON
         *
         * @author xxxxxx xxxxxx
         * @param currentRecord nlobjRecord
         * @returns {boolean} void
         */
        function commitChildItem(currentRecord, doNotShowMessage, doNotReset) {
            try {
                var oldJSON = currentRecord.getValue({
                    fieldId: 'custpage_sub_json',
                }) || {};
                var itemSku = currentRecord.getValue({
                    fieldId: 'custpage_sub_sku',
                });
                var parentItemSKU = currentRecord.getValue({
                    fieldId: 'custpage_sku',
                });

                if (!itemSku) {
                    var message = "";
                    if (!itemSku) {
                        message = "Sub-Assembly name cannot be empty.";
                    }
                    alert(message);
                    return false;
                } else if (!!parentItemSKU &&
                    itemSku.trim().toLocaleLowerCase() == parentItemSKU.trim().toLocaleLowerCase()) {
                    alert("Sub-Assembly name cannot same with parent BOM name");
                    return false;
                }
                if (!library.isEmpty(oldJSON)) {
                    oldJSON = JSON.parse(oldJSON);
                }
                var bomJSON = createSubBOMJSON(currentRecord);
                if (bomJSON.lines.length == 0) {
                    var saveMsg = uiMessage.create({
                        title: 'Error',
                        message: "Sub-Assembly Compnonents is mandatory",
                        type: uiMessage.Type.ERROR,
                    });
                    saveMsg.show({
                        duration: 5000,
                    });
                    return false;
                }

                oldJSON[itemSku] = bomJSON;
                loaderDiv.style.display = "block";
                var temp = parseFloat(currentRecord.getValue({"fieldId": "custpage_sub_totalcost"}) || "0");
                nsHttps.post.promise({
                    body: JSON.stringify(oldJSON),
                    url: library.Configuration.SuitleteUrl,
                })
                    .then(function (response) {
                        var responseBody = JSON.parse(response.body);
                        console.log('responseBody', responseBody);
                        for (var i = 0; i < responseBody.length; i++) {
                            if (!responseBody[i].error) {
                                var id = responseBody[i].assemblyitemId;
                                var lineNum = currentRecord.selectNewLine({
                                    sublistId: 'custpage_sublist'
                                });
                                nlapiSetCurrentLineItemValue("custpage_sublist", "custpage_item", id, true, true);
                                nlapiSetCurrentLineItemValue("custpage_sublist", "custpage_qty", 1, true, true);
                                nlapiSetCurrentLineItemValue("custpage_sublist", "custpage_partcost", temp, true, true);
                                currentRecord.commitLine({
                                    sublistId: 'custpage_sublist'
                                });
                                currentRecord.setValue({
                                    fieldId: 'custpage_sub_sku',
                                    value: ""
                                });
                                _totalCost[id] = temp;
                            } else {
                                alert(responseBody[i].error);
                            }
                        }
                        loaderDiv.style.display = "none";
                        window.document.getElementById('custpage_tablinetxt').click();
                    }).catch(function onRejected(reason) {
                    loaderDiv.style.display = "none";
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason,
                    });
                });

                if (!doNotReset) {
                    var fields = library.CHILD_ASSEMBLY_FIELDS;
                    for (var field in fields) {
                        var sField = fields[field];
                        currentRecord.setValue({fieldId: sField.toString(), value: ""});
                    }
                    currentRecord.setValue({fieldId: "custpage_sub_partcost", value: ""});
                    var count = currentRecord.getLineCount({sublistId: 'custpage_sub_sublist'});
                    for (var l = count - 1; l >= 0; l--) {
                        currentRecord.removeLine({
                            sublistId: 'custpage_sub_sublist',
                            line: l,
                            ignoreRecalc: true
                        })
                    }
                }

                // var oldData = currentRecord.getValue({"fieldId": "custpage_sub_bom_names"});
                // oldData = Object.keys(oldJSON).join();
                // currentRecord.setValue({"fieldId": "custpage_sub_bom_names", value: oldData});
                // currentRecord.setValue({
                //     fieldId: 'custpage_sub_json',
                //     value: JSON.stringify(oldJSON),
                // });

                if (!doNotShowMessage) {
                    var saveMsg = uiMessage.create({
                        title: 'Success',
                        message: "Sub-Assembly is committed successfully...",
                        type: uiMessage.Type.INFORMATION,
                    });
                    saveMsg.show({
                        duration: 2000,
                    });
                }

                var cost = parseFloat(currentRecord.getValue({"fieldId": "custpage_sub_totalcost"}) || "0");
                currentRecord.setValue({
                    "fieldId": "custpage_totalcost",
                    value: parseFloat(currentRecord.getValue({"fieldId": "custpage_totalcost"}) || "0") + cost
                });
                _totalCostSubBOM = [];
                currentRecord.setValue({fieldId: "custpage_sub_totalcost", value: ""});
                return true;
            } catch (e) {
                console.log(JSON.stringify(e));
                alert(e.message);
                return false;
            }
        }

        function showPopup(currentRecord) {
            var searchid = null;
            var extraparams = null;
            window.SubBOM = false;
            var fld = document.getElementsByName("custpage_hidden")[0];
            var subsidiary = currentRecord.getValue({"fieldId": "custpage_subsidiary"});
            var locationField = currentRecord.getValue({"fieldId": "custpage_location"});
            //window.open('/app/common/search/search.nl?l=T&target=item:item&targetinfo=F,salesord&Item_SUBSIDIARY=' + subsidiary + '&usequantity=T' + (searchid != null ? '&e=T&id=' + searchid : '') + '' + ('&searchtype=Item') + '' + (extraparams != null ? extraparams : '') + '', 'selsearch', "width=950px,height=550px");
            var serverURL = "/app/accounting/transactions/salesord.nl?warnnexuschange=F&at=T&rroc=F&includepaypaloverride=T&e=T&q=item&l=T&t=item:item&machine=item&multi=T&si_subsidiary=" + subsidiary;//+"&si_entity=8121&si_shipaddresslist=249595&si_shipzip=W1K%206AH&si_shipstate=London&si_shipcountry=GB&si_exchangerate=1.00&si_currency=1&si_entitynexus=5&si_subsidiary=1&si_location=&si_quantity=&si_nexus=5&si_shipcarrier=&si_units=&si_price=&si_costestimatetype=&si_line=&si_trandate=2%2F17%2F2019&si_shipaddress=London%0A24%20Grosvenor%20Square%0ALondon%20London%20W1K%206AH%0AUnited%20Kingdom%20(GB)";
            window.document.getElementById("server_commands").src = serverURL;
            window.InsertItems = null;
            window.InsertItems = function (items) {
                loaderDiv.style.display = "block";
                var temp = items.split("");
                subListItems = temp;
                var ids = [];
                for (var i = 0; i < subListItems.length; i++) {
                    var array = subListItems[i].split("(");
                    var id = array[0];
                    var qty = 1;
                    if (array.length > 1) {
                        qty = array[1].replace(")", "").trim();
                    }
                    var lineNum = currentRecord.selectNewLine({
                        sublistId: 'custpage_sublist'
                    });
                    nlapiSetCurrentLineItemValue("custpage_sublist", "custpage_qty", qty, true, true);
                    nlapiSetCurrentLineItemValue("custpage_sublist", "custpage_item", id, true, true);
                    currentRecord.commitLine({
                        sublistId: 'custpage_sublist'
                    });
                    ids.push(id);
                }
                // setTimeout(function () {
                if (ids.length > 0) {
                    var filter = [];
                    for (var o = 0; o < ids.length; o++) {
                        filter.push(["internalid", "is", ids[o]]);
                        if (o < ids.length - 1) {
                            filter.push("OR");
                        }
                    }
                    var _qty = 0;
                    var search = library.searchRecord("item", filter, ["averagecost", "cost"]);
                    if (search.length > 0) {
                        for (var o = 0; o < ids.length; o++) {
                            var averagecost = search[o].getValue({name: "averagecost"});
                            if (!!averagecost) {
                                var index = currentRecord.findSublistLineWithValue({
                                    sublistId: "custpage_sublist",
                                    fieldId: 'custpage_item',
                                    value: search[o].id
                                });
                                currentRecord.selectLine({
                                    sublistId: 'custpage_sublist',
                                    line: index
                                });
                                currentRecord.setCurrentSublistValue({
                                    sublistId: "custpage_sublist",
                                    fieldId: 'custpage_partcost',
                                    value: parseFloat(averagecost).toFixed(2)
                                });
                                _qty = currentRecord.getCurrentSublistValue({
                                    sublistId: "custpage_sublist",
                                    fieldId: 'custpage_qty',
                                });
                                currentRecord.commitLine({
                                    sublistId: 'custpage_sublist',
                                });
                            } else {
                                averagecost = search[o].getValue({name: "cost"});
                                if (!!averagecost) {
                                    var index = currentRecord.findSublistLineWithValue({
                                        sublistId: "custpage_sublist",
                                        fieldId: 'custpage_item',
                                        value: search[o].id
                                    });
                                    currentRecord.selectLine({
                                        sublistId: 'custpage_sublist',
                                        line: index
                                    });
                                    _qty = currentRecord.getCurrentSublistValue({
                                        sublistId: "custpage_sublist",
                                        fieldId: 'custpage_qty',
                                    });
                                    currentRecord.setCurrentSublistValue({
                                        sublistId: "custpage_sublist",
                                        fieldId: 'custpage_partcost',
                                        value: parseFloat(averagecost).toFixed(2)
                                    });
                                    currentRecord.commitLine({
                                        sublistId: 'custpage_sublist',
                                    });
                                }
                            }
                            if (!!averagecost) {
                                averagecost = parseFloat(averagecost).toFixed(2);
                                var totalCost = parseFloat(currentRecord.getValue({"fieldId": "custpage_totalcost"}) || "0");
                                var previousCost = _totalCost[search[o].id];
                                if (!!previousCost) {
                                    totalCost -= previousCost;
                                } else {
                                    _totalCost[search[o].id] = parseFloat(averagecost * _qty).toFixed(2);
                                }
                                totalCost += parseFloat(averagecost * _qty);
                                currentRecord.setValue({"fieldId": "custpage_totalcost", value: totalCost.toFixed(2)})
                            }
                        }
                    }
                }
                loaderDiv.style.display = "none";
                // }, 100);

            }
        }

        function showSubAssemblyTab(currentRecord) {
            window.document.getElementById("custpage_tabsubbomtxt").click();
        }

        function showPopupForSubBOM(currentRecord) {
            var searchid = null;
            var extraparams = null;
            var fld = document.getElementsByName("custpage_hidden")[0];
            var subsidiary = currentRecord.getValue({"fieldId": "custpage_subsidiary"});
            var locationField = currentRecord.getValue({"fieldId": "custpage_location"});
            //window.open('/app/common/search/search.nl?l=T&target=item:item&targetinfo=F,salesord&Item_SUBSIDIARY=' + subsidiary + '&usequantity=T' + (searchid != null ? '&e=T&id=' + searchid : '') + '' + ('&searchtype=Item') + '' + (extraparams != null ? extraparams : '') + '', 'selsearch', "width=950px,height=550px");
            var serverURL = "/app/accounting/transactions/salesord.nl?warnnexuschange=F&at=T&rroc=F&includepaypaloverride=T&e=T&q=item&l=T&t=item:item&machine=item&multi=T&si_subsidiary=" + subsidiary;//+"&si_entity=8121&si_shipaddresslist=249595&si_shipzip=W1K%206AH&si_shipstate=London&si_shipcountry=GB&si_exchangerate=1.00&si_currency=1&si_entitynexus=5&si_subsidiary=1&si_location=&si_quantity=&si_nexus=5&si_shipcarrier=&si_units=&si_price=&si_costestimatetype=&si_line=&si_trandate=2%2F17%2F2019&si_shipaddress=London%0A24%20Grosvenor%20Square%0ALondon%20London%20W1K%206AH%0AUnited%20Kingdom%20(GB)";
            window.document.getElementById("server_commands").src = serverURL;
            window.SubBOM = true;
            window.InsertItems = null;
            window.InsertItems = function (items) {
                loaderDiv.style.display = "block";
                var temp = items.split("");
                subListItems = temp;
                var ids = [];
                for (var i = 0; i < subListItems.length; i++) {
                    var array = subListItems[i].split("(");
                    var id = array[0];
                    var qty = 1;
                    if (array.length > 1) {
                        qty = array[1].replace(")", "").trim();
                    }
                    var lineNum = currentRecord.selectNewLine({
                        sublistId: 'custpage_sub_sublist',
                    });
                    nlapiSetCurrentLineItemValue("custpage_sub_sublist", "custpage_sub_qty", qty, true, true);
                    nlapiSetCurrentLineItemValue("custpage_sub_sublist", "custpage_sub_item", id, true, true);
                    currentRecord.commitLine({
                        sublistId: 'custpage_sub_sublist',
                    });
                    ids.push(id);
                }
                //setTimeout(function () {
                if (ids.length > 0) {
                    var filter = [];
                    for (var o = 0; o < ids.length; o++) {
                        filter.push(["internalid", "is", ids[o]]);
                        if (o < ids.length - 1) {
                            filter.push("OR");
                        }
                    }
                    var _qty = 0;
                    var search = library.searchRecord("item", filter, ["averagecost", "cost"]);
                    if (search.length > 0) {
                        for (var o = 0; o < ids.length; o++) {
                            var averagecost = search[o].getValue({name: "averagecost"});
                            if (!!averagecost) {
                                var index = currentRecord.findSublistLineWithValue({
                                    sublistId: "custpage_sub_sublist",
                                    fieldId: 'custpage_sub_item',
                                    value: search[o].id
                                });
                                currentRecord.selectLine({
                                    sublistId: 'custpage_sub_sublist',
                                    line: index
                                });
                                _qty = currentRecord.getCurrentSublistValue({
                                    sublistId: "custpage_sub_sublist",
                                    fieldId: 'custpage_sub_qty',
                                });
                                currentRecord.setCurrentSublistValue({
                                    sublistId: "custpage_sub_sublist",
                                    fieldId: 'custpage_sub_partcost',
                                    value: parseFloat(averagecost).toFixed(2)
                                });
                                currentRecord.commitLine({
                                    sublistId: 'custpage_sub_sublist',
                                });
                            } else {
                                averagecost = search[o].getValue({name: "cost"});
                                if (!!averagecost) {
                                    var index = currentRecord.findSublistLineWithValue({
                                        sublistId: "custpage_sub_sublist",
                                        fieldId: 'custpage_sub_item',
                                        value: search[o].id
                                    });
                                    currentRecord.selectLine({
                                        sublistId: 'custpage_sub_sublist',
                                        line: index
                                    });
                                    _qty = currentRecord.getCurrentSublistValue({
                                        sublistId: "custpage_sub_sublist",
                                        fieldId: 'custpage_sub_qty',
                                    });
                                    currentRecord.setCurrentSublistValue({
                                        sublistId: "custpage_sub_sublist",
                                        fieldId: 'custpage_sub_partcost',
                                        value: parseFloat(averagecost).toFixed(2)
                                    });
                                    currentRecord.commitLine({
                                        sublistId: 'custpage_sub_sublist',
                                    });
                                }
                            }
                            if (!!averagecost) {
                                averagecost = parseFloat(averagecost).toFixed(2);
                                var totalCost = parseFloat(currentRecord.getValue({"fieldId": "custpage_sub_totalcost"}) || "0");
                                var previousCost = _totalCostSubBOM[search[o].id];
                                if (!!previousCost) {
                                    totalCost -= previousCost;
                                } else {
                                    _totalCostSubBOM[search[o].id] = parseFloat(averagecost * _qty).toFixed(2);
                                }
                                totalCost += parseFloat(averagecost * _qty)
                                currentRecord.setValue({
                                    "fieldId": "custpage_sub_totalcost",
                                    value: totalCost.toFixed(2)
                                })
                            }
                        }
                    }
                }
                // }, 100);
                loaderDiv.style.display = "none";
            }
        }

        //addSearchMultipleitem
        /**
         * Save BOM Item
         *
         * @author xxxxxx xxxxxx
         * @param currentRecord nlobjRecord
         * @returns {boolean} void
         */
        function saveItem(currentRecord) {
            if (!!_errorMsg) {
                _errorMsg.hide();
            }
            var sku = currentRecord.getValue({fieldId: 'custpage_sku'});
            var entity = currentRecord.getValue({fieldId: 'custpage_hidden_entity'});
            var status = true;
            if (!!sku && sku.length > 0) {
                if (!!entity) {
                    status = commitItem(currentRecord, true, true);
                } else {
                    var result = confirm("We found uncommitted BOM data, Do you want to commit BOM data before add to Sales Order?");
                    if (result) {
                        status = commitItem(currentRecord, true);
                    }
                }
            }
            if (!status) {
                return false;
            }
            var bomJSON = currentRecord.getValue({
                fieldId: 'custpage_json',
            });
            if (!library.isEmpty(bomJSON)) {
                // var saveMsg = uiMessage.create({
                //     title: 'Please Wait',
                //     message: "Saving BOM...",
                //     type: uiMessage.Type.INFORMATION,
                // });
                // saveMsg.show();
                loaderDiv.style.display = "block";
                bomJSON = JSON.parse(bomJSON);
                var response = sendRequest(bomJSON, function (_saveMsg) {
                    loaderDiv.style.display = "none";
                    // if (!!_saveMsg) {
                    //     _saveMsg.hide();
                    // }
                    //saveMsg.hide();
                    page_reset();
                    //window.close();
                }, null, entity);
                currentRecord.setValue({fieldId: 'custpage_json', value: ''});
                currentRecord.setValue({fieldId: 'custpage_sub_json', value: ''});
            }
        }

        /**
         * Save BOM Item
         *
         * @author xxxxxx xxxxxx
         * @param currentRecord nlobjRecord
         * @returns {boolean} void
         */
        function createBOMJSON(currentRecord) {
            var obj = {};
            var fields = library.ASSEMBLY_FIELDS;

            for (var field in fields) {
                var sField = fields[field];
                obj[field] = currentRecord.getValue({fieldId: sField.toString()});
            }

            obj.customFields = {};
            var temp = currentRecord.getValue({fieldId: "custpage_customfields"});
            if (!!temp) {
                var _fields = JSON.parse(temp);
                for (var i = 0; i < 10000; i++) {
                    var id = "custpage_customfield_" + i.toString();
                    var field = currentRecord.getField({fieldId: id});
                    if (!!field) {
                        var _obj = _fields.filter(function (f) {
                            return f.id === field.id;
                        })[0];
                        obj.customFields[_obj.custrecord_ab_bom_item_mapping_field] = currentRecord.getValue({fieldId: id});
                    } else {
                        break;
                    }
                }
            }
            var componentLines = currentRecord.getLineCount({
                sublistId: 'custpage_sublist',
            });
            obj.lines = [];

            for (var i = 0; i < componentLines; i++) {
                var item = currentRecord.getSublistValue({
                    sublistId: 'custpage_sublist',
                    fieldId: 'custpage_item',
                    line: i,
                });
                var qty = currentRecord.getSublistValue({
                    sublistId: 'custpage_sublist',
                    fieldId: 'custpage_qty',
                    line: i,
                });

                var yield = currentRecord.getSublistValue({
                    sublistId: 'custpage_sublist',
                    fieldId: 'custpage_yield',
                    line: i,
                });

                var item_source = currentRecord.getSublistValue({
                    sublistId: 'custpage_sublist',
                    fieldId: 'custpage_item_source',
                    line: i,
                });

                obj.lines.push({
                    item: item,
                    qty: qty,
                    yield: yield,
                    item_source: item_source
                });
            }

            console.log('obj', obj);

            return obj;
        }

        /**
         * Save SUB BOM Item
         *
         * @author xxxxxx xxxxxx
         * @param currentRecord nlobjRecord
         * @returns {boolean} void
         */
        function createSubBOMJSON(currentRecord) {
            var obj = {};
            var fields = library.CHILD_ASSEMBLY_FIELDS;
            for (var field in fields) {
                var sField = fields[field];
                obj[field] = currentRecord.getValue({fieldId: sField.toString()});
            }
            fields = library.PARENT_ASSEBMLY_FIELDS;
            for (var field in fields) {
                var sField = fields[field];
                obj[field] = currentRecord.getValue({fieldId: sField.toString()});
            }

            var componentLines = currentRecord.getLineCount({
                sublistId: 'custpage_sub_sublist',
            });
            obj.lines = [];

            for (var i = 0; i < componentLines; i++) {
                var item = currentRecord.getSublistValue({
                    sublistId: 'custpage_sub_sublist',
                    fieldId: 'custpage_sub_item',
                    line: i,
                });
                var qty = currentRecord.getSublistValue({
                    sublistId: 'custpage_sub_sublist',
                    fieldId: 'custpage_sub_qty',
                    line: i,
                });

                var yield = currentRecord.getSublistValue({
                    sublistId: 'custpage_sub_sublist',
                    fieldId: 'custpage_sub_yield',
                    line: i,
                });

                var item_source = currentRecord.getSublistValue({
                    sublistId: 'custpage_sub_sublist',
                    fieldId: 'custpage_sub_item_source',
                    line: i,
                });

                obj.lines.push({
                    item: item,
                    qty: qty,
                    yield: yield,
                    item_source: item_source
                });
            }

            console.log('obj', obj);

            return obj;
        }

        /**
         * Send request to Suitelet for creating BOM Item
         *
         * @author xxxxxx xxxxxx
         * @param reqBody List of BOM Item
         * @param success return callback function
         * @returns {boolean} void
         */
        function sendRequest(reqBody, success, saveMsg, entity) {
            nsHttps.post.promise({
                body: JSON.stringify(reqBody),
                url: library.Configuration.SuitleteUrl,
            }).then(function (response) {
                console.log('Response', response);
                var responseBody = JSON.parse(response.body);
                console.log('responseBody', responseBody);
                var error = false;
                var errorList = [];
                var errorString = "";
                var successString = "";
                for (var i = 0; i < responseBody.length; i++) {
                    if (!!responseBody[i].error) {
                        errorString = responseBody[i].error + "\r\n";
                        errorList.push(responseBody[i].error);
                        error = true;
                    } else {
                        // var myMsg = uiMessage.create({
                        //     title: 'Success',
                        //     message: 'Assembly Item Created: ' + responseBody[i].assemblyitemId,
                        //     type: uiMessage.Type.CONFIRMATION,
                        // });
                        // myMsg.show({
                        //     duration: 3000,
                        // });
                        successString = 'Assembly Item Created: ' + responseBody[i].assemblyitemId + "\r\n";
                    }
                }
                if (!!window.opener && !!window.opener.createBom && (errorList.length != responseBody.length)) {
                    window.successfulyAddedBOM = function () {
                        if (!!errorString) {
                            if (!!entity) {
                                _errorMsg = uiMessage.create({
                                    title: 'Error',
                                    message: errorString,
                                    type: uiMessage.Type.ERROR,
                                });
                                _errorMsg.show();
                            } else {
                                var myMsg = uiMessage.create({
                                    title: 'Error',
                                    message: errorString,
                                    type: uiMessage.Type.ERROR,
                                });
                                myMsg.show({
                                    duration: 10000,
                                });
                            }
                        } else if (!!successString) {
                            var myMsg = uiMessage.create({
                                title: 'Success',
                                message: successString,
                                type: uiMessage.Type.CONFIRMATION,
                            });
                            myMsg.show({
                                duration: 3000,
                            });
                        }
                        if (errorList.length == 0) {
                            success(saveMsg);
                        } else {
                            loaderDiv.style.display = "none";
                        }
                    };
                    window.opener.createBom(JSON.stringify(responseBody));
                } else {
                    if (!!errorString) {
                        if (!!entity) {
                            _errorMsg = uiMessage.create({
                                title: 'Error',
                                message: errorString,
                                type: uiMessage.Type.ERROR,
                            });
                            _errorMsg.show();
                        } else {
                            var myMsg = uiMessage.create({
                                title: 'Error',
                                message: errorString,
                                type: uiMessage.Type.ERROR,
                            });
                            myMsg.show({
                                duration: 10000,
                            });
                        }
                    } else if (!!successString) {
                        var myMsg = uiMessage.create({
                            title: 'Success',
                            message: successString,
                            type: uiMessage.Type.CONFIRMATION,
                        });
                        myMsg.show({
                            duration: 3000,
                        });
                    }
                    if (!!window.opener && !!window.opener.createBom) {
                        loaderDiv.style.display = "none";
                    } else {
                        success();
                    }

                }
            }).catch(function onRejected(reason) {
                success();
                log.debug({
                    title: 'Invalid Request: ',
                    details: reason,
                });
            });
        }

        function search(type, filters, columns) {
            return library.searchRecord(type, filters, columns);
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            validateDelete: validateDelete,
            lineInit: lineInit,
            validateLine: validateLine,
            showSubAssemblyTab: function () {
                return showSubAssemblyTab(currentRecord.get());
            },
            showPopupForSubBOM: function () {
                return showPopupForSubBOM(currentRecord.get());
            },
            showPopup: function () {
                return showPopup(currentRecord.get());
            },
            commitItem: function () {
                return commitItem(currentRecord.get());
            },
            commitChildItem: function () {
                return commitChildItem(currentRecord.get());
            },
            saveItem: function () {
                return saveItem(currentRecord.get());
            },
        };
    }
)
;
