    /**
     *@NApiVersion 2.0
    *@NScriptType Suitelet
    */
    define(['N/ui/serverWidget','N/log','N/file','N/record','../common/ab_lib_convertCSVToJson.js','N/currentRecord','N/ui/dialog'], function(serverWidget,log,file,record,convertCSVLIB,currentRecord,dialog) {

        function onRequest(context) {

            var request = context.request;
            var response = context.response;
            var form = serverWidget.createForm({
                title : 'CSV Impot'
            });
            var recStep;
            var NetsuiteMapData;
            var csvMapData;
            
            //log.debug({title: "CSV Map Data",details: csvMapData});
            //client Script call
        
            var assistance = serverWidget.createAssistant({
                title : 'BOLDImport Assistant'
            });
            assistance.clientScriptModulePath = '../client/ab_cs_function_csv.js';
            // form.addResetButton({
            //     label : 'Reset Button'
            // });
            try {
                
            var scanUploadSTP = assistance.addStep({
                id : 'custpage_ab_scan_step',
                label : 'Scan & Upload CSV File'
            });
            var importOptSTP = assistance.addStep({
                id : 'custpage_ab_importopt',
                label : 'Import Options'
            });
            var fileMapSTP = assistance.addStep({
                id : 'custpage_ab_filemap',
                label : 'File Mapping'
            });
            var fieldMapSTP = assistance.addStep({
                id : 'custpage_ab_fieldmap',
                label : 'Field Mapping'
            });
            var saveMapSTP = assistance.addStep({
                id : 'custpage_ab_savemap',
                label : 'Save mapping & Start Import'
            });
            
            log.debug('assistance',assistance);
            
        
            if (assistance.getLastAction() == serverWidget.AssistantSubmitAction.NEXT || assistance.getLastAction() == serverWidget.AssistantSubmitAction.BACK){
                if(assistance.currentStep == null){
                    log.debug('test',assistance.currentStep);
                    recStep = assistance.getStep({
                        id : 'custpage_ab_scan_step'
                    });
                    var val = recStep.getValue({
                        id: 'custpage_ab_htmlfield',
                    });
                    log.debug(title+'val',val);
                }
                log.debug('assistance.currentStep',assistance.currentStep.id);
                if(assistance.currentStep.id == "custpage_ab_filemap"){
                    //var test = GetThirdStepFieldMapLength(assistance);
                    //log.debug({title: 'test',details: test});
                    var test = false;
                    if(test == true){
                        log.debug({title: 'is Data is True',details: test});
                        assistance.currentStep = assistance.getNextStep();
                    }else{
                        log.debug({title: 'is Data is false',details: test});
                        //assistance.currentStep = assistance.getStep({id : 'custpage_ab_scan_step'});
                        var MapNotEqual = assistance.addField({
                            id: 'custpage_ab_mapnotequal',
                            type: serverWidget.FieldType.TEXT,
                            label: 'Mapping Fields length not Euqal'
                        });
                        MapNotEqual.defaultValue = 'Please Map Equal Field in Both Table';
                    }
                    // var result = GetThirdStepData(assistance);
                    // if(result){
                    //     assistance.currentStep = assistance.getNextStep();
                    // }else if(assistance.getLastAction() == serverWidget.AssistantSubmitAction.NEXT){
                    //     log.debug({title: "Conditionn false",details:"Tables Length not same"});
                    // assistance.currentStep = assistance.getStep({id : 'custpage_ab_filemap'});
                    // }
                
                }
                else{
                    assistance.currentStep = assistance.getNextStep();
                }
            //assistance.currentStep = assistance.getNextStep();
            } else if (assistance.getLastAction() == serverWidget.AssistantSubmitAction.CANCEL){
                assistance.currentStep = assistance.getStep({id : 'custpage_ab_scan_step'});
            } else if ( assistance.getLastAction() == serverWidget.AssistantSubmitAction.FINISH){
                //at the end form is submite here so perform all thinks here
                // add csv import functionalty here

                assistance.finishedHtml = 'You have Completed the BOLDImport Process';
            }

                var currentStepId = assistance.currentStep == null ? 'custpage_ab_scan_step' : assistance.currentStep.id;
                log.debug('currentStepId',currentStepId);
            var tableData = file.load({id: '../templates/boldimport_table_use.html'});
            indexPageValue = tableData.getContents();
            log.debug('Templates',indexPageValue);
                switch(currentStepId){
                    case 'custpage_ab_scan_step':
                        buildFirstStep(assistance);
                        break;

                    case 'custpage_ab_importopt':
                        buildSecondStep(assistance);
                        break; 

                    case 'custpage_ab_filemap':
                        buildThirdStep(assistance,NetsuiteMapData,csvMapData);
                        break;

                    case 'custpage_ab_fieldmap':
                        buildFourthStep(assistance);
                        break;

                    case 'custpage_ab_savemap':
                            var saveFld = assistance.addField({
                                id : 'custpage_ab_save',
                                type : serverWidget.FieldType.TEXT,
                                label : 'Your Save Mapping Here'
                            });
                        break;
                }

            response.writePage(assistance);
        } catch (error) {
            log.debug('ERROR',error.message);
        }
        }
        //First step
        function buildFirstStep(assistance){
            var title = 'buildFirstStep()::';
            var HTMLInput =     '<input  class="box__file" type="file" id="file" accept=".csv" onchange="getJsonCSV();">'
            try{
                var nameFld = assistance.addField({
                    id : 'custpage_ab_record_type',
                    type : serverWidget.FieldType.SELECT,
                    label : 'Record Type'
                });
                nameFld.isMandatory = true;//arslan
                var chooseFile = assistance.addField({
                    id: 'custpage_ab_htmlfield',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Intelisys'
                });
                chooseFile.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.NORMAL
                });
                chooseFile.defaultValue =HTMLInput;
                
                }catch(error){
                    log.error(title+error.name,error.message) 
            } 
        }
        //Second step
        function buildSecondStep(assistance){
            var title = 'buildSecondStep()::';
            try{
                var addFld = assistance.addField({
                    id : 'custpage_ab_add',
                    name: 'csv_ab_btn',
                    type : serverWidget.FieldType.RADIO,
                    label : 'ADD',
                    source :'Add'
                });
                var updateFld = assistance.addField({
                    id : 'custpage_ab_add',
                    name :'csv_ab_btn',
                    type : serverWidget.FieldType.RADIO,
                    label : 'UPDATE',
                    source :'Update'
                });
                var addUpdateFld = assistance.addField({
                    id : 'custpage_ab_add',
                    name :'csv_ab_btn',
                    type : serverWidget.FieldType.RADIO,
                    label : 'ADD OR UPDATE',
                    source :'Add_Update'
                });
                }catch(error){
                    log.error(title+error.name,error.message) 
            } 
        }
        //Third step
        function buildThirdStep(assistance,NetsuiteMapData,csvMapData){
            var title = 'buildThirdStep()::';
            var nstable,radioBtnSelect,recordFld,hideFielddata;
            try{
                var thirdStep =  assistance.getStep({id: 'custpage_ab_filemap'})
        
                // recordFld = assistance.addField({
                //     id : 'custpage_ab_record_type',
                //     type : serverWidget.FieldType.TEXT,
                //     label : 'Record Type'
                // });
                hideFielddata = assistance.addField({
                    id : 'custpage_hidden_data_field',
                    type : serverWidget.FieldType.INLINEHTML,
                    label : 'Ns fields'
                });
                hideFielddata.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                // radioBtnSelect = assistance.addField({
                //     id : 'custpage_ab_import_radio_type',
                //     type : serverWidget.FieldType.TEXT,
                //     label : 'Import Button'
                // });
                // recordFld.updateDisplayType({
                //     displayType : serverWidget.FieldDisplayType.INLINE
                // });
                // radioBtnSelect.updateDisplayType({
                //     displayType : serverWidget.FieldDisplayType.INLINE
                // });
                // nstable = assistance.addField({
                //     id: 'custpage_ns_recordfields',
                //     type: serverWidget.FieldType.INLINEHTML,
                //     label: 'Netsutie Record Fields'
                // });
                // nstable.updateLayoutType({
                //     layoutType: serverWidget.FieldLayoutType.MIDROW
                // });
                // recStep = assistance.getStep({
                //     id : 'custpage_ab_scan_step'
                // });
                // recoRadio = assistance.getStep({
                //     id : 'custpage_ab_importopt'
                // });

                // recordFld.defaultValue  = recStep.getValue({
                //     id : 'custpage_ab_record_type'
                // });
                // radioBtnSelect.defaultValue  = recoRadio.getValue({
                //     id : 'custpage_ab_add'
                // });
                // var recordFields =  getRecordFields(recordFld.defaultValue)
                // if(recordFields.length){
                    hideFielddata.defaultValue = '<h1>Fields are loading please wait ... </h1>';
                //     var recordGet = window.sessionStorage
                // }
                NetsuiteMapData = assistance.addField({
                id: 'custpage_ab_netmapdata',
                type: serverWidget.FieldType.TEXT,
                label: 'Intelisys'
                });
                NetsuiteMapData.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                csvMapData = assistance.addField({
                    id: 'custpage_ab_csvmapdata',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Intelisys1'
                });
                csvMapData.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });
                // var result1 = GetThirdStepData(assistance);
            var trueData = assistance.addField({
                    id: 'custpage_ab_truedata',
                    type: serverWidget.FieldType.TEXT,
                    label: 'True Data'
                });
                trueData.isMandatory = true;
                // trueData.updateDisplayType({
                //     displayType : serverWidget.FieldDisplayType.INLINE
                // });
                
                // trueData.defaultValue = result1;
                log.debug({
                    title: 'trueData',
                    details: trueData
                });
                }catch(error){
                    log.error(title+error.name,error.message) 
            } 
        }
        //Fourth step
        function buildFourthStep(assistance){
            var title = 'buildFourthStep()::';
            try{
                var filedsFld = assistance.addField({
                    id : 'custpage_ab_file',
                    type : serverWidget.FieldType.TEXT,
                    label : 'Your Fileds Mapping Here'
                });
                var table = assistance.addField({
                    id: 'custpage_ng_htmlfield',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Intelisys'
                });
                table.updateLayoutType({
                    layoutType: serverWidget.FieldLayoutType.NORMAL
                });
                table.defaultValue = indexPageValue;
                }catch(error){
                    log.error(title+error.name,error.message) 
            } 
        }
        function getRecordFields(recID){
            var title = 'getRecordFields()::';
            var fields,rec,rank;
            try{
                    rec =  record.create({
                        type: recID,
                        isDynamic: true,
                    });
                    if(rec){
                        fields = convertCSVLIB.getRecFields(rec);          
                        if(fields.length){
                            return fields;
                        }else{
                            throw new Error('Fields not found please check record id on import custom records');
                        }
                    }else{
                        throw new Error('Record Not defined please check record id on import custom records');
                    }
                }catch(error){
                    log.error(title+error.name,error.message) 
            } 
        }
        // function GetThirdStepData(assistance){
        //     var result = false ; 
        //    var  recStep1 = assistance.getStep({
        //             id : 'custpage_ab_filemap'
        //         });
        //    var  NetsuiteMapData = recStep1.getValue({
        //             id : 'custpage_ab_netmapdata'
        //         });
        //    var  NetsuiteCSVData = recStep1.getValue({
        //             id : 'custpage_ab_csvmapdata'
        //         });
        //         if(NetsuiteCSVData  == NetsuiteMapData){
        //             result = true;
        //         }
        //     // NetsuiteMapData = assistance.getValue('custpage_ab_netmapdata');
        //     // csvMapData = assistance.getValue('custpage_ab_csvmapdata');
        //     return result;
        // }
        function GetThirdStepFieldMapLength(assistance){
                var  recStep3 = assistance.getStep({
                    id : 'custpage_ab_filemap'
                });
                var MapLength = recStep3.getValue({
                    id : 'custpage_ab_truedata'
                });
                log.debug({
                    title: 'MapLength',
                    details: MapLength
                })
                
            return MapLength;
        }

        return {
            onRequest: onRequest
        }
    });
