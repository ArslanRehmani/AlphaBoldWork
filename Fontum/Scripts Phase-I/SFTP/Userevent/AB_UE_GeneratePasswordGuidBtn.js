    /**
     *@NApiVersion 2.0
    *@NScriptType UserEventScript
    */
    // eslint-disable-next-line no-undef
    define(['N/log','N/ui/serverWidget'], function (log,serverWidget) {

        function beforeLoad(context) {
            var title = 'beforeLoad()::';
            try {
                var rec = context.newRecord;
                var form = context.form;
                if(context.type == context.UserEventType.VIEW){

                    form.addButton({
                        id: "custpage_GenerateGUID",
                        label: "Generate GUID",
                        functionName: "generateGUID"
                    });
                    // if(context.type == context.UserEventType.VIEW){
                        form.addButton({
                            id: "custpage_sftpConnection",
                            label: "Test Connection",
                            functionName: "sftpConnection"
                        });
                    // }
                    form.clientScriptModulePath = 'SuiteScripts/AlphaBold/[AB] SAP INTEGRATION/Scripts Phase-I/SFTP/Client/AB_CS_GeneratePasswordGuid.js';
                }
    
            } catch (error) {
                log.error(title + error.name, error.message);
            }

        }
        return {
            beforeLoad: beforeLoad
        };
    });