/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 // eslint-disable-next-line no-undef
 define(['N/record', 'N/currentRecord', 'N/log', 'N/search','N/ui/dialog'], function (record, currentRecord, log, search,dialog) {


    function fieldChanged(context) {
        try {
            var rec = context.currentRecord;
            var stopOrderId;
            var sublist = context.sublistId;
            var fieldId = context.fieldId;
            var stopOrderDataObj;
            var recordType = 'assemblyitem';
            var formId = rec.getValue({
                fieldId: 'customform'
            });
            if (formId == '161' || formId == '136' || formId == '176') { // '161' its for Sale Order, '136' and '176' its for transfer order   
                if (sublist == 'item' && fieldId == 'item') {
                    var itemVal = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    });
                    var itemType = rec.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype'
                    });
                    if(itemType == 'InvtPart'){
                        recordType = 'inventoryitem';
                    }
                    log.debug({
                        title: 'recordType',
                        details: recordType
                    });                
                    var objItem = record.load({
                        type: recordType,
                        id: itemVal,
                        isDynamic: true,
                    });
                    log.debug({
                        title: 'objItem',
                        details: objItem    
                    });
                    //load stop order here
                    var lineCount = objItem.getLineCount({
                        sublistId: 'recmachcustrecord1'
                    });
                    log.debug({
                        title: 'lineCount',
                        details: lineCount
                    });
                    if (lineCount > 0) {
                            for(var i=0; i<lineCount ; i++){
                            stopOrderId = objItem.getSublistValue({
                                sublistId: 'recmachcustrecord1',
                                fieldId: 'id',
                                line: i
                            });
                            log.debug({
                                title: 'stopOrderId',
                                details: stopOrderId    
                            });
                            var stopOrderDate = record.load({
                                type: 'customrecord386',
                                id: stopOrderId,
                                isDynamic: true,
                            });
                            log.debug({
                                title: 'stopOrderDate',
                                details: stopOrderDate    
                            });
                            var date = stopOrderDate.getValue('custrecord4');
                            log.debug({
                                title: 'date',
                                details: date    
                            });
                            if(!date)
                            {
                                log.debug({
                                    title: 'if st',
                                    details: 'test'    
                                });
                                        stopOrderDataObj = getStopOrderNotes(stopOrderId);
                                        var objKeys = Object.keys(stopOrderDataObj);
                                    var stringMessage = 'This Item has a Stop Order: <br />Date Placed Stop : '+stopOrderDataObj.dateCreated+'  <br />';
                                    for(var x= 0 ; x < objKeys.length-1 ; x++){
                                        if(objKeys[x] != 'dateCreated'){
                                            var obj = stopOrderDataObj[objKeys[x]];
                                            stringMessage += 'Reported by :'+obj.author +' <br />';
                                            stringMessage += 'Memo :'+obj.memo +' <br />';
                                        }
                                    }
                                    dialog.confirm({
                                        title: 'Are You Sure ?',
                                        message: stringMessage
                                    }).then(function(option){
                                        if(!option){
                                            rec.setCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'item',
                                                value: '',
                                                ignoreFieldChange: false
                                            });
                                        }
                                    }).catch(function(e){
                                        throw new Error('ERROR',e.message);
                                    });
                                    log.debug({
                                        title: 'stopOrderDataObj',
                                        details: stopOrderDataObj
                                    });
                            }
                        }
                        
                        
                    }
                }
            }
        } catch (e) {
            log.debug({
                title: 'ERROR1',
                details: e.message
            });
        }
    }

    function getStopOrderNotes(stopOrderId) {
        var title = 'getStopOrderNotes() :: ';
        var mapObj ={};
        try {

            var customrecord_nm_stop_ordersSearchObj = search.create({
                type: 'customrecord386',
                filters: [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["internalid", "anyof", stopOrderId]
                ],
                columns: [
                    search.createColumn({
                        name: "custrecord3"
                      
                    }),
                    search.createColumn({
                        name: "author",
                        join: "userNotes"
                       
                    }),
                    search.createColumn({
                        name: "company",
                        join: "userNotes"
                       
                    }),
                     search.createColumn({
                        name: "title",
                        join: "userNotes"
                      
                    }),
                    search.createColumn({
                        name: "note",
                        join: "userNotes"
                      
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "userNotes"
                     })
                ]
            });
            customrecord_nm_stop_ordersSearchObj.run().each(function (result) {
              var internalid =  result.getValue({
                    name: "internalid",
                    join: "userNotes"
                    });
            
            if(!mapObj[internalid]){
                mapObj[internalid] = {};
            }
            mapObj.dateCreated  =  result.getValue({
                    name: "custrecord3"
                });
                mapObj[internalid].author =  result.getText({
                name: "author",
                join: "userNotes"
                });
                mapObj[internalid].company =  result.getValue({
                name: "company",
                join: "userNotes"
                });
                mapObj[internalid].memo =  result.getValue({
                name: "note",
                join: "userNotes"
                });
                mapObj[internalid].title =  result.getValue({
                name: "title",
                join: "userNotes"
                });
                mapObj[internalid].id =  result.getValue({
                name: "internalid",
                join: "userNotes"
                });
                return true;
            });
            return mapObj || {};

        } catch (error) {
            log.error({
                title: title + 'ERROR',
                details: error.message
            });
        }
    }
    return {
        fieldChanged: fieldChanged
    };
});