/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */

define(['N/search', 'N/record', 'N/log'], function(search, record, log) {

        function beforeSubmit(context) {
         var recordObject=context.newRecord;
         log.debug({
             title: 'print record',
             details: recordObject
         });
         //aggiorno le righe del tab item
         var lineCount = recordObject.getLineCount('item');
            log.debug({
                title: 'n. lines in the tab Items',
                details: lineCount
            });

            for (var j = 0; j < lineCount; j++){

                //Getting the selected valued for the custom field "CUSTOMER"
                var CustomVendorField = recordObject.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_aw_vendor',
                    line: j
                });

                log.debug({
                    title: 'Custom field "VENDOR" value in the tab Items',
                    details: CustomVendorField
                });

                if (CustomVendorField!=''){
                        recordObject.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'customer',
                            line: j,
                            value: CustomVendorField
                        });
                }
            }

            //aggiorno le righe del tab expense
            var lineCount = recordObject.getLineCount('expense');
            log.debug({
                title: 'n. lines in the tab Expenses',
                details: lineCount
            });

            for (var j = 0; j < lineCount; j++){

                //Getting the selected valued for the custom field "CUSTOMER"
                var CustomVendorField = recordObject.getSublistValue({
                    sublistId: 'expense',
                    fieldId: 'custcol_aw_vendor',
                    line: j
                });

                log.debug({
                    title: 'Custom field "VENDOR" value in the tab Items',
                    details: CustomVendorField
                });

                if (CustomVendorField!=''){
                    recordObject.setSublistValue({
                        sublistId: 'expense',
                        fieldId: 'customer',
                        line: j,
                        value: CustomVendorField
                    });
                }
            }
        }

        return {
           beforeSubmit: beforeSubmit
        };
    });

