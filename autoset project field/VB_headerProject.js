/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       1 Aug 2019     dbrys
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord vendorbill
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */

function fillinprojectheader(type, name, linenum){
  if(type == 'expense' && name == 'custcol_aw_projects'){
    var project = nlapiGetCurrentLineItemValue('expense', 'customer', 1);
    var custbodyprojectheader = nlapiSetFieldValue('custbody_aw_projectheader', project, null);
    
    
  }
  if(type == 'item' && name == 'custcol_aw_projects'){
    var project = nlapiGetCurrentLineItemValue('item', 'custcol_aw_projects', 1);
    var custbodyprojectheader = nlapiSetFieldValue('custbody_aw_projectheader', project, null);
    
    
  }
}