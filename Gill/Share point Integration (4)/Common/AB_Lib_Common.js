/**
 * @NApiVersion 2.0
 */
define(['N/log', 'N/record', 'N/runtime', 'N/search', 'N/file', 'N/ui/serverWidget', '../dao/AB_CLS_Error.js'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{file} file
     * @param{serverWidget} serverWidget
     */
    function (log, record, runtime, search, file, serverWidget, error) {
        return {
            sharePointTab: {
                id: 'custpage_sharepoint',
                lable: 'Share Point',
                container: {
                    id: 'custpage_sharepoint'
                },
                addField: {
                    recType: {
                        id: 'custpage_rec_type',
                        lable: 'Record Type'
                    },
                    recID: {
                        id: 'custpage_rec_id',
                        lable: 'Record Type'
                    }
                }
            },
            /** 
             * This function following required parameters that create a Tab is respective Record 
             * and if one of the parameters is not found the function returns the 
             * error object. 
             * 
             * @author marslan@AlphaBOLDconsultants.com 
             * @param [context] context 
             * @param [RecID] RecID 
             * @param [RecType] RecType 
             * @returns null //Add Tab in recpective Record
             * 
            */
            addTab: function (context, RecID, RecType, files,companyID,token,suiteletID) {
                var object = context.newRecord;
                var form = context.form;
                var title = 'Functions AddTab(::)';
                try {
                    var rectype = JSON.stringify(RecType);
                    var recid = JSON.stringify(RecID);
                    form.addTab({
                        id: this.sharePointTab.id,
                        label: this.sharePointTab.lable
                    });
                    // var fieldgroup = form.addFieldGroup({
                    //     id : 'custgrp_spintegration',
                    //     label : 'SP Integration'
                    // });
                    // var agreeList = form.addSublist({
                    //     id: 'custpage_echosign_agree_list',
                    //     type: serverWidget.SublistType.STATICLIST,
                    //     label: 'Upload File',
                    //     tab: this.sharePointTab.id
                    // });
                    form.clientScriptFileId = '74728';
                    // agreeList.addButton({ id: "custpage_send_button", label: "Click Here To Upload File", functionName: "uploadFile()" });
                    var HtmlField = form.addField({
                        id: 'custpage_html_field',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Test Field',
                        container: this.sharePointTab.container.id
                    });
  




                    if (files) {
                        var htmlData = '<table style="width: 100%;margin-top: 10px;border: 1px solid;"><tr><th style="border: 1px solid;font-weight: bold;font-weight: bold">File Name</th><th style="border: 1px solid;font-weight: bold;font-weight: bold">Relative URL</th></tr>';

                        for (var x = 0; x < files.length; x++) {
                            htmlData += '<tr><td style="border: 1px solid;">' + files[x].name + '</td><td style="border: 1px solid;">' + files[x].relativeUrl + '</td></tr>';
                        }

                        htmlData += '</table>';
                        form.updateDefaultValues({
                            custpage_html_field: htmlData
                        });
                        if(!files.length){
                            // var ordersGrp = form.addFieldGroup('custpage_upload_btn_grp', 'Upload');
                            var HtmlFieldUploadBtn = form.addField({
                                id: 'custpage_html_upload_btn',
                                type: serverWidget.FieldType.INLINEHTML,
                                label: 'Upload File',
                                container: this.sharePointTab.container.id
                            });
                            HtmlFieldUploadBtn.updateLayoutType({
                                layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE
                            });
                            // HtmlField.updateLayoutType({
                            //     layoutType: serverWidget.FieldLayoutType.STARTROW
                            // });

                            // var htmlBtnData = '<br /> <br /><input type="button" onClick ="uploadSharepointFile();" value="Upload File" />';
                            // htmlBtnData += '<SCRIPT language="JavaScript" type="text/javascript">';
                            // htmlBtnData += '$( document ).ready(function() {';
                            // htmlBtnData += ' console.log( "document loaded" ); alert("Loaded")';
                            // htmlBtnData += '});';
                            // htmlBtnData += 'var uploadSharepointFile = function(event){';
                            // htmlBtnData += 'alert("working")';
                            // htmlBtnData += 'location.reload()}';
                            // htmlBtnData += '</SCRIPT>';
                            var htmlBtnData = '<br /> <br /><input type="button" onClick="uploadSharepointFile();"  id= "spFileUpload" value="Upload File" style="cursor:pointer;width: 100px;height: 25px;" />';
                            htmlBtnData += '<SCRIPT language="JavaScript" type="text/javascript">';
                            htmlBtnData += "function bindEvent(element, type, handler) {if(element.addEventListener) {element.addEventListener(type, handler, false);} else {element.attachEvent('on'+type, handler);}} ";
                            htmlBtnData += 'bindEvent(window, "load", function(){';
                            htmlBtnData += 'window.uploadSharepointFile = function (event){ window.open("/app/site/hosting/scriptlet.nl?script='+suiteletID+'&deploy=1", "Upload File", "width=1200px,height=600px");}';
                            htmlBtnData += '});';
                            htmlBtnData += '</SCRIPT>';
                            form.updateDefaultValues({
                                custpage_html_upload_btn: htmlBtnData
                            });
                        }
                    } 
                    else {
                        var agreeList = form.addSublist({
                            id: 'custpage_echosign_agree_list',
                            type: serverWidget.SublistType.STATICLIST,
                            label: 'Create Folder',
                            tab: this.sharePointTab.id
                        });
                        form.clientScriptFileId = '74728';
                        agreeList.addButton({ id: "custpage_send_button", label: "Click Here To Create Folder", functionName: "createCustomerFolder('"+RecType+"','"+companyID+"' ,'"+token+"','"+RecID+"','"+context+"','"+files+"')" });
                    }


                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            },
            unDeployedScript: function (RecType) {
                var title = 'UnDeployedScript(::)';
                try {
                    //Custom Script Deployment Search 2
                    var scriptDeploymentSearch = search.create({
                        type: "scriptdeployment",
                        filters:
                            [
                                ["recordtype", "anyof", RecType],
                                "AND",
                                ["script.internalid", "anyof", "2652"],
                                "AND",
                                ["isdeployed", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "isdeployed", label: "Is Deployed" })
                            ]
                    });
                    var searchResult = scriptDeploymentSearch.run().getRange({
                        start: 0,
                        end: 1
                    });
                    var linecount = searchResult.length;
                    if (linecount) {
                        for (var i = 0; i < linecount; i++) {
                            var scriptId = searchResult[i].id;
                            var isdeployed = searchResult[i].getValue({ name: 'isdeployed' });
                            log.debug({
                                title: 'isdeployed UnDeployedScript',
                                details: isdeployed
                            });
                            if (isdeployed == true) {
                                var rec = record.load({
                                    type: record.Type.SCRIPT_DEPLOYMENT,
                                    id: scriptId
                                });
                                rec.setValue({
                                    fieldId: 'isdeployed',
                                    value: false
                                });
                                var undeployedId = rec.save();
                                log.debug({
                                    title: 'undeployedId UnDeployedScript',
                                    details: undeployedId
                                });
                            }
                        }
                    }
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            },
            deployedScript: function (Rectype) {
                var title = 'DeployedScript(::)';
                try {
                    var scriptdeploymentAlreadyExit = search.create({
                        type: "scriptdeployment",
                        filters:
                            [
                                ["recordtype", "anyof", Rectype],
                                "AND",
                                ["script.internalid", "anyof", "2652"],
                                "AND",
                                ["isdeployed", "is", "F"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "isdeployed", label: "Is Deployed" })
                            ]
                    });
                    var searchResult = scriptdeploymentAlreadyExit.run().getRange({
                        start: 0,
                        end: 1
                    });
                    var linecount = searchResult.length;
                    if (linecount) {
                        for (var i = 0; i < linecount; i++) {
                            var scriptId = searchResult[i].id;
                            var isdeployed = searchResult[i].getValue({ name: 'isdeployed' });
                            log.debug({
                                title: 'isdeployed DeployedScript',
                                details: isdeployed
                            });
                            if (isdeployed == false) {
                                var scriptRecord = record.load({
                                    type: record.Type.SCRIPT_DEPLOYMENT,
                                    id: scriptId
                                });
                                scriptRecord.setValue({
                                    fieldId: 'isdeployed',
                                    value: true
                                });
                                var deployedId = scriptRecord.save();
                                log.debug({
                                    title: 'deployedId DeployedScript',
                                    details: deployedId
                                });
                            }
                        }

                    } else {
                        var deployScript = record.create({
                            type: record.Type.SCRIPT_DEPLOYMENT,
                            defaultValues: {
                                script: 2652       // Internal id of existing script record
                            }
                        });
                        deployScript.setValue({
                            fieldId: 'recordtype',
                            value: Rectype
                        });
                        deployScript.setValue({
                            fieldId: 'status',
                            value: 'RELEASED'
                        });
                        deployScript.setValue({
                            fieldId: 'loglevel',
                            value: 'DEBUG'
                        });
                        deployScript.setValue({
                            fieldId: 'allroles',
                            value: true
                        });
                        var deployScriptID = deployScript.save();
                        log.debug(title + 'deployScriptID', deployScriptID);
                    }
                } catch (e) {
                    log.debug('Exception ' + title, e.message);
                    error.createError(e.name, e.message, title);
                }
            }

        }

    });