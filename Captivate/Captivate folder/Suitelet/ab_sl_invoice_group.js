/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
// eslint-disable-next-line no-undef
define(['N/render', 'N/search', 'N/log', 'N/record', 'N/config'],

    function (render, search, log, record, config) {
        function onRequest(context) {
            var title = " onRequest() ";
            var params = context.request.parameters;
            var recId = params.id;
            log.debug(title + "Recid ->", recId);
            try {
                var companyInformation = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });
                var companyname = companyInformation.getValue({
                    fieldId: 'companyname'
                });
                var mainaddress_text = companyInformation.getValue({
                    fieldId: 'mainaddress_text'
                });
                log.debug(title + 'companyname->', companyname);
                log.debug(title + 'mainaddress_text->', mainaddress_text);
                var response = context.response;
                var searchResult = getInvoiceGroupData(recId);
                log.debug(title + 'grouped invoce ->', searchResult);
                var subsidiaryID = searchResult.subsidiary;
                var subsidiaryData = record.load({
                    type: 'subsidiary',
                    id: subsidiaryID,
                });
                var subName = subsidiaryData.getValue({
                    fieldId: 'name'
                });
                var RemittanceAddress = subsidiaryData.getValue({
                    fieldId: 'mainaddress_text'
                });
                log.debug(title + 'subName', subName);
                log.debug(title + 'RemittanceAddress', RemittanceAddress);
                var address = RemittanceAddress.substring(37);
                //Writing Template Code
                var template = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
                template += "<pdfset>";
                //PDF 1
                template += "<pdf>";
                template += "<head>";
                template += '<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'
                template += '<macrolist>';
                template += '<macro id="nlheader">';
                template += '<table  width="100%" table-layout="fixed"><tr>\
             <td width="65%" align="left" ><img src="https://450196-sb2.app.netsuite.com/core/media/media.nl?id=1795002&amp;c=450196_SB2&amp;h=FS25UuDtIe-reVdzTPIRpP8-HFZX-ZNl_SA_b9hNOHnmbn72&amp;fcts=20200924003132&amp;whence="></img></td>\
             <td width="35%"><span>'+ RemittanceAddress + '</span><br /><span>Invoice Group ' + searchResult.invoicegroupnumber + '</span><br /><br /><span>Date ' + formateDate(searchResult.trandate) + '</span></td>\
             </tr>\
             </table>';
                //third td below
                //  <td width="25%"><span>'+companyname+'</span><br /><span>'+mainaddress_text+'</span><br /><br /><span>Date '+formateDate(searchResult.trandate)+'</span></td>\
                //  template += '<table class="header" style="width: 100%;"><tr>\
                //  <td rowspan="3"><img src="https://450196-sb1.secure.netsuite.com/core/media/media.nl?id=1795002&amp;c=450196_SB1&amp;h=bVHNLUhBQmj2wAC0sSgsMwFfsPG2_yip_oWOG8MI-I253QVa" style="float: left; margin: 7px"></img><span class="nameandaddress">'+companyname+'</span><br /><span class="nameandaddress">'+mainaddress_text+'</span></td>\
                //  <td align="right">&nbsp;</td>\
                //  </tr>\
                //  <tr>\
                //  <td align="right">'+formateDate(searchResult.trandate)+'</td>\
                //  </tr></table>';
                //template += '<table class="header" style="width: 100%"><tr><td ><img src="https://450196-sb1.secure.netsuite.com/core/media/media.nl?id=1795002&amp;c=450196_SB1&amp;h=bVHNLUhBQmj2wAC0sSgsMwFfsPG2_yip_oWOG8MI-I253QVa" style="float: left; margin: 7px"></img></td></tr></table>';
                template += '</macro>';
                template += '<macro id="nlfooter">';
                template += '<table width="100%"><tr><td align="left">Page <pagenumber/>/<totalpages/></td></tr></table>';
                template += '</macro>';
                template += '</macrolist>';
                template += "</head>";
                template += "<body header='nlheader' header-height='14%' padding='0.5in 0.5in 0.5in 0.5in' size='Letter'>";
                //  template += "<p>&nbsp;</p>"; 
                template += "<table style='width: 100%;'><tr>\
             <td colspan='5' style='width: 50%;'>\
             <table style='width: 60%;'>\
             <tr>\
             <td >"+ address + "</td>\
             </tr>\
             <tr >\
                 <td style='font-size: 13pt; font-weight: bold;'><br />Bill Address</td>\
                 </tr>\
                 <tr>\
                 <td>"+ searchResult.customer + "<br /> " + searchResult.billaddress + "</td>\
                 </tr>\
                 </table>\
             </td>\
             <td colspan='5' style='width: 50%;'>\
             <table>";
             template +=
             '<tr>\
             <td >&nbsp;</td>\
             </tr>\
             <tr>\
             <td >&nbsp;</td>\
             </tr>\
             <tr>\
             <td >&nbsp;</td>\
             </tr>\
             <tr>\
                <td align="left" style="background-color: #d3d3d3; font-weight: bold; color: rgb(51, 51, 51); width: 180pt;">Amount Paid</td>\
                <td style="background-color: #d3d3d3;">&nbsp;</td>\
                <td align="right" style="font-weight: bold; width: 100px;">$'+ searchResult.amountpaid + '</td>\
             </tr>\
             <tr>\
                <td align="left" style="background-color: #d3d3d3; font-weight: bold; color: rgb(51, 51, 51); width: 180pt;">Amount Due</td>\
                <td style="background-color: #d3d3d3;">&nbsp;</td>\
                <td align="right" style="font-weight: bold; width: 100px;">$'+ searchResult.amountdue + '</td>\
             </tr>\
             <tr>\
                <td align="left" style="background-color: #d3d3d3; font-weight: bold; color: rgb(51, 51, 51); width: 180pt;">Total Amount</td>\
                <td style="background-color: #d3d3d3;">&nbsp;</td>\
                <td align="right" style="font-weight: bold; width: 100px;">$'+ searchResult.total + '</td>\
             </tr>\
                 </table>\
             </td>\
             </tr></table>';
                template += "<p>&nbsp;</p>";
                //Primary information commented on customer requirment
                //  template += '<table style="break-inside: avoid; margin-top: 10px; width: 677px;"><tr style="">\
                //  <td align="left"><strong>Primary Information</strong></td>\
                //  </tr></table>';
                //Primary Information details here using for loop
                template += '<table class="body" style="width: 100%; margin-top: 10px;"><tr style="background-color: #d3d3d3; ">\
             <th align="center" style="font-weight: bold; " width="200pt">Customer Name</th>\
             <th align="center" style="font-weight: bold; " width="150pt">Transaction Date</th>';
                //  <th align="center" style="font-weight: bold; " width="150pt">Transaction Date</th>\
                template += '<th align="center" style="font-weight: bold; " width="100pt">Terms</th>\
             <th align="center" style="font-weight: bold; " width="100pt">Due Date</th>\
             <th align="center" style="font-weight: bold; " width="200pt"><span class="title">Subsidiary</span></th>\
             <th align="center" style="font-weight: bold; " width="100pt"><span class="title">Currency</span></th>\
             </tr>\
             <tr>\
             <td align="center" style="">'+ searchResult.customer + '</td>\
             <td align="center" style="">'+ formateDate(searchResult.trandate) + '</td>';
                //  <td align="center" style="">'+formateDate(searchResult.trandate)+'</td>\
                template += '<td align="center" style="">' + searchResult.term + '</td>\
             <td align="center" style="">'+ formateDate(searchResult.duedate) + '</td>\
             <td align="center" style=""><span class="number">'+ searchResult.subsidiaryText + '</span></td>\
             <td align="center" style=""><span class="number">'+ searchResult.currency + '</span></td>\
             </tr></table>';
                //template += '<#if groupedinvoices_detailed?has_content>';
                template += '<table style="break-inside: avoid; margin-top: 10px; width: 647px;"><tr style="">\
             <td align="left"><strong>Invoice Group Detail</strong></td>\
             </tr></table>';
                //Invoice Group Detail here useing for loop
                template += '<table style="width=100%; margin-top: 10px;margin-bottom: 0px; ">\
             <thead>\
                    <tr style="background-color: #d3d3d3; ">\
                    <th align="center" style="font-weight: bold; " width="220pt">Invoice Number</th>\
                    <th align="center" style=" font-weight: bold; " width="190pt">Item Total</th>\
                    <th align="center" style=" font-weight: bold; " width="210pt">Discount Total</th>\
                    <th align="center" style="font-weight: bold; " width="180pt">Tax Total</th>\
                    <th align="center" style="font-weight: bold; " width="210pt">Shipping Total</th>\
                    <th align="center" style="font-weight: bold; " width="210pt">Handling Total</th>';
                template += '<th align="center" style=" font-weight: bold;" width="200pt">Amount</th>\
                    </tr>\
                </thead>';
                for (var i = 0; i < searchResult.items.length; i++) {
                    var item = searchResult.items[i];
                    var item_item = item.invoiceNum;
                    var rate;

                    if (item.itemType == 'TaxItem') {
                        rate = item.rate + '%';
                    } else {
                        rate = '$' + item.rate;
                    }
                    var item_inv = item_item.slice(9, 18);
                    template += '<tr>\
                    <td align="center" style="">'+ item_inv + '</td>\
                    <td align="center" style="">$ '+ item.itemTotal + '</td>\
                    <td align="center" style="">$ '+ item.discounttotal + '</td>\
                    <td align="center" style="">$ '+ item.trantaxtotal + '</td>\
                    <td align="center" style="">'+ item.shippingcost + '</td>\
                    <td align="center" style="">'+item.handlingcost+'</td>';
                    template += '<td align="center" style="">$' + item.amount + '</td>\
                    </tr>';
                }
                template += '</table>';
                template += "<p>&nbsp;</p>";



                //testing
                template += '<table width="100%" table-layout="fixed">\
                 <tr>\
                     <td width="35%">\
                     </td>\
                     <td width="30%">\
                     </td>\
                     <td width="35%">\
                         <table style="width: 100%;" table-layout="fixed" padding-right="-12px" margin-top="-40px">\
                             <tr>\
                             <td align="left" style=" color: rgb(51, 51, 51);  width: 160pt;">Tax Total</td>\
                             <td>&nbsp;</td>\
                             <td align="right" style="width: 100px ">$'+ searchResult.taxTotal + '</td>\
                             </tr>';
                //  <tr>\
                //  <td align="left" style=" color: rgb(51, 51, 51); width: 160px;">Shipping Cost</td>\
                //  <td>&nbsp;</td>\
                //  <td align="right" style="width: 100px ">$ '+searchResult.shippingcost+'</td>\
                //  </tr>\
                //  <tr>\
                //  <td align="left" style=" color: rgb(51, 51, 51); width: 160pt;">${record.handlingcost@label}</td>\
                //  <td>&nbsp;</td>\
                //  <td align="right" style="width: 100px ">${record.handlingcost}</td>\
                //  </tr>\
                template += '<tr>\
                             <td align="left" style="background-color: #d3d3d3; font-weight: bold; color: rgb(51, 51, 51); width: 180pt;">Total Amount </td>\
                             <td style="background-color: #d3d3d3;">&nbsp;</td>\
                             <td align="right" style="background-color: #d3d3d3; font-weight: bold; width: 100px;">$'+ searchResult.total + '</td>\
                             </tr>\
                         </table>\
                     </td>\
                 </tr>\
             </table>';







                //testing end
                template += '<table style="width=100%; margin-top: 10px;margin-bottom: 0px; border: 1px solid;"><tr>\
             <td style="font-size: 10pt;">For Billing or payment questions:<br />accountsreceivable@captivate.com (978)845-5094<br />For non-billing questions:<br />customersuccess@captivate.com<br /><br /><br />Webster Bank,NA.<br />a/c # 0010930391<br />Wire/ACH: ABA # 211170101<br />Swift Code: WENAUS31<br />Please send an email notification to accountsreceivable@captivate.com</td>';
                if (subsidiaryID == 3) {
                    template += '<td style="font-size: 10pt;">Verticore Communications, Ltd. c.o.b. as,<br />\
                Captivate Network<br />\
                Business Number: 899364871RT<br />\
                QST Reg# 1210585199 QT0001</td>';
                }
                template += '</tr></table>';
                template += "</body>";
                template += "</pdf>";
                template += "</pdfset>";



                //  template += "<pdfset>";
                //  //PDF 1
                //  template += "<pdf>";
                //  template += "<head>";
                //  template += "<link name='cyberbit' type='font' subtype='opentype' src='NetSuiteFonts/Cyberbit.ttf' bytes='2'/>"
                //  template += '<macrolist>';
                //  template += '<macro id="nlfooter">';
                //  template += '<table width="100%"><tr><td align="right">Page <pagenumber/>/<totalpages/></td></tr></table>';
                //  template += '</macro>';
                //  template += '</macrolist>';
                //  template += "</head>";
                //  template += "<body  height='6.69in' width='4.27in' footer='nlfooter' footer-height='20px' padding='0.5in 0.5in 0.5in 0.5in'>";
                //  template += "<p>Hello World Once 1!</p>";
                // //  template += "<pbr />";
                //  template += "<p>Hello World Once 2!</p>";
                //  template += "</body>";
                //  template += "</pdf>";
                //  template += "</pdfset>";


                //Using "N/render" Module to Generate PDF
                var pdfFile = render.xmlToPdf({
                    xmlString: template
                });
                response.writeFile(pdfFile, true);

            } catch (e) {
                log.error("Error in " + title, e);
            }
        }
        function formateDate(trandate) {
            var date = new Date(trandate);
            var day = date.getDay();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var formateDate = month + '/' + day + '/' + year;
            return formateDate;

        }
        function getInvoiceGroupData(recid) {
            var title = 'getInvoiceGroupData()::';
            var groupInvoiceData = {
                items: []
            };
            try {
                log.debug(title + "recbefore", recid);
                var rec = record.load({
                    type: 'invoicegroup',
                    id: parseInt(recid),
                    isDynamic: true,
                });
                log.debug(title + "rec", rec);
                var customer = rec.getValue({
                    fieldId: 'customer'
                });
                groupInvoiceData.customer = getcustomer(customer);
                groupInvoiceData.billaddress = rec.getValue({
                    fieldId: 'billaddress'
                });
                groupInvoiceData.trandate = rec.getValue({
                    fieldId: 'trandate'
                });
                var terms = rec.getValue({
                    fieldId: 'terms'
                });
                groupInvoiceData.term = getterm(terms);
                groupInvoiceData.duedate = rec.getValue({
                    fieldId: 'duedate'
                });
                groupInvoiceData.invoicegroupnumber = rec.getValue({
                    fieldId: 'invoicegroupnumber'
                });
                groupInvoiceData.taxTotal = rec.getValue({
                    fieldId: 'taxtotal'
                });
                groupInvoiceData.shippingcost = rec.getValue({
                    fieldId: 'shippingcost'
                });
                groupInvoiceData.total = rec.getValue({
                    fieldId: 'total'
                });
                groupInvoiceData.amountpaid = rec.getValue({
                    fieldId: 'amountpaid'
                });
                groupInvoiceData.amountdue = rec.getValue({
                    fieldId: 'amountdue'
                });
                groupInvoiceData.currency = rec.getText({
                    fieldId: 'currency'
                });
                groupInvoiceData.subsidiary = rec.getValue({
                    fieldId: 'subsidiary'
                });
                groupInvoiceData.subsidiaryText = rec.getText({
                    fieldId: 'subsidiary'
                });
                log.debug(title + "groupInvoiceData.invoicegroupnumber", groupInvoiceData.invoicegroupnumber);
                var searchData = getSearchData(groupInvoiceData.invoicegroupnumber);
                groupInvoiceData.items = searchData;
                log.debug(title + "searchData", searchData);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return groupInvoiceData || {};
        }
        function getSearchData(groupid) {
            var title = 'getSearchData()::';
            try {
                var invoiceArray = [];
                var obj;
                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["type", "anyof", "CustInvc"],
                            "AND",
                            ["formulatext: {groupedto}", "is", groupid],
                            "AND",
                            ["formulatext: {item}", "isnotempty", ""],
                            "AND", 
                            ["taxline","is","F"]
                            //    ,
                            //    "AND", 
                            //    ["formulatext: {item.type}","isnot","Sales Tax Item"]//change
                        ],
                    columns:
                        [
                            search.createColumn({ name: "invoicenum", label: "Invoice Number" }),
                            search.createColumn({ name: "custbody5", label: "Site" }),
                            search.createColumn({ name: "quantity", label: "Quantity" }),
                            search.createColumn({ name: "item", label: "Item" }),
                            search.createColumn({ name: "type", join: "item", label: "Type" }),
                            search.createColumn({ name: "rate", label: "Item Rate" }),
                            search.createColumn({ name: "taxcode", label: "Tax Item" }),
                            search.createColumn({ name: "grossamount", label: "Amount (Gross)" }),
                            search.createColumn({name: "total", label: "Amount (Transaction Total)"}),
                            search.createColumn({name: "discounttotal", label: "Discount Total"}),
                            search.createColumn({name: "trantaxtotal", label: "Tax Total"}),
                            search.createColumn({name: "amount", label: "Amount"}),
                            search.createColumn({name: "shippingcost", label: "Shipping Cost"}),
                            search.createColumn({name: "handlingcost", label: "Handling Cost"})
                        ]
                });

                invoiceSearchObj.run().each(function (result) {
                    obj = {};

                    obj.invoiceid = result.id;
                    obj.invoiceNum = result.getValue({ name: 'invoicenum' });
                    obj.site = result.getText({ name: 'custbody5' });
                    obj.quantity = result.getValue({ name: 'quantity' });
                    obj.item = result.getText({ name: 'item' });
                    obj.rate = result.getValue({ name: 'rate' });
                    obj.itemType = result.getValue({ name: "type", join: "item" });
                    obj.taxcode = result.getText({ name: 'taxcode' });
                    obj.grossamount = result.getValue({ name: 'grossamount' });
                    obj.itemTotal = result.getValue({ name: 'total' });
                    obj.discounttotal = result.getValue({ name: 'discounttotal' });
                    obj.trantaxtotal = result.getValue({ name: 'trantaxtotal' });
                    obj.amount = result.getValue({ name: 'amount' });
                    obj.shippingcost = result.getValue({ name: 'shippingcost' });
                    obj.handlingcost = result.getValue({ name: 'handlingcost' });
                    invoiceArray.push(obj);
                    return true;
                });
            } catch (error) {
                log.error(title + error.name, error.message)
            }
            return invoiceArray || [];
        }
        function getcustomer(customerid) {
            var title = 'getcustomer()::';
            try {
                var rec = record.load({
                    type: 'customer',
                    id: customerid,
                    isDynamic: true,

                });
                var customername = rec.getValue({
                    fieldId: 'companyname'
                });
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return customername || '';
        }
        function getterm(termid) {
            var title = 'getterm()::';
            try {
                var rec = record.load({
                    type: 'term',
                    id: termid,
                    isDynamic: true,

                });
                var termname = rec.getValue({
                    fieldId: 'name'
                });
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return termname || '';
        }
        return {
            onRequest: onRequest
        };
    });