/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// eslint-disable-next-line no-undef
define(['N/sftp','N/log'],
    function (sftp,log) {

        function onRequest(context) {
            if (context.request.method === 'GET') {
                var parms = context.request.parameters;
                log.debug('parms',parms);
                var connection = sftp.createConnection({
                    username: parms.username,
                    passwordGuid: parms.passwordGuid,
                    url: parms.url,
                    port: parseInt(parms.port),
                    hostKey: parms.hostKey,
                    directory: parms.directory
                });
                log.debug("connection",connection);           
                context.response.write(JSON.stringify(connection));
            } 
        }
        return{
            onRequest:onRequest
        };
    });