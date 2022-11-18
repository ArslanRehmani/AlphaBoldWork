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
 * File:        UE_BOLDRoleAudit.js
 * Date:        9/4/2019
 *
 *
 ***********************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(['N/search', 'N/record', 'N/runtime', 'N/task'],
    function (nsSearch, record, runtime, task) {
        function beforeLoad(context) {
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

        function beforeSubmit(scriptContext) {
            // log.debug("beforeSubmit" , 'Start');
            //
            // var rec = scriptContext.newRecord;
            // var value = rec.getValue({fieldId: "custpage_segment_value"});
            // log.debug("custpage_segment_value" , value);
            // rec.setValue({fieldId: "custrecord_ab_segment_value", value: value});
            //
            // log.debug("beforeSubmit" , 'End');
        }

        function afterSubmit(scriptContext) {
            log.debug("afterSubmit", 'Start');

            var rec = scriptContext.newRecord;
            var type = scriptContext.type;

            var iscustom = rec.getValue({fieldId: "iscustom"});
            if ((type.toLowerCase() === 'edit' || type.toLowerCase() === 'create') && iscustom) {
                var _name = rec.getValue({fieldId: "name"});
                var roleId = rec.id;

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
                log.debug("Create boldRole", "End");
                runScheduleScript(returnRoleId, roleId);
            }
            log.debug("afterSubmit", 'End');
        }

        function runScheduleScript(boldroleId, roleId) {
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
            log.debug({title: 'runScheduleScript', details: 'Start'});
            var params = {
                "custscript_lasst_permission_processed": 0,
                "custscript_boldroleid": boldroleId,
                "custscript_roleId": roleId
            };
            var ScheduledScriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
                deploymentId: 'customdeploy1',
                scriptId: 'customscript_ab_bold_role_sch',
                params: params
            });
            ScheduledScriptTask.submit();
            log.debug({title: 'runScheduleScript', details: 'End'});
        }

        //custrecord_ab_segment_value
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });
