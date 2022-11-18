/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
// eslint-disable-next-line no-undef
define(['N/record', 'N/currentRecord', 'N/log', 'N/search', 'N/ui/dialog'], function (record, currentRecord, log, search, dialog) {

    function pageInit(context) {
        var title = 'pageInit()::';
        try {
            var rec = context.currentRecord;
            // var stopOrderId;
            // var sublist = context.sublistId;
            // var fieldId = context.fieldId;
            // var stopOrderDataObj;
            // var stringMultiStopOrder = '';
            // var FirstLinestring = '';
            // var showstringOnPoPUP = '';
            var recordType;
            // var recordType = 'assemblyitem';
            // var recordType = 'lotnumberedinventoryitem';
            var formId = rec.getValue({
                fieldId: 'customform'
            });
            if (formId == '150') { // '150' NALU | ITEM FULFILLMENT   
                var itemLines = rec.getLineCount({
                    sublistId: 'item'
                });
                for(var x = 0 ; x < itemLines ; x++){
                    var itemVal = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: x
                    });
                    var itemText = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemname',
                        line: x
                    });
                    log.debug({
                        title: 'itemText',
                        details: itemText
                    });
            



                    log.debug({
                        title: 'itemVal',
                        details: itemVal
                    });
                    // var itemType = rec.getCurrentSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'itemtype'
                    // });
                    var itemType = getItemtype(itemVal);
                    log.debug({
                        title: 'itemType',
                        details: itemType
                    });
                    if(itemType == 'InvtPart'){
                        // recordType = 'inventoryitem';
                        recordType = record.Type.INVENTORY_ITEM;
                        //recordType = 'lotnumberedinventoryitem';
                        log.debug({
                            title: 'working',
                            details: 'working'
                        });
                    }else{
                        //recordType = 'assemblyitem';
                        recordType =record.Type.ASSEMBLY_ITEM;
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
                    if(lineCount > 0){
                        showStopOrder(context,lineCount,objItem,itemText);
                    }
                }
            }
        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }

    function showStopOrder(context,lineCount,objItem,itemText) {
        var title = 'showStopOrder()::';
        var rec = context.currentRecord;
        var stopOrderId;
        // var sublist = context.sublistId;
        // var fieldId = context.fieldId;
        var stopOrderDataObj;
        var stringMultiStopOrder = '';
        var FirstLinestring = '';
        var showstringOnPoPUP = '';
        // var recordType;
         try{
            if (lineCount > 0) {
                var array = [];
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
                    //load user note lineCount
                    var notelineCount = stopOrderDate.getLineCount({
                        sublistId: 'recmachcustrecord1'
                    });
                    log.debug({
                        title: 'notelineCount',
                        details: notelineCount
                    });
                    var date = stopOrderDate.getValue('custrecord4');
                    log.debug({
                        title: 'date',
                        details: date    
                    });
                    if(!date)
                    {
                                stopOrderDataObj = getStopOrderNotes(stopOrderId);
                                var objKeys = Object.keys(stopOrderDataObj);
                               
                            var stringMessage = '<br /> Date Placed Stop : '+stopOrderDataObj.dateCreated+'  <br />';
                            for(var x= 0 ; x < objKeys.length-1 ; x++){
                                if(objKeys[x] != 'dateCreated'){
                                    var obj = stopOrderDataObj[objKeys[x]];
                                    stringMessage += 'Reported by :'+obj.author +' <br />';
                                    // var links = 'link';
                                    // stringMessage += 'Link :<a>https://6485266-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=386&id='+stopOrderId +'</a> <br />';
                                    stringMessage += '<a href="https://6485266-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=386&id='+stopOrderId +'">Stop Order : '+stopOrderId+'</a> <br />';
                                    // stringMessage += 'Memo :'+obj.memo +' <br />';
                                    var date12 = new Date(obj.notedate);
                                    var day = date12.getDate();
                                    var month = date12.getMonth()+1;
                                    var year = date12.getFullYear();
                                    var formateDate =  month +'/'+ day +'/'+ year;
                                    stringMessage += 'Date :'+ formateDate +' <br />';
                                    // stringMessage += 'Memo :'+new Date(obj.notedate) +' <br />';
                                    stringMessage += 'Title :'+obj.title +' <br />';
                                }
                            }
                            array.push(stringMessage);
                            
                            log.debug({
                                title: 'stopOrderDataObj',
                                details: stopOrderDataObj
                            });
                    }
                }
                
                for(var j=0 ; j<array.length ; j++){
                    stringMultiStopOrder += array[j]+'\n';
                }
                FirstLinestring = itemText+' has Stop Order(s): ';
                showstringOnPoPUP = FirstLinestring.concat(stringMultiStopOrder);
                dialog.confirm({
                    title: 'Are You Sure ?',
                    message: showstringOnPoPUP
                }).then(function(option){
                    if(!option){
                        rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: '',
                            ignoreFieldChange: false
                        });
                    }
                }).catch(function(e){
                    throw new Error('ERROR',e.message);
                });   
            }
            }catch(error){
                 log.error(title+error.name,error.message); 
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
                        name: "notedate",
                        sort: search.Sort.ASC,
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
                mapObj[internalid].notedate =  result.getValue({
                name: "notedate",
                join: "userNotes"
                });
                mapObj[internalid].id =  result.getValue({
                name: "internalid",
                join: "userNotes"
                });
                // return true;
            });

            return mapObj || {};

        } catch (error) {
            log.error({
                title: title + 'ERROR',
                details: error.message
            });
        }
    }
    function getItemtype(itemId){
        var title = "getItemtype() ::";
        try {
            var itemType = '';
        var itemSearchObj = search.create({
            type: "item",
            filters:
            [
               ["isinactive","is","F"], 
               "AND", 
               ["internalid","anyof",itemId]
            ],
            columns:
            [
               search.createColumn({name: "type", label: "Type"})
            ]
         });
         
         var reultset = itemSearchObj.run().getRange({
             start : 0,
             end : 1
         });
         if(reultset.length){
             itemType = reultset[0].getValue({
                name: "type"
             })
         }
        } catch (error) {
            log.error({
                title: title + 'ERROR',
                details: error.message
            });
        }
        return itemType || '';
    }
    return {
        pageInit: pageInit
    };
});