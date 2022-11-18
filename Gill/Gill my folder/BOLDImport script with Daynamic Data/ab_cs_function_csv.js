        /**
         *@NApiVersion 2.0
        *@NScriptType ClientScript
        */
        define(['N/record', 'N/search', 'N/currentRecord', '../class/ab_CLS_boldImportRecords.js', '../common/ab_lib_convertCSVToJson.js'], function (record, search, currentRecord, importRecordCLS, convertCSVLIB) {

            function pageInit(context) {
                try {
                    
                    window.swapRow = swapRow;
                    var headerFields;
                    recType(context);

                    var record = currentRecord.get();
                    var currentRec =  context.currentRecord;
                    var fieldId3 = context.fieldId;
    
                    var recordField = record.getValue({
                        fieldId: 'custpage_ab_record_type'
                    });
                    //var recordField = 'salesorder'

                    var csvdata = localStorage.getItem('csvData')
                    if(csvdata){
                    var csv_json =  JSON.parse(csvdata);
                    if(csv_json.length){
                        headerFields = Object.keys(csv_json[0]);
                    }
                    }


            if (recordField) {
                var recordFields = getRecordFields(recordField)
                console.log('Fileds ->', recordFields);
                if (recordFields.length) {
                var recordFieldVal = window.nlapiGetFieldValue('custpage_hidden_data_field')
                var html = '<!DOCTYPE html>\
                    <html lang="en">\
                    <head>\
                    <meta charset="utf-8">\
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\
                    <title></title>\
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round|Open+Sans">\
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">\
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">\
                    <script src="https://code.jquery.com/jquery-3.6.1.min.js"></script>\
                    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"></script>\
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>\
                    <style>\
                    body {\
                        color: #404E67;\
                        background: #F5F7FA;\
                        font-family: "Open Sans", sans-serif;\
                    }\
                    .table-wrapper {\
                        width: 700px;\
                        margin: 30px auto;\
                        background: #fff;\
                        padding: 20px;box-shadow: 0 1px 1px rgba(0,0,0,.05);\
                    }\
                    .table-title {\
                        padding-bottom: 10px;\
                    }\
                    .table-title h2 {\
                        font-size: 22px;\
                        align :center;\
                    }\
                    .table-title .add-new {\
                        float: right;\
                        height: 30px;\
                        font-weight: bold;\
                        font-size: 12px;\
                        text-shadow: none;\
                        min-width: 100px;\
                        border-radius: 50px;\
                        line-height: 13px;\
                    }\
                    .table-title .add-new i {\
                        margin-right: 4px;\
                    }\
                    table.table {\
                        table-layout: fixed;\
                    }\
                    table.table tr th, table.table tr td {\
                        border-color: #e9e9e9;\
                    }\
                    table.table th i {\
                        font-size: 13px;\
                        margin: 0 5px;\
                        cursor: pointer;\
                    }\
                    table.table th:last-child {\
                        width: 100px;\
                    }\
                    table.table td a {\
                        cursor: pointer;\
                        display: inline-block;\
                        margin: 0 5px;\
                        min-width: 24px;\
                    }\
                    table.table td a.add {\
                        color: #27C46B;\
                    }\
                    table.table td a.edit {\
                        color: #FFC107;\
                    }\
                    table.table td a.delete {\
                        color: #E34724;\
                    }\
                    table.table td i {\
                        font-size: 19px;\
                    }\
                    table.table td a.add i {\
                        font-size: 24px;\
                        margin-right: -1px;\
                        position: relative;\
                        top: 3px;\
                    }\
                    table.table .form-control {\
                        height: 32px;\
                        line-height: 32px;\
                        box-shadow: none;\
                        border-radius: 2px;\
                    }\
                    table.table .form-control.error {\
                        border-color: #f50000;\
                    }\
                    table.table td .add {\
                        display: none;\
                    }\
                    #right-Float {\
                    float: right;\
                    }\
                    #left-Float {\
                    float: left;\
                    }\
                    </style>\
                    </head>\
                    <body>\
                    <form>\
                    <div class="container-lg">\
                        <div id="left-Float" style="width: 25%;">\
                            <div class="table-wrapper" style="width: 80%;">\
                                <div class="table-title">\
                                    <div class="row">\
                                        <div class="col-sm-4"><h2>NetSuite Record</h2></div>\
                                    </div>\
                                </div>\
                                <table class="table table-bordered " id= "NetSuitetbl" >\
                                    <thead>\
                                        <tr>\
                                            <th>NetSuite Field Name</th>\
                                        </tr>\
                                    </thead>\
                                    <tbody id= "NetSuiteTblBody">';
                                    for (var i = 0; i <= recordFields.length - 1; i++) {
                                        var datarec = recordFields[i];
                                        var mandatoryData = datarec.isMandator;
                                        var staric = '*(required)';
                                        if(mandatoryData == true){
                                            html += '<tr>\
                                        <td class = "fields" data-id = "'+datarec.id+'" name = "mapFields"><a onclick="swapRow(event)" title="Delete"><i class="fa fa-arrows-h"></i></a>'+ datarec.name +''+staric+'</td>\
                                        </tr>'
                                        }else{
                                            html += '<tr>\
                                        <td class = "fields" data-id = "'+datarec.id+'" name = "mapFields"><a onclick="swapRow(event)" title="Delete"><i class="fa fa-arrows-h"></i></a>'+ datarec.name +'</td>\
                                        </tr>'
                                        }   
                                    }
                        html += '</tbody>\
                                </table>\
                            </div>\
                        </div>\
                        <div id="left-Float" style="width: 25%;">\
                            <div class="table-wrapper" style="width: 80%;">\
                                <div class="table-title">\
                                    <div class="row">\
                                        <div class="col-sm-4"><h2>NetSuite Record Mapping</h2></div>\
                                    </div>\
                                </div>\
                                <table class="table table-bordered" id= "NetSuitetblMap" >\
                                    <thead>\
                                        <tr>\
                                            <th>NetSuite Field Map</th>\
                                        </tr>\
                                    </thead>\
                                    <tbody id= "NetSuitemapTblBody">\
                                    </tbody>\
                                </table>\
                            </div>\
                        </div>\
                        <div id="right-Float" style="width: 25%;">\
                            <div class="table-wrapper" style="width: 80%;">\
                                <div class="table-title">\
                                    <div class="row">\
                                        <div class="col-sm-4"><h2>CSV Record</h2></div>\
                                    </div>\
                                </div>\
                                <table class="table table-bordered" id= "CSVtbl" >\
                                    <thead>\
                                        <tr>\
                                            <th>CSV Field Name</th>\
                                        </tr>\
                                    </thead>\
                                    <tbody id= "CSVtblBody">';
                                    for (var i = 0; i <= headerFields.length - 1; i++) {
                                        var headerField = headerFields[i];
                                        html += '<tr>\
                                        <td class = "fields" data-id = "'+headerField+'" name = "CSVFields"><a onclick="swapRow(event)" title="Delete"><i class="fa fa-arrows-h"></i></a>'+ headerField+'</td>\
                                        </tr>'
                                    }

                                    html +=   '</tbody>\
                                </table>\
                            </div>\
                        </div>\
                        <div id="right-Float" style="width: 25%;">\
                            <div class="table-wrapper" style="width: 80%;">\
                                <div class="table-title">\
                                    <div class="row">\
                                        <div class="col-sm-4"><h2>CSV Record Mapping</h2></div>\
                                    </div>\
                                </div>\
                                <table class="table table-bordered" id= "CSVtblMap" >\
                                    <thead>\
                                        <tr>\
                                            <th>CSV Field Map</th>\
                                        </tr>\
                                    </thead>\
                                    <tbody id= "CSVmapTblBody">\
                                    </tbody>\
                                </table>\
                            </div>\
                        </div>\
                    </div>\
                    </form>\
                    </body>\
                    </html>';
                            window.nlapiSetFieldValue('custpage_hidden_data_field', html)
                }
            }
                    console.log('recordField1', recordField);
                    console.log("fieldId3" , fieldId3)
                    if(fieldId3 != "undefined"){
                    if (fieldId3 == 'custpage_ab_record_type') {
                        console.log('PageValue', val);
                        var recordField = record.setValue({
                            fieldId: 'custpage_ab_record_type',
                            value: localStorage.setItem('recscan')
                        });
                    }
                }


                    window.getJsonCSV = convertCSVLIB.getJsonCSV;
                    window.csvJSON = convertCSVLIB.csvJSON;
                } catch (e) {
                    alert("ERROR" + e.message)
                }
            }

            function recType(context) {
                try {
                    var record = currentRecord.get();
                    var importRecords = importRecordCLS.getList();
                    console.log('options->', importRecords);
                    var importRec = record.getField('custpage_ab_record_type');
                    if (!!importRec) {
                        importRec.removeSelectOption({
                            value: null
                        });
                        if (importRecords.length != 0) {
                            for (var i in importRecords) {
                                importRec.insertSelectOption({
                                    value: importRecords[i].value,
                                    text: importRecords[i].text
                                });
                            }
                        }
                    }
                } catch (e) {
                    log.debug(e.message);
                }
            }
            //funtion call from suitelet
            function getRecordFields(recID) {
                var title = 'getRecordFields()::';
                var fields, rec, rank;
                try {
                    rec = record.create({
                        type: recID,
                        isDynamic: true,
                    });
                    if (rec) {
                        fields = convertCSVLIB.getRecFields(rec);
                        if (fields.length) {
                            return fields;
                        } else {
                            throw new Error('Fields not found please check record id on import custom records');
                        }
                    } else {
                        throw new Error('Record Not defined please check record id on import custom records');
                    }
                } catch (error) {
                    log.error(title + error.name, error.message)
                }
            }

            function fieldChanged(context) {
                try {
                    var rec =  currentRecord.get();
                    console.log("field is chaging values ------------------------------------")
                   
                   var  netsuitedata = jQuery('#NetSuitetblMap .fields').length;
                   console.log('netsuitedatalenght1 --->', netsuitedata);
                    var csvmapdata = jQuery('#CSVtblMap .fields').length;
                    console.log('csvmapdatalength1  --->', csvmapdata);

                    if(netsuitedata == csvmapdata){
                        console.log('testin for true condition-------->', netsuitedata == csvmapdata)
                        rec.setValue({
                            fieldId: 'custpage_ab_truedata',
                            value: true,
                            ignoreFieldChange: true
                        });
                    }else{
                        console.log('testin for false condition-------->', netsuitedata == csvmapdata)
                        rec.setValue({
                            fieldId: 'custpage_ab_truedata',
                            value: false,
                            ignoreFieldChange: true
                        });
                    }

                    rec.setValue({
                        fieldId: 'custpage_ab_netmapdata',
                        value: netsuitedata,
                        ignoreFieldChange: true
                    });
                   
                       
                    rec.setValue({
                        fieldId: 'custpage_ab_csvmapdata',
                        value: csvmapdata,
                        ignoreFieldChange: true
                    });
                   
                } catch (e) {
                    log.debug(e.message);
                }
            }

            //Function for tables row that move (swap) from one table to another
            function swapRow(e){

                    console.log("event",e)
                    var rec = currentRecord.get();
        
                    console.log("jQuery(e.target).closest('table')",jQuery(e.target).closest('table')[0].id);
                    var tableID = jQuery(e.target).closest('table')[0].id;
                    console.log("tableID",tableID)
                    if(tableID == 'CSVtbl'){
                        var row =  jQuery(e.target).closest('tr');
                        jQuery('#CSVmapTblBody').append(row);
                        serializeData();
                    }
                    if(tableID == 'CSVtblMap'){
                        var row =  jQuery(e.target).closest('tr');
                        jQuery('#CSVtblBody').append(row);
                        
                    }
                    if(tableID == 'NetSuitetbl'){
                        var row =  jQuery(e.target).closest('tr');
                        jQuery('#NetSuitemapTblBody').append(row);
                        serializeData();
                    }
                    if(tableID == 'NetSuitetblMap'){
                        var row =  jQuery(e.target).closest('tr');
                        jQuery('#NetSuiteTblBody').append(row);
                        
                    }
                    fieldChanged(rec)
            }
            function serializeData(){
                var nsData = [];
                jQuery('#NetSuitetblMap .fields').each(function(index,td){
                    nsData.push(jQuery(td).attr('data-id'))
                    console.log("td ->",jQuery(td).attr('data-id'))
                    
                })
                var nsMapLength = nsData.length;
                    console.log("netsuite Map length",nsMapLength);
                var csvData = [];
                jQuery('#CSVmapTblBody .fields').each(function(index,td){
                    csvData.push(jQuery(td).attr('data-id'))
                    console.log("tdCSV ->",jQuery(td).attr('data-id'))
                })
                var csvMapLength = csvData.length;
                    console.log("CSV Map length",csvMapLength);
            }

            return {
                pageInit: pageInit,
                fieldChanged: fieldChanged,
                recType: recType
            }
        });