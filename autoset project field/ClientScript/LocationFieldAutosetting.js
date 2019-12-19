/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

define(['N/record', 'N/log'], function(record, log) {

    function postSourcing(context) {
        log.debug({
            title: 'Check entering the function postSourcing',
            details: 'Entered'
        });

            if(context.sublistId === 'item' && context.fieldId === 'item' ){
                log.debug({
                    title: 'Check entering into item',
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

            if(context.sublistId === 'expense' && context.fieldId === 'account'){
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

      if(context.sublistId === 'line' && context.fieldId === 'account'){
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
              sublistId: 'line',
              fieldId: 'item',
              line: context.line
          });
          var locationLine = context.currentRecord.getCurrentSublistValue({
              sublistId: 'line',
              fieldId: 'location',
              line: context.line
          });
          if (accountLine !== '' && locationLine === '') {
              context.currentRecord.setCurrentSublistValue({
                  sublistId: 'line',
                  fieldId: 'location',
                  value: locationHeader
              });
          }
          var departmentLine = context.currentRecord.getCurrentSublistValue({
              sublistId: 'line',
              fieldId: 'department',
              line: context.line
          });
          if (accountLine !== '' && departmentLine === '') {
              context.currentRecord.setCurrentSublistValue({
                  sublistId: 'line',
                  fieldId: 'department',
                  value: departmentHeader
              });
          }

      }
        return true;
    }

    return {
        postSourcing: postSourcing
    };
});

