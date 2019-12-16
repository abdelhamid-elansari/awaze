function userEventBeforeLoad(type, form, request) {
	
	if (type == 'edit' || type == 'view') {
	
	
	var resultsSearch = nlapiSearchRecord('customrecord_aw_purchaseorder_list',null,[['custrecord_aw_polist_pohead','is',nlapiGetRecordId()]],
	[new nlobjSearchColumn('custrecord_aw_polist_item'),
	new nlobjSearchColumn('custrecord_aw_polist_toreceive'),
	new nlobjSearchColumn('custrecord_aw_polist_description'),
	new nlobjSearchColumn('custrecord_aw_polist_rate'),
	new nlobjSearchColumn('custrecord_aw_polist_amount'),
	new nlobjSearchColumn('custrecord_aw_polist_taxcode'),
	new nlobjSearchColumn('custrecord_aw_polist_taxrate'),
	new nlobjSearchColumn('custrecord_aw_polist_taxamount'),
	new nlobjSearchColumn('custrecord_aw_polist_grossamount'),
	new nlobjSearchColumn('custrecord_aw_polist_quantityreceived'),
	new nlobjSearchColumn('custrecord_aw_polist_quantitybilled'),
	new nlobjSearchColumn('internalid'),
	new nlobjSearchColumn('custrecord_aw_polist_quantity'),
	new nlobjSearchColumn('custrecord_aw_polist_receive')]);
	
	
	

	var sublist = form.addSubList('custpage_awz_items', 'list', 'Items','custom72');
	
	sublist.addField('custpage_awz_id', 'integer','Id').setDisplayType('hidden');
	sublist.addField('custpage_awz_select', 'checkbox', 'Select');
	sublist.addField('custpage_awz_received', 'float','Quantity Received');
	sublist.addField('custpage_awz_billed', 'float','Quantity Billed');
	sublist.addField('custpage_awz_item', 'select', 'Item','item').setDisplayType('inline');
	sublist.addField('custpage_awz_description', 'select', 'textarea','Description').setDisplayType('inline');
	sublist.addField('custpage_awz_quantity', 'float','Quantity To Receive');
	sublist.addField('custpage_awz_toreceive', 'float','Quantity').setDisplayType('entry');
	sublist.addField('custpage_awz_rate', 'currency','Rate');
	sublist.addField('custpage_awz_amount', 'currency','Amount');
	sublist.addField('custpage_awz_taxcode', 'text','Tax Code');
	sublist.addField('custpage_awz_taxrate', 'percent','Tax Rate');
	sublist.addField('custpage_awz_taxamount', 'currency','Tax Amount');
	sublist.addField('custpage_awz_grossamount', 'currency','Gross Amount');
	
	if (resultsSearch&&resultsSearch.length>0){
	for (var i = 0; i < resultsSearch.length; i++) {
		
		sublist.setLineItemValue('custpage_awz_select', i+1, resultsSearch[i].getValue('custrecord_aw_polist_receive'));
		sublist.setLineItemValue('custpage_awz_item',i+1,resultsSearch[i].getValue('custrecord_aw_polist_item'));
		sublist.setLineItemValue('custpage_awz_quantity',i+1,resultsSearch[i].getValue('custrecord_aw_polist_toreceive'));
		sublist.setLineItemValue('custpage_awz_id',i+1,resultsSearch[i].getValue('internalid'));
		sublist.setLineItemValue('custpage_awz_received',i+1,resultsSearch[i].getValue('custrecord_aw_polist_quantityreceived'));
		sublist.setLineItemValue('custpage_awz_billed',i+1,resultsSearch[i].getValue('custrecord_aw_polist_quantitybilled'));
		sublist.setLineItemValue('custpage_awz_description',i+1,resultsSearch[i].getValue('custrecord_aw_polist_description'));
		sublist.setLineItemValue('custpage_awz_toreceive',i+1,resultsSearch[i].getValue('custrecord_aw_polist_toreceive'));
		sublist.setLineItemValue('custpage_awz_rate',i+1,resultsSearch[i].getValue('custrecord_aw_polist_rate'));
		sublist.setLineItemValue('custpage_awz_amount',i+1,resultsSearch[i].getValue('custrecord_aw_polist_amount'));
		sublist.setLineItemValue('custpage_awz_taxcode',i+1,resultsSearch[i].getText('custrecord_aw_polist_taxcode'));
		sublist.setLineItemValue('custpage_awz_taxrate',i+1,resultsSearch[i].getValue('custrecord_aw_polist_taxrate'));
		sublist.setLineItemValue('custpage_awz_taxamount',i+1,resultsSearch[i].getValue('custrecord_aw_polist_taxamount'));
		sublist.setLineItemValue('custpage_awz_grossamount',i+1,resultsSearch[i].getValue('custrecord_aw_polist_grossamount'));
	}
	}
	}
}

function userEventBeforeSubmit(type, form, request) {
	
	if ('edit' == type) {
		
		
		for (var i = 1; i<=nlapiGetLineItemCount('custpage_awz_items'); i++){
			
				
			var IDrec = nlapiGetLineItemValue('custpage_awz_items','custpage_awz_id',i);
			var toreceive = nlapiGetLineItemValue('custpage_awz_items','custpage_awz_toreceive',i);
			var yesno = nlapiGetLineItemValue('custpage_awz_items','custpage_awz_select',i);
			var received = nlapiGetLineItemValue('custpage_awz_items','custpage_awz_toreceive',i);
					
			nlapiSubmitField('customrecord_aw_purchaseorder_list',IDrec,['custrecord_aw_polist_toreceive','custrecord_aw_polist_receive'],[toreceive,yesno]);
		}
		
	}
	

}