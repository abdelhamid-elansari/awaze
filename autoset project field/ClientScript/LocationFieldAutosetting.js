/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

define(['N/record', 'N/log'], function(record, log) {

    function fieldChanged(context) {
        log.debug({
            title: 'Check entering the function fieldChanged',
            details: 'Entered'
        });
        // Check on the sublists in wihich the field "location" is present
        /*
            if(context.sublistId == 'item'){
                if(context.fieldId == 'location' ){
                    var recordObject=context.currentRecord;
                    log.debug({
                        title: 'print record',
                        details: recordObject
                    });
                    //Getting the value of the location and department from the header
                    var locationHeader=recordObject.getValue('location');
                    var departmentHeader=recordObject.getValue('department');
                    log.debug({
                        title: 'print of location in the header',
                        details: locationHeader
                    });
                    log.debug({
                        title: 'print of department in the header',
                        details: departmentHeader
                    });

                    log.debug({
                        title: 'Check entering the function fieldChanged',
                        details: 'Entered'
                    });

                    //filling the field "location"
                    var locationLine = context.currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: context.line
                    });
                    log.debug({
                        title: 'Sublist',
                        details: context.sublistId
                    });
                    log.debug({
                        title: 'Location in the line',
                        details: locationLine
                    });
                    if (locationLine == '') {
                        context.currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            value: locationHeader
                        });
                    }
                }else if(context.fieldId == 'department'){
                    var recordObject=context.currentRecord;
                    log.debug({
                        title: 'print record',
                        details: recordObject
                    });
                    //Getting the value of the location and department from the header
                    var locationHeader=recordObject.getValue('location');
                    var departmentHeader=recordObject.getValue('department');
                    log.debug({
                        title: 'print of location in the header',
                        details: locationHeader
                    });
                    log.debug({
                        title: 'print of department in the header',
                        details: departmentHeader
                    });
                        //filling the field "department"
                        var departmentLine = context.currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'department',
                            line: context.line
                        });
                        log.debug({
                            title: 'Sublist',
                            details: context.sublistId
                        });
                        log.debug({
                            title: 'department in the line',
                            details: departmentLine
                        });
                        if (departmentLine==''){
                            context.currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'department',
                                value: departmentHeader
                            });
                        }
                }

            }

         */
            if(context.sublistId === 'item'){
                log.debug({
                    title: 'Check entering into expenses',
                    details: 'Entered'
                });
                log.debug({
                    title: 'Name of the field',
                    details: context.fieldId
                });

                var recordObject=context.currentRecord;
                log.debug({
                    title: 'print record',
                    details: recordObject
                });
                //Getting the value of the location and department from the header
                var locationHeader=recordObject.getValue('location');
                var departmentHeader=recordObject.getValue('department');
                log.debug({
                    title: 'print of location in the header',
                    details: locationHeader
                });
                log.debug({
                    title: 'print of department in the header',
                    details: departmentHeader
                });
                var itemLine = context.currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: context.line
                });
                var locationLine = context.currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    line: context.line
                });
                if (itemLine !== '' && locationLine === '') {
                    context.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        value: locationHeader
                    });
                }
                var departmentLine = context.currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'department',
                    line: context.line
                });
                if (itemLine !== '' && departmentLine === '') {
                    context.currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'department',
                        value: departmentHeader
                    });
                }

            }
            if(context.sublistId === 'expense'){
                log.debug({
                    title: 'Check entering into expenses',
                    details: 'Entered'
                });
                log.debug({
                    title: 'Name of the field',
                    details: context.fieldId
                });

                var recordObject=context.currentRecord;
                log.debug({
                    title: 'print record',
                    details: recordObject
                });
                //Getting the value of the location and department from the header
                var locationHeader=recordObject.getValue('location');
                var departmentHeader=recordObject.getValue('department');
                log.debug({
                    title: 'print of location in the header',
                    details: locationHeader
                });
                log.debug({
                    title: 'print of department in the header',
                    details: departmentHeader
                });
                var accountLine = context.currentRecord.getCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'account',
                    line: context.line
                });
                var locationLine = context.currentRecord.getCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'location',
                    line: context.line
                });
                if (accountLine !== '' && locationLine === '') {
                    context.currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location',
                        value: locationHeader
                    });
                }
                var departmentLine = context.currentRecord.getCurrentSublistValue({
                    sublistId: 'expense',
                    fieldId: 'department',
                    line: context.line
                });
                if (accountLine !== '' && departmentLine === '') {
                    context.currentRecord.setCurrentSublistValue({
                        sublistId: 'expense',
                        fieldId: 'department',
                        value: departmentHeader
                    });
                }

            }
    }

    return {
        fieldChanged: fieldChanged
    };
});

