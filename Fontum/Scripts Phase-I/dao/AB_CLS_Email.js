// eslint-disable-next-line no-undef
define(['N/record', 'N/log', 'N/email','N/runtime','../dao/AB_CLS_SFTPConfiguration.js'], function (record, log, email,runtime,CLSconfig) {
    return {
        /**
         * @param  {} list
         * @param  {} {vartitle="sendEmail()
         * @param  {} description ="Sending email summary using netsutie module"
         * @returns varsendFrom
         */
        sendEmail: function (list) {
            var title = "sendEmail () :: ";
            var userObj = runtime.getCurrentUser();
            var currentuserId = userObj.id;
            var currentuserEmail = userObj.email;
            var scriptObj = runtime.getCurrentScript();
            var configID = scriptObj.getParameter({name: "custscript_ab_sftp_config"}) || 1;
            var config = CLSconfig.getConfig(configID);
            var sendFrom = config.emailSender ? config.emailSender:currentuserId;
            var sendTo = config.emailRecipents? config.emailRecipents:currentuserEmail; 
            if(sendTo){
                sendTo = sendTo.split(',');
            }
            log.debug(title+'sendTo',sendTo);
            sendTo = sendTo ? sendTo : ['akabbas@alphabold.com','humzariaz66@gmail.com'];
            var subject = "Fontem NS-SAP File Based Integration";
            var body;
            try {
                if (list.length > 0) {
                    body = this.getEmailBody(list);
                    email.send({
                        author: sendFrom,
                        recipients: sendTo,
                        // cc: ccDetails,
                        // bcc: bccEmail,
                        subject: subject,
                        body: body
                    });
                } else {
                    email.send({
                        author: sendFrom,
                        recipients: sendFrom,
                        // cc: ccDetails,
                        // bcc: bccEmail,
                        subject: subject,
                        body: "Nothing Update/Create/Delete"
                    });
                }
                return true;
            } catch (error) {
                log.error({
                    title: title + "Error",
                    details: error.message
                });
                return false;
            }

        },
        /**
         * @param  {} list
         * @param  {} {vartitle="getEmailBody(
         * @param  {} successTbl
         * @param  {} description ="Custom Function Generate Email body tables for success and errors"
         * @returns varbody
         */
        getEmailBody: function (list) {
            var title = "getEmailBody () :: ";
            var body = "";
            var errorTbl, successTbl, logObj;
            try {
                errorTbl = "<table border='1px'><tr><th>Log ID</th><th>Netsuite Customer ID</th><th>SAP Customer ID</th><th>Available Credit</th><th>Group Credit Account ID</th></tr><tbody>";
                successTbl = "<table border='1px'><tr><th>Log ID</th><th>Netsuite Customer ID</th><th>SAP Customer ID</th><th>Available Credit</th><th>Group Credit Account ID</th></tr><tbody>";
                for (var i = 0; i < list.length; i++) {
                    logObj ={};
                    var listObj = list[i];
                    logObj.updated = listObj.getValue('custrecord_ab_update_credit_status');
                    logObj.id = listObj.id;
                    logObj.nsCustomer = listObj.getValue('custrecord_ab_ns_customer_id');
                    logObj.sapCustomer = listObj.getValue('custrecord_ab_sap_id');
                    logObj.availableCredit = listObj.getValue('custrecord_ab_available_credit');
                    logObj.groupCreditId = listObj.getValue('custrecord_ab_group_credit_acc');

                    if (logObj.updated == 'true' || logObj.updated == true) {
                        successTbl += "<tr><td>" + logObj.id + "</td><td>" + logObj.nsCustomer + "</td><td>" + logObj.sapCustomer + "</td><td>" + logObj.availableCredit + "</td><td>" + logObj.groupCreditId + "</td></tr>";
                        // successLogs.push({id:logObj.id,networkVenue:logObj.networkVenue ,reqType : logObj.reqType})
                    } else {
                        errorTbl  += "<tr><td>" + logObj.id + "</td><td>" + logObj.nsCustomer + "</td><td>" + logObj.sapCustomer + "</td><td>" + logObj.availableCredit + "</td><td>" + logObj.groupCreditId + "</td></tr>";
                        // errorLogs.push({id:logObj.id,networkVenue:logObj.networkVenue ,reqType : logObj.reqType})
                    }
                }
                successTbl += '</tbody></table>';
                errorTbl += '</tbody></table>';

                body += "<h2>Successfully Updated</h2></br>";
                body += successTbl;
                body += "</br>";
                body += "<h2>Error In Updation</h2></br>";
                body += errorTbl;

                return body;
            } catch (error) {
                log.error({
                    title: title + "Error",
                    details: error.message
                });
            }

        },
        sendConnectionErrorEmail : function(recid,msg){
            var title = 'sendConnectionErrorEmail()::';
             try{
                var userObj = runtime.getCurrentUser();
                var currentuserId = userObj.id;
                var currentuserEmail = userObj.email;
                var scriptObj = runtime.getCurrentScript();
                var configID = scriptObj.getParameter({name: "custscript_ab_sftp_config_rec"}) || 1;
                var config = CLSconfig.getConfig(configID);
                var sendFrom = config.emailSender ? config.emailSender:currentuserId;
                var sendTo = config.emailRecipents? config.emailRecipents:currentuserEmail; 
                if(sendTo){
                    sendTo = sendTo.split(',');
                }
                log.debug(title+'sendTo',sendTo);
                sendTo = sendTo ? sendTo : ['akabbas@alphabold.com','humzariaz66@gmail.com'];
                var subject = "Fontem NS-SAP SFTP Connection Error";
                var body="";
                body += "<h2 style='color:Red;'>Error In SFTP Connection</h2></br></br>";
                body += "<span><b>Error Message :</b>"+msg+"</span><br>";
                body += "<span><b>Error Log Record :</b><a style='color:blue' href='https://3416361-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=410&id="+recid+"'>Click to see Error log</a></br></span>";
                email.send({
                    author: sendFrom,
                    recipients: sendTo,
                    // cc: ccDetails,
                    // bcc: bccEmail,
                    subject: subject,
                    body: body
                });
            }catch(error){
                    log.error(title+error.name,error.message);
            } 
        }
    };
});