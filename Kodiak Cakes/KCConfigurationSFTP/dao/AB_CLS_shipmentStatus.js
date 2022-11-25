// eslint-disable-next-line no-undef
define(['N/log','N/record'], function(log,record) {
    return {
        internalid: 'customrecord810',
        fields: {
            refNo:'custrecorddoc_ref',
            date:'custrecord157',
            time:'custrecord158',
            carrieAlphaCode:'custrecord143',
            referenceSONo:'custrecord144',
            referenceINVNo:'custrecord145',
            shipmentAppointmentStatusCode:'custrecord146',
            shipmentAppointmentReasonCode:'custrecord147',
            itemFulfillmentNo:'custrecord148',
            order:'custrecord149',
            shipmentIdentificationNum:'custrecord156',
            statusCode:'custrecord159',
            custOrderNum:'custrecord160',
        },
        

        create:function create(lineData){
            var title = 'create()::';
            log.debug(title+"lineData",lineData);           
            try{
                var shipmentRec = record.create({
                    type: this.internalid,
                    isDynamic: true
                });
                shipmentRec.setValue({
                    fieldId: this.fields.refNo,
                    value: lineData['Carrier Pro #']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.shipmentIdentificationNum,
                    value: lineData['Master BOL #']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.carrieAlphaCode,
                    value: lineData['SCAC']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.referenceSONo,
                    value: lineData['Sales Order #']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.referenceINVNo,
                    value: lineData['Purchase Order #']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.shipmentAppointmentStatusCode,
                    value: lineData['Staus Code']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.shipmentAppointmentReasonCode,
                    value: lineData['Status Reason']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.date,
                    value: new Date(lineData['Date'])
                });
                shipmentRec.setValue({
                    fieldId: this.fields.time,
                    value: String(lineData['Time'])
                });
                shipmentRec.setValue({
                    fieldId: this.fields.itemFulfillmentNo,
                    // value: lineData['Customer Order #']
                    value: ''
                });
                shipmentRec.setValue({
                    fieldId: this.fields.order,
                    // value: lineData['Sales Order #']
                    value: 22799
                });
                shipmentRec.setValue({
                    fieldId: this.fields.statusCode,
                    value: lineData['Staus Code']
                });
                shipmentRec.setValue({
                    fieldId: this.fields.custOrderNum,
                    value: lineData['Customer Order #']
                });
                var shipmentRecId = shipmentRec.save();
                }catch(error){
                    log.error(title+error.name,error.message);
            }
            return shipmentRecId; 
        },   
    };
});