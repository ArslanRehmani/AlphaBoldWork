function beforeSubmit() {
    try{
    var SO = nlapiGetNewRecord();
    var id = SO.id;
    nlapiLogExecution('DEBUG', 'id', id);

    var obj = {
            country  : 'US',
            isresidential : 'F',
            attention     : 'bold123',
            addressee  : 'Arslan Inc.',
            addrphone  : '(123)123-1234',
            addr1      : '2955 Campus Drive',
            addr2    : 'Suite - 200',
            city    : 'San Mateo',
            state   : 'CA',
            zip    : '94403'
        };

        SO.setFieldValue('shipcountry', obj.country);
        SO.setFieldValue('shipisresidential', obj.isresidential);
        SO.setFieldValue('shipattention', obj.attention);
        SO.setFieldValue('shipaddressee', obj.addressee);
        SO.setFieldValue('shipaddrphone', obj.addrphone);
        SO.setFieldValue('shipaddr1', obj.addr1);
        SO.setFieldValue('shipaddr2', obj.addr2);
        SO.setFieldValue('shipcity', obj.city);
        SO.setFieldValue('shipstate', obj.state);
        SO.setFieldValue('shipzip', obj.zip);

   
}catch(error){
    nlapiLogExecution('DEBUG', 'error', error.message);
}
}