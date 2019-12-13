/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

define(['N/ui/dialog','N/error', 'N/log'], function(dialog, error, log) {


        var PreviousProjectValue='';
        var PreviousCustomerValue='';
        var PreviousVendorValue='';

        function lineInit(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;

            if (sublistName === 'item' || sublistName === 'expense') {
                PreviousProjectValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_projects'
                });

                PreviousCustomerValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_customer'
                });

            }else if(sublistName === 'line'){
                PreviousProjectValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_projects'
                });

                PreviousCustomerValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_customer'
                });

                PreviousVendorValue = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_vendor'
                });
                log.debug({
                    title: 'Previous VENDOR value',
                    details: PreviousVendorValue
                });
            }
        }
        function validateLine(context) {

            var flagProject=0;
            var flagCustomer=0;
            var flagVendor=0;

            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;

            log.debug({
                title: 'Name of sublist',
                details: sublistName
            });
            var line = context.line;

            if (sublistName === 'item' || sublistName === 'expense') {
                var currentProjectValue= currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_projects'
                });

                var currentCustomerValue= currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_customer'
                });

                log.debug({
                    title: 'Value of PROJECT',
                    details: currentProjectValue
                });

                log.debug({
                    title: 'value of CUSTOMER',
                    details: currentCustomerValue
                });



                if (currentProjectValue!='' ) {
                    flagProject=1;
                }

                log.debug({
                    title: 'Check of Project filling',
                    details: flagProject
                });

                if ( currentCustomerValue!='') {
                    flagCustomer=1;
                }

                log.debug({
                    title: 'Check of Customer filling',
                    details: flagCustomer
                });

            }else if( sublistName === 'line'){
                var currentProjectValue= currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_projects'
                });

                var currentCustomerValue= currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_customer'
                });

                var currentVendorValue= currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_vendor'
                });

                log.debug({
                    title: 'Value of PROJECT',
                    details: currentProjectValue
                });

                log.debug({
                    title: 'value of CUSTOMER',
                    details: currentCustomerValue
                });

                log.debug({
                    title: 'value of VENDOR',
                    details: currentVendorValue
                });

                if (currentProjectValue!='' ) {
                    flagProject=1;
                }

                log.debug({
                    title: 'Check of Project filling',
                    details: flagProject
                });

                if ( currentCustomerValue!='') {
                    flagCustomer=1;
                }

                log.debug({
                    title: 'Check of Customer filling',
                    details: flagCustomer
                });

                if ( currentVendorValue!='') {
                    flagVendor=1;
                }

                log.debug({
                    title: 'Check of Vendor filling',
                    details: flagVendor
                });

            }
            if((flagProject==1 && flagCustomer==1) || (flagProject==1 && flagVendor==1) || (flagCustomer==1 && flagVendor==1) || (flagProject==1 && flagCustomer==1 && flagVendor==1)){

                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_projects',
                    value: PreviousProjectValue,
                    ignoreFieldChange : true
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_customer',
                    value: PreviousCustomerValue,
                    ignoreFieldChange : true
                });

                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_aw_vendor',
                    value: PreviousVendorValue,
                    ignoreFieldChange : true
                });

                log.debug({
                    title: 'Check on custom fields PROJECT and CUSTOMER',
                    details: 'ERROR: you can fill only a custom field between PROJECT, CUSTOMER and VENDOR'
                });

                function success(result) {
                    console.log("Success with value " + result);
                }
                function failure(reason) {
                    console.log("Failure: " + reason);
                }

                dialog.alert({
                        title: 'Warning',
                        message: 'Fill one of the custom fields "PROJECT"/"CUSTOMER"/"VENDOR"'
                    }).then(success).catch(failure);

                return false;
            }
            return true;
        }

        function setDescriptionField(context) {

            console.log(context.fieldId);
            log.debug({
                title: 'Check entering in function setDescription',
                details: 'Entered'
            });
            // is this the field "PROJECT" or "CUSTOMER"
            if(context.sublistId !== 'item' && context.sublistId !== 'expense' && context.sublistId !== 'line') {return;}
            if(context.fieldId !== 'custcol_aw_projects' && context.fieldId !== 'custcol_aw_customer' && context.fieldId !== 'custcol_aw_vendor') {return;}

            log.debug({
                title: 'Field ID',
                details: context.fieldId
            });
            // is the opposite field already filled ?
            // register the value of each field
            lineInit(context);

            // check if more than one field is filled
            if(!validateLine(context)){return;}


            console.log('??');

            // get the value to set

            var descriptionValue = context.currentRecord.getCurrentSublistValue({
                sublistId: context.sublistId,
                fieldId: context.fieldId,
                line: context.line
            });

            console.log('==> ' +  descriptionValue);

            // set the "description" field

            log.debug({
                title: 'Description value',
                details: descriptionValue
            });

            if(context.fieldId !== 'custcol_aw_vendor'){
                context.currentRecord.setCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'customer',
                    value: descriptionValue
                });
            }else{
                context.currentRecord.setCurrentSublistValue({
                    sublistId: context.sublistId,
                    fieldId: 'entity',
                    value: descriptionValue
                });
            }
        }

        return {
            lineInit: lineInit,
            validateLine: validateLine,
            fieldChanged : function(context) {
                setDescriptionField(context);
            }
        };

});

