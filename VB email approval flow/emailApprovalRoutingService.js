
var SEARCHMODULE, UIMODULE;

/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@NModuleScope Public
 */

//********************** MAIN FUNCTION **********************
define(['N/search', 'N/ui/serverWidget','N/record', 'N/email', 'N/log', 'N/file', 'N/action', './underscore-min-1.8.3.js'],
    function runSuitelet(search, ui, record, email, log, file, action){
        function execute(context){
            //SEARCHMODULE.load(123);
            log.debug({
                title: 'context method',
                details: context.request.method
            });
            try {
                if (context.request.method == 'GET') {
                    var transactionId = context.request.parameters['transactionId'];
                    var action = context.request.parameters['action'];
                    var approverId = context.request.parameters['approverId'];
                    var transactionType = context.request.parameters['transactionType'];
                    log.debug({
                        title: 'context params',
                        details: context.request.parameters
                    });

                    var vendoBillRecord = record.load({type: transactionType, id: transactionId});
                    var nextApprover = vendoBillRecord.getValue({
                        fieldId: 'custbody_aw_nextapprovervb'
                    });
                    if (approverId == nextApprover) {
                        if (action == 'APPROVE') {
                            vendoBillRecord.setValue({
                                fieldId: 'custbody_aw_approve_emailaction',
                                value: true,
                            });

                            vendoBillRecord.save();
                            context.response.write('<div style="font-size: 1rem; font-weight: 400; line-height: 1.5; text-align: left; box-sizing: border-box; position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; color: #155724; background-color: #d4edda; border-color: #c3e6cb; margin-top: 1rem;">' +
                                                    'The Invoice has been approved, depending on your approval limit and the value of the invoice; it will either be ready for payment or sent to the next approver for approval.' +
                                                    '</div>');
                        } else if (action == 'REJECT') {

                            vendoBillRecord.setValue({
                                fieldId: 'custbody_aw_reject_emailaction',
                                value: true,
                            });
                            vendoBillRecord.save();
                            var form = ui.createForm({title: 'Netsuite e-mail approval flow response'});
                            var htmlMessage = form.addField({
                                id: 'htmlmessage',
                                type: ui.FieldType.INLINEHTML,
                                layoutType: ui.FieldLayoutType.OUTSIDEABOVE,
                                label: '-'
                            });
                            htmlMessage.defaultValue = '<div style="font-size: 1rem; font-weight: 400; line-height: 1.5; text-align: left; box-sizing: border-box; position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; color: #155724; background-color: #d4edda; border-color: #c3e6cb; margin-top: 1rem;">' +
                                'The transaction has been correctly rejected, please enter a rejection reason' +
                                '</div>';


                            var reject_reasons_field = form.addField({
                                id: 'reject_reasons',
                                type: ui.FieldType.TEXTAREA,
                                label: 'Rejection reason',
                                layoutType: ui.FieldLayoutType.NORMAL
                            });
                            reject_reasons_field.isMandatory = true;

                            var additionalData = form.addField({
                                id: 'additionaldata',
                                type: ui.FieldType.LONGTEXT,
                                label: '-'
                            });
                            additionalData.updateDisplayType({
                                displayType: ui.FieldDisplayType.HIDDEN
                            });
                            additionalData.defaultValue = JSON.stringify({approverId: approverId,
                                                            transactionId: transactionId});
                            form.addSubmitButton({
                                label: 'Save'
                            });
                            context.response.writePage(form);
                        } else {
                            var errorMsg = 'RESPONSE - unexpected error has occurred - cannot recognize the approve or reject action';
                            context.response.write('<div style="font-size: 1rem; font-weight: 400; line-height: 1.5; text-align: left; box-sizing: border-box; position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; margin-top: 1rem;" role="alert">\n' +
                                errorMsg +
                                '</div>');
                        }
                    }else{
                        var errorMsg = 'Error, impossible to execute the requested action, the transaction has already been approved or rejected'
                        context.response.write('<div style="font-size: 1rem; font-weight: 400; line-height: 1.5; text-align: left; box-sizing: border-box; position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; margin-top: 1rem;" role="alert">\n' +
                            errorMsg +
                            '</div>');
                    }
                } else {
                    log.debug({
                        title: 'context params',
                        details: context.request.parameters
                    });
                    var request = context.request;
                    var additionaldata = JSON.parse(request.parameters['additionaldata']);
                    var transactionId = additionaldata.transactionId;
                    var approverId = additionaldata.approverId;
                    var rejectReasons = request.parameters.reject_reasons;
                    var rejectReasonsRec = record.create({type: 'customrecord_aw_rejectionreason'});

                    rejectReasonsRec.setValue({fieldId: 'custrecord_aw_rejectionreason', value: rejectReasons});
                    rejectReasonsRec.setValue({fieldId: 'custrecord1', value: transactionId});
                    rejectReasonsRec.setValue({fieldId: 'custrecord_aw_approver', value: approverId});
                    rejectReasonsRec.save();
                    context.response.write('<div style="font-size: 1rem; font-weight: 400; line-height: 1.5; text-align: left; box-sizing: border-box; position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; color: #155724; background-color: #d4edda; border-color: #c3e6cb; margin-top: 1rem;">' +
                        'The rejection reason has been correctly saved'+
                        '</div>');
                }

            }catch (exc) {
                var errorMsg = 'An unexpected error has occurred, details: ' +exc.toString() + ' on line: ' + exc.lineNumber || 'unknown. Please contact support'
                context.response.write('<div style="font-size: 1rem; font-weight: 400; line-height: 1.5; text-align: left; box-sizing: border-box; position: relative; padding: .75rem 1.25rem; margin-bottom: 1rem; border: 1px solid transparent; border-radius: .25rem; color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; margin-top: 1rem;" role="alert">\n' +
                                        errorMsg +
                                        '</div>');
            }
        }
    return {
        onRequest: execute,
    };
});

