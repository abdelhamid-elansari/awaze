/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/email', 'N/log', 'N/file', '/SuiteScripts/underscore-min-1.8.3.js'], function() {
    function onAction(context){
        log.debug({
            title: 'Start Script'
        });
        var senderId = -5;
        var recipientEmail = 'aelansari@deloitte.it';
        var timeStamp = new Date().getUTCMilliseconds();
        var recipientId = 1709;
        var fileObj = file.load({
            id: 641
        });
        var templateFileObj = file.load({
            id: 26227
        });
        var mergeDataObj = {};
        mergeDataObj.id = context.newRecord.id;
        mergeDataObj.entity = context.newRecord.getValue({fieldId: 'entity'});
        mergeDataObj.tranid = context.newRecord.getValue({fieldId: 'tranid'});
        mergeDataObj.trandate = context.newRecord.getValue({fieldId: 'trandate'});
        mergeDataObj.memo = context.newRecord.getValue({fieldId: 'memo'});
        mergeDataObj.amount = context.newRecord.getValue({fieldId: 'amount'});
        mergeDataObj.nextApprover = context.newRecord.getValue({fieldId: 'custbodynextapprovervb'});
        mergeDataObj.approvalStatus = context.newRecord.getValue({fieldId: 'custbodyapprovalstatusvb'});
        mergeDataObj.emailApprovalRoutingServiceLink = 'https://5104205-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=438&deploy=1&compid=5104205_SB1&h=4fa12db64c1510393ece?' +
            'approverId='+mergeDataObj.nextApprover +
            '&transactionId='+mergeDataObj.id;
        var buildListHtmlLayout = _.template(templateFileObj.getContents());
        var templateData = {};
        templateData.templateData = mergeDataObj;
        var mergedListHtmlLayout = buildListHtmlLayout(templateData);

        email.send({
            author: senderId,
            recipients: recipientEmail,
            subject: 'Test html form Email bootstraè ',
            body: mergedListHtmlLayout,
            attachments: [fileObj],
            relatedRecords: {
                transactionId: context.newRecord.id
            }
        });
        // var newRecord = scriptContext.newRecord;
        // var itemCount = newRecord.getLineCount({
        //     sublistId: 'item'
        // });
        // log.debug({
        //     title: 'Item Count',
        //     details: itemCount
        // });
        // for (var i = 0; i < itemCount; i++){
        //     var quantity = newRecord.getSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'quantity',
        //         line: i
        //     });
        //     log.debug({
        //         title: 'Quantity of Item ' + i,
        //         details: quantity
        //     });
        //     if (quantity === 0){
        //         return 0;
        //     }
        // }
        // log.debug({
        //     title: 'End Script'
        // });
        // return 1;
    }
    return {
        onAction: onAction
    }
});
