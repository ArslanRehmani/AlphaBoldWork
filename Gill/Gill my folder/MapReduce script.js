/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
 define(['N/error', 
 'N/record', 
 'N/runtime',
 'N/search',
 'N/log'
],
/**
* @param {email} email
* @param {error} error
* @param {record} record
* @param {runtime} runtime
* @param {search} search
*/
function(error, record, runtime, search,log) 
{

/**
* Map/Reduce Script:
* Sample Map/Reduce script for blog post.  
*/


/**
* Marks the beginning of the Map/Reduce process and generates input data.
*
* @typedef {Object} ObjectRef
* @property {number} id - Internal ID of the record instance
* @property {string} type - Record type id
*
* @return {Array|Object|Search|RecordRef} inputSummary
* @since 2015.1
*/
function getInputData() 
{   
 //Dynamically create Saved Search to grab all eligible Sales orders to invoice
 //In this example, we are grabbing all main level data where sales order status are 
 //any of Pending Billing or Pending Billing/Partially Fulfilled
 return search.create({
     type:'customrecord_ab_maped_record',
     filters:[
                    ['isinactive', search.Operator.IS, false]
               ],
    columns:[
                    'custrecord_ab_maped_record_field'
               ]
 });
}

/**
* Executes when the map entry point is triggered and applies to each key/value pair.
*
* @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
* @since 2015.1
*/
function map(context) 
{
 log.debug('context', context.value);
 var rowJson = JSON.parse(context.value);
 log.debug('rowJson', rowJson);
//  //Transform salesorder into an invoice
//  var invrec = record.transform({
//      'fromType':record.Type.SALES_ORDER,
//      'fromId':rowJson.values['internalid'].value,
//      'toType':record.Type.INVOICE
//  });
 
//  //Let's save it 
//  var invoiceid = invrec.save({
//      'enableSourcing':true,
//      'ignoreMandatoryFields':true
//  });
 
//  log.debug('generated invoice id', invoiceid);
}

/**
* Executes when the summarize entry point is triggered and applies to the result set.
*
* @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
* @since 2015.1
*/

return {
 getInputData: getInputData,
 map: map
};

});