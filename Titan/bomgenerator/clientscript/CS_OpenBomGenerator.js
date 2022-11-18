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
 * File:        CS_OpenBomGenerator.js
 * Date:        4/18/2019
 *
 *
 ***********************************************************************/
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define(['N/currentRecord', 'N/ui/message', '../lib/BomGenerator_lib.js'],
    function (currentRecord, uiMessage, lib) {

        var _alert = null;
        var _popup = null;

        /**
         * .
         *
         * @author xxxxxx xxxxxx
         * @param context scriptcontext
         * @returns {boolean} void
         */
        function pageInit(context) {

        }

        //Call from suitelet
        //Param Data : JSON object, list of booms
        function createBomInternal(data, currentRecord) {
            try {
                _alert = window.alert;
                window.alert = function () {
                };
                //console.log('Create Bom', data);
                var boomList = JSON.parse(data);
                for (var i = 0; i < boomList.length; i++) {
                    console.log('commitLine', "Start");
                    var lineNum = currentRecord.selectNewLine({
                        sublistId: 'item',
                    });
                    var boom = boomList[i];
                    console.log('lineNum', lineNum);
                    nlapiSetCurrentLineItemValue("item", "item", boom.assemblyitemId, true, true);
                    nlapiSetCurrentLineItemValue("item", "rate", 1, true, true);
                    nlapiSetCurrentLineItemValue("item", "location", boom.location, true, true);
                    nlapiCommitLineItem("item");
                    console.log('commitLine', "End");
                }
                setTimeout(function () {
                    window.alert = _alert;
                    _popup.successfulyAddedBOM();
                }, 100);
            } catch (e) {
                window.alert = _alert;
                alert(e.message);
            }
        }

        // function attachedToSalesOrder(boom, currentRecord, i, boomList) {
        //     // if (i > (boomList.length - 1)) {
        //     //     window.alert = _alert;
        //     //     _popup.successfulyAddedBOM();
        //     //     return true;
        //     // }
        //
        // }

        function importBomGenerator(){
            var rec = currentRecord.get();
            var subsidiary = rec.getValue({'fieldId': 'subsidiary'});
            var entity = rec.getValue({'fieldId': 'entity'});
            var location = rec.getValue({'fieldId': 'location'});
            var department = rec.getValue({'fieldId' : 'department'});
            var _class = rec.getValue({'fieldId' : 'class'});

            if (!!entity && !!subsidiary && !!location) {
            } else {
                var message = "";
                if (!entity) {
                    message = "Please select Customer.";
                } else if (!subsidiary) {
                    message = "Please select Subsidiary.";
                }
                else if (!location) {
                    message = "Please select Location.";
                }
                var saveMsg = uiMessage.create({
                    title: 'Error',
                    message: message,
                    type: uiMessage.Type.ERROR,
                });
                saveMsg.show({
                    duration: 5000,
                });
                return;
            }
            var scriptURL = lib.Configuration.ImportBOMSuitleteUrl + '&recid=' + rec.id + '&subsidiary=' + subsidiary + "&entity=" + entity + "&location=" + location;
            scriptURL += "&department=" + department + "&classification=" + _class;
            _popup = window.open(scriptURL, 'bom generator', 'width=1200px,height=600px');
            window.createBom = function (data) {
                createBomInternal(data, currentRecord.get());
            };
        }


        //Open suitelete for adding boom generator
        function showBomGenerator() {
            var rec = currentRecord.get();
            var subsidiary = rec.getValue({'fieldId': 'subsidiary'});
            var location = rec.getValue({'fieldId': 'location'});
            var entity = rec.getValue({'fieldId': 'entity'});
            var department = rec.getValue({'fieldId' : 'department'});
            var _class = rec.getValue({'fieldId' : 'class'});

            if (!!entity && !!subsidiary) {
            } else {
                var message = "";
                if (!entity) {
                    message = "Please select Customer.";
                } else if (!subsidiary) {
                    message = "Please select Subsidiary.";
                }
                var saveMsg = uiMessage.create({
                    title: 'Error',
                    message: message,
                    type: uiMessage.Type.ERROR,
                });
                saveMsg.show({
                    duration: 5000,
                });
                return;
            }
            var scriptURL = lib.Configuration.SuitleteUrl + '&recid=' + rec.id + '&subsidiary=' + subsidiary + "&entity=" + entity +"&location="+location;
            scriptURL += "&department=" + department + "&classification=" + _class;
            _popup = window.open(scriptURL, 'bom generator', 'width=1000px,height=600px');
            window.createBom = function (data) {
                createBomInternal(data, currentRecord.get());
            };
        }

        return {
            showBomGenerator: showBomGenerator,
            importBomGenerator : importBomGenerator,
            pageInit: pageInit,
            createBom: function (data) {
                return createBomInternal(data, currentRecord.get());
            },
        };
    });
