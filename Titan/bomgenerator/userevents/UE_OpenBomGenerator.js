/*
 ***********************************************************************
 *
 * The following javascript code is created by AlphaBOLD Inc.,
 * a NetSuite Partner. It is a SuiteCloud component containing custom code
 * intended for NetSuite (www.netsuite.com) and use the SuiteScript API.
 * The code is provided "as is": AlphaBOLD shall not be liable
 * for any damages arising out the intended use or if the code is modified
 * after delivery.
 *
 * Company:     AlphaBOLD Inc., www.alphabold.com
 * Author:      mazhar@alphabold.com
 * File:        UE_OpenBomGenerator.js
 * Date:        4/18/2019
 *
 *
 ***********************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/search'],
    function (nsRecord, nsSearch) {
        function beforeLoad(context) {

            context.form.clientScriptModulePath = '../clientscript/CS_OpenBomGenerator';
            if (context.type !== context.UserEventType.VIEW) {
                //Add button for open boom generator page.
                context.form.addButton({
                    id: 'custpage_btn_open_bom_generator',
                    label: 'Generate BOM',
                    functionName: 'showBomGenerator'
                });

                context.form.addButton({
                    id: 'custpage_btn_import_csv',
                    label: 'Import BOM',
                    functionName: 'importBomGenerator'
                });
            }
        }

        return {
            beforeLoad: beforeLoad
        };
    });
