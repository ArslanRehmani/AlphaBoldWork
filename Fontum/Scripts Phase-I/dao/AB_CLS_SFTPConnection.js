// eslint-disable-next-line no-undef
define(['N/sftp', 'N/log', 'N/runtime', '../dao/AB_CLS_SFTPConfiguration.js','N/file','../Common/AB_LIB_Common.js','../dao/AB_CLS_ErrorLogs.js'], function (sftp, log, runtime, CLSconfig,file,LIB_Common,CLSErrorLogs) {
    return {
        /**
         * @param  {} fileID
         * @param  {} {vartitle='uploadFile(
         * Details : Upload File on SFTP server using configuration custom Record for details 
         */
        uploadFile: function (fileID) {
            var title = 'uploadFile()::';
            var csvFile = file.load({
                id: fileID
            });
            csvFile.name;
            var scriptObj = runtime.getCurrentScript();
            var configID = scriptObj.getParameter({
                name: "custscript_ab_sftp_configuration"
            }) || 1;
            var parms = CLSconfig.getConfig(configID);
            var outboundDirectory = parms.outboundDirectory;
            try {
                var connection = this.getConnection(parms,outboundDirectory);
                this.moveFiles(connection);
                var uploadedFile = connection.upload({
                    filename: csvFile.name,
                    file: csvFile,
                    replaceExisting: true
                });
            } catch (error) {
                CLSErrorLogs.create(error.message,'','');
                log.error(title + error.name, error.message);
            }
            return uploadedFile || "";
        },

        /**
         * @param  {} {vartitle='downloadFile(
         * Detials : Download File From SFTP server using configuration custom record for details
         */
        downloadFile: function () {
            var title = 'downloadFile()::';
            var scriptObj = runtime.getCurrentScript();
            var configID = scriptObj.getParameter({
                name: "custscript_ab_sftp_config"
            }) || 1;
            var parms = CLSconfig.getConfig(configID);
            var InboundDirectory = parms.inboundDirectory;
            var connection = this.getConnection(parms,InboundDirectory);
            try {
                if(connection){
                    var todaysDate= this.getSysDate();
                    var inboundFolder = parms.inboundFolderId;
                    var filename = parms.inboundFilePrefix;
                    filename = filename +todaysDate+'.csv';
                    log.debug(title+'filename',filename);
                    var downloadedFile = connection.download({
                        filename: filename
                    });
                    downloadedFile.folder = inboundFolder;
                    var fileId = downloadedFile.save();
                    if(fileId){
                        this.moveFiles(connection);
                    }
                }
            } catch (error) {
                CLSErrorLogs.create(error.message,'','');
                log.error(title + error.name, error.message);
            }
            return fileId;
        },
        /**
         * @param  {} configID
         * @param  {} {vartitle='getConnection(
         * Detials : Build Connection with SFTP server 
         */
        getConnection: function (parms,directorypath) {
            var title = 'getConnection()::';
            try {
                // var parms = CLSconfig.getConfig(configID);
                log.debug('parms', parms);
                var connection = sftp.createConnection({
                    username: parms.username,
                    passwordGuid: parms.passwordGuid,
                    url: parms.url,
                    port: parseInt(parms.port),
                    hostKey: parms.hostKey,
                    directory: directorypath
                });
                log.debug("connection", connection);
            } catch (error) {
                CLSErrorLogs.create(error.message,'','');
                log.error(title + error.name, error.message);
            }
            return connection;
        
        },
        /**
         * @param  {} connection
         * @param  {} {vartitle='moveFiles(
         * Details : Move Files Into Previous Folder 
         */
        moveFiles: function moveFiles(connection){
            var title = 'moveFiles()::';
             try{
                var list = connection.list();
                log.debug(title+'list',list);
                if(list.length){
                        // var files = list.filter(function(obj){
                        //     return obj.directory != true;
                        // });
                    for(var x = 0 ; x < list.length ; x++){
                        var file = list[x];
                        if(file.directory != true){
                            connection.move({
                                from: '/'+file.name,   
                                to: '/previous/'+file.name   
                            });
                        }
                    }
                }
                }catch(error){
                    CLSErrorLogs.create(error.message,'','');
                    log.error(title+error.name,error.message); 
            } 
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
    };
});