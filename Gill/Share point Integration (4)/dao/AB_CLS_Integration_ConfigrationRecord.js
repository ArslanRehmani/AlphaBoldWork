/**
 * @NApiVersion 2.0
 */
// eslint-disable-next-line no-undef
define(['N/log', 'N/record', 'N/runtime', 'N/search','../dao/AB_CLS_Error.js'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{file} file
     * @param{serverWidget} serverWidget
     */
    function (log, record, runtime, search,error) {
        return {
            internalID: {
                reccordType: 'customrecord_ab_add_subtab_inti_confi'
            },
            fields: {
                inactiveField: 'isinactive',
                grantType : 'custrecord_grant_type',
                spUserId : 'custrecord_spuser_client_id',
                spClientSecret:'custrecord_spuser_client_secret',
                spResourceId : 'custrecord_spresource_client_id',
                spRelam :'custrecord_sp_realm',
                spSiteUrl : 'custrecord_sp_site_url',
                selectRecords: 'custrecord_multiselectrec_field',
                spSubSite: 'custrecord_sp_subsite',
                spParentFolder: 'custrecord_sp_parent_folder',
                uploadFolderID: 'custrecord_ab_upload_folder_id',
                uploadSuiteletId: 'custrecord_ab_upload_suitelet'
            },
            inActivePreviousRecords: function () {
                var title = 'inActivePreviousRecords(::)';
                try {
                    var obj;
                    var inactiveRecArray = [];
                    var recordSearch = search.create({
                        type: this.internalID.reccordType,
                        filters:
                            [
                                ["isinactive", "is", "F"]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "name",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),
                                search.createColumn({ name: "scriptid", label: "Script ID" }),
                                search.createColumn({ name: "isinactive", label: "Inactive" })
                            ]
                    });
                    recordSearch.run().each(function (result) {
                        obj = {};
                        obj.id = result.id;
                        obj.isinactive = result.getValue({ name: 'isinactive' });
                        inactiveRecArray.push(obj);
                        return true;
                    });
                    if (inactiveRecArray && inactiveRecArray.length) {
                        for (var i = 0; i < inactiveRecArray.length; i++) {
                            var Id = inactiveRecArray[i].id;
                            if (Id) {
                                var customRecTab = record.load({
                                    type: this.internalID.reccordType,
                                    id: Id
                                });
                                customRecTab.setValue({
                                    fieldId: this.fields.inactiveField,
                                    value: true
                                });
                                customRecTab.save();
                            }
                        }
                    }
                    return true;
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            },

            /**
             * @param  {} {vartitle='getConfig(
             * @param  {[["isinactive"} filters
             * @param  {} "is"
             * @param  {} "F"]]
             * Details : return Latest Actice "[AB] SP Integration Configuration" record 
             */
            getConfig: function (){
                var title = 'getConfig()::';
                var configObj ={};
                 try{
                    var configSearch = search.create({
                        type: this.internalID.reccordType,
                        filters:[["isinactive","is","F"]], 
                        columns:[
                            search.createColumn({name: this.fields.grantType}),
                            search.createColumn({name: this.fields.spUserId}),
                            search.createColumn({name: this.fields.spClientSecret}),
                            search.createColumn({name: this.fields.spResourceId}),
                            search.createColumn({name: this.fields.spRelam}),
                            search.createColumn({name: this.fields.spSiteUrl}),
                            search.createColumn({name: this.fields.selectRecords}),
                            search.createColumn({name: this.fields.spParentFolder}),
                            search.createColumn({name: this.fields.uploadFolderID}),
                            search.createColumn({name: this.fields.uploadSuiteletId}),
                            search.createColumn({name: this.fields.spSubSite}),
                        ]
                    });
                    var resultset = configSearch.run().getRange({
                        start: 0,
                        end: 1
                    });
                    if(resultset.length){
                        var result = resultset[0];          
                        configObj.grantType = result.getValue({name: this.fields.grantType});
                        configObj.spUserId = result.getValue({name: this.fields.spUserId});
                        configObj.spClientSecret = result.getValue({name: this.fields.spClientSecret});
                        configObj.spResourceId = result.getValue({name: this.fields.spResourceId});
                        configObj.spRelam = result.getValue({name: this.fields.spRelam});
                        configObj.spSiteUrl = result.getValue({name: this.fields.spSiteUrl});
                        configObj.selectRecords = result.getValue({name: this.fields.selectRecords});
                        configObj.spParentFolder = result.getValue({name: this.fields.spParentFolder});
                        configObj.uploadFolderID = result.getValue({name: this.fields.uploadFolderID});
                        configObj.uploadSuiteletId = result.getValue({name: this.fields.uploadSuiteletId});
                        configObj.spSubSite = result.getValue({name: this.fields.spSubSite});
                    }
                    }catch(error){
                        log.error(title+error.name,error.message);
                }
                return  configObj || {};
            }
        };

    });