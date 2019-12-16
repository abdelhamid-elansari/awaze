/**
 *@NApiVersion 2.0
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record', 'N/log','N/format'],	function(search, record, log, format) {

	function execute(context) {
		//Carico i record della ricerca salvata che fornisce i soli purchase order da inserire nelle custom records
		function SavedSearch() {
			var MySavedSearch = search.load({
				id: 'customsearch_aw_purchaseorder'
			});

			var numOfRows=MySavedSearch.runPaged().count;
			log.debug({
				title: 'Numero righe ricerca salvata',
				details: numOfRows
			});

			//variabile globale per storicizzare l'id del record di testata creato nel custom record
			var poHeadRecordId=null;
			var po_prec=0;

			MySavedSearch.run().each(function(result) {


				//controllo che il PO non sia già nel custom record head
				var POId = result.id;

				log.debug({
					title: 'Id PO da cercare nel custom',
					details: POId
				});

				//Estraggo dal custom record Head la lista degli id dei PO già inseriti
				var myPOHeadSearch =  search.create({
					type: 'customrecord_aw_purchorder_head',
					filters: [
						search.createFilter({
							name: 'custrecord_aw_pohead_po',
							operator:'is',
							values: POId
						})],
					columns: [{
						name: 'custrecord_aw_pohead_po'
					},{
						name: 'internalId'
					}]
				});

				//Count of the custom record lines for the PO head
				var numOfPOHead=myPOHeadSearch.runPaged().count;
				log.debug({
					title: 'Test debug presenza PO in Head',
					details: numOfPOHead
				});

				if (numOfPOHead < 1){
					po_prec=POId;
				}

				log.debug({
					title: 'Valore PO Head precedente',
					details: po_prec
				});

				//se numOfPO < 1 vuol dire che nel custom record Head non c'è il PO
				if (numOfPOHead < 1 || POId==po_prec){
					log.debug({
						title: 'ingresso if',
						details: 'prova ingresso if'
					});
					//Campi di testata da inserire nel custom record di testata
					if (result.getValue('mainline') == '*'){

						//var POStatus = result.getText('statusref');
						var POStatusId = result.getValue('statusref');

						log.debug({
							title: 'id del PO è:',
							details: POId
						});
						var POVendor = result.getValue('entity');
						var POTrandate = result.getValue('trandate');
						var POTrandateDate = format.parse({
							value: POTrandate,
							type: format.Type.DATE
						});
						var POCurrency = result.getValue('currency');
						var POExchangeRate=result.getValue('exchangerate');
						var POTotalAmount=result.getValue('total');
						var POTax=Math.abs(result.getValue('taxtotal'));
						var PONetTotal=POTotalAmount-POTax;
						var POTotal=result.getValue('fxamount');
						var POSubsidiary=result.getValue('subsidiary');
						var POLocation=result.getValue('location');
						
						log.debug({
							title: 'PO Head fields',
							details: [POStatusId, POId, POTrandateDate, POVendor, POCurrency, POExchangeRate, POTotalAmount,
								POTotal,  PONetTotal, POTax, POSubsidiary, POLocation]
						});
						//Creo un nuovo custom record di testata e assegno i valori ai campi
						var MyCustomRecordHead = record.create({
							type: 'customrecord_aw_purchorder_head',
							isDynamic: true
						});

						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_status',
							text: POStatusId
						});

						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_po',
							value: POId
						});

						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_date',
							value: POTrandateDate
						});

						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_currency',
							value: POCurrency
						});
						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_total',
							value: POTotalAmount
						});
						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_subtotal',
							value: PONetTotal
						});
						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_taxsummary',
							value: POTax
						});
						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_vendor',
							value: POVendor
						});

						//20191206 adding fields subsidiary and location
						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_subsidiary',
							value: POSubsidiary
						});

						MyCustomRecordHead.setValue({
							fieldId: 'custrecord_aw_pohead_location',
							value: POLocation
						});


						log.debug({
							title: 'Custom Record Head:',
							details: JSON.stringify(MyCustomRecordHead)
						});

						poHeadRecordId = MyCustomRecordHead.save({
							enableSourcing: true,
							ignoreMandatoryFields: true
						});
						log.debug({
							title: 'Custom Record Head ID:',
							details: poHeadRecordId
						});

					}else{
							log.debug({
							title: 'entro nellif',
							details: 'entro in else'
							});

						//try {
							//Campi di riga da inserire nel custom record delle righe
							var MyCustomRecordLine = record.create({
								type: 'customrecord_aw_purchaseorder_list',
								isDynamic: true
							});

							//var itemItem= result.getText('item');
							var itemItem='';
							itemItem= result.getText('item');

							var itemDescription = result.getValue({
								name: 'salesdescription',
								join: 'item'
							});
							var itemQuantity= result.getValue('quantity');
							var itemAmount= result.getValue('amount');
							var itemTaxRate= +result.getValue({
								name: 'rate',
								join: 'taxItem'
							});

							var itemQuantityReceived= result.getValue('quantityshiprecv');
							var itemQuantityBilled= result.getValue('quantitybilled');
							var itemLine= result.getValue('line');
							var itemTaxAmount=Math.abs(result.getValue('taxamount'));
							var itemRate= result.getValue('rate');
							var itemTaxCode= result.getValue('taxcode');
							var itemGrossAmount= ((+itemAmount)+(+itemTaxAmount));


							log.debug({
								title: 'PO Line fields',
								details: [ poHeadRecordId, itemItem, itemDescription, itemQuantity, itemAmount, itemTaxRate,
									itemGrossAmount, itemQuantityReceived, itemQuantityBilled, itemLine, itemTaxAmount, itemRate,
									itemTaxCode]
							});

							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_pohead',
								value: poHeadRecordId
							});

							MyCustomRecordLine.setText({
								fieldId: 'custrecord_aw_polist_item',
								text: itemItem
							});

							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_description',
								value: itemDescription
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_quantity',
								value: itemQuantity
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_toreceive',
								value: itemQuantity-itemQuantityReceived
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_amount',
								value: itemAmount
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_taxrate',
								value: itemTaxRate
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_grossamount',
								value: itemGrossAmount
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_quantityreceived',
								value: itemQuantityReceived
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_quantitybilled',
								value: itemQuantityBilled
							});
							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_itemline',
								value: itemLine
							});

							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_taxamount',
								value: itemTaxAmount
							});

							MyCustomRecordLine.setValue({
							fieldId: 'custrecord_aw_polist_rate',
							value: itemRate
							});

							MyCustomRecordLine.setValue({
								fieldId: 'custrecord_aw_polist_taxcode',
								value: itemTaxCode
							});

							log.debug({
								title: 'Custom Record Line:',
								details: JSON.stringify(MyCustomRecordLine)
							});

							var poListRecordId = MyCustomRecordLine.save({
								enableSourcing: true,
								ignoreMandatoryFields: true
							});
							log.debug('record line loaded successfully', 'Id: ' + poListRecordId);
						//} catch (f) {
							//log.error(f.name);
							//mandiamo una mail
						//}
					}
				}
				return true;
			});
		}
		SavedSearch();
	}
	return {
		execute: execute
	};
});
