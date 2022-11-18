/**
 * @NApiVersion 2.0
 * @NScriptType BundleInstallationScript
 */
define(['N/runtime', 'N/task', 'N/search', 'N/record'],
    function (runtime, task, nsSearch, record) {

        return {

            afterInstall: function afterInstall(params) {
                try {
                    // log.debug({title: 'afterInstall', details: 'Start'});
                    // var ScheduledScriptTask = task.create({
                    //     taskType: task.TaskType.MAP_REDUCE,
                    //     deploymentId: 'customdeploy1',
                    //     scriptId: 'customscript_ab_bold_role_mr',
                    // });
                    // ScheduledScriptTask.submit();
                    // log.debug({title: 'afterInstall', details: 'End'});
                } catch (e) {
                    log.error("error", e.message);
                }

            },
            afterUpdate: function afterUpdate(params) {
            //     try {
            //         var ScheduledScriptTask = task.create({
            //             taskType: task.TaskType.MAP_REDUCE,
            //             deploymentId: 'customdeploy1',
            //             scriptId: 'customscript_ab_bold_role_mr',
            //         });
            //         ScheduledScriptTask.submit();
            //     } catch (e) {
            //         log.error("error", e.message);
            //     }
             }
        };
    });