// eslint-disable-next-line no-undef
define(['N/https','N/record','N/search','N/log','../dao/AB_CLS_Integration_ConfigrationRecord.js','../dao/AB_CLS_Error.js','N/ui/serverWidget'], function(https,record,search,log,AB_CLS_Config,AB_CLS_Error,serverWidget) {
    var TOKEN_ACCESS_URL = 'https://accounts.accesscontrol.windows.net/{realm}/tokens/OAuth/2';
    var folderExistURL = "https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/GetFolderByServerRelativeUrl('TestHumzaInt/{folderName}')/Exists";
    // var FoldersURL = 'https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/GetFolderByServerRelativeUrl("TestHumzaInt/{folderName}")/Folders';
    var FilesURL = "https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/GetFolderByServerRelativeUrl('TestHumzaInt/{folderName}')/Files";
    var AddFolders = "https://alphabold.sharepoint.com/sites/AB/NetSuite/_api/web/Folders/add('TestHumzaInt/{folderName}')";
  
  
    return {
    /**
     * @param  {} {vartitle='getAccessToken(
     * Details : Returns Access Token information
     */
    getAccessToken : function  getAccessToken(){
        var title = 'getAccessToken()::';
         try{
            var configObj = AB_CLS_Config.getConfig();
            if(Object.keys(configObj).length){
                var token = this.getToken(configObj);
            }else{
                throw {name:"Configuration Not Found",message : "Sharepoint Configration record not found"};
            }
            }catch(error){
                AB_CLS_Error.createError(error.name,error.message,title);
                log.error(title+error.name,error.message);
        } 
        return token || '';
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
    /**
     * @param  {} obj
     * @param  {} {vartitle='getToken(
     * @param  {} obj.spRelam
     * @param  {spURL} ;varreqHeaders={};varreqbody={};reqHeaders['Content-Type']='application/x-www-form-urlencoded';reqbody['grant_type']=obj.grantType;reqbody['client_id']=obj.spUserId+'@'+obj.spRelam;reqbody['client_secret']=obj.spClientSecret;reqbody['resource']=obj.spResourceId+'/'+obj.spSiteUrl+'@'+obj.spRelam;varresponse=https.post({url
     * Details : Request tokens by using configuration details
     */
    getToken : function getToken(obj){
        var title = 'getToken()::';
        var token;
         try{
            var spURL  = TOKEN_ACCESS_URL.replace('{realm}',obj.spRelam);
            var reqHeaders ={};
            var reqbody = {};
            reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            reqbody['Authorization'] = obj.grantType;
            reqbody['grant_type']=obj.grantType;
            reqbody['client_id'] = obj.spUserId+'@'+obj.spRelam;
            reqbody['client_secret'] = obj.spClientSecret;
            reqbody['resource'] = obj.spResourceId+'/'+obj.spSiteUrl+'@'+obj.spRelam;
            var response = this.postRequest(spURL,reqHeaders,reqbody);
            if(response.code == 200 && response.body){
                var body = JSON.parse(response.body);
                log.debug(title+'body after parsing',body);
                token = body.access_token;
            }
            else{
                throw {name:"Get Token Access failed",message : response};
            }
            }catch(error){
                AB_CLS_Error.createError(error.name,error.message,title);
                log.error(title+error.name,error.message);
        } 
        return token || '';
    },
    folderExist : function folderExist(folderName,token){
        var title = 'folderExist()::';
        var responseObj;
         try{
            var folderUrl  = folderExistURL.replace('{folderName}',folderName);
            var headers = this.getRequestHeaders(token);
            var response = this.getRequest(folderUrl,headers);
            log.debug(title+'response.body',response.body);
            if(response.code == 200 && response.body){
                responseObj = JSON.parse(response.body);
            }
            }catch(error){
                log.error(title+error.name,error.message);
        } 
        return responseObj ? responseObj['d']['Exists'] : false;
    },
    getFolderDetails: function getFolderDetails(recid,type,token){
        var title = 'getFolderDetails()::';
        var createdFolderName ;
        var info = config.load({type:config.Type.COMPANY_INFORMATION});
        var companyID = info.getValue({fieldId:'companyid'});
        log.debug({title:'Current company ID', details:info.getValue({fieldId:'companyid'})});
         try{
           var CompanyfolderCreated =  this.folderExist(companyID,token);
           if(CompanyfolderCreated){
            companyID = companyID+'/'+type;
            var recTypeFolderCreated = this.folderExist(companyID,token);
            if(recTypeFolderCreated){
                companyID = companyID +'/'+recid;
                var recidFolderCreated = this.folderExist(companyID,token);
                if(recidFolderCreated){
                    var relativePath = companyID;
                    var fileUrl = FilesURL.replace('{folderName}',relativePath);
                    var filesName = this.getFiles(fileUrl,token);
                }
                else{
                    log.debug({
                        title: 'YES!',
                        details: 'YES!'
                    });
                    //Create Rec Id Folder
                    createdFolderName = this.createFolder(companyID,token);
                    if(createdFolderName){
                        log.debug(title+'createdFolderName',createdFolderName);
                        this.getFolderDetails(recid,type,token);
                        this.addTab(context, recid, type, files,companyID,token);
                    }
                }
            }else{
                //Create Rec Type Folder
                createdFolderName = this.createFolder(companyID,token);
                if(createdFolderName){
                    log.debug(title+'createdFolderName',createdFolderName);
                    this.getFolderDetails(recid,type,token);
                }
            }
           }else{
            //Company Fodler Creation
            createdFolderName = this.createFolder(companyID,token);
            if(createdFolderName){
                log.debug(title+'createdFolderName',createdFolderName);
                this.getFolderDetails(recid,type,token);
            }
           }     
            }catch(error){
                log.error(title+error.name,error.message);
        }
        return filesName || []; 
    },
    createFolder: function createFolder(relativeUrl,tokens){
        var title = 'createFolder()::';
        var folderName = '';
         try{
            var headers = this.getRequestHeaders(tokens);
            var url = AddFolders.replace('{folderName}',relativeUrl);
            var response = this.postRequest(url,headers,'');
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
    },
    getFiles: function getFiles(url,tokens){
        var title = 'getFiles()::';
        var files = [];
        var obj ={};
         try{
            log.debug(title+'url',url);
            var headers = this.getRequestHeaders(tokens);
            var response = this.getRequest(url,headers);
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
    },


    getRequest: function getRequest(spurl,reqheaders){
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
    },


    postRequest: function postRequest(spurl,reqheaders,reqbody){
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
    },
    addTab :function addTab(context, recid, type, files,companyID,token){
        var title = 'addTab(::)';
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
        } catch(e) {
            log.debug('Exception ' +title, e.message);
        }
        
    }
};
});