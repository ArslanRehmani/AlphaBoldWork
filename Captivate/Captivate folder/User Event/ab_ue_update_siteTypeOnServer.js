/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
// eslint-disable-next-line no-undef
define(['N/record', 'N/log', '../dao/AB_CLS_SiteTypeMapping.js', '../dao/AB_CLS_Server.js', 'N/search'], function (rec, log, siteTypeCLS, serverCLS, search) {

    /**
     * @param  {} context
     * @param  {} description ="Update serverSite type field against Ns site type on Server record Record"
     */
    function beforeSubmit(context) {
        var title = "beforeSubmit () :: ";
        var serverRecord, NS_siteType, recType,serverSiteType,siterecord;
        var vistarSiteType = '';
        var fieldId = 'custrecord_ab_vistar_site_type_server';
        try {
            serverRecord = context.newRecord;
            // recType = record.type;
            if (context.type == context.UserEventType.CREATE  || context.type == context.UserEventType.EDIT) {
                var siteId = serverRecord.getValue({
                    fieldId: 'custrecord_server_site'
                });
                if (siteId) {
                    siterecord = rec.load({
                        type: 'customrecord_captivate_site',
                        id: siteId,
                        isDynamic: true
                    });
                    NS_siteType = siterecord.getValue({
                        fieldId: 'custrecord_captivate_site_type'
                    });
                    log.debug(title + 'NS_siteType', NS_siteType);
                    if (NS_siteType) {
                        vistarSiteType = siteTypeCLS.getVistarSiteType(NS_siteType);
                        log.debug(title + 'vistarSiteType', vistarSiteType);
                        serverSiteType = vistarSiteType;


                    } else {
                        serverSiteType = vistarSiteType;
                    }
                    log.debug(title + 'serverSiteType', serverSiteType);
                    serverRecord.setValue({
                        fieldId:fieldId,
                        value: serverSiteType
                    });
                   
                }
            }
        } catch (error) {
            log.error(title + 'ERROR', error.message);
        }

    }
    return {
        beforeSubmit: beforeSubmit
    };
});