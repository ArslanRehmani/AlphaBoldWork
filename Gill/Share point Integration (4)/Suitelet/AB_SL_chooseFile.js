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
            var response = context.response;
            var params = context.request.parameters;
            var recId = params.id;
          
            var template = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
            template += "<pdfset>";
            //PDF 1
            template += "<pdf>";
            template += "<head>";
            template += "<link name='NotoSans' type='font' subtype='truetype' src='${nsfont.NotoSans_Regular}' src-bold='${nsfont.NotoSans_Bold}' src-italic='${nsfont.NotoSans_Italic}' src-bolditalic='${nsfont.NotoSans_BoldItalic}' bytes='2' />\
             <style>\
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
              table.border{\
                border: 1px solid black;\
              }\
              td.borderRight{\
                border-right: 1px solid black;\
              }\
              td.borderLeft{\
                border-left: 1px solid black;\
              }\
              td.Tdborder{\
                border-top: 1px solid black;\
              }\
        </style>\
        </head>";
            template += "<body padding='0.5in 0.5in 0.5in 0.5in' size='Letter'>";

            template += '<table class="border" style="width=100%;">\
                                <tr style="background-color: #d3d3d3; ">\
                                <th align="center" style=" font-weight: bold; " width="270pt">Item</th>\
                                <th align="center" style=" font-weight: bold; " width="260pt">Qty</th>\
                                </tr>';
            //   for(var i = 0 ; i < groupItemArray.length;i++){
                //   var item = groupItemArray[i];
            template += '<tr>\
                            <td align="center" style="">+item.item+</td>\
                                <td align="center" style="">+item.qty+</td>\
                        </tr>';
            //   }
            template += '</table>';
            template += "</body>";
            template += "</pdf>";
            template += "</pdfset>";
            //Using "N/render" Module to Generate PDF
            var pdfFile = render.xmlToPdf({
                xmlString: template
            });
            response.writeFile(pdfFile, true);
        }
        return {
            onRequest: onRequest
        };
    });