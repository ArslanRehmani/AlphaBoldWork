/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
// eslint-disable-next-line no-undef
define(['N/log', 'N/error', 'N/email', 'N/record', 'N/search'], function (log, error, email, record, search) {

    var RECORDID = '';

    function afterSubmit(context) {
        var title = 'afterSubmit()::';
        var record = context.newRecord;
        RECORDID = record.id;
        var linesCount, obj, qtyPO, qty, item, qtyLimit, qtyReceived, newQty;
        var emailDataArray = [],vendor;
        try {
            vendor = record.getValue({
                fieldId: 'entity'
            });
            linesCount = record.getLineCount({
                sublistId: 'item'
            });
            for (var i = 0; i < linesCount; i++) {
                qtyPO = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_po_qty',
                    line: i
                });
                qty = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });
                qtyReceived = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_qty_received',
                    line: i
                });
                newQty = parseInt(qty) + parseInt(qtyReceived);
                // qtyLimit = record.getSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'custcol_item_qty_limit',
                //     line: i
                // });
                qtyLimit = getLimit(qtyPO,vendor);
                log.debug({title: title+"qtyLimit",details: qtyLimit});

                item = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemname',
                    line: i
                });
                if (newQty > parseInt(qtyLimit.upperLimit) || newQty < parseInt(qtyLimit.lowerLimit) ) {
                  
                    obj = {};
                    obj.increase = false;
                    obj.limit = qtyLimit.lowerLimit;
                    if(newQty > parseInt(qtyLimit.upperLimit)){
                        obj.increase = true;
                        obj.limit = qtyLimit.upperLimit;
                    }
                    obj.line = i + 1;
                    obj.item = item;
                    obj.qtyPO = qtyPO;
                    obj.totalLimit = qtyLimit.lowerLimit + ' - ' + qtyLimit.upperLimit;
                    obj.totalQtyReceived = newQty;
                    emailDataArray.push(obj);
                }
            }
            log.debug({title: title+"emailDataArray",details: emailDataArray});
            if (emailDataArray.length) {
                log.debug({
                    title: "Email Data",
                    details: emailDataArray
                });
                sendEmail(emailDataArray);
            }
        } catch (error) {
            log.error({
                title: title + 'ERROR',
                details: error.message
            });
        }
    }



    ///////////////////////////
    function beforeLoad(context) {
        var title = 'beforeLoad()::';
        var linesCount, item, qtyLimitObj, PO_id, remainingQty;
        try {
            var record = context.newRecord;
            linesCount = record.getLineCount({
                sublistId: 'item'
            });
            PO_id = record.getValue({
                fieldId: 'createdfrom'
            });
            qtyLimitObj = getItemQtyLimitFromPO(PO_id);
            log.debug({
                title: title + "qtyLimitObj",
                details: qtyLimitObj
            });
            for (var i = 0; i < linesCount; i++) {

                item = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                remainingQty = record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantityremaining',
                    line: i
                });
                record.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_item_qty_limit',
                    line: i,
                    value: getQtyPercentageValue(qtyLimitObj[item]['quantity']),
                });
                record.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_qty_received',
                    line: i,
                    value: qtyLimitObj[item]['quantity'] - remainingQty,
                });
                record.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_po_qty',
                    line: i,
                    value: qtyLimitObj[item]['quantity']
                });

            }
        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }
    /////////////////////////////////
    // function checkQtyCondition(qtyRemain, qty) {
    //     var qtyLimit = getQtyPercentageValue(qtyRemain);
    //     if (qty > qtyLimit) {
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    function getQtyPercentageValue(qty) {
        var percentage = 10;
        var increaseQty = qty * (percentage / 100);
        var totalQty = Math.round(qty + increaseQty);
        return totalQty;
    }

    function getLimit(qty,vendor) {
        var title = 'getLimit()::';
        var limitobj = {};
        var  upperLimitPercent, lowerLimitPercent;
        var vendorRec;
        try {
            

            vendorRec =  record.load({
                type: record.Type.VENDOR,
                id: vendor,
                isDynamic: true,
            });
            upperLimitPercent  = vendorRec.getValue({
                fieldId : 'custentity_ab_upper_limit'
            }) || 0;
            lowerLimitPercent  = vendorRec.getValue({
                fieldId : 'custentity_ab_lower_limit'
            }) || 0;
            log.debug(title+'upperLimitPercent',upperLimitPercent);
            log.debug(title+'lowerLimitPercent',lowerLimitPercent);
            // var customrecord_ab_set_percentage_irSearchObj = search.create({
            //     type: "customrecord_ab_set_percentage_ir",
            //     filters: [
            //         ["isinactive", "is", "F"]
            //     ],
            //     columns: [
            //         search.createColumn({
            //             name: "custrecord_ab_upper_limit"
            //         }),
            //         search.createColumn({
            //             name: "custrecord_ab_lower_limit"
            //         }),
            //         search.createColumn({
            //             name: "created",
            //             sort: search.Sort.ASC
            //         })
            //     ]
            // });
            // searchresult = customrecord_ab_set_percentage_irSearchObj.run().getRange({
            //     start: 0,
            //     end: 1
            // });
            // log.debug({
            //     title: title + 'searchresult',
            //     details: searchresult
            // });
            // upperLimitPercent = searchresult[0].getValue({
            //     name: "custrecord_ab_upper_limit"
            // }) || 0;
            // lowerLimitPercent = searchresult[0].getValue({
            //     name: "custrecord_ab_lower_limit"
            // }) || 0;
            limitobj.upperLimit = getQty(parseFloat(upperLimitPercent), parseFloat(qty), true);
            limitobj.lowerLimit = getQty(parseFloat(lowerLimitPercent),parseFloat(qty) , false);

            log.debug({
                title: title + 'limitobj',
                details: limitobj
            });
        } catch (error) {
            log.error(title + error.name, error.message);
        }
        return limitobj;
    }

    function getQty(percentage, qty, upperLimit) {
        var title = 'getQty()::';
        var totalQty;
        try {

            var changeInQty = qty * (percentage / 100);
            if (upperLimit) {              
                totalQty = Math.round(qty + changeInQty);
            } else {
                totalQty = Math.round(qty - changeInQty);
            }

        } catch (error) {
            log.error(title + error.name, error.message);
        }
        log.debug(title+'totalqty',totalQty);
        return totalQty;



    }

    function sendEmail(data) {
        var title = 'sendEmail()::';
        try {
            var senderId = 5;
            email.send({
                author: senderId,
                recipients: 'Humzariaz66@gmail.com',
                subject: 'Limit Violation :: Item Receipt : ' + RECORDID,
                body: getEmailBody(data),
            });
        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }

    function getItemQtyLimitFromPO(poid) {
        var title = 'findLimitOnPO()::';
        var recordPo, linesCount, qty, item;
        var itemQtyMapObj = {};
        try {
            recordPo = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: poid,
                isDynamic: true
            });
            linesCount = recordPo.getLineCount({
                sublistId: 'item'
            });
            for (var i = 0; i < linesCount; i++) {
                item = recordPo.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                qty = recordPo.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });
                if (!itemQtyMapObj[item]) itemQtyMapObj[item] = {};

                itemQtyMapObj[item].quantity = qty;

            }
            return itemQtyMapObj || {};
        } catch (error) {
            log.error(title + error.name, error.message);
        }
    }

    function getEmailBody(list) {
        var title = "getEmailBody () :: ";
        var body = "";
        var successTbl, logObj, difference;
        try {

            successTbl = "<table border='1px'><tr><th>Line No</th><th>Item </th><th>Quantity On PO</th><th>Min-Max Limit</th><th>Total Quantity Received</th><th>Qty Difference By Limit</th></tr><tbody>";
            for (var i = 0; i < list.length; i++) {
                logObj = list[i];
                if(logObj.increase){
                    difference = parseInt(logObj.totalQtyReceived) - parseInt(logObj.limit);
                }else{
                    difference = parseInt(logObj.limit) - parseInt(logObj.totalQtyReceived) ;
                }
                
                successTbl += "<tr><td>" + logObj.line + "</td><td>" + logObj.item + "</td><td>" + logObj.qtyPO + "</td><td>" + logObj.totalLimit + "</td><td>" + logObj.totalQtyReceived + "</td><td>" + difference + "</td></tr>";
                // successLogs.push({id:logObj.id,networkVenue:logObj.networkVenue ,reqType : logObj.reqType})

            }
            successTbl += '</tbody></table>';

            body += "<h2>Item Receipt : " + RECORDID + "</h2></br>";
            body += successTbl;


            return body;
        } catch (error) {
            log.error({
                title: title + "Error",
                details: error.message
            });
        }

    }
    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit,
    };
});