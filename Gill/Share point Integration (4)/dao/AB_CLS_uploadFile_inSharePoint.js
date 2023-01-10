// eslint-disable-next-line no-undef
define(['N/https', 'N/record', 'N/search', 'N/log', '../dao/AB_CLS_Integration_ConfigrationRecord.js', '../dao/AB_CLS_Error.js','N/file', '../dao/AB_CLS_Sharepoint.js', 'N/config'], 
function (https, record, search, log, AB_CLS_Config, AB_CLS_Error,file,AB_CLS_Sharepoint,config) {
    return {
        uploadFileinSharePoint: function uploadFileinSharePoint(id) {
            var title = 'uploadFileinSharePoint(::)';
            try{
                var fileId = parseInt(id);
                var fileObj = file.load({
                    id: fileId
                });
                log.debug({
                    title: title+'fileObj',
                    details: fileObj
                });
                var token = AB_CLS_Sharepoint.getAccessToken();
                var reqHeaders = this.getRequestHeaders(token);
                var configObj = AB_CLS_Config.getConfig();
                var info = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });
                var companyID = info.getValue({
                    fieldId: 'companyid'
                });
                // this.postRequest(spurl, reqHeaders, reqbody);
                var fileUploaded = this.postRequest(reqHeaders,configObj,companyID,fileId);
                log.debug(title+'fileUploaded',fileUploaded);
            } catch(e) {
                log.debug('Exception ' +title, e.message);
            }
            
        },
        postRequest: function postRequest(reqheaders,configObj,companyID,fileId) {
            var title = 'postRequest()::';
            try {
                var relativePath = companyID;
                var parentFolder = configObj.spParentFolder;
                if(parentFolder){
                    relativePath = 'TestHumzaInt/'+relativePath+'/salesorder/186385';
                }
                var response = https.post({
                    // url: "https://alphabold.sharepoint.com/_api/web/GetFolderByServerRelativeUrl('"+relativePath+"')/Files/add(url='Test.txt',overwrite=true)",
                    // url: "https://alphabold.sharepoint.com/_api/web/GetFolderByServerRelativeUrl/186385/Files/add(url='a.txt',overwrite=true)",
                    // url: "https://alphabold.sharepoint.com/_api/web/GetFolderByServerRelativeUrl/186385/Files/add(url='test.txt')",
                    // url: "https://alphabold.sharepoint.com/_api/web/GetFolderByServerRelativeUrl(/sites/AB/NetSuite/TestHumzaInt/TSTDRV2084962/salesorder/186385)/Files/add(url='Test.txt',overwrite=true)",
                    url: "https://alphabold.sharepoint.com/_api/web/GetFolderByServerRelativeUrl(/sites/AB/NetSuite/TestHumzaInt/TSTDRV2084962/salesorder/186385)/Files/add(url='NiceDay.txt',overwrite=true)",
                    headers: reqheaders,
                    body: 'Hello Test'
                });
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return response;
        },
        getRequestHeaders : function getRequestHeaders(tokens){
            var title = 'getRequestHeaders()::';
            var reqHeaders = {};
             try{
                reqHeaders['Content-Type'] = 'application/json';
                reqHeaders['Authorization'] = 'Bearer '+ tokens;
                reqHeaders['Accept'] = 'application/json;odata=verbose';
                reqHeaders['Accept-Encoding'] = 'gzip, deflate, br';
                }catch(error){
                    log.error(title+error.name,error.message);
            } 
            return reqHeaders || {};
        },
    };
});