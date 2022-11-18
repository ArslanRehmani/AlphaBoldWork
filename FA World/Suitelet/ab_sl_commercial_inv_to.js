        /**
         * @NApiVersion 2.0
         * @NScriptType Suitelet
         * @NModuleScope SameAccount
         */
        // eslint-disable-next-line no-undef
        define(['N/render','N/search','N/log','N/record','N/config','N/currentRecord'],

        function (render,search,log,record,config,currentRecord) {
            function onRequest(context) {
                var title = " onRequest() ";
                var params = context.request.parameters;
                var recId = params.id;
                log.debug(title+"Recid ->",recId);
                // var rec = currentRecord.get();
                try {
                    var response = context.response;
                    var inv = record.load({
                        type: 'invoice',
                        id: parseInt(recId)
                    });
                    var dDate = inv.getValue({
                        fieldId: 'trandate'
                    });
                    log.debug(title+"date ->",dDate);
                    var date = new Date(dDate);
                    var day = date.getDay();
                    var month = date.getMonth()+1;
                    var year = date.getFullYear();
                    var formateDate =  month +'/'+ day +'/'+ year;
                    var invnum = inv.getValue({
                        fieldId: 'tranid'
                    });
                    var TotalBox = inv.getValue({
                        fieldId: 'custbody4'
                    });
                    log.debug("TotalBox ->",TotalBox);
                    var BoxWeight = inv.getValue({
                        fieldId: 'custbody5'
                    });
                    log.debug("BoxWeight ->",BoxWeight);
                    var subtotal = inv.getValue({
                        fieldId: 'subtotal'
                    });
                    var amountdue = inv.getValue({
                        fieldId: 'amountremainingtotalbox'
                    });
                    var TOrcord = inv.getValue({
                        fieldId: 'custbody_interco_transfer_order'
                    });
                    var TOrcordLoad = record.load({
                        type: 'intercompanytransferorder',
                        id: parseInt(TOrcord)
                    });
                    var shipaddress = TOrcordLoad.getValue({
                        fieldId: 'shipaddress'
                    });
                    var transferlocation = TOrcordLoad.getText({
                        fieldId: 'transferlocation'
                    });
                    var subsidiary = TOrcordLoad.getText({
                        fieldId: 'subsidiary'
                    });
                    var OrderNum = TOrcordLoad.getText({
                        fieldId: 'tranid'
                    });
                    log.debug(title+"OrderNum ->",OrderNum);
                    
                    var obj;
                    var TransferOrderArray =[];
                    var count=0;
                    var itemfulfillmentSearchObj = search.create({
                        type: "itemfulfillment",
                        filters:
                        [
                            ["type","anyof","ItemShip"], 
                            "AND", 
                            ["quantity","greaterthan","0","1000"], 
                            "AND", 
                            ["createdfrom.type","anyof","TrnfrOrd"], 
                            "AND", 
                            ["account","anyof","512"], 
                            "AND", 
                            ["createdfrom.number","equalto",OrderNum]
                        ],
                        columns:
                        [
                            search.createColumn({name: "type", label: "Type"}),
                            search.createColumn({name: "tranid", label: "Document Number"}),
                            search.createColumn({
                            name: "tranid",
                            join: "createdFrom",
                            label: "Transfer Oder Number"
                            }),
                            search.createColumn({name: "account", label: "Account"}),
                            search.createColumn({name: "item", label: "Item"}),
                            search.createColumn({name: "quantity", label: "Quantity"}),
                            search.createColumn({name: "rate", label: "Item Rate"}),
                            search.createColumn({name: "amount", label: "Amount"}),
                            search.createColumn({name: "custcol7", label: "HTS"}),
                            search.createColumn({
                            name: "lastpurchaseprice",
                            join: "item",
                            label: "Last Purchase Price"
                            })
                        ]
                    });
                    var searchResultCount = itemfulfillmentSearchObj.runPaged().count;
                    log.debug("transferorderSearchObj result count",searchResultCount);
                    itemfulfillmentSearchObj.run().each(function(result){
                    obj ={};
                    var item = result.getText({ name: 'item' });
                    var jsonString = JSON.stringify(item);
                    jsonString = jsonString.replace(/&/g,'&amp;');
                    item = JSON.parse(jsonString);
                    var quantity = result.getValue({ name: 'quantity' });
                    var rate = result.getValue({ name: 'rate' });
                    var amount = result.getValue({ name: 'amount' });
                    var hts = result.getValue({ name: 'custcol7' });
                    var PurchasePrice = result.getValue({ name: 'lastpurchaseprice',join: 'item' });
                    obj.item = item
                    obj.quantity = quantity
                    obj.rate = rate
                    obj.amount = amount
                    obj.hts = hts
                    obj.PurchasePrice = PurchasePrice
                    TransferOrderArray.push(obj);
                    count += parseInt(quantity);
                        return true;
                    });
                    log.debug({
                        title: 'item_display--obj123',
                        details: TransferOrderArray
                    });
                    
                    
                    //Get line level data from invoice
                    var lineCountinv = inv.getLineCount({
                        sublistId: 'item'
                    });
                    log.debug(title+"lineCountinv ->",lineCountinv);
                    
                    var invItemLevelArray =[];
                    for (var i = 0; i < lineCountinv; i++) {
                        var obj = {};
                        
                        //returns true/false depending on user input for checkbox in item sublist
                        var amount = inv.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: i
                        });
                        var rate = inv.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: i
                        });
                        obj.amount = amount;
                        obj.rate = rate;
                        invItemLevelArray[i]= obj;
                    }
                    log.debug({
                        title: 'invItemLevelArray',
                        details: invItemLevelArray
                    });
                    //Company Information
                    var companyInfo = config.load({
                        type: config.Type.COMPANY_INFORMATION
                    });
                    var Streetaddress = companyInfo.getText({
                        fieldId: 'mainaddress_text'
                    });
                    log.debug({
                        title: 'Streetaddress',
                        details: Streetaddress
                    });
                    //END Get line level data from invoice
                    //Writing Template Code
                    var template = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">\
                    <pdf>\
                    <head>\
                    <macrolist>\
                        <macro id="nlheader">\
                            <table class="header" style="width: 100%;"><tr>\
                    <td align="center" ><span style="color:#ffffff;"><span class="title"><span style="background-color:#000000;">Commercial Invoice</span></span></span></td>\
                    </tr></table>\
                        </macro>\
                        <macro id="nlfooter">\
                            <table class="footer" style="width: 100%;"><tr>\
                    <td><barcode codetype="code128" showtext="true" value="'+invnum+'"/></td>\
                    <td align="right"><pagenumber/> of <totalpages/></td>\
                    </tr></table>\
                        </macro>\
                    </macrolist>\
                    <style type="text/css">\
                        table {\
                            font-size: 9pt;\
                            table-layout: fixed;\
                        }\
                        th {\
                            font-weight: bold;\
                            font-size: 8pt;\
                            vertical-align: middle;\
                            padding: 5px 6px 3px;\
                            background-color: #e3e3e3;\
                            color: #333333;\
                        }\
                        td {\
                            padding: 4px 6px;\
                        }\
                        td p { align:left }\
                        b {\
                            font-weight: bold;\
                            color: #333333;\
                        }\
                        table.header td {\
                            padding: 0px;\
                            font-size: 10pt;\
                        }\
                        table.footer td {\
                            padding: 0px;\
                            font-size: 8pt;\
                        }\
                        table.itemtable th {\
                            padding-bottom: 10px;\
                            padding-top: 10px;\
                        }\
                        table.body td {\
                            padding-top: 2px;\
                        }\
                        table.total {\
                            page-break-inside: avoid;\
                        }\
                        tr.totalrow {\
                            background-color: #e3e3e3;\
                            line-height: 200%;\
                        }\
                        td.totalboxtop {\
                            font-size: 12pt;\
                            background-color: #e3e3e3;\
                        }\
                        td.addressheader {\
                            font-size: 8pt;\
                            padding-top: 6px;\
                            padding-bottom: 2px;\
                        }\
                        td.address {\
                            padding-top: 0px;\
                        }\
                        td.totalboxmid {\
                            font-size: 28pt;\
                            padding-top: 20px;\
                            background-color: #e3e3e3;\
                        }\
                        td.totalboxbot {\
                            background-color: #e3e3e3;\
                            font-weight: bold;\
                        }\
                        span.title {\
                            font-size: 28pt;\
                        }\
                        span.number {\
                            font-size: 16pt;\
                        }\
                        span.itemname {\
                            font-weight: bold;\
                            line-height: 150%;\
                        }\
                        hr {\
                            width: 100%;\
                            color: #d3d3d3;\
                            background-color: #d3d3d3;\
                            height: 1px;\
                        }\
                </style>\
                </head>\
                    <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">\
                        <table style="width: 100%; margin-top: 10px;">\
                        <tr>\
                        <td>Date:' +formateDate+'</td>\
                        <td>Invoice # : '+invnum+'</td>\
                        </tr>\
                        <tr>\
                        <td>SHIPPER NAME: '+subsidiary+'</td>\
                        <td>CONSIGNEE NAME : '+shipaddress+'</td>\
                        </tr>\
                        <tr>\
                        <td>CONTACT PERSON: GLEN HAMMERLE</td>\
                        <td>CONTACT PERSON: MASASHI SEKI</td>\
                        </tr>\
                        <tr>\
                        <td>STREET ADDRESS: '+Streetaddress+'</td>\
                        <td>STREET ADDRESS: TSM BUILDING.2F, 4-14-8 NISHI-MIZUE EDOGAWA-KU</td>\
                        </tr>\
                        <tr>\
                        <td> <table>\
                            <tr>\
                        <td>CITY: LOS ANGELES</td>\
                        <td>POSTAL CODE: 90021</td>\
                        </tr>\
                            </table></td>\
                        <td> <table>\
                            <tr>\
                        <td>CITY: TOKYO</td>\
                        <td>POSTAL CODE: 1340015</td>\
                        </tr>\
                            </table></td>\
                        </tr>\
                        \
                        <tr>\
                        <td> <table>\
                            <tr>\
                        <td>COUNTRY: UNITED STATES</td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        <td> <table>\
                            <tr>\
                        <td>COUNTRY: JAPAN</td>\
                        <td>EMAI ADDRESS: MSEKI@MECOM</td>\
                        </tr>\
                            </table></td>\
                        </tr>\
                        \
                        <tr>\
                        <td> <table>\
                            <tr>\
                        <td>TELEPHONE # </td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        <td> <table>\
                            <tr>\
                        <td>TELEPHONE #</td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        </tr>\
                        \
                        <tr>\
                        <td> <table>\
                            <tr>\
                        <td>(513) 720-2465 </td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        <td> <table>\
                            <tr>\
                        <td>81358793101</td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        </tr>\
                        \
                        <tr>\
                        <td> <table>\
                            <tr>\
                        <td>TAX ID NUMBER (EIN): 452286186 </td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        <td> <table>\
                            <tr>\
                        <td></td>\
                        <td>INCOTERMS: EXW</td>\
                        </tr>\
                            </table></td>\
                        </tr>\
                        \
                            <tr>\
                        <td> <table>\
                            <tr>\
                        <td>TOTAL PCS:' +count+'</td>\
                        <td>TOTAL BOXES: '+ TotalBox+'</td>\
                        </tr>\
                            </table></td>\
                        <td> <table>\
                            <tr>\
                        <td>TOTAL GROSS WEIGHT IN KILOS: '+ BoxWeight+'</td>\
                        <td></td>\
                        </tr>\
                            </table></td>\
                        </tr>\
                        </table>';
                        //List of items in Transfer Order
                        template += '<table style="width=100%; margin-top: 10px;margin-bottom: 0px; ">\
                <thead>\
                        <tr style="background-color: #d3d3d3; ">\
                        <th align="center" style=" font-weight: bold; " width="320pt">COMMODITY DESCRIPTION</th>\
                        <th align="center" style="font-weight: bold; " width="240pt">QUANTITY</th>\
                        <th align="center" style="font-weight: bold; " width="250pt">UNIT PRICE USD</th>\
                        <th align="center" style="font-weight: bold; " width="250pt">TOTAL PRICE USD</th>\
                        <th align="center" style="font-weight: bold; " width="250pt">HST CODE</th>\
                        <th align="center" style="font-weight: bold; " width="270pt">PURCHASE PRICE</th>\
                        </tr>\
                    </thead>';
                    var Subtotal = 0;
                    for(var i = 0 ; i < TransferOrderArray.length;i++){
                        var item = TransferOrderArray[i];
                        var TotalPriceUSD = (parseFloat (item.quantity))*(parseFloat (item.rate));
                        var TotalPrice = TotalPriceUSD.toFixed(2);
                            Subtotal += TotalPriceUSD;
                            log.debug({
                                title: 'Subtotal',
                                details: Subtotal
                            });
                            var SubTotal = Subtotal.toFixed(2);
                        // var itemMaterData = itemMasterArray[i];
                        template += '<tr>\
                        <td align="center" style="">'+item.item+'</td>\
                        <td align="center" style="">'+item.quantity+'</td>\
                        <td align="center" style="">'+item.rate+'</td>\
                        <td align="center" style="">'+TotalPrice+'</td>\
                        <td align="center" style="">'+item.hts+'</td>\
                        <td align="center" style="">'+item.PurchasePrice+'</td>\
                        </tr>';
                    }
                    template +='</table>';
                template += "<p>&nbsp;</p>";
                template +=     '<hr />\
                            <table class="total" style="width: 100%; margin-top: 10px;">\
                            <tr>\
                            <td colspan="4">I/we hereby certify that the information on this invoice is true and correct and that the contents of this shipment are as stated above.</td>\
                            <td align="right"><b>Subtotal</b></td>\
                            <td align="right">'+SubTotal+'</td>\
                            </tr>\
                            <tr>\
                            <td colspan="4">Signature and Date of Authorized Person.</td>\
                        </tr>';
                            // <tr class="totalrow">\
                            // <td background-color="#ffffff" colspan="4">&nbsp;</td>\
                            // <td align="right"><b>Amount Due</b></td>\
                            // <td align="right">'+amountdue+'</td>\
                            // </tr>
                            template += '</table>\
                    </body>\
                    </pdf>';
                    
                    //Using "N/render" Module to Generate PDF
                    var pdfFile = render.xmlToPdf({
                        xmlString: template
                    });
                    response.writeFile(pdfFile, true);

                } catch (e) {
                    log.error("Error in " + title, e);
                }
            }

            return {
                onRequest: onRequest
            };
        });