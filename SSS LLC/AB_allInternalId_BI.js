/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/log'], function (search, log) {

    function afterSubmit(context) {
        var title = 'afterSubmit(::)';
        try {
            var allInternalIdArray = [];
            var allINternalIdSearch = search.load({
                id: '1730'
            });
            var resultSet = allINternalIdSearch.run();
            // now take the first portion of data.
            var currentRange = resultSet.getRange({
                start: 0,
                end: 1000
            });

            var i = 0;  // iterator for all search results
            var j = 0;  // iterator for current result range 0..999
            var internalIdArray = [];
            var obj;
            while (j < currentRange.length) {
                // take the result row
                var result = currentRange[j];
                obj = {};
                obj.id = result.getText({ name: 'internalid', summary: "GROUP" });
                internalIdArray.push(obj);
                i++; j++;
                if (j == 1000) {   // check if it reaches 1000
                    j = 0;          // reset j an reload the next portion
                    currentRange = resultSet.getRange({
                        start: i,
                        end: i + 1000
                    });
                    log.debug('Range', currentRange.length);
                }
            }
            for (var j = 0; j < internalIdArray.length; j++) {
                var recordID = internalIdArray[j];
                var allRecordsIDs = Object.keys(recordID).map(function (k) { return recordID[k] }).join(",");
                allInternalIdArray.push(allRecordsIDs);
            }
            log.debug('allInternalIdArray', allInternalIdArray.length);

} catch (e) {
    log.debug('Exception ' + title, e.message);
}
    }
return {
    afterSubmit: afterSubmit
}
});
