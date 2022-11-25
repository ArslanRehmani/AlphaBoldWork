/**
 * Description: UI page that displays bulk email send action and calls the worker script. Display list of saved searches
 * 
 * Version      Date        Author      FRD Reference       Notes
 * 1.0          2022-03-30  Andrew Luke
 */

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/ui/serverWidget', 'N/ui/message', 'N/search', 'N/http', 'N/url', 'N/https', 'N/record','N/runtime'],
 function (serverWidget, message, search, http, url, https, record,runtime) {
     function onRequest(context) {
         var script1 = runtime.getCurrentScript();
         
         try {
             //Code here
             if (context.request.method == 'GET') {
                 log.debug("Remaining Usage Initially " + script1.getRemainingUsage());

                 // get request parameters
                 var blankError = context.request.parameters.blank;
                 var submitted = context.request.parameters.submitted;
                 var successes = context.request.parameters.successes;
                 var failures = context.request.parameters.failures;
                 var noResults = context.request.parameters.noResults;

                 // saved search list to populate select box
                 var searchSearch = search.create({
                     type: search.Type.SAVED_SEARCH,
                     filters: [
                         ['recordtype', 'is', 'Transaction'],
                         'AND',
                         ['titletext', 'contains', 'Bulk Email']
                     ],
                     columns: [
                         search.createColumn({
                             name: 'recordType',
                             label: 'Type'
                         }),
                         search.createColumn({
                             name: 'title',
                             label: 'Title',
                             sort: search.Sort.ASC
                         })
                     ]
                 });

                 // get results
                 var results = searchSearch.run().getRange({
                     start: 0,
                     end: 999                  
                 });
                 
                 log.debug('results. ' + results.length, results);
                 
                 log.debug("Remaining Usage after first getrange " + script1.getRemainingUsage());
                 // create form
                 var form = serverWidget.createForm({
                     title: 'Send Bulk Invoices'
                 });

                 // display page instruction message
                 form.addPageInitMessage({
                     type: message.Type.INFORMATION,
                     title: 'Send Bulk Invoices',
                     message: "Please select the saved search that contains all transactions to be emailed.<br />This process will take several minutes depending on how many records need to be emailed. Please do not nagivate away from this page.<br />NOTE: The saved search must contain 'Bulk Email' in the title in order to show up in the dropdown."
                 });

                 // display error message
                 if (blankError == 'T') {
                     form.addPageInitMessage({
                         type: message.Type.ERROR,
                         title: 'Error',
                         message: 'Please Select a saved search'
                     });
                 }

                 // display successes
                 if (successes) {
                     form.addPageInitMessage({
                         type: message.Type.CONFIRMATION,
                         title: 'Successes',
                         message: successes
                     });
                 }

                 // display errors
                 if (failures) {
                     form.addPageInitMessage({
                         type: message.Type.ERROR,
                         title: 'Failures',
                         message: failures
                     });
                 }

                 // display no results message
                 if (noResults) {
                     form.addPageInitMessage({
                         type: message.Type.ERROR,
                         title: 'No Search Results',
                         message: 'No records found.'
                     });
                 }

                 // add select box
                 var selectSearch = form.addField({
                     id: 'custpage_cg_select_search',
                     type: serverWidget.FieldType.SELECT,
                     label: 'Saved Search'
                 });

                 // add empty option as first select option
                 selectSearch.addSelectOption({
                     value: -999,
                     text: '',
                     isDefault: true
                 });

                 // add search results as select options 
                 for (var x = 0; x < results.length; x++) {
                     selectSearch.addSelectOption({
                         value: results[x].id,
                         text: results[x].getValue({
                             name: 'title'
                         })
                     });
                 }

                 // add submit button
                 form.addSubmitButton({
                     label: 'Submit'
                 });

                 // set clientscript location for cancel function
                 form.clientScriptFileId = 500788;

                 // add cancel button
                 form.addButton({
                     id: 'cancelButton',
                     label: 'Cancel',
                     functionName: 'cancel()'
                 });

                 // render page
                 context.response.writePage(form);

                 log.debug('Success', 'Page Loaded');
             } else {
                 // begin post method logic 

                 // get request parameters
                 var searchText = context.request.parameters.inpt_custpage_cg_select_search;
                 var searchId = context.request.parameters.custpage_cg_select_search;

                 // if the request is not -999 (blank) then call worker, otherwise redirect with error message
                 if (searchId != '-999') {
                     // call worker suitelet logic
                     var recSearch = search.load({
                         id: searchId
                     });

                     var recResults = recSearch.run().getRange({
                         start: 0,
                         end: 999
                     });
                     log.debug("Remaining Usage after select saved search from dropdown " + script1.getRemainingUsage());

                     log.debug('rec count', recResults.length);

                     if (recResults.length > 0) {

                         var noResults = '';

                         // initialize objects
                         var custRecObj = {};
                         var skipCust = [];

                         // loop over results and build an object, keys are the unique customers, values are the email details and a list of invoices
                         for (var x = 0; x < recResults.length; x++) {
                             var customerId = recResults[x].getValue({
                                 name: 'entity'
                             });
                             var recId = recResults[x].id;
                             var docNo = recResults[x].getValue({
                                 name: 'tranid'
                             });
                             var recType = recResults[x].recordType;
                             if (!skipCust.includes(recId)) {
                                 if (custRecObj[customerId]) {
                                     custRecObj[customerId][2].push(recId);
                                     custRecObj[customerId][3].push(docNo);
                                 } else {
                                     // get email, skip the customer if their delivery method is not email
                                     var customerSearchObj = search.create({
                                         type: "customer",
                                         filters: [
                                             ["internalid", "anyof", customerId],
                                             "AND",
                                             ["custentity_cg_delivery_method", "anyof", "1", "9", "13", "15", "17"]
                                         ],
                                         columns: [
                                             search.createColumn({
                                                 name: "custentity_cg_delivery_method_details",
                                                 label: "Delivery Method Details"
                                             }),
                                             search.createColumn({
                                                 name: 'companyname',
                                                 label: 'Company Name'
                                             })
                                         ]
                                     });
                                     var emailSearchCount = customerSearchObj.runPaged().count;
                                     if (emailSearchCount > 0) {
                                         var result = customerSearchObj.run().getRange({
                                             start: 0,
                                             end: 1
                                         })[0];
                                         var emailString = result.getValue({
                                             name: 'custentity_cg_delivery_method_details'
                                         });
                                         var custName = result.getValue({
                                             name: 'companyname'
                                         });
                                         var emailList = [];
                                         emailList = emailString.split(";");
                                         for (email in emailList) {
                                             emailList[email] = emailList[email].trim();
                                         }
                                         custRecObj[customerId] = [custName, emailList, [recId],
                                             [docNo], recType
                                         ];
                                     } else {
                                         skipCust.push(customerId);
                                     }
                                 }
                             }
                         }

                         log.debug('obj', custRecObj);

                         // call worker suitelet once for each customer 
                         var successes = '';
                         var failures = '';
                         for (cust in custRecObj) {
                             var emails = custRecObj[cust][1];
                             var recs = custRecObj[cust][2];
                             var currentUser = context.request.parameters.nluser;
                             var custName = custRecObj[cust][0];
                             var docs = custRecObj[cust][3];
                             var type = custRecObj[cust][4];

                             log.debug('call suitlet with parameters', 'cust=' + cust + '&email=' + emails + '&recs=' + recs + '&currentUser=' + currentUser + '&custName=' + custName);

                             var script = 'customscript_cg_bulk_email_worker';
                             var deployment = 'customdeploy_cg_bulk_email_worker';
                             var parameters = '';
                             var suiteletURL = url.resolveScript({
                                 scriptId: script,
                                 deploymentId: deployment,
                                 returnExternalUrl: true
                             });
                             var response = https.post({
                                 url: suiteletURL,
                                 body: parameters,
                                 headers: {
                                     //the suitelet will not run without this key. Just an extra safety measure. The key never changes.
                                     'Key': 'B8F9CBDAC5E17964B36631C53C25A',
                                     'customerId': cust,
                                     'emailList': JSON.stringify(emails),
                                     'recList': JSON.stringify(recs),
                                     'currentUser': currentUser,
                                     'custName': custName,
                                     'docNos': JSON.stringify(docs),
                                     'recType': type
                                 }
                             });
                             var resp = response.headers.status;
                             var recIds = JSON.parse(response.headers.recIds);
                             var recType = response.headers.recType;
                             log.debug('resp', response);
                             if (resp.substr(resp.indexOf('Send Status:') + 13, 5) == 'Error') {
                                 failures += resp + '<br />';
                                 // set field
                                 for (var id in recIds) {
                                     record.submitFields({
                                         type: recType,
                                         id: recIds[id],
                                         values: {
                                             'custbody_cg_trxtype': 2
                                         }
                                     });
                                 }
                             } else {
                                 successes += resp + '<br />';
                                 // set field
                                 for (var id in recIds) {
                                     try {
                                         record.submitFields({
                                             type: recType,
                                             id: recIds[id],
                                             values: {
                                                 'custbody_cg_trxtype': 1,
                                                 'custbody_cg_invoicemailed': 1
                                             }
                                         });
                                     } catch (err) {
                                         log.debug(err.name, err.message);
                                     }
                                 }
                             }
                             // break;
                         }
                     } else {
                         var noResults = 'T';
                     }

                     // log status and redirect

                     log.debug('Success', 'Worker Finished');
                     context.response.sendRedirect({
                         type: http.RedirectType.SUITELET,
                         identifier: 'customscript_cg_bulk_email_page',
                         id: 'customdeploy_cg_bulk_email_page',
                         parameters: {
                             blank: '',
                             submitted: 'T',
                             successes: successes,
                             failures: failures,
                             noResults: noResults
                         }
                     });
                 } else {
                     // log status and redirect
                     log.debug('No selection', 'Redirect back to page');
                     context.response.sendRedirect({
                         type: http.RedirectType.SUITELET,
                         identifier: 'customscript_cg_bulk_email_page',
                         id: 'customdeploy_cg_bulk_email_page',
                         parameters: {
                             blank: 'T',
                             submitted: '',
                             successes: '',
                             failures: '',
                             noResults: noResults
                         }
                     });
                 }
             }
             log.debug("Remaining Usage at end " + script1.getRemainingUsage());

         } catch (err) {
             log.debug(err.name, err.message);
         }
     }
     return {
         onRequest: onRequest
     }
 })