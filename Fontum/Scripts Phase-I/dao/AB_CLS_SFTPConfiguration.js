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
            outboundDirectory:'custrecord_ab_outbound_path',
            inboundFolderId:'custrecord_ab_inbound_folder_id',
            outboundFolderId:'custrecord_ab_outbound_folder_id',
            inboundFilePrefix:'custrecord_ab_inbound_file_prefix',
            outboundFilePrefix:'custrecord_ab_outbound_file_prefix',
            emailRecipents:'custrecord_ab_email_recipients',
            emailSender:'custrecord_ab_email_sender',
            inboundCSVHeader:'custrecord_ab_inbound_csv_header',

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
                obj.outboundDirectory = rec.getValue(this.fields.outboundDirectory);
                obj.inboundFolderId = rec.getValue(this.fields.inboundFolderId);
                obj.outboundFolderId = rec.getValue(this.fields.outboundFolderId);
                obj.inboundFilePrefix = rec.getValue(this.fields.inboundFilePrefix);
                obj.outboundFilePrefix = rec.getValue(this.fields.outboundFilePrefix);
                obj.emailRecipents = rec.getValue(this.fields.emailRecipents);
                obj.emailSender = rec.getValue(this.fields.emailSender);
                obj.inboundCSVHeader = rec.getValue(this.fields.inboundCSVHeader);
            } catch (error) {
                log.error(title + error.name, error.message);
            }
            return obj || {};
        }
    };
});