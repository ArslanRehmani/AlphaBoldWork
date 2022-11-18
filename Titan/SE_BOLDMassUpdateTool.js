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
 * File:        SE_BOLDMassUpdateTool.js
 * Date:        5/8/2019
 *
 *
 ***********************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget', 'N/record', 'N/runtime', 'N/config', '../lib/BomGenerator_lib.js', 'N/url', 'N/file', 'N/task', 'N/https'],
    function (nsSearch, ui, nsRecord, runtime, config, library, nsUrl, file, task, https) {

        function onRequest(context) {
            try {
                var params = context.request.parameters;
                log.debug('title : parameters',JSON.stringify(params));
                if (!!params.method) {
                    handleApiRequest(context, params.method);
                } else {
                    var indexPageValue;
                    var form = ui.createForm({
                        title: 'BOLD Quick Update',
                    });
                    var html = library.addTextField(form, 'custpage_inlinehtml', ui.FieldType.INLINEHTML, 'HTML');
                    indexPageValue = extractPageContent(params);
                    html.defaultValue = indexPageValue;
                    context.response.writePage({pageObject: form});
                }
            } catch (e) {
                log.error('Error on Request', e);
            }
        }

        function handleApiRequest(context, method) {
            var result = handleRequest(method, context.request, context.response);
            log.debug("result", JSON.stringify(result));

            context.response.addHeader("Content-Type", "application/json");
            context.response.write({
                output: JSON.stringify(result),
            });
        }

        function handleRequest(method, request, response) {
            var result = [];
            switch (method) {
                case 'getRoles':
                    result = getRoles();
                    break;
                case 'getAllSavedSearch':
                    result = getAllSavedSearch(request, response);
                    break;
                case 'getAllRecords':
                    result = getAllRecords(request, response);
                    break;
                case 'executeDeleteRecords':
                    result = executeScript(request, response);
                    break;
                case 'getScriptDeploymentInstances':
                    result = getScriptDeploymentInstances(request, response);
                    break;
                case 'getExecutionLogs' :
                    result = getExecutionLogs(request, response);
                    break;
                case 'executeOpenAndSaveTransaction' :
                    result = executeScript(request, response);
                    break;
                case 'executeUpdateDynamicallyFieldValues' :
                    result = executeScript(request, response);
                    break;
                case 'executeUpdateRecordFields' :
                    result = executeScript(request, response);
                    break;
                case 'executeUpdateRecordLineFields' :
                    result = executeScript(request, response);
                    break;

            }
            return result;
        }

        function getScriptDeploymentInstances(request, response) {
            var finalResponse = [];
            var params = request.parameters;
            var scriptId = params.scriptId;
            var deploymentId = params.deploymentId;

            var search = nsSearch.create({
                type: "scheduledscriptinstance",
                filters:
                    [
                        ["datecreated", "within", "thisweek"],
                        "AND",
                        ["script.scriptid", "startswith", scriptId],
                        "AND",
                        ["scriptdeployment.scriptid", "startswith", deploymentId]
                    ],
                columns:
                    [
                        nsSearch.createColumn({
                            name: "datecreated",
                            sort: nsSearch.Sort.DESC,
                            label: "Date Created"
                        }),
                        nsSearch.createColumn({name: "startdate", label: "Start Date"}),
                        nsSearch.createColumn({name: "enddate", label: "End Date"}),
                        nsSearch.createColumn({name: "queue", label: "Queue"}),
                        nsSearch.createColumn({name: "status", label: "Status"}),
                        nsSearch.createColumn({name: "percentcomplete", label: "Percent Complete"}),
                        nsSearch.createColumn({name: "queueposition", label: "Queue Position"}),
                        nsSearch.createColumn({
                            name: "scriptid",
                            join: "script",
                            label: "Script ID"
                        }),
                        nsSearch.createColumn({
                            name: "scripttype",
                            join: "script",
                            label: "Script Type"
                        })
                    ]
            });
            var results = search.run().getRange({
                start: 0,
                end: 1000,
            });
            if (results != null && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    finalResponse.push({
                        startdate: results[i].getValue({name: "startdate"}),
                        enddate: results[i].getValue({name: "enddate"}),
                        queue: results[i].getValue({name: "queue"}),
                        status: results[i].getValue({name: "status"}),
                        percentcomplete: results[i].getValue({name: "percentcomplete"}),
                        queueposition: results[i].getValue({name: "queueposition"}),
                        queueposition: results[i].getValue({
                            name: "scriptid",
                            join: "script",
                            label: "Script ID"
                        }),
                        queueposition: results[i].getValue({
                            name: "scripttype",
                            join: "script",
                            label: "Script Type"
                        })
                    });
                }
            }
            return finalResponse;
        }

        function getExecutionLogs(request, response) {
            var params = request.parameters;
            var scriptId = params.scriptId;
            var deploymentId = params.deploymentId;

            var finalResponse = [];
            var search = nsSearch.create({
                type: "customrecord_ab_custom_logging",
                filters:
                    ["custrecord_ab_logging_deployment_id", "is", deploymentId],
                columns:
                    [
                        nsSearch.createColumn({name: "custrecord_ab_logging_title", label: "Title"}),
                        nsSearch.createColumn({name: "custrecord_ab_logging_description", label: "Detail"}),
                        nsSearch.createColumn({name: "custrecord_ab_logging_type", label: "Type"}),
                        nsSearch.createColumn({name: "custrecord_ab_logging_date", label: "Date", sort: nsSearch.Sort.DESC}),
                        nsSearch.createColumn({name: "custrecord_ab_logging_time", label: "Time"}),
                    ]
            });
            var results = search.run().getRange({
                start: 0,
                end: 1000,
            });
            if (results != null && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    finalResponse.push({
                        title: results[i].getValue({name: "custrecord_ab_logging_title"}),
                        detail: results[i].getValue({name: "custrecord_ab_logging_description"}),
                        type: results[i].getValue({name: "custrecord_ab_logging_type"}),
                        date: results[i].getValue({name: "custrecord_ab_logging_date"}),
                        time: results[i].getValue({name: "custrecord_ab_logging_time"})
                    });
                }
            }
            return finalResponse;
        }

        function getRoles() {
            var filter = [['isinactive', nsSearch.Operator.IS, false], 'and', ['iscustom', nsSearch.Operator.IS, true]];
            var search = nsSearch.create({
                type: 'role',
                filters: filter,
                columns: ['name']
            });
            var response = [];
            var result = search.run().getRange({
                start: 0,
                end: 1000
            });
            if (!!result && result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    response.push({
                        "id": result[i].id,
                        "name": result[i].getValue({"name": "name"})
                    });
                }
            }
            return response;
        }
        function executeScript(request, response) {
            var result = {};
            var data = request.parameters.data;
            var scriptId = request.parameters.scriptId;
            var deploymentId = request.parameters.deploymentId;
            if(!!data){
                try {
                    data = JSON.parse(data);
                    data.employeeID = runtime.getCurrentUser();
                    data = JSON.stringify(data);
                }catch (e) {
                }
            }
            var params = {
                "custscript_bold_data": data
            };
            var ScheduledScriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                deploymentId: deploymentId,
                scriptId: scriptId,
                params: params
            });
            var scriptTaskId = ScheduledScriptTask.submit();
            var taskStatus = task.checkStatus({
                taskId: scriptTaskId
            });
            result.status = taskStatus.status;
            if (result.status === 'QUEUED' || result.status === 'INQUEUE' || result.status === 'INPROGRESS' || result.status === 'SCHEDULED') {
                result.success = true;
                result.error = false;
            } else {
                result.success = false;
                result.error = true;
            }
            return result;
        }

        function getAllRecords(request, response) {
            var result = [];
            var search = nsSearch.create({
                type: "customrecord_bold_dynamic_records",
                columns:
                    [
                        nsSearch.createColumn({name: "name", label: "Name"}),
                        nsSearch.createColumn({name: "custrecord_bold_dynamic_record_id", label: "Record Id"}),
                        nsSearch.createColumn({name: "custrecord_bold_dynamic_script_level", label: "Access"}),
                        nsSearch.createColumn({name: "custrecord_saved_search_type", label: "Saved Search Type"}),
                    ]
            });
            search.run().each(function (option) {
                result.push({
                    "text": option.getValue({name: "name"}),
                    "id": option.getValue({name: "custrecord_bold_dynamic_record_id"}),
                    "access": option.getValue({name: "custrecord_bold_dynamic_script_level"}),
                    "savedSearchType": option.getValue({name: "custrecord_saved_search_type"})
                });
                return true;
            });
            return result;
        }

        function getAllSavedSearch(request, response) {
            var result = [];
            log.debug('library.Configuration.AccountId', library.Configuration.AccountId);
            var response = https.get({
                url: 'https://' + library.Configuration.AccountId + '.app.netsuite.com/app/common/search/savedsearchlist.csv?csv=Export'
            });
            log.debug('response', response.body.toString());
            var rec = nsRecord.create({type: "customrecord_bold_man_update_tool", isDynamic: true});
            var options = rec.getField({fieldId: "custrecord_bold_man_tool_saved_search"});
            options.getSelectOptions(null).forEach(function (option) {
                result.push({"text": option.text, "id": option.value});
            });
            return result;
        }

        function getFileUrl() {
            try {
                var scriptObj = runtime.getCurrentScript();
                var bundleArr = scriptObj.bundleIds;
                var bundleId = !!bundleArr && bundleArr.length > 0 ? bundleArr[0] : 0;
                if (!bundleId || bundleId.length <= 0) {
                    return "SuiteBundles/Bundle 000001/util/";
                } else {
                    return "SuiteBundles/Bundle " + bundleId.replace('suitebundle', '') + '/boldmassupdatetool/util/';
                }
            } catch
                (e) {
                log.error('Error', e);
            }
        }

        function createSideBar(store_id) {
            try {
                var sidebarFile = file.load({id: getFileUrl() + "dashboard/templates/_sidebar.html"});
                var template = sidebarFile.getContents();
                var productList = library.Configuration.ExternalSystemConfig;
                var stores = [];
                var selectedStore = null;
                for (var i = 0; i < productList.length; i++) {
                    var obj = productList[i];
                    var url = nsUrl.resolveScript({
                        scriptId: library.Configuration.ScriptId,
                        deploymentId: library.Configuration.DeploymentId,
                        returnExternalUrl: true
                    });
                    url = url + '&store_id=' + obj.internalId;
                    obj.url = url;
                    var store = {
                        id: obj.internalId,
                        name: obj.systemDisplayName,
                        systemType: obj.systemType,
                        url: obj.url
                    };
                    stores.push(store);
                    if (store.id == store_id) {
                        selectedStore = store;
                    }
                }
                if (selectedStore == null) {
                    selectedStore = stores && stores[0];
                }
                return {stores: stores, sidebarHtml: template, selectedStore: selectedStore};
            } catch (e) {
                log.error('Error during main createSideBar', e);
            }
            return null;
        }

        function extractPageContent(params) {
            var indexPageValue = '';
            var store_id = "1";
            log.debug({
                title: "extractPageContent () :: ",
                details: getFileUrl()
            })
            var data = file.load({id: getFileUrl() + "dashboard/index.html"});
            indexPageValue = data.getContents();
            var sideBar = createSideBar(store_id);
            indexPageValue = indexPageValue.replace(/<BASE_URL>/g, library.Configuration.BaseURL);
            indexPageValue = indexPageValue.replace('[STORES_JSON]', JSON.stringify(sideBar && sideBar.stores || []));
            indexPageValue = indexPageValue.replace('[SELECTED_STORE_JSON]', JSON.stringify(sideBar && sideBar.selectedStore || {}));
            indexPageValue = indexPageValue.replace('[SIDE_BAR]', sideBar && sideBar.sidebarHtml || '');
            return indexPageValue;
        }

        return {
            onRequest: onRequest,
        };
    });
