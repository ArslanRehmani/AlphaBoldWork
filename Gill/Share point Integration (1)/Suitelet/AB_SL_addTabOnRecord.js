/**
 *@NApiVersion 2.0
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/log'], function(serverWidget,log) {

    function onRequest(context) {
        var title = 'onRequest(::)';
        var params = context.request.parameters;
         var files = params.id;
         var response = context.response;
        try{
            form.addTab({
                id: 'custpage_sharepoint',
                label: 'Share Point'
            });
            var HtmlField = form.addField({
                id: 'custpage_html_field',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Test Field',
                container: 'custpage_sharepoint'
            });
            var htmlData = '<table style="width: 100%;margin-top: 10px;border: 1px solid;"><tr><th style="border: 1px solid;font-weight: bold;font-weight: bold">File Name</th><th style="border: 1px solid;font-weight: bold;font-weight: bold">Relative URL</th></tr>';

            for (var x = 0; x < files.length; x++) {
                htmlData += '<tr><td style="border: 1px solid;">' + files[x].name + '</td><td style="border: 1px solid;">' + files[x].relativeUrl + '</td></tr>';
            }

            htmlData += '</table>';
            form.updateDefaultValues({
                custpage_html_field: htmlData
            });
            response.write(form);
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
        
    }

    return {
        onRequest: onRequest
    }
});
