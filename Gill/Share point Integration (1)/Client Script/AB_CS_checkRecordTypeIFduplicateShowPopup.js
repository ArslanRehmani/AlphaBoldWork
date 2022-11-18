/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(['N/log', 'N/search', 'N/ui/dialog', '../dao/AB_CLS_Error.js', 'N/https','../dao/AB_CLS_createFolderIfNotCreated.js','N/url'], function (log, search, dialog, error, https,createFolderCLS,nsUrl) {

    var FilesURL = "https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/GetFolderByServerRelativeUrl('TestHumzaInt/{folderName}')/Files";
    var TOKEN_ACCESS_URL = 'https://accounts.accesscontrol.windows.net/{realm}/tokens/OAuth/2';
    var folderExistURL = "https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/GetFolderByServerRelativeUrl('TestHumzaInt/{folderName}')/Exists";
    var AddFolders = "https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/Folders/add('TestHumzaInt/{folderName}')";
    function fieldChanged(context) {
        var title = 'fieldChanged(::)';
        var rec = context.currentRecord;
        var field = context.fieldId;
        try {
            if (field === 'custrecord_slct_rec_type') {
                // var RecordType = rec.getValue({ fieldId: 'custrecord_slct_rec_type' });
                var recordType = rec.getValue({ fieldId: 'custrecord_slct_rec_type1' });
                log.debug('RecordType', recordType);
                //if this record is select previoly a popup message is shown
                var customrecord_ab_deploye_conf_recSearchObj = search.create({
                    type: "customrecord_ab_deploye_conf_rec",
                    filters:
                        [
                            ["custrecord_slct_rec_type", "anyof", recordType]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_rec_id", label: "Rec ID" })
                        ]
                });
                customrecord_ab_deploye_conf_recSearchObj.run().each(function (result) {
                    var id = result.getValue({ name: 'custrecord_rec_id' });
                    if (id) {
                        dialog.confirm({
                            title: '<span>STOP ?</span>',
                            message: '<b>Script is Deployd on this Record! Record Type is always Unique!</b>'
                        }).then(function (option) {
                            if (option) {
                                rec.setValue({
                                    fieldId: 'custrecord_slct_rec_type',
                                    value: '',
                                    ignoreFieldChange: true
                                });
                                rec.setValue({
                                    fieldId: 'custrecord_rec_id',
                                    value: '',
                                    ignoreFieldChange: true
                                });
                                return true;
                            }
                        }).catch(function (e) {
                            throw new Error('ERROR', e.message);
                        });
                    } else {
                        return true;
                    }
                    return true;
                });
            }
        } catch (e) {
            log.debug('Exception ' + title, e.message);
            var id = error.createError(e.name, e.message, title);
            log.debug('Exception ' + title + 'errorRecId', id);
        }

    }

    // function createFolder(type, companyID, token, recid, context, files){
    //     var title = 'createFolder(::)';
    //     try{
    //         alert('hello');
    //         var created = createFolderCLS.getFolderDetails(type, companyID, token, recid, context, files);
    //         log.debug({
    //             title: 'created',
    //             details: created
    //         });

    //     } catch(e) {
    //         log.debug('Exception ' +title, e.message);
    //     }

    // }
    function getRequestHeaders(tokens){
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
    }
    function folderExist(folderName,token){
        var title = 'folderExist()::';
        var responseObj;
         try{
            var folderUrl  = folderExistURL.replace('{folderName}',folderName);
            var headers = getRequestHeaders(token);
            var response = getRequest(folderUrl,headers);
            log.debug(title+'response.body',response.body);
            if(response.code == 200 && response.body){
                responseObj = JSON.parse(response.body);
            }
            }catch(error){
                log.error(title+error.name,error.message);
        } 
        return responseObj ? responseObj['d']['Exists'] : false;
    }
function getFolderDetails(recid,type,token,companyID,context,files){
        var title = 'getFolderDetails()::';
        var createdFolderName ;
         try{
           var CompanyfolderCreated =  folderExist(companyID,token);
           if(CompanyfolderCreated){
            companyID = companyID+'/'+type;
            var recTypeFolderCreated = folderExist(companyID,token);
            if(recTypeFolderCreated){
                companyID = companyID +'/'+recid;
                var recidFolderCreated = folderExist(companyID,token);
                if(recidFolderCreated){
                    var relativePath = companyID;
                    var fileUrl = FilesURL.replace('{folderName}',relativePath);
                    var filesName = getFiles(fileUrl,token);
                }
                else{
                    log.debug({
                        title: 'YES!',
                        details: 'YES!'
                    });
                    //Create Rec Id Folder
                    createdFolderName = createFolder(companyID,token);
                    if(createdFolderName){
                        log.debug(title+'createdFolderName',createdFolderName);
                        getFolderDetails(recid,type,token);
                        var scriptURL = nsUrl.resolveScript({
                            scriptId: 'customscript_ab_sl_addtabonrec',
                            deploymentId: 'customdeploy_ab_sl_addtabonrec',
                            params: {
                                id: files,
                            },
                            returnExternalUrl: false
                        });
                    }
                }
            }else{
                //Create Rec Type Folder
                createdFolderName = createFolder(companyID,token);
                if(createdFolderName){
                    log.debug(title+'createdFolderName',createdFolderName);
                    getFolderDetails(recid,type,token);
                }
            }
           }else{
            //Company Fodler Creation
            createdFolderName = createFolder(companyID,token);
            if(createdFolderName){
                log.debug(title+'createdFolderName',createdFolderName);
                getFolderDetails(recid,type,token);
            }
           }     
            }catch(error){
                log.error(title+error.name,error.message);
        }
        return filesName || []; 
    }
    function createFolder(relativeUrl,tokens){
        var title = 'createFolder()::';
        var folderName = '';
         try{
            var headers = getRequestHeaders(tokens);
            var url = AddFolders.replace('{folderName}',relativeUrl);
            var response = postRequest(url,headers,'');
            if(response.code == 200 && response.body){
                var responseObj = JSON.parse(response.body);
                log.debug(title+'body after parsing',responseObj);
                if(responseObj && responseObj['d'].Name){
                    folderName = responseObj['d'].Name;
                }
            }
           
            }catch(error){
                log.error(title+error.name,error.message); 
        }
        return folderName || ''; 
    }
    function getFiles(url,tokens){
        var title = 'getFiles()::';
        var files = [];
        var obj ={};
         try{
            log.debug(title+'url',url);
            var headers = getRequestHeaders(tokens);
            var response = getRequest(url,headers);
            log.debug(title+'response',response.body);
            if(response.code == 200 && response.body){
                var responseObj = JSON.parse(response.body);
                log.debug(title+'body after parsing',responseObj);
            
            if(responseObj && responseObj["d"] && responseObj["d"]["results"].length){
                for(var x = 0; x < responseObj["d"]["results"].length ; x++ ){
                    obj ={};
                    obj.name = responseObj["d"]["results"][x].Name;
                    obj.relativeUrl = responseObj["d"]["results"][x].ServerRelativeUrl;
                    files.push(obj);
                }
            }
        }
            }catch(error){
                log.error(title+error.name,error.message); 
        } 
        return files || [];
    }
    function getRequest(spurl,reqheaders){
        var title = 'getRequest()::';
         try{
            var response =  https.get({
                url: spurl,
                headers: reqheaders
            });
            }catch(error){
                log.error(title+error.name,error.message); 
        } 
        return response;
    }
    function postRequest(spurl,reqheaders,reqbody){
        var title = 'postRequest()::';
         try{
            var response =  https.post({
                url: spurl,
                headers: reqheaders,
                body : reqbody
            });
            }catch(error){
                log.error(title+error.name,error.message); 
        } 
        return response;
    }
    return {
        fieldChanged: fieldChanged,
        getFolderDetails: getFolderDetails
    }
});
