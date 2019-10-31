/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(['N/search', 'N/record', 'N/email', 'N/log', 'N/file', 'N/format', './underscore-min-1.8.3.js'],
    function(search, record, email, log, file, format) {
        function afterSubmit(context) {
            log.audit({
                title: 'sendEmail - afterSubmit - ' + context.type
            });
            if(context.type != context.UserEventType.DELETE) {
                var vendoBillRecord = record.load({type: record.Type.VENDOR_BILL, id: context.newRecord.id});
                var mergeDataObj = {};
                mergeDataObj.id = context.newRecord.id;
                mergeDataObj.entity = context.newRecord.getValue({fieldId: 'entity'});
                mergeDataObj.entity_text = vendoBillRecord.getText({fieldId: 'entity'});
                mergeDataObj.tranid = context.newRecord.getValue({fieldId: 'tranid'});
                mergeDataObj.trandate = context.newRecord.getValue({fieldId: 'trandate'});
                mergeDataObj.memo = context.newRecord.getValue({fieldId: 'memo'});
                mergeDataObj.amount = context.newRecord.getValue({fieldId: 'usertotal'});
                mergeDataObj.currency_text = vendoBillRecord.getText({fieldId: 'currency'});
                mergeDataObj.department = context.newRecord.getValue({fieldId: 'department'});
                mergeDataObj.department_text = vendoBillRecord.getText({fieldId: 'department'});
                mergeDataObj.account_text = vendoBillRecord.getText({fieldId: 'account'});
                mergeDataObj.subsidiary = context.newRecord.getValue({fieldId: 'subsidiary'});
                mergeDataObj.subsidiary_text = vendoBillRecord.getText({fieldId: 'subsidiary'});
                mergeDataObj.nextApprover = context.newRecord.getValue({fieldId: 'custbody_aw_nextapprovervb'});
                mergeDataObj.nextApprover_text = vendoBillRecord.getText({fieldId: 'custbody_aw_nextapprovervb'});
                mergeDataObj.oldNextApprover = context.oldRecord.getValue({fieldId: 'custbody_aw_nextapprovervb'});
                mergeDataObj.approvalStatus = context.newRecord.getValue({fieldId: 'custbody_aw_approvalstatusvb'});
                mergeDataObj.project = vendoBillRecord.getText({fieldId: 'custbody_aw_projectheader'});
                mergeDataObj.createdBy = context.newRecord.getValue({fieldId: 'custbody_aw_createdby'});
                //mergeDataObj.emailApprovalRoutingServiceLink = 'https://debugger.eu1.netsuite.com/app/site/hosting/scriptlet.nl?script=438&deploy=1' +
                //mergeDataObj.emailApprovalRoutingServiceLink = 'https://5104205.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=346&deploy=2&compid=5104205&h=96696bdf43d2dce2bcf5' +//PROD
                mergeDataObj.emailApprovalRoutingServiceLink = 'https://5104205-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=346&deploy=2&compid=5104205_SB1&h=1a83ecbe303065e189f8' + //SB
                    '&approverId=' + mergeDataObj.nextApprover +
                    '&transactionId=' + mergeDataObj.id;
                mergeDataObj.trandate = format.format({
                    value: mergeDataObj.trandate,
                    type: format.Type.DATE
                });
                mergeDataObj.amount = _formatNumber({
                    number: mergeDataObj.amount,
                    sepDecimale: ",",
                    applicaSepMigliaia: '.'
                });


                log.audit({
                    title: 'sendEmail - afterSubmit - currentRecordData',
                    details: mergeDataObj
                });

                // if nextApprover is changed and it is not null
                if (mergeDataObj.nextApprover && mergeDataObj.nextApprover != mergeDataObj.oldNextApprover) {
                    log.audit({
                        title: 'sendEmail - afterSubmit',
                        details: 'nextApprover is changed going to send email'
                    });

                    var senderId = mergeDataObj.createdBy; //TODO is it correct?
                    var recipientId = mergeDataObj.nextApprover;
                    var attacchedFielsId = _getFilesId(context.newRecord.id);
                    var fileObjList = [];
                    _.each(attacchedFielsId, function (fileId) {
                        if (fileId) {
                            fileObjList.push(file.load({
                                id: fileId
                            }));
                        }
                    });
                    var templateFileObj = file.load({
                        id: 1555 // TODO search template file by name
                    });

                    var buildListHtmlLayout = _.template(templateFileObj.getContents());
                    var templateData = {};
                    templateData.templateData = mergeDataObj;
                    var mergedListHtmlLayout = buildListHtmlLayout(templateData);
                    var subject = 'Awaze vendor bill approval request (#' + mergeDataObj.tranid + ' - ' + mergeDataObj.trandate + ' - ' + mergeDataObj.amount + ' ' + mergeDataObj.currency_text + ')';
                    email.send({
                        author: senderId,
                        recipients: recipientId,
                        subject: subject,
                        body: mergedListHtmlLayout,
                        attachments: fileObjList,
                        relatedRecords: {
                            transactionId: context.newRecord.id
                        }
                    });
                    log.audit({
                        title: 'sendEmail - afterSubmit',
                        details: 'email sent, subject: ' + subject
                    });
                } else {
                    log.audit({
                        title: 'sendEmail - afterSubmit',
                        details: 'nextApprover is null or not changed, approval email not sent.'
                    });
                }
            }
        }
        function _getFilesId(vendoBillId) {
            var attacchedFielsId = [];
            var currentVendorbillAttachedFilesSrc = search.create({
                type: "vendorbill",
                filters:
                    [["type","anyof","VendBill"], "AND", ["internalidnumber","equalto",vendoBillId], "AND", ["mainline","is","T"]],
                columns: [search.createColumn({name: "internalid", join: "file"})]
            });
            var searchResultCount = currentVendorbillAttachedFilesSrc.runPaged().count;
            log.debug("vendorbillSearchObj result count",searchResultCount);
            var resultSet = currentVendorbillAttachedFilesSrc.run();
            log.debug("vendorbillSearchObj resultSet",JSON.stringify(resultSet));
            currentVendorbillAttachedFilesSrc.run().each(function(result){
                attacchedFielsId.push(result.getValue({name: "internalid", join: "file"}));

                return true;
            });
            log.debug("vendorbillSearchObj attacchedFielsId",JSON.stringify(attacchedFielsId));
            return attacchedFielsId;
        }
        function _formatNumber(params) {
                var number = params.number;         // numero da formattare
                var sepDecimale = params.sepDecimale||',';           // separatore decimale
                var sepMigliaia = params.sepMigliaia||'.';           // separatore delle migliaia
                var decimali = params.decimali||2;             // numero di cifre decimali

                // ----------------------------
                number = '' + parseFloat(number);
                // ----------------------------
                var saParti = number.split('.');
                // ----------------------------
                var parteDecimale = '';
                if (saParti.length > 1)
                {
                    parteDecimale = saParti[1];
                }
                for (var i = 0; i < decimali; i++)
                {
                    parteDecimale += '0';
                }
                parteDecimale = parteDecimale.substr(0, decimali);
                if (parteDecimale.length > 0)
                {
                    parteDecimale = sepDecimale + parteDecimale;
                }
                // ----------------------------
                var parteIntera = saParti[0];
                if (sepMigliaia != '')
                {
                    var regexp = /(\d+)(\d{3})/;
                    while (regexp.test(parteIntera))
                    {
                        parteIntera = parteIntera.replace(regexp, '$1' + sepMigliaia + '$2');
                    }
                }
                // ----------------------------
                return parteIntera + parteDecimale;
            }
        return {
            afterSubmit: afterSubmit
        };
    });