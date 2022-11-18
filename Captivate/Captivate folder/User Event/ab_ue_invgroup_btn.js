
/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 *
 */
 define(['N/record', 'N/search', 'N/runtime','N/log'], function (record, nsSearch, runtime,log) {


	/**
	 * Entry point function
	 * @param context
	 */
	function beforeLoad(context) {
      var currentRecord = context.newRecord;
      var recid = currentRecord.id;

		try {
			log.debug('context.type', context.type);
			if (context.type == context.UserEventType.VIEW || context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
				addbutton(context,recid)
			}
		}
		catch (e) {
			log.error('ERROR in addButton', e.message)
		}

	}

	function addbutton(context,recid) {
		try {
            log.debug('recID userEevnt',recid);
				var form = context.form;
				form.clientScriptFileId = '2069774';
				form.addButton({id: "custpage_printInvoiceGroup", label: "Print Invoice Group", functionName: "printInvoiceGroup(' " + recid + "')"});

		}
		catch (e) {
			log.error('Error::addbutton', e.message);
		}
	}

	return {
		beforeLoad: beforeLoad,
	}

});