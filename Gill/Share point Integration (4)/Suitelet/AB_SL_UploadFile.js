/**
*@NApiVersion 2.0
*@NScriptType Suitelet
*/
// eslint-disable-next-line no-undef
define(['N/ui/serverWidget','../dao/AB_CLS_Integration_ConfigrationRecord.js','N/log','../dao/AB_CLS_uploadFile_inSharePoint.js'],
    function(serverWidget,AB_CLS_Config,log,uploadFileInSP) {
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
                var chooseFile = form.addField({
                    id: 'custpage_ab_htmlfield',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Upload File'
                });
                chooseFile.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.NORMAL
                });
                var HTMLInput = '<input  class="box__file" type="file" id="file" onchange="uploadFile();">';
                HTMLInput += '<SCRIPT language="JavaScript" type="text/javascript">';
                            HTMLInput += 'window.uploadFile = function (event){alert("Heloo")}';
                            HTMLInput += '</SCRIPT>';
                // var HTMLInput = '<input  class="box__file" type="file" id="file" onchange="uploadFile();">';
                // HTMLInput += '<SCRIPT language="JavaScript" type="text/javascript">';
                //             HTMLInput += 'window.uploadFile = function (event){if(this._fileName!=null){\
                //                 uploadfile(this._fileBase64,this._fileName);\
                //             }}';
                //             HTMLInput += '</SCRIPT>';
                form.updateDefaultValues({
                    custpage_ab_htmlfield: HTMLInput
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
                uploadFileInSP.uploadFileinSharePoint(id);
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
    function uploadfile(base64,fileName){
		var self = this;
		var binary = dataURItoBlob(base64);
			var data = {
				// "url": this._defaultsite + "/_api/web/getfolderbyserverrelativeurl('"+this._relativeUrl+"')/Files/Add(url='"+fileName+"',overwrite=true)",
                "url": "https://alphabold.sharepoint.com/_api/web/GetFolderByServerRelativeUrl(/sites/AB/NetSuite/TestHumzaInt/TSTDRV2084962/salesorder/186385)/Files/add(url='"+fileName+"',overwrite=true)",
				"type": "POST",
				"data" : binary,
				"processData": false,
				"headers": {
				  "accept": "application/json;odata=verbose",
				  //@ts-ignore
				  "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
				  "Authorization": "Bearer " + this.token,
				  
				},
				"binaryStringRequestBody": true
			};
			//@ts-ignore
			$.ajax(data).done(function (response) {
				debugger;
				//@ts-ignore      
				Xrm.Page.ui.clearFormNotification("1");

				//@ts-ignore
				Xrm.Page.ui.setFormNotification("File uploaded successfully", "INFO", "2"); 
				
				self.setColumns(response);
			}).fail(function(){
				debugger
				//@ts-ignore
				Xrm.Page.ui.setFormNotification("File not uploaded", "INFO", "3");
				
				setTimeout(
					function () {
						//@ts-ignore      
						Xrm.Page.ui.clearFormNotification("3");
					},
					6000
				);

            });
	}
    function dataURItoBlob(dataURI) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);
	  
		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	  
		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
	  
		return new Blob([ia], {type:mimeString});
	  }
    return {
        onRequest: onRequest
    };
});