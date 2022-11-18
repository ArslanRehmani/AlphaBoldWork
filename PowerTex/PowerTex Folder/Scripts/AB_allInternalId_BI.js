/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/search','N/log'], function (search,log) {

    function afterSubmit(context) {
        var title = 'afterSubmit(::)';
        try {
            var obj;
            var internalIdArray = [];
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type", "anyof", "VendBill", "VendCred", "CustCred", "ExpRept", "InvAdjst", "ItemShip", "SalesOrd"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP",
                            label: "Internal ID"
                        })
                    ]
            });
            var resultset = transactionSearchObj.run().getRange({
                start: 0,
                end: 1000
            });
            for(var i=0; i<resultset.length; i++){
                obj = {};
                obj.internalId = resultset[i].getValue({name: 'internalid', summary:"GROUP"});
                internalIdArray.push(obj);
            }
            log.debug({
                title: title + 'internalIdArray',
                details: internalIdArray
            });
            var allInernalIdArray =[];
            for(var j=0; j<internalIdArray.length; j++){
                var person = internalIdArray[j];
               var data = Object.keys(person).map(function(k){return person[k]}).join(",");
               allInernalIdArray.push(data);
            }
            log.debug({
                title: title + 'allInernalIdArray',
                details: allInernalIdArray
            });
        } catch (e) {
            log.debug('Exception ' + title, e.message);
        }
    }
    return {
        afterSubmit: afterSubmit
    }
});
