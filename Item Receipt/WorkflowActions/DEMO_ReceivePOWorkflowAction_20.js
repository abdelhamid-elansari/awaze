/**
 *@NApiVersion 2.0
 *@NScriptType WorkflowActionScript
 */
define(['N/search', 'N/record', 'N/log'], function (search, record, log) {

	return {
		onAction: onAction
	};

	function onAction(scriptContext){

		//Getting the id of the custom record head opened
		var myRecordHead = scriptContext.newRecord;
		var myRecordId=myRecordHead.id;
		log.debug({
			title: 'Test debug id Head',
			details: myRecordId
		});
		/*
		log.debug({
			title: 'Test sublist page',
			details: JSON.stringify(myRecordHead.getSublists())
		});

		var myListFields=myRecordHead.getSublistFields({ sublistId: 'customrecord_aw_purchaseorder_list' });
		log.debug({
			title: 'Test debug custom list fields',
			details: JSON.stringify(myListFields)
		});

		 */

		//fare una search dei custom record di tipo line tramite l'id del custom record head
		//prendere id delle righe e aggiornare quantità.
		var myPOLineSearch =  search.create({
				type: 'customrecord_aw_purchaseorder_list',
				filters: [
					search.createFilter({
						name: 'custrecord_aw_polist_pohead',
						operator:'is',
						values: myRecordId
				})],
				columns: [{
					name: 'custrecord_aw_polist_toreceive'
				}, {
					name: 'custrecord_aw_polist_receive'
				}, {
					name: 'custrecord_aw_polist_itemline'
				}, {
					name: 'internalId'
				}, {
					name: 'custrecord_aw_polist_quantityreceived'
				}]
		});

		var location=search.lookupFields({
			type: 'customrecord_aw_purchorder_head',
			id: myRecordId,
			columns: ['custrecord_aw_pohead_location']
		});

		log.debug({
			title: 'valore di location',
			details: JSON.stringify(location)
		});

		log.debug({
			title: 'Location in the item recepit',
			details: location.custrecord_aw_pohead_location[0].value
		});

		//transforming the record into 'itemreceipt'
		var myPORecordId= myRecordHead.getValue('custrecord_aw_pohead_po');
		var myItemReceipt = record.transform({
			fromType: 'purchaseorder',
			fromId: myPORecordId,
			toType: 'itemreceipt',
			isDynamic: false
		});

		var receiptLines= myItemReceipt.getLineCount('item');
		log.debug({
			title: 'Numero di items della receipt',
			details: receiptLines
		});

		for(var i=0; i< myItemReceipt.getLineCount('item'); i++){

			log.debug({
				title: 'Ciclo FOR su item receipt',
				details: 'Entrato'
			});

/*
			myItemReceipt.setSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: i,
				value: 0
			});

 */
			myItemReceipt.setSublistValue({
				sublistId: 'item',
				fieldId: 'itemreceive',
				line: i,
				value: false
			});
			log.debug({
				title: 'Location in the item recepit',
				details: JSON.stringify(myItemReceipt)
			});

			myItemReceipt.setSublistValue({
				sublistId: 'item',
				fieldId: 'location',
				line: i,
				value: location.custrecord_aw_pohead_location[0].value
			});




		}

		//Count of the custom record lines for the PO head
		var numOfLines=myPOLineSearch.runPaged().count;
		log.debug({
			title: 'Test debug PO lines',
			details: numOfLines
		});

		var mySearchResults=myPOLineSearch.run().getRange({
			start: 0,
			end: numOfLines
		});
		log.debug({
			title: 'Range result',
			details: JSON.stringify(mySearchResults)
		});

		myPOLineSearch.run().each(function(result) {
			log.debug({
				title: 'Each su Lines custom record',
				details: 'Entrato'
			});

			if(result.getValue('custrecord_aw_polist_receive')==1){
				var quantityToReceive=result.getValue('custrecord_aw_polist_toreceive');
				var lineId=result.getValue('custrecord_aw_polist_itemline');
				var internID=result.getValue('internalId');
				var received=result.getValue('custrecord_aw_polist_quantityreceived');

				log.debug({
					title: 'If su quantity to receive - Quantità',
					details: quantityToReceive
				});

				log.debug({
					title: 'If su quantity to receive - Numero linea',
					details: lineId
				});

				log.debug({
					title: 'If su quantity to receive - Internal ID custom line',
					details: internID
				});

				for(var i=0; i<myItemReceipt.getLineCount('item'); i++){
					log.debug({
						title: 'For su line item receipt',
						details: 'Entrato'
					});

					if (lineId==myItemReceipt.getSublistValue({
						sublistId: 'item',
						fieldId: 'line',
						line: i
						})){

						myItemReceipt.setSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: i,
							value: quantityToReceive
						});

						myItemReceipt.setSublistValue({
							sublistId: 'item',
							fieldId: 'itemreceive',
							line: i,
							value: true
						});

						//2019-11-28 Update of the quantity received in the custom record Lines
						var myLineToUpdate = record.load({
							type: 'customrecord_aw_purchaseorder_list',
							id: internID,
							isDynamic: true
						});
						log.debug({
							title: 'Custom line extracted',
							details: JSON.stringify(myLineToUpdate)
						});

						myLineToUpdate.setValue({
							fieldId: 'custrecord_aw_polist_quantityreceived',
							value: +received+(+quantityToReceive)
						});

						myLineToUpdate.save();
					}
				}
			}

			return true;
		});
	//	try {
			var transformId = myItemReceipt.save();
			log.debug('record transformed successfully', 'Id: ' + transformId);

		/*} catch (f) {
			log.debug('sigh');
			log.error(f.name);
		}

		 */
	}
});