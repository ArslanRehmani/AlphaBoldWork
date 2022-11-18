  
  /**
   *@NApiVersion 2.x
  *@NModuleScope Public
  *@NScriptType ClientScript
  */

  //define(['N/search','N/log'], runClientscript);
  define(['N/log','N/record','N/search'], runClientscript);
        
  function runClientscript(log,record,search){
    
      //*********** HELPER FUNCTIONS ***********
      function lineInit(context) {
      context.currentRecord;
      context.sublistId;
      //alert("lineInit Triggered!");
          return;
    }
    
      function pageInit(context) {
      context.currentRecord;
      context.mode;
      //alert("pageInit Triggered!");
          return;
    }
    
      function postSourcing(context) {
      context.currentRecord;
      context.sublistId;
      context.fieldId;
      alert("postSourcing Triggered!");
          return;
      }
    
      function saveRecord(context) {
      context.currentRecord;
      //alert("saveRecord Triggered!");
          return true; //Return true if you want to continue saving the record.
      }
    
      function sublistChanged(context) {
      context.currentRecord;
      context.sublistId;
      //alert("sublistChanged Triggered!");
      }
    
      function validateDelete(context) {
      context.currentRecord;
      context.sublistId;
      //alert("validateDelete Triggered!");
      return true; //Return true if the line deletion is valid.
      }
    
      function validateField(context) {
          var currentRecord = context.currentRecord;
          var sublistName = context.sublistId;
          var sublistFieldName = context.fieldId;
          var line = context.line;
      var column = context.column;
          var strOut = "";
          var itemId = currentRecord.getValue({
            fieldId : 'item'
          });
          log.debug('itemId',itemId);
          //code change here
          var isserialitem;
          var itemSearchObj = search.create({
            type: "item",
            filters:
            [
               ["internalid","anyof",itemId]
            ],
            columns:
            [
               search.createColumn({
                  name: "itemid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "isserialitem", label: "Is Serialized Item"})
            ]
         });
         itemSearchObj.run().each(function(result){
          isserialitem = false;
          isserialitem = result.getValue({ name: 'isserialitem' });
            return true;
         });
         log.debug('isserialitem',isserialitem);
          //end here
          if ((sublistName === "inventoryassignment") && (sublistFieldName === "receiptinventorynumber")) {
            var fieldval = currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: sublistFieldName
            });
      log.debug('fieldval',fieldval);
            var bExpires = false;
            var strGTIN = "-none-";
            var strMfg = "N/A";
            var strExp = "N/A";
            var strSerial = "N/A";
            var strLot = "N/A";
            // UDI's start with Nalu signature string and will have a manufacturing date ("11" code) in positions [16:17]
            var isUDI = ((fieldval.substring(0,12) == "010081253703") && (fieldval.substring(16,18) == "11"));
            if (isUDI) {
              strGTIN = fieldval.substring(0,16);
              strMfg = fieldval.substring(18,24);
              // next tag will encode Expiry Date (Sterile=17), Use By Date (Adhesive=15) or a Lot Number (10)
              var strTag3 = fieldval.substring(24,26);
              log.debug('strTag3',strTag3);
              if ((strTag3 == "15") || (strTag3 == "17")) {
                bExpires = true;
              strExp = fieldval.substring(26,32);
                // next tag will encode a Serial Number (21) or a Lot Number (10)
                var strTag4 = fieldval.substring(32,34);
                var strTail = fieldval.substring(34);
                if (strTag4 == "21") {
                  strSerial = strTail;
                } else if (strTag4 == "10") {
                  strLot = strTail;
                }
              // else this is just a non-sterile lot or serial encoded UDI (e.g. MODEL_34009, MODEL_34001-001_US, MODEL_74001-US)
              }if (strTag3 == "10") {
                if(isserialitem == "true" || isserialitem == true){
                  strSerial = fieldval.substring(26);
                }else{
                  strLot = fieldval.substring(26);
                }
              }if (strTag3 == "21") {
                strSerial = fieldval.substring(26);
              }
            // Bulk adhesive clip boxes (e.g. PD-290) follow "Eyymmdd#L<LOT>" format
            } else if ((fieldval.substring(0,1) == "E") && (fieldval.substring(7,9) == "#L")) {
              strLot = fieldval.substring(9);
              strExp = fieldval.substring(1,7);
            } else {
              strLot = fieldval;
            }

            alert(sublistName + " : " + sublistFieldName + " = " + fieldval + "\n"
                  + "GTIN    = " + strGTIN + "\n"
                  + "MfgDate = " + strMfg + "\n"
                  + "ExpDate = " + strExp + "\n"
                  + "Lot     = " + strLot + "\n"
                  + "Serial  = " + strSerial);
          }
      return true; //Return true to continue with the change.
      }
    
      function validateInsert(context) {
      context.currentRecord;
      context.sublistId;
      //alert("validateInsert Triggered!");
      return true; //Return true if the line insertion is valid.
      }
    
      function validateLine(context) {
      context.currentRecord;
      context.sublistId;
      //alert("validateLine Triggered!");
      return true; //Return true if the line is valid.
      }
      
      function fieldChanged(context) {
      context.currentRecord;
      context.sublistId;
      context.fieldId;
      context.line;
      context.column;
      //alert("fieldChanged Triggered!");
          return;
      }
      
      var returnObj = {};
      returnObj.lineInit = lineInit;
    returnObj.pageInit = pageInit;
    returnObj.postSourcing = postSourcing;
    returnObj.saveRecord = saveRecord;
    returnObj.sublistChanged = sublistChanged;
    returnObj.validateDelete = validateDelete;
    returnObj.validateField = validateField;
    returnObj.validateInsert = validateInsert;
    returnObj.validateLine = validateLine;
      returnObj.fieldChanged = fieldChanged;
      return returnObj;
  }