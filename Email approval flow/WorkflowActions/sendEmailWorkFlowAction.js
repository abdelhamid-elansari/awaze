/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/search', 'N/record', 'N/email', 'N/log', 'N/file', 'N/format', './underscore-min-1.8.3.js', 'N/url'],
    function(search, record, email, log, file, format, underscore, url) {
        function onAction(context) {

            log.audit({
                title: 'sendEmail - afterSubmit - ' + context.type
            });

            var vendoBillRecord = record.load({type: context.newRecord.type, id: context.newRecord.id});
            var mergeDataObj = {};
            mergeDataObj.id = context.newRecord.id;
            mergeDataObj.entity = context.newRecord.getValue({fieldId: 'entity'});
            mergeDataObj.entity_text = vendoBillRecord.getText({fieldId: 'entity'});
            mergeDataObj.tranid = context.newRecord.getValue({fieldId: 'tranid'});
            mergeDataObj.trandate = context.newRecord.getValue({fieldId: 'trandate'});
            mergeDataObj.memo = context.newRecord.getValue({fieldId: 'memo'});


            mergeDataObj.currency_text = vendoBillRecord.getText({fieldId: 'currency'});
            mergeDataObj.department = context.newRecord.getValue({fieldId: 'department'});
            mergeDataObj.department_text = vendoBillRecord.getText({fieldId: 'department'});
            mergeDataObj.account_text = vendoBillRecord.getText({fieldId: 'account'});
            mergeDataObj.subsidiary = context.newRecord.getValue({fieldId: 'subsidiary'});
            mergeDataObj.subsidiary_text = vendoBillRecord.getText({fieldId: 'subsidiary'});
            mergeDataObj.approvalStatus = context.newRecord.getValue({fieldId: 'custbody_aw_approvalstatusvb'});
            mergeDataObj.project = vendoBillRecord.getText({fieldId: 'custbody_aw_projectheader'});
            mergeDataObj.createdBy = context.newRecord.getValue({fieldId: 'createdby'});

            // depending on the record type, we fetch the information from the context
            if(context.newRecord.type == 'vendorbill'){

                mergeDataObj.nextApprover_text = vendoBillRecord.getText({fieldId: 'custbody_aw_nextapprovervb'});
                mergeDataObj.nextApprover = context.newRecord.getValue({fieldId: 'custbody_aw_nextapprovervb'});
                mergeDataObj.amount = context.newRecord.getValue({fieldId: 'usertotal'});

            } else if(context.newRecord.type == 'purchaseorder'){

                mergeDataObj.amount = context.newRecord.getValue({fieldId: 'total'});
                mergeDataObj.nextApprover_text = vendoBillRecord.getText({fieldId: 'nextapprover'});
                mergeDataObj.nextApprover = context.newRecord.getValue({fieldId: 'nextapprover'});

            } else if (context.newRecord.type == 'vendorcredit') {
                mergeDataObj.amount = context.newRecord.getValue({fieldId: 'total'});
                mergeDataObj.nextApprover_text = vendoBillRecord.getText({fieldId: 'custbody_aw_nextapprovervb'});
                mergeDataObj.nextApprover = context.newRecord.getValue({fieldId: 'custbody_aw_nextapprovervb'});
            }

            mergeDataObj.expenses = [];

            // dynamically get the url or the suitelet

            mergeDataObj.emailApprovalRoutingServiceLink = url.resolveScript({
                    scriptId: 'customscript_wz_emailapprovalflow_serv',
                    deploymentId: 'customdeploy_wz_emailapprovalflow_serv',
                    returnExternalUrl : true
                }) +
                '&approverId=' + mergeDataObj.nextApprover +
                '&transactionId=' + mergeDataObj.id +
                '&transactionType=' + context.newRecord.type;

            /* //mergeDataObj.emailApprovalRoutingServiceLink = 'https://debugger.eu1.netsuite.com/app/site/hosting/scriptlet.nl?script=438&deploy=1' +
            mergeDataObj.emailApprovalRoutingServiceLink = 'https://a-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=346&deploy=2&compid=5104205_SB1&h=1a83ecbe303065e189f8' + //SB
            //mergeDataObj.emailApprovalRoutingServiceLink = 'https://5104205.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=346&deploy=2&compid=5104205&h=96696bdf43d2dce2bcf5' +//PROD
                */

            mergeDataObj.trandate = format.format({
                value: mergeDataObj.trandate,
                type: format.Type.DATE
            });

            mergeDataObj.amount = _formatNumber({
                number: mergeDataObj.amount,
                sepDecimale: ",",
                applicaSepMigliaia: '.'
            });


            // we loop through each sublist to get a recap
            var arrayOfSublist = ['expense', 'item'];
            for (var sublist in arrayOfSublist) {
                var expensesCount = vendoBillRecord.getLineCount({"sublistId": arrayOfSublist[sublist]});

                for (var iCount = 0; iCount < expensesCount; iCount++) {
                    context.newRecord.getSublistValue({sublistId: arrayOfSublist[sublist], fieldId: 'account', line: iCount});

                    mergeDataObj.expenses.push({
                        account: vendoBillRecord.getSublistText({
                            sublistId: arrayOfSublist[sublist],
                            // for expenses, we take the account, for item, the item's name
                            fieldId: ((arrayOfSublist[sublist] === 'expense') ? 'account' : 'item'),
                            line: iCount
                        }),
                        amount: vendoBillRecord.getSublistText({sublistId: arrayOfSublist[sublist], fieldId: 'amount', line: iCount}),
                        grossamt: vendoBillRecord.getSublistText({
                            sublistId: arrayOfSublist[sublist],
                            fieldId: 'grossamt',
                            line: iCount
                        }),
                        taxcode: vendoBillRecord.getSublistText({
                            sublistId: arrayOfSublist[sublist],
                            fieldId: 'taxcode',
                            line: iCount
                        }),
                        taxrate: vendoBillRecord.getSublistText({
                            sublistId: arrayOfSublist[sublist],
                            fieldId: 'taxrate1',
                            line: iCount
                        }),
                        taxamount: vendoBillRecord.getSublistText({
                            sublistId: arrayOfSublist[sublist],
                            fieldId: 'tax1amt',
                            line: iCount
                        }),
                    });
                }
            }

            log.audit({
                title: 'sendEmail - afterSubmit - currentRecordData',
                details: mergeDataObj
            });


            mergeDataObj.createdBy = _getCreatedBy(context.newRecord.id, context.newRecord.type); //TODO is it correct?
            log.audit({
                title: 'sendEmail - afterSubmit - createdBy',
                details: 'createdBy: ' + mergeDataObj.createdBy
            });

            var senderId = mergeDataObj.createdBy; //TODO is it correct?
            var recipientId = mergeDataObj.nextApprover;
            var attacchedFielsId = _getFilesId(context.newRecord.id, context.newRecord.type);
            var fileObjList = [];
            _.each(attacchedFielsId, function (fileId) {
                if (fileId) {
                    fileObjList.push(file.load({
                        id: fileId
                    }));
                }
            });

            var templateFileObj = null;
            var subject = '';

            // depending on the record type, we set a different subject and load a different template file

            switch (context.newRecord.type) {

                case 'vendorbill':
                    templateFileObj = file.load({
                        id: 12020 // TODO search template file by name
                    });
                    subject = 'Awaze vendor bill approval request'
                    break;

                case 'purchaseorder':
                    templateFileObj = file.load({
                        id: 12019 // TODO search template file by name
                    });
                    subject = 'Awaze purchase order approval request'
                    break;

                case 'vendorcredit':
                    templateFileObj = file.load({
                        id: 12021 // TODO search template file by name
                    });
                    subject = 'Awaze vendor credit approval request'
                    break;

                default:
                    // @TODO : define the error scenario
                    throw "Error : Unknown Error Type";
                    log.audit({
                        title: 'Error : Unknown Error Type'
                    });
                    break;

            }

            var buildListHtmlLayout = _.template(templateFileObj.getContents());
            var templateData = {};
            templateData.templateData = mergeDataObj;
            var mergedListHtmlLayout = buildListHtmlLayout(templateData);

            subject += ' (#' + mergeDataObj.tranid + ' - ' + mergeDataObj.trandate + ' - ' + mergeDataObj.amount + ' ' + mergeDataObj.currency_text + ')';

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

        }


        function _getFilesId(transactionId, transactionType) {
            var attacchedFielsId = [];
            var currentVendorbillAttachedFilesSrc = search.create({
                type: transactionType,
                filters:
                    [["type", "anyof", transactionType], "AND", ["internalidnumber", "equalto", transactionId], "AND", ["mainline", "is", "T"]],
                columns: [search.createColumn({name: "internalid", join: "file"})]
            });
            var searchResultCount = currentVendorbillAttachedFilesSrc.runPaged().count;
            log.debug("vendorbillSearchObj result count", searchResultCount);
            var resultSet = currentVendorbillAttachedFilesSrc.run();
            log.debug("vendorbillSearchObj resultSet", JSON.stringify(resultSet));
            currentVendorbillAttachedFilesSrc.run().each(function (result) {
                attacchedFielsId.push(result.getValue({name: "internalid", join: "file"}));

                return true;
            });
            log.debug("vendorbillSearchObj attacchedFielsId", JSON.stringify(attacchedFielsId));
            return attacchedFielsId;
        }

        function _getCreatedBy(transactionId, transactionType) {
            log.debug("transactionId: ", transactionId);
            log.debug("transactionType: ", transactionType);

            var createdBy = [];
            var currentVendorbillAttachedFilesSrc = search.create({
                type: transactionType,
                filters:
                    [["recordtype", "is", transactionType], "AND", ["internalidnumber", "equalto", transactionId], "AND", ["mainline", "is", "T"]],
                columns: [search.createColumn({name: "createdby"})]
            });
            var searchResultCount = currentVendorbillAttachedFilesSrc.runPaged().count;
            log.debug("createdBySearchObj result count", searchResultCount);
            var resultSet = currentVendorbillAttachedFilesSrc.run();
            log.debug("createdBySearchObj resultSet", JSON.stringify(resultSet));
            currentVendorbillAttachedFilesSrc.run().each(function (result) {
                createdBy = result.getValue({name: "createdby"});
                return true;
            });
            log.debug("vendorbillSearchObj createdBy", createdBy);
            return createdBy;
        }

        function _formatNumber(params) {
            var number = params.number;         // numero da formattare
            var sepDecimale = params.sepDecimale || ',';           // separatore decimale
            var sepMigliaia = params.sepMigliaia || '.';           // separatore delle migliaia
            var decimali = params.decimali || 2;             // numero di cifre decimali

            // ----------------------------
            number = '' + parseFloat(number);
            // ----------------------------
            var saParti = number.split('.');
            // ----------------------------
            var parteDecimale = '';
            if (saParti.length > 1) {
                parteDecimale = saParti[1];
            }
            for (var i = 0; i < decimali; i++) {
                parteDecimale += '0';
            }
            parteDecimale = parteDecimale.substr(0, decimali);
            if (parteDecimale.length > 0) {
                parteDecimale = sepDecimale + parteDecimale;
            }
            // ----------------------------
            var parteIntera = saParti[0];
            if (sepMigliaia != '') {
                var regexp = /(\d+)(\d{3})/;
                while (regexp.test(parteIntera)) {
                    parteIntera = parteIntera.replace(regexp, '$1' + sepMigliaia + '$2');
                }
            }
            // ----------------------------WORKORDERCOMPLETION
            return parteIntera + parteDecimale;
        }

        return {
            onAction: onAction
        }
    });
