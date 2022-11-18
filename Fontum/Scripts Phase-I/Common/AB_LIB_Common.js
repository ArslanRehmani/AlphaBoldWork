// eslint-disable-next-line no-undef
define(['N/log', 'N/search','N/file','N/runtime','../dao/AB_CLS_SFTPConnection.js','../dao/AB_CLS_SFTPConfiguration.js'], function (log, search,file,runtime,CLSConnection,CLSConfig) {
    return {
        /**
         * @param  {} {vartitle='searchOpenTransaction(
         * @param  {} {return =All Open transaction data object }
         * Details : Retrive Open transactions SO/Invoice data 
         */
        searchOpenTransaction: function searchOpenTransaction() {
            var title = 'searchOpenTransaction()::';
            try {
                var transactionSearchObj = search.create({
                    type: "transaction",
                    filters: [
                        // ["type","anyof","CustInvc","RtnAuth","SalesOrd","CustCred"], 
                        // "AND", 
                        // ["custbody2","isnotempty",""], 
                        // "AND", 
                        // ["customer.entityid","isnotempty",""], 
                        // "AND", 
                        // ["status","noneof","CustInvc:B","CustInvc:E","CustInvc:V","SalesOrd:C","SalesOrd:G","CustCred:B","CustCred:V","RtnAuth:C","RtnAuth:G"], 
                        // "AND", 
                        // ["mainline","is","T"], 
                        // "AND", 
                        // ["customer.isinactive","is","F"]
                        ["type","anyof","CustCred","CustInvc","CustPymt","RtnAuth","SalesOrd","Journal"], 
                        "AND", 
                        ["custbody2","isnotempty",""], 
                        "AND", 
                        ["customer.entityid","isnotempty",""], 
                        "AND", 
                        ["status","noneof","CustCred:B","CustCred:V","CustInvc:B","CustInvc:E","CustInvc:V","RtnAuth:A","RtnAuth:C","RtnAuth:G","RtnAuth:H","SalesOrd:C","SalesOrd:G","SalesOrd:H"], 
                        "AND", 
                        ["mainline","is","T"], 
                        "AND", 
                        ["customer.isinactive","is","F"]

                    ],
                    columns: [
                        // search.createColumn({
                        //     name: "altname",
                        //     join: "customer",
                        //     summary: "GROUP",
                        //     label: "name"
                        // }),
                        // search.createColumn({
                        //     name: "custbody2",
                        //     summary: "GROUP",
                        //     label: "sap_customer_id"
                        // }),
                        // search.createColumn({
                        //     name: "internalid",
                        //     join: "customer",
                        //     summary: "GROUP",
                        //     label: "customer_id"
                        // }),
                        // search.createColumn({
                        //     name: "formulanumeric",
                        //     summary: "SUM",
                        //     formula: "CASE WHEN {amountremaining} IS NOT NULL THEN {amountremaining} ELSE 0 END",
                        //     label: "invoice_amt"
                        // }),
                        // search.createColumn({
                        //     name: "formulanumeric",
                        //     summary: "SUM",
                        //     formula: "CASE WHEN {amountunbilled} IS NOT NULL THEN {amountunbilled} ELSE 0 END",
                        //     label: "salesorder_amt"
                        // }),

                        // search.createColumn({
                        //     name: "formulanumeric",
                        //     summary: "SUM",
                        //     formula: "CASE WHEN {type} = 'Invoice' THEN {amountremaining} ELSE (CASE WHEN {amountunbilled} IS NOT NULL THEN {amountunbilled} ELSE 0 END) END",
                        //     label: "total_amt"
                        // })
                        search.createColumn({
                            name: "altname",
                            join: "customer",
                            summary: "GROUP",
                            label: "name"
                         }),
                         search.createColumn({
                            name: "custbody2",
                            summary: "GROUP",
                            sort: search.Sort.ASC,
                            label: "sap_customer_id"
                         }),
                         search.createColumn({
                            name: "internalid",
                            join: "customer",
                            summary: "GROUP",
                            label: "customer_id"
                         }),
                         search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "CASE WHEN {type} = 'Invoice' THEN {amountremaining} ELSE (CASE WHEN {type} = 'Credit Memo' THEN {amount} ELSE 0 END)END",
                            label: "invoice_amt"
                         }),
                         search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "CASE WHEN {amountunbilled} IS NOT NULL THEN {amountunbilled} ELSE 0 END",
                            label: "salesorder_amt"
                         }),
                         search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "CASE WHEN {type} = 'Invoice' THEN {amountremaining} ELSE (CASE When {type} in ('Return Authorization', 'Sales Order') THEN {amountunbilled} ELSE (CASE WHEN {type} = 'Credit Memo' THEN {amount} ELSE 0 END)END)END",
                            label: "total_amt"
                         }),
                         search.createColumn({
                            name: "formulacurrency",
                            summary: "MAX",
                            formula: "{customer.balance}+{customer.unbilledorders}",
                            label: "customer_balance"
                         }),
                         search.createColumn({
                            name: "formulacurrency",
                            summary: "MAX",
                            formula: "sum(((CASE WHEN {type} = 'Invoice' THEN {amountremaining} ELSE (CASE When {type} in ('Return Authorization', 'Sales Order') THEN {amountunbilled} ELSE (CASE WHEN {type} = 'Credit Memo' THEN {amount} ELSE 0 END)END)END)))-max(({customer.balance}+{customer.unbilledorders}))",
                            label: "difference"
                         })
                    ]
                });

                var resultSet = this.searchAllWithColumns(transactionSearchObj);


            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return resultSet;
        },

        /**
         * @param  {} searchResult
         * @param  {} {return allresult of search in an array form }
         * Details : Return all search data 
         */
        searchAllWithColumns: function (searchResult) {
            var title = 'searchAllWithColumns()::';
            try {


                var allResults = [];
                var startIndex = 0;
                var RANGECOUNT = 1000;
                var resultLine = {};
                var lineResult;
                var columns = searchResult.columns;
                do {
                    var resultset = searchResult.run();
                    var pagedResults = resultset.getRange({
                        start: parseInt(startIndex),
                        end: parseInt(startIndex + RANGECOUNT)
                    });

                    for (var i = 0; i < pagedResults.length; i++) {
                        resultLine = {};
                        lineResult = pagedResults[i];
                        columns.forEach(function (column) {
                            if (lineResult.getText(column)) {
                                resultLine[column.label] = lineResult.getText(column);
                            } else {
                                resultLine[column.label] = lineResult.getValue(column);
                            }
                        });
                        allResults.push(resultLine);
                    }

                    // allResults = allResults.concat(pagedResults);

                    var pagedResultsCount = pagedResults != null ? pagedResults.length : 0;
                    startIndex += pagedResultsCount;

                }
                while (pagedResultsCount == RANGECOUNT);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return allResults;
        },

        /**
         * @param  {} searchResult
         * @param  {} {return allresult of search in an array form }
         */
        searchAll: function searchAll(searchResult) {
            var title = 'searchAll()::';
            try {


                var allResults = [];
                var startIndex = 0;
                var RANGECOUNT = 1000;
                do {
                    var resultset = searchResult.run();
                    var pagedResults = resultset.getRange({
                        start: parseInt(startIndex),
                        end: parseInt(startIndex + RANGECOUNT)
                    });

                    allResults = allResults.concat(pagedResults);

                    var pagedResultsCount = pagedResults != null ? pagedResults.length : 0;
                    startIndex += pagedResultsCount;

                }
                while (pagedResultsCount == RANGECOUNT);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return allResults;
        },

        /**
         * @param  {}
         * details : Return current date in format : year_month_day_time;
         */
        getSysDate: function getSysDate() {
            var now = new Date();
            var year = "" + now.getFullYear();
            var month = "" + (now.getMonth() + 1);
            if (month.length == 1) {
                month = "0" + month;
            }
            var day = "" + now.getDate();
            if (day.length == 1) {
                day = "0" + day;
            }
            // var time = now.getTime();
            // return year + month + day + '_' + time;
            return year + month + day;
        },

        /**
         * @param  {} content
         * @param  {} {Details= 'Create CSV outbound'}
         */
        createCSV : function createCSV(content){
            var title = 'createCSV()::';

            var scriptObj  =  runtime.getCurrentScript();
            var configID = scriptObj.getParameter({name: "custscript_ab_sftp_configuration"}) || 1;
             try{
                var config = CLSConfig.getConfig(configID);
                var outboundprefix = config.outboundFilePrefix;
                var outboundFolder = config.outboundFolderId;
                var fileId  = file.create({
                    name: outboundprefix+this.getSysDate()+'.csv',
                    fileType: file.Type.CSV,
                    contents: content,
                    folder: outboundFolder,
                });
                var csvFileId = fileId.save();
                log.debug(title+'csvFileId',csvFileId);
                }catch(error){
                    log.error(title+error.name,error.message);
            }
            return csvFileId; 
        },
        /**
         * @param  {} folderId
         * @param  {} {vartitle='getSapFile(
         * Details : SAP CSV file handler , Return Latest SAP CSV file into JSON Object
         */
        getSapFile : function getSapFile(folderId){
            var title = 'getSapFile()::';
            var JSONFileContent = {};
             try{
                // var scriptObj  =  runtime.getCurrentScript();
                // var FOLERID = scriptObj.getParameter({name: folderId});
                var fileId = CLSConnection.downloadFile();



                // var latestFileId = this.getLatestSAPFile(FOLERID);
                if(fileId){
                   var SAPfile =  file.load({
                        id: fileId
                    });
                   var SAPFileContent =  SAPfile.getContents();
                   JSONFileContent = this.ConvertCSVtoJSON(SAPFileContent);
                }
             
                }catch(error){
                    log.error(title+error.name,error.message);
            }
            return JSONFileContent || []; 
        },

        /**
         * @param  {} folderId
         * @param  {} {vartitle='getLatestSAPFile(
         * Details : Return Latest SAP Csv file of parameterized folder
         */
        getLatestSAPFile : function getLatestSAPFile(folderId){
            var title = 'getLatestSAPFile()::';
            var fileId;
             try{
                var fileSearchObj = search.create({
                    type: "file",
                    filters:
                    [
                       ["folder","anyof",folderId],
                       "AND", 
                       ["filetype","anyof","CSV"]
                    ],
                    columns:
                    [
                       search.createColumn({name: "internalid", label: "Internal ID"}),
                       search.createColumn({
                          name: "created",
                          sort: search.Sort.DESC,
                          label: "Date Created"
                       })
                    ]
                 });

                var resultSet =  fileSearchObj.run().getRange({
                    start: 0,
                    end: 1
                 });
                 if(resultSet.length){
                    fileId = resultSet[0].id;
                 }

                }catch(error){
                    log.error(title+error.name,error.message);
            } 
            return fileId || '';
        },


        
        /**
         * @param  {} csv
         * @param  {} {vartitle='csvJSON(
         * Details : Convert CSV content into JSON
         */
        ConvertCSVtoJSON: function ConvertCSVtoJSON(csv) {
        var title = 'csvJSON()::';
        var scriptObj  =  runtime.getCurrentScript();
        var configID = scriptObj.getParameter({name: "custscript_ab_sftp_config"}) || 1;
        try{
             var config = CLSConfig.getConfig(configID);
             var inboundCSVheaders = config.inboundCSVHeader;
             var lines = csv.split("\r");
             log.debug(title+'inboundCSVheaders',inboundCSVheaders);
             log.debug(title+'Before Adding Headers Lines',lines.length);
            if(lines.length && !inboundCSVheaders){
                lines.unshift('Date and Time,NS Customer ID,Customer SAP ID,Group Credit Account,SAP Exposure  (Group Acct),NS Exposure,Available Credit - Group');
            }
            log.debug(title+'After Adding Headers Lines',lines.length);
        var result = [];
            
        // NOTE: If your columns contain commas in their values, you'll need
        // to deal with those before doing the next step
        // (you might convert them to &&& or something, then covert them back later)
        // jsfiddle showing the issue https://jsfiddle.net/
        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {

            var obj = {};
            var currentline = lines[i].replace('\n', '').split(",");

            for (var j = 0; j < headers.length; j++) {
                if (headers[j] && currentline[j]) {
                    headers[j] = headers[j].trim().toString();
                    obj[headers[j]] = currentline[j];
                }
            }
            if (Object.keys(obj).length) {

                result.push(obj);
            }

        }

        //return result; //JavaScript object
    }catch(error){
        log.error(title+error.name,error.message);
} 
        return result || []; //JSON
    }
    };
});