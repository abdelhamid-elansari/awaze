/**
 *@NApiVersion 2.0
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/log', 'N/format', 'N/url'], function (search, record, log, format, url) {

	return {
		execute: execute
	};

	function execute(context){

		function SavedSearch() {

				//loading of result of the saved search which already filters bills in status "open"
				//JE is created only for lines with a G-ACCOUNT amount specified
				var MySavedSearch = search.load({
					id: 'customsearch_aw_lan_vendorbills'
				});

				var numOfRows=MySavedSearch.runPaged().count;
				log.debug({
					title: 'Number of lines in the saved search',
					details: numOfRows
				});

				MySavedSearch.run().each(function(result) {

						//reading of eachline in item and expenses
						//Journal entry creation for the line
						var journal = record.create({
							type : record.Type.JOURNAL_ENTRY,
							isDynamic : true
						});

						log.debug({
							title: 'JE object',
							details: JSON.stringify(journal)
						});

						//setting the custom form for the Journal Entry
                       /*
                        var recordObject=context.newRecord;
                        log.debug({
                            title: 'print record',
                            details: recordObject
                        });
						var myCustomForm=recordObject.getValue('customform');
                            context.getParameter('');
						journal.setValue('customform', myCustomForm);

                        */

                       //Setting the form to use for the JE. For now, I assign the form id manually
                        journal.setValue('customform', 106);

						//set the values in the required fields in JE main section
						journal.setValue('subsidiary',result.getValue('subsidiary'));
						journal.setValue('currency',result.getValue('currency'));
						journal.setValue('exchangerate',result.getValue('exchangerate'));
						var billTrandate=result.getValue('trandate');
						var billTrandateDate = format.parse({
							value: billTrandate,
							type: format.Type.DATE
						});
						journal.setValue('trandate', billTrandateDate);

						journal.setValue('postingperiod', result.getValue('postingperiod'));
						journal.setValue('memo',"G-ACCOUNT "+ result.getValue('transactionnumber'));

						// Debit line
						journal.selectNewLine('line');
						//Set the value for the field in the currently selected line.
						journal.setCurrentSublistValue('line','account',result.getValue('account'));
						journal.setCurrentSublistValue('line','debit', result.getValue('custbody_aw_amountgaccount'));
						journal.setCurrentSublistValue('line','entity',result.getValue('entity'));
						journal.setCurrentSublistValue('line','department',result.getValue('department'));
						journal.setCurrentSublistValue('line','location',result.getValue('location'));
						//Commits the currently selected line on a sublist.
						journal.commitLine('line');

						// Credit Line
						journal.selectNewLine('line');
						//Set the value for the field in the currently selected line.
						//Searching G-Vendor payable account
						var myGVendor=result.getValue('entity');
						var gAccountField = search.lookupFields({
							type: 'vendor',
							id: myGVendor,
							columns: ['custentity_lan_vendorgaccount']
						});
						//Lookup results
						log.debug({
							title: 'G-Vendor payable account',
							details: gAccountField.custentity_lan_vendorgaccount[0].value
						});

						//Searching G-Account Vendor account payable
						var gAccountPayable = search.lookupFields({
							type: 'vendor',
							id: gAccountField.custentity_lan_vendorgaccount[0].value,
							columns: ['payablesaccount']
						});

						//Lookup results
						log.debug({
							title: 'G-Account payable account',
							details: gAccountPayable.payablesaccount[0].value
						});

 						journal.setCurrentSublistValue('line','entity', gAccountField.custentity_lan_vendorgaccount[0].value);
						journal.setCurrentSublistValue('line','account', gAccountPayable.payablesaccount[0].value);
						journal.setCurrentSublistValue('line','credit', result.getValue('custbody_aw_amountgaccount'));
						journal.setCurrentSublistValue('line','department',result.getValue('department'));
						journal.setCurrentSublistValue('line','location',result.getValue('location'));
						//Commits the currently selected line on a sublist.
						journal.commitLine('line');
						//save the record.
						var creationId=journal.save();
						log.debug('JE successfully created', 'Id: ' + creationId);

						var outputURL = url.resolveRecord({
							recordType: 'journalentry',
							recordId: creationId,
							isEditMode: true
						});
						log.debug({
							title: 'URL of journal entry',
							details: outputURL
						});

						log.debug({
							title: 'Internal ID of the Bill',
							details: result.getValue('internalid')
						});

						//assign the url to the bill
						var MyBillRecord = record.load({
							type: record.Type.VENDOR_BILL,
							id: result.getValue('internalid'),
							isDynamic: true,
						});

						MyBillRecord.setValue({
							fieldId: 'custbody_aw_gaccountlink',
							value: outputURL
						});


						var recordId = MyBillRecord.save({
							enableSourcing: true,
							ignoreMandatoryFields: true
						});
/*
						var refNumBill=result.getValue('refnumber');

 */

						var refNumBill = search.lookupFields({
							type: search.Type.VENDOR_BILL,
							id: result.getValue('internalid'),
							columns: ['tranid']
						});

						log.debug({
							title: 'Bill transaction number',
							details: refNumBill["tranid"]
						});


					/*******Step 5: Bill Payment Creation******/
						//Bill Payment creation for the JE

						var billPayment = record.create({
							type : record.Type.VENDOR_PAYMENT,
							defaultValues: {
							entity: 9897
							},
							isDynamic : true
						});

						log.debug({
							title: 'Range result of Account search',
							details: JSON.stringify(billPayment)
						});


					/*
                                            var billPayment = record.transform({
                                                fromType: record.Type.VENDOR_BILL,
                                                fromId: 47537,
                                                toType: record.Type.VENDOR_PAYMENT,
                                                defaultValues: {
                                                    entity: 9897
                                                },
                                                isDinamic: true
                                            });

                     */

						//Setting the form to use for the Bill Payment. For now, I assign the form id manually
						billPayment.setValue('customform', 103);
						billPayment.setValue('department', result.getValue('department'));
						billPayment.setValue('location', result.getValue('location'));
						billPayment.setValue('apacct', result.getValue('account'));
					/*


						billPayment.setValue('entity', result.getValue('entity'));

						billPayment.setValue('currency', result.getValue('currency'));
						billPayment.setValue('exchangerate', result.getValue('exchangerate'));
						billPayment.setValue('trandate', billTrandateDate);
						billPayment.setValue('postingperiod', result.getValue('postingperiod'));

						billPayment.setValue('subsidiary', result.getValue('subsidiary'));


					 */

						//Search for a payable account

						var billAccountSearch =  search.create({
							type: search.Type.ACCOUNT,
							columns: [{
								name: 'name'
							}],
							filters: [
								['subsidiary', 'is', result.getValue('subsidiary')],
								'and',	['type', 'is', 'Bank']
							]
						});

						var numOfAccountRows=billAccountSearch.runPaged().count;
						log.debug({
							title: 'Number of lines in the Account saved search',
							details: numOfAccountRows
						});

						var myAccountSearchResults=billAccountSearch.run().getRange({
							start: 0,
							end: numOfAccountRows
						});
						log.debug({
							title: 'Range result of Account search',
							details: JSON.stringify(myAccountSearchResults)
						});

						//Assign as account the first line extracted by the search
						billAccountSearch.run().each(function(result1) {
							log.debug({
								title: 'Account selected',
								details: result1.getValue('name')
							});
							//billPayment.setText('account', result1.getText('name'));
							return false;
						});


					//Set the value for the field in the currently selected line.
					//count the number of lines in the "apply" sublist
					var  applySublistLines= billPayment.getLineCount({
						sublistId: 'apply'
					});
					log.debug({
						title: 'Number of lines of Apply sublist',
						details: applySublistLines
					});

					var myJERecord = record.load({
						type: record.Type.JOURNAL_ENTRY,
						id: creationId,
						isDynamic: true,
					});

					log.debug({
						title: 'JE transaction number',
						details: myJERecord.getValue('tranid')
					});

					for(var i=0; i<applySublistLines; i++) {

						billPayment.selectLine({
							sublistId: 'apply',
							line: i,
						});
						var lineRefnum = billPayment.getCurrentSublistValue({
							sublistId: 'apply',
							fieldId: 'refnum'
						});

						log.debug({
							title: 'Bill Payment transaction number',
							details: lineRefnum
						});

						//Identify the Bill
						if (lineRefnum == refNumBill["tranid"]) {

							log.debug({
								title: 'If for Bill',
								details: 'Entrato'
							});

							billPayment.setCurrentSublistValue({
								sublistId: 'apply',
								fieldId: 'apply',
								value: true
							});
							billPayment.setCurrentSublistValue({
								sublistId: 'apply',
								fieldId: 'amount',
								value: result.getValue('custbody_aw_amountgaccount')
							});
							billPayment.commitLine({
								sublistId: 'apply'
							});
						}

					}

					for(var i=0; i<applySublistLines; i++) {

						billPayment.selectLine({
							sublistId: 'apply',
							line: i,
						});
						var lineRefnum = billPayment.getCurrentSublistValue({
							sublistId: 'apply',
							fieldId: 'refnum'
						});
						var lineAmount = billPayment.getCurrentSublistValue({
							sublistId: 'apply',
							fieldId: 'amount'
						});

						//Identify the Journal
						if (lineRefnum == myJERecord.getValue('tranid')) {

							billPayment.setCurrentSublistValue({
								sublistId: 'apply',
								fieldId: 'apply',
								value: true
							});
							billPayment.setCurrentSublistValue({
								sublistId: 'apply',
								fieldId: 'total',
								value: lineAmount
							});
							billPayment.commitLine({
								sublistId: 'apply'
							});
						}
					}



/*

							var tranIdJE=myJERecord.getValue('tranid');
							billPayment.setCurrentSublistValue('line','refnum',tranIdJE);
							billPayment.setCurrentSublistValue('line','type','Journal');
							billPayment.setCurrentSublistValue('line','amount',result.getValue('custbody_aw_amountgaccount'));
							billPayment.setCurrentSublistValue('line','due',result.getValue('custbody_aw_amountgaccount'));
							billPayment.setCurrentSublistValue('line','total',result.getValue('custbody_aw_amountgaccount'));

 */

						var billRecordId = billPayment.save({
							enableSourcing: true,
							ignoreMandatoryFields: true
						});

					return true;
				});
		}
		SavedSearch();
	}
});