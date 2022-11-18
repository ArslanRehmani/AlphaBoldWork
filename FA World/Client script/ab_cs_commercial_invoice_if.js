
/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 *

 */

 define(['N/url', 'N/currentRecord'], function (nsUrl, currentRecord) {


	function pageInit(context) {
        console.log('pageInit Work','pageWork');
	}

	function printInvoiceGroup(redId) {
        console.log('printInvoiceGroup ->',redId.toString());
		var currentRec = currentRecord.get();
		var scriptURL = nsUrl.resolveScript({
			scriptId: 'customscript_ab_sl_commercial_inv_if',
			deploymentId: 'customdeploy_ab_sl_commercial_inv_if',
			params: {
				id: redId,
				rectype: currentRec.type
			},
			returnExternalUrl: false
		});
		newWindow = window.open(scriptURL);
	}


	return {
		pageInit: pageInit,
		printInvoiceGroup: printInvoiceGroup
	};
});