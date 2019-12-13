/**
 *@NApiVersion 2.0
 *@NScriptType WorkflowActionScript
 */
define(['N/search', 'N/record', 'N/log'], function (search, record, log) {


    function onAction(scriptContext){
        var newRecord = scriptContext.newRecord;
        var location = newRecord.getValue('location');
        var departement = newRecord.getValue('department');

        log.debug({
            title: 'Transaction data',
            details: 'location: ' + location + ', departement: ' + departement
        });

        var nextApproverMatrixSrc = search.create({
            type: 'customrecord_aw_next_approver_matrix_con',
            filters: [
                search.createFilter({name: 'custrecord_aw_approvermatrix_location', operator:'is', values: location}),
                search.createFilter({name: 'custrecord_aw_approvermatrix_departement', operator:'is', values: departement})
            ],
            columns: [{name: 'custrecord_aw_approvermatrix_approver'}]
        });
        var nextApproverMatrixSrcLength = nextApproverMatrixSrc.runPaged().count;
        if(nextApproverMatrixSrcLength != 1){
            throw  'There is no combination set up for that location and department. Could you please create it first?'
        }
        var nextApprover;
        nextApproverMatrixSrc.run().each(function(result) {
            nextApprover = result.getValue('custrecord_aw_approvermatrix_approver');
            return false;
        });
        var nextApproverFiledId;
        if(newRecord.type == 'vendorbill'){
            nextApproverFiledId = 'custbody_aw_nextapprovervb'
        }else if(newRecord.type == 'purchaseorder' || newRecord.type == 'vendorcredit'){
            nextApproverFiledId = 'nextapprover'
        }
        newRecord.setValue({
            fieldId: nextApproverFiledId,
            value: nextApprover,
        });

        log.debug('Set next approver', 'Approver (id: ' + nextApprover + ') on transaction  (type: ' + newRecord.type + ', id: ' + newRecord.id + ')');
        return 1
    }
    return {
        onAction: onAction
    };

});