/**
 * Description: Email worker for bulk email process, receives a customer, a list of emails, and a list of records. renders the records and sends email with attatchments 
 * 
 * Version      Date        Author      FRD Reference       Notes
 * 1.0          2022-03-30  Andrew Luke
 */

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/email', 'N/render', 'N/file', 'N/search','N/runtime'],
    function (email, render, file, search,runtime) {
        function onRequest(context) {
			var script = runtime.getCurrentScript();
            try {
                //Code here

                // security key (only run if triggered by the Suitlet page, never externally)
                var key = context.request.headers.Key;
                if (key == 'B8F9CBDAC5E17964B36631C53C25A') {

                    // log.debug('ctx', context);
					log.debug("initially script call" + script.getRemainingUsage());
					
                    var customerId = context.request.headers.customerId;
                    var emailList = JSON.parse(context.request.headers.emailList);
                    var recList = JSON.parse(context.request.headers.recList);
                    var currentUser = context.request.headers.currentUser;
                    var custName = context.request.headers.custName;
                    var docNos = JSON.parse(context.request.headers.docNos);
                    var docType = context.request.headers.recType;

                    // log.debug('cust', customerId);
                    // log.debug('emails', emailList);
                    // log.debug('recs' + recList.length, recList);
                    // log.debug('user', currentUser);
                    // log.debug('custName', custName);
                    // log.debug('docNos', docNos);
                    // log.debug('docType', docType);

                    // determine whether to send all pdfs in one email or one email per pdf
                    var sendSepparate = search.lookupFields({
                        type: 'customer',
                        id: customerId,
                        columns: ['custentity_cg_separateinvemail']
                    }).custentity_cg_separateinvemail;
					
					log.debug("Remaining Usage at search lookup" + script.getRemainingUsage());

                    // log.debug('sendSepparate', sendSepparate);
                    if (sendSepparate) {
                        log.debug('send sepparate logic');
                        var responseStr = '';
                        for (var x = 0; x < recList.length; x++) {
                            var pdf = render.transaction({
                                entityId: parseInt(recList[x])
                            });
                            var response = sendEmail(currentUser, emailList, [pdf], [recList[x]], custName, docNos[x], sendSepparate);
                            responseStr += response;
                            if (x != (recList.length - 1)) {
                                responseStr += '<br />';
                            }
                        }
                    } else {
                        var attatchmentList = [];
                        var attachmentsSize = 0;
                        for (var x = 0; x < recList.length; x++) {
                            var pdf = render.transaction({
                                entityId: parseInt(recList[x])
                            });
                            attatchmentList.push(pdf);
                            attachmentsSize += pdf.size;

                            if (attatchmentList.length == 100) {
                                var responseStr = sendEmail(currentUser, emailList, attatchmentList, recList, custName, docNos);
                                attatchmentList = [];
                            }
                        }
                        if (attatchmentList.length < 100) {
                            var responseStr = sendEmail(currentUser, emailList, attatchmentList, recList, custName, docNos);
                        }
                    }
                    log.debug('ids', recList);
                    context.response.addHeader({
                        name: 'recIds',
                        value: JSON.stringify(recList)
                    });
                    context.response.addHeader({
                        name: 'status',
                        value: responseStr
                    });
                    context.response.addHeader({
                        name: 'recType',
                        value: docType
                    });
                } else {
                    log.debug('Error', 'Suitlet was triggered without authorization key');
                }
            } catch (err) {
                log.debug(err.name, err.message);
            }
			log.debug("at end of script" + script.getRemainingUsage());
        }

        function sendEmail(currentUser, emailList, attatchmentList, recList, custName, docNos, sendSepparate) {
			var script = runtime.getCurrentScript();
            // get invoice email template
            var emailTemplate = render.mergeEmail({
                templateId: 18,
                entity: null,
                recipient: null,
                supportCaseId: null,
                transactionId: null,
                customRecord: null
            });

            var subject = emailTemplate.subject;
            var body = emailTemplate.body;

            if (sendSepparate) {
                // edit subject line
                subject = subject.replace('Invoice #', 'Invoice #' + docNos);

                // edit email body
                body = body.replace('Dear ,', 'Dear ' + custName + ',');
            } else {
                // edit subject line
                subject = subject.replace('Invoice #', 'Invoices');

                // edit email body
                body = body.replace('Dear ,', 'Dear ' + custName + ',');
                var invSummary = '<br /><strong>Invoices:</strong><br />'
                for (doc in docNos) {
                    invSummary += docNos[doc] + '<br />'
                }
                body = body.replace('from RSA.<br />', 'from RSA.<br />' + invSummary)
            }

            // send email
            log.debug('email send', currentUser + '; ' + emailList + '; ' + recList);
            try {
                email.send({
                    author: 501487,
                    recipients: emailList,
                    cc: [],
                    bcc: [currentUser, 501487],
                    subject: subject,
                    body: body,
                    attachments: attatchmentList,
                    relatedRecords: recList
                });
				log.debug("Remaining Usage at email send " + script.getRemainingUsage());
                return 'Customer: ' + custName + '. Email Send Status: Successful'
            } catch (err) {
                return 'Customer: ' + custName + '. Email Send Status: Error. Name: ' + err.name + '. Message: ' + err.message
            }
			log.debug("at end of send email" + script.getRemainingUsage());

        }
        return {
            onRequest: onRequest
        }
    })