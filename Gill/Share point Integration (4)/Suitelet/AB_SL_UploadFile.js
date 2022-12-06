/**
*@NApiVersion 2.0
*@NScriptType Suitelet
*/
// eslint-disable-next-line no-undef
define(['N/ui/serverWidget','../dao/AB_CLS_Integration_ConfigrationRecord.js','N/log'],
    function(serverWidget,AB_CLS_Config,log) {
        function onRequest(context) {
            var title = 'onRequest()::';
            try{
            title = 'GetSuiteletForm()::';

             
               
            if (context.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'Simple Form'
                });

                var field = form.addField({
                    id: 'custpage_file',
                    type: 'file',
                    label: 'Document'
                });
                field.isMandatory = true;
                form.addSubmitButton({
                    label: 'Submit Button'
                });

                context.response.writePage(form);
            } else {
            title = 'POSTSuiteletForm()::';
            var ConfigObj = AB_CLS_Config.getConfig();
            var fileObj = context.request.files.custpage_file;
            log.debug(title+'ConfigObj ::',ConfigObj);
            fileObj.folder =  ConfigObj.uploadFolderID || '-15';//Default Suitescript folder
            var id = fileObj.save();
            log.debug(title+'fileId ::',id);
            if(id){
                var Confirmationform = serverWidget.createForm({
                    title: 'Simple Form'
                });
                var field = Confirmationform.addField({
                    id: 'custpage_confirmation',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Message'
                });
                var fieldhidden = Confirmationform.addField({
                    id: 'custpage_hidden',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'closeform'
                });
                var htmlCloseMsg = '<script>window.closeFrom = function(){window.close();}</script>';
                var htmlMsg = '<h1>File Uploaded with ID :'+id+'</h1>';
                Confirmationform.updateDefaultValues({
                    custpage_confirmation: htmlMsg
                });
                Confirmationform.updateDefaultValues({
                    custpage_hidden: htmlCloseMsg
                });
                Confirmationform.addButton({
                    id:'custpage_close',
                    label: "Close Form",
                    functionName: "closeFrom"
                });
                // Confirmationform.addSubmitButton({
                //     label: 'Submit Button'
                // });
                context.response.writePage(Confirmationform);
                // context.response.write("<script>window.close();</script>");
                // context.response.writePage(form);
            }
            }
        }catch(error){
            log.error(title+error.name,error.message);
    } 
    }

    return {
        onRequest: onRequest
    };
});