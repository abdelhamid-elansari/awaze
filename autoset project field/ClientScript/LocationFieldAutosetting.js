/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */

define(['N/ui/serverWidget', 'N/record', 'N/runtime', 'N/log'], function(serverWidget, record, runtime, log) {

    /*
            function beforeLoad(context) {


                var myForm = context.form;

                            var formObject=context.newRecord;
                            var currentForm = recordObject.getValue('customform');
                            var scriptObj = runtime.getCurrentScript();
                            var currentFormId= scriptObj.getParameter({name: 'custscript_aw_templateid_locationautoset'});
                            log.debug({
                                title: 'Before Load current form ID',
                                details: currentFormId
                            });

                            log.debug({
                                title: 'Before Load custom form ID',
                                details: currentForm
                            });

                          //  if (currentForm == currentFormId){
                                //var form = context.form;
                                log.debug({
                                    title: 'Ingresso if FORM',
                                    details: 'Entrato'
                                });

                            var sublist = myForm.getSublist({
                                id : 'item'
                            });
                            var itemLocationField =  myForm.getSublist({id: 'item'}).getField({id: 'taxcode'});
                        log.debug({
                            title: 'Field to disable',
                            details: itemLocationField
                        });
                            itemLocationField.isMandatory = false
            log.debug({
                title: 'Field after disabling',
                details: itemLocationField
            });
                        //}
                    }
*/

    function beforeSubmit(context) {

        var recordObject=context.newRecord;
        log.debug({
            title: 'print record',
            details: recordObject
        });

       // var currentForm = recordObject.getValue('customform');
       // var scriptObj = runtime.getCurrentScript();
       // var currentFormId= scriptObj.getParameter({name: 'custscript_aw_templateid_locationautoset'});

        //log.debug({
        //    title: 'Current form',
        //    details: currentForm
        //});

        //log.debug({
        //    title: 'Current form ID',
        //    details: currentFormId
        //});

       // if (currentForm == currentFormId){

            log.debug({
                title: 'if form',
                details: 'Entrato'
            });

            //Getting the value of the location in the header
            var locationHeader=recordObject.getValue('location');

            //aggiorno le righe del tab item
            var lineCount = recordObject.getLineCount('item');
            log.debug({
                title: 'n. lines in the tab Items',
                details: lineCount
            });

            for (var j = 0; j < lineCount; j++){

                //Getting the selected valued for the custom field "PROJECT"
                var locationLine = recordObject.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    line: j
                });

                if(locationLine==''){

                    var locationField = recordObject.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        value: locationHeader,
                        line: j
                    });

                    /*
                    log.debug({
                        title: 'Value of location in the line',
                        details: locationField.description
                    });

                     */

                }else{
                    log.debug({
                        title: 'Filling of location in the line',
                        details: 'The field location is already filled in the line'
                    });
                }
            }

            //aggiorno le righe del tab expenses
            var lineCount = recordObject.getLineCount('expense');
            log.debug({
                title: 'n. lines in the tab Expenses',
                details: lineCount
            });

            for (var j = 0; j < lineCount; j++){

                //Getting the selected valued for the custom field "PROJECT"
                var locationLine = recordObject.getSublistValue({
                    sublistId: 'expense',
                    fieldId: 'location',
                    line: j
                });

                if(locationLine==''){

                    var CustomProjectField = recordObject.setSublistValue({
                        sublistId: 'expense',
                        fieldId: 'location',
                        value: locationHeader,
                        line: j
                    });

                }else{
                    log.debug({
                        title: 'Filling of location in the line',
                        details: 'The field location is already filled in the line'
                    });
                }
            }
       // }
    }

    return {
        //beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };
});

