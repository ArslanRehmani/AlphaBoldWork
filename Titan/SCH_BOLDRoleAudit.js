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
 * File:        SCH_InativeUnSoldItem.js
 * Date:        4/24/2019
 *
 *
 ***********************************************************************/

/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/runtime', 'N/task'],
    function (nsSearch, record, runtime, task) {

        var usageLimit = 150;
        var lastProcessedItemRecordItemIndex = "";
        var boldRoleId = "";
        var roleId = "";

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

        function updateQueue(queueId) {
            var queue = record.load({
                type: "customrecord_ab_bold_schedule_script_que",
                id: queueId
            });
            queue.setValue({
                fieldId: 'custrecord_ab_is_processed'
                , value: true
            });
            queue.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
        }

        function getQueueById(boldRoleId, roleID) {
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

        function getQueue() {
            var searchBoldRole = nsSearch.create({
                type: "customrecord_ab_bold_schedule_script_que",
                filters:
                    [
                        ["isinactive", "is", "F"],
                        "and",
                        ["custrecord_ab_is_processed", nsSearch.Operator.IS, false]
                    ],
                columns: ['custrecord_ab_bold_role_id', 'custrecord_ab_role_id', 'custrecord_ab_is_processed'],
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

        function execute(context) {
            log.debug({title: 'execute', details: 'Start'});
            try {
                lastProcessedItemRecordItemIndex = runtime.getCurrentScript().getParameter("custscript_lasst_permission_processed") || 0;
                log.debug({title: "lastProcessedItemIndex", details: lastProcessedItemRecordItemIndex});

                boldRoleId = runtime.getCurrentScript().getParameter("custscript_boldroleid") || 0;
                log.debug({title: "boldRoleId", details: boldRoleId});

                roleId = runtime.getCurrentScript().getParameter("custscript_roleId") || 0;
                log.debug({title: "roleId", details: roleId});

                var running = true;
                var isPreviousRecord = false;
                while (running) {
                    var records = getQueue();
                    log.debug({title: "records.length", details: records.length});
                    if (records.length > 0) {
                        for (var r = 0; r < records.length; r++) {
                            if (isPreviousRecord) {
                                isPreviousRecord = false;
                                r = 0;
                            }
                            var _rec = records[r];
                            log.debug({title: "_rec", details: _rec});
                            if (parseInt(_rec.getValue({name: "custrecord_ab_bold_role_id"})) != parseInt(boldRoleId) && parseInt(boldRoleId) > 0) {
                                var _previousQueue = getQueueById(boldRoleId, roleId);
                                if (!!_previousQueue && _previousQueue.length > 0) {
                                    _rec = _previousQueue[0];
                                    isPreviousRecord = true;
                                }

                            } else {
                                boldRoleId = _rec.getValue({name: "custrecord_ab_bold_role_id"});
                                roleId = _rec.getValue({name: "custrecord_ab_role_id"});
                            }

                            if (rescheduleIfNeeded()) {
                                running = false;
                                break;
                            }

                            var employee = nsSearch.lookupFields({
                                type: 'customrecord_bold_role',
                                id: boldRoleId,
                                columns: ['custrecord_br_user']
                            }).custrecord_br_user;
                            employee = employee.map(function (num,index) {
                                return num.value;
                            });
                            log.debug({title: "employee", details: employee});
                            log.debug({title: "boldRoleId", details: boldRoleId});
                            log.debug({title: "roleId", details: roleId});

                            if (lastProcessedItemRecordItemIndex == 0) {
                                var _boldRoleAudit = searchBolRoleAudit(boldRoleId);
                                for (var c = 0; c < _boldRoleAudit.length; c++) {
                                    record.delete({
                                        type: 'customrecord_bold_role_audit',
                                        id: _boldRoleAudit[c].id,
                                    });
                                    if (rescheduleIfNeeded()) {
                                        running = false;
                                        break;
                                    }
                                }
                            }
                            if (rescheduleIfNeeded()) {
                                running = false;
                                break;
                            }
                            if (running) {
                                var _roleObj = searchRole(roleId);
                                if (!!_roleObj && _roleObj.length > 0) {
                                    for (var v = lastProcessedItemRecordItemIndex; v < _roleObj.length; v++) {

                                        lastProcessedItemRecordItemIndex = v;
                                        var permissionName = _roleObj[v].getText({name: "permission"});
                                        var permissionLevel = _roleObj[v].getValue({name: "level"});

                                        log.debug("permissionName", permissionName);
                                        log.debug("permissionLevel", permissionLevel);

                                        var boldRoleAudit = record.create({
                                            type: "customrecord_bold_role_audit"
                                        });
                                        boldRoleAudit.setValue({
                                            fieldId: 'custrecord_bra_role'
                                            , value: boldRoleId
                                        });
                                        if (!!employee && employee.length > 0) {
                                            try {
                                                log.debug({title: "employee", details: employee});
                                            }catch (e) {
                                            }
                                            boldRoleAudit.setValue({
                                                fieldId: 'custrecord_bra_user'
                                                , value: employee
                                            });
                                        }
                                        if (!!permissionName) {
                                            boldRoleAudit.setValue({
                                                fieldId: 'custrecord_bra_permission_name'
                                                , value: permissionName
                                            });
                                        }
                                        if (!!permissionLevel && permissionLevel != 0) {
                                            boldRoleAudit.setValue({
                                                fieldId: 'custrecord_bra_permission_level'
                                                , value: permissionLevel
                                            });
                                        }
                                        if (!!permissionName) {
                                            var _permissions = searchPermissions(permissionName);
                                            log.debug('_permissionsUsage', _permissions.length);
                                            if (!!_permissions && _permissions.length > 0) {
                                                boldRoleAudit.setValue({
                                                    fieldId: 'custrecord_bra_permission_type'
                                                    ,
                                                    value: _permissions[0].getValue({name: "custrecord_ab_permissions_type"})
                                                });
                                                var pDescription = [];
                                                for (var p = 0; p < _permissions.length; p++) {
                                                    var _permission = _permissions[p];
                                                    pDescription.push(_permission.getValue({name: "custrecord_ab_permission_usage"}));
                                                }
                                                if (pDescription.length > 0) {
                                                    boldRoleAudit.setValue({
                                                        fieldId: 'custrecord_bra_permission_description'
                                                        , value: pDescription.join(',')
                                                    });
                                                }
                                            }
                                        }
                                        if (!!permissionName) {
                                            var id = boldRoleAudit.save({
                                                enableSourcing: true,
                                                ignoreMandatoryFields: true
                                            });
                                        }
                                        if (rescheduleIfNeeded()) {
                                            running = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (running) {
                                log.debug({title: "updateQueue", details: _rec.id});
                                boldRoleId = 0;
                                updateQueue(_rec.id);
                                lastProcessedItemRecordItemIndex = 0;
                            } else {
                                break;
                            }
                        }
                    } else {
                        running = false;
                    }
                }
            } catch (e) {
                log.error({title: 'execute', details: JSON.stringify(e)});
            }
            log.debug({title: 'execute', details: 'End'});
        }

        function rescheduleIfNeeded() {
            try {
                var params = {
                    "custscript_lasst_permission_processed": lastProcessedItemRecordItemIndex,
                    "custscript_boldroleid": boldRoleId,
                    "custscript_roleId": roleId
                };
                var scriptObj = runtime.getCurrentScript();
                var usageRemaining = scriptObj.getRemainingUsage();
                log.debug({title: 'usageRemaining', details: usageRemaining});
                if (usageRemaining < usageLimit) {
                    rescheduleScript(scriptObj.id, scriptObj.deploymentId, params);
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
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                deploymentId: deploymentId,
                scriptId: scriptID,
                params: params
            });
            ScheduledScriptTask.submit();
        }

        return {
            execute: execute
        };
    })
;