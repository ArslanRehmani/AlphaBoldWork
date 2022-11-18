// eslint-disable-next-line no-undef
define(['N/https','N/record','N/search','N/log','../dao/AB_CLS_Integration_ConfigrationRecord.js','../dao/AB_CLS_Error.js'], function(https,record,search,log,AB_CLS_Config,AB_CLS_Error) {
    var TOKEN_ACCESS_URL = 'https://accounts.accesscontrol.windows.net/{realm}/tokens/OAuth/2';
return {
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
    getToken : function getToken(obj){
        var title = 'getToken()::';
        var token;
         try{
            var spURL  = TOKEN_ACCESS_URL.replace('{realm}',obj.spRelam);
            var reqHeaders = {};
            var reqbody = {};
            reqHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            reqbody['grant_type'] = obj.grantType;
            reqbody['client_id'] = obj.spUserId+'@'+obj.spRelam;
            reqbody['client_secret'] = obj.spClientSecret;
            reqbody['resource'] = obj.spResourceId+'/'+obj.spSiteUrl+'@'+obj.spRelam;

           var response =  https.post({
                url: spURL,
                headers: reqHeaders,
                body : reqbody
            });

            log.debug(title+'response',response);
            log.debug(title+'response.body',response.body);
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
    }
};
});