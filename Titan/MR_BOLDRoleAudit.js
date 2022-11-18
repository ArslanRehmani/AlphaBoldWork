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
 * File:        SCH_BOLDRoleAudit.js
 * Date:        9/2/2019
 *
 *
 ***********************************************************************/

/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/runtime', 'N/task'],
    function (nsSearch, record, runtime, task) {

        var usageLimit = 150;

        function searchEmployee(roleId) {
            var employeeSearchObj = nsSearch.create({
                type: "employee",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "and",
                        ["role", "anyof", roleId]
                    ],
                columns:
                    [
                        nsSearch.createColumn({
                            name: "entityid",
                            label: "Name"
                        }),
                        nsSearch.createColumn({name: "email", label: "Email"}),
                        nsSearch.createColumn({name: "phone", label: "Phone"}),
                        nsSearch.createColumn({name: "role", label: "Role"})
                    ]
            });
            var result = employeeSearchObj.run().getRange({
                start: 0,
                end: 1000
            });
            return result;
        }

        function searchRole(roleId) {
            var searchBoldRole = nsSearch.create({
                type: "role",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "and",
                        ["internalidnumber", nsSearch.Operator.EQUALTO, parseInt(roleId)]
                    ],
                columns: ['name', 'level', 'permission'],
            });
            var result = searchBoldRole.run().getRange({
                start: 0,
                end: 1000
            });
            return result;
        }

        function searchBolRole(boldRoleId) {
            var searchBoldRole = nsSearch.create({
                type: "customrecord_bold_role",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "and",
                        ["custrecord_br_role", "anyof", boldRoleId]
                    ],
                columns:
                    []
            });
            var result = searchBoldRole.run().getRange({
                start: 0,
                end: 1000
            });
            return result;
        }

        function searchBolRoleAudit(boldRoleId) {
            var searchBoldRole = nsSearch.create({
                type: "customrecord_bold_role_audit",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "and",
                        ["custrecord_bra_role", "anyof", boldRoleId]
                    ],
                columns:
                    []
            });
            var result = searchBoldRole.run().getRange({
                start: 0,
                end: 1000
            });
            return result;
        }

        function searchPermissions(permissionName) {
            var searchBoldRole = nsSearch.create({
                type: "customrecord_ab_permissions",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "AND",
                        ["name", "is", permissionName]
                    ],
                columns:
                    [
                        nsSearch.createColumn({
                            name: "name",
                            label: "Name"
                        }),
                        nsSearch.createColumn({name: "custrecord_ab_permissions_type", label: "Type"}),
                        nsSearch.createColumn({name: "custrecord_ab_permission_usage", label: "Usage"}),
                    ]
            });
            var result = searchBoldRole.run().getRange({
                start: 0,
                end: 1000
            });
            return result;
        }

        function getInputData() {

            log.debug("getInputData", "Start");

            var roleId = runtime.getCurrentScript().getParameter("custscript_param_role_id_role_mr");
            log.debug("roleId param", roleId);

            var filter = [['isinactive', nsSearch.Operator.IS, false], 'and', ['iscustom', nsSearch.Operator.IS, true]];
            if (!!roleId && parseInt(roleId) > 0) {
                filter.push('and');
                filter.push(['internalidnumber', nsSearch.Operator.EQUALTO, parseInt(roleId)])
            }
            log.debug("filter", filter);

            var search = nsSearch.create({
                type: 'role',
                filters: filter,
                columns: ['name']
            });

            log.debug("getInputData", "End");
            return search;
        }

        function map(context) {
            log.debug("map", "Start");
            var response = [];
            try {
                var searchResult = JSON.parse(context.value);
                var _name = searchResult.values.name;
                var roleId = searchResult.id;

                log.debug("roleId", roleId);
                log.debug("name", _name);

                log.debug("Create boldRole", "Start");
                var _boldrole = searchBolRole(roleId);
                var boldRole = null;
                if (!!_boldrole && _boldrole.length > 0) {
                    boldRole = record.load({
                        type: "customrecord_bold_role",
                        id: _boldrole[0].id
                    });
                } else {
                    boldRole = record.create({
                        type: "customrecord_bold_role"
                    });
                }
                boldRole.setValue({
                    fieldId: 'custrecord_br_role'
                    , value: roleId
                });
                boldRole.setValue({
                    fieldId: 'name'
                    , value: _name
                });
                var employeesList = [];
                var employees = searchEmployee(roleId);
                log.debug("employees", employees);
                if (!!employees && employees.length > 0) {
                    for (var i = 0; i < employees.length; i++) {
                        employeesList.push(employees[i].id);
                    }
                }
                if (employeesList.length > 0) {
                    boldRole.setValue({
                        fieldId: 'custrecord_br_user'
                        , value: employeesList
                    });
                }
                var returnRoleId = boldRole.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.debug("returnRoleId", returnRoleId);
                response.key = returnRoleId;
                log.debug("Create boldRole", "End");

            } catch (e) {
                log.error("error", e.message);
            }
            log.debug("map", "End");
            context.write({
                key: response.key,
                value: [roleId]
            });
        }

        function reduce(context) {
            log.debug('reduce', 'Start');
            var returnRoleId = context.key;
            var roleId = JSON.parse(context.values[0])[0];

            log.debug("returnRoleId", returnRoleId);
            log.debug(roleId, roleId);

            try {
                log.debug("Create boldRoleAudit", "Start");
                var _boldRoleAudit = searchBolRoleAudit(returnRoleId);
                if (!!_boldRoleAudit && _boldRoleAudit.length > 0) {
                    log.debug("Create boldRoleAuditdelete", "Start");
                    log.debug("_boldRoleAudit.length", _boldRoleAudit.length);
                    for (var c = 0; c < _boldRoleAudit.length; c++) {
                        record.delete({
                            type: 'customrecord_bold_role_audit',
                            id: _boldRoleAudit[c].id,
                        });
                        if (rescheduleIfNeeded()) {
                            break;
                        }
                    }
                    log.debug("Create boldRoleAuditdelete", "End");
                }
                log.debug("Create boldRoleAudit", "End");
                if (!!roleId && !!returnRoleId) {
                    runScheduleScript(returnRoleId, roleId)
                }
            } catch (e) {
                log.error("error", e.message);
            }
            log.debug('reduce', 'End');
        }

        function summarize(summary) {
            log.debug('Summary', summary);
            log.debug({title: 'runScheduleScript', details: 'Start'});
            try {
                var ScheduledScriptTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    deploymentId: 'customdeploy1',
                    scriptId: 'customscript_ab_bold_role_sch',
                });
                ScheduledScriptTask.submit();
            }catch (e) {
                log.error("error from start sch script",e.message);
            }
            log.debug({title: 'runScheduleScript', details: 'End'});
        }

        function rescheduleIfNeeded() {
            try {
                var roleId = runtime.getCurrentScript().getParameter("custscript_param_role_id_role_mr");
                var params = {};
                if (!!roleId) {
                    params = {
                        "custscript_param_role_id_role_mr": roleId
                    };
                }
                var scriptObj = runtime.getCurrentScript();
                var usageRemaining = scriptObj.getRemainingUsage();

                log.debug({title: 'usageRemaining', details: usageRemaining});

                if (usageRemaining < usageLimit) {
                    //rescheduleScript(scriptObj.id, scriptObj.deploymentId, params);
                    //yield;
                    return true;
                }

            } catch (e) {
                log.error({title: 'rescheduleIfNeeded', details: JSON.stringify(e)});
            }
            return false;
        }

        function rescheduleScript(scriptID, deploymentId, params) {

            log.debug({title: 'scriptID', details: scriptID});
            log.debug({title: 'deploymentId', details: deploymentId});

            var ScheduledScriptTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                deploymentId: deploymentId,
                scriptId: scriptID,
                params: params
            });
            ScheduledScriptTask.submit();
        }

        function getQueue(boldRoleId, roleID) {
            var searchBoldRole = nsSearch.create({
                type: "customrecord_ab_bold_schedule_script_que",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "and",
                        ["custrecord_ab_bold_role_id", 'anyof', boldRoleId],
                        "and",
                        ["custrecord_ab_role_id", 'anyof', roleID]
                    ],
                columns: ['custrecord_ab_bold_role_id', 'custrecord_ab_role_id', 'custrecord_ab_is_processed'],
            });
            var result = searchBoldRole.run().getRange({
                start: 0,
                end: 1000
            });
            return result;
        }

        function runScheduleScript(boldroleId, roleId) {
            var previousQueue = getQueue(boldroleId, roleId);
            if (!!previousQueue && previousQueue.length > 0) {
                for (var i = 0; i < previousQueue.length; i++) {
                    record.delete({
                        type: 'customrecord_ab_bold_schedule_script_que',
                        id: previousQueue[i].id,
                    });
                }
            }
            var rec = record.create({
                type: "customrecord_ab_bold_schedule_script_que"
            });
            rec.setValue({
                fieldId: 'custrecord_ab_bold_role_id'
                , value: boldroleId
            });
            rec.setValue({
                fieldId: 'custrecord_ab_role_id'
                , value: roleId
            });
            rec.setValue({
                fieldId: 'custrecord_ab_is_processed'
                , value: false
            });
            var Id = rec.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    }
);