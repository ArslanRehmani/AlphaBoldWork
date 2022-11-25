// eslint-disable-next-line no-undef
define(['N/record','N/log'], function (record,log) {
    return {
        internalid : 'customrecord_ab_sftp_configuration',
        fields : {
            username:'custrecord_ab_username',
            passwordGuid:'custrecord_ab_password_guid',
            url:'custrecord_ab_hostname',
            port:'custrecord_ab_port',
            hostkey:'custrecord_ab_hostkey',
            inboundDirectory:'custrecord_ab_inbound_path',
            csvFileName:'custrecord_ab_csv_filename',
            inboundFolderId:'custrecord_ab_inbound_folder_id',
        },
        /**
         * @param  {} configId
         * @param  {} {vartitle='getConfig(
         * @param  {configId} id
         * @param  {true}} isDynamic
         * Detials : To Get Configuration custom record data Object
         */
        getConfig: function (configId) {
            var title = 'getConfig()::';
            var obj ={};
            try {
               var rec = record.load({
                    type: this.internalid,
                    id: configId,
                    isDynamic: true
                });
                obj.username = rec.getValue(this.fields.username);
                obj.passwordGuid = rec.getValue(this.fields.passwordGuid);
                obj.url = rec.getValue(this.fields.url);
                obj.port = rec.getValue(this.fields.port);
                obj.hostKey = rec.getValue(this.fields.hostkey);
                obj.inboundDirectory = rec.getValue(this.fields.inboundDirectory);
                obj.inboundFolderId = rec.getValue(this.fields.inboundFolderId);
                obj.csvFileName = rec.getValue(this.fields.csvFileName);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return obj || {};
        }
    };
});