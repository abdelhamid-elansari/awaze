/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */

define(['N/ui/serverWidget', 'N/runtime', 'N/log'], function(serverWidget, runtime, log) {
//customrole1017

		function beforeLoad(context) {

				if(context.type=='edit'){
				//	var currentRole = runtime.getCurrentUser();
				//	log.debug("Custom script ID of current user role: " + currentRole.roleId);
				//	if (currentRole.roleId == 'employee_center') {
						log.debug({
							title:"Check ingresso nell'if ",
							details: "Entrato"
						});
						var yourForm = context.form;
						log.debug({
							title: 'Form ID',
							details: JSON.stringify(yourForm)
						});

						var button = yourForm.removeButton({

							id : 'changeid'
						});


					//button.isHidden=true;
				//	}
				}
		}
		return {
			beforeLoad: beforeLoad
		};
});