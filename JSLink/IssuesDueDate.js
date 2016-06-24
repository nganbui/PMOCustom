Type.registerNamespace('PMO.ProjectTask');

PMO.ProjectTask.IssuesFieldRendering = function () {
	//SP.SOD.registerSod
	RegisterSod('IssuesDueDate.js', '/Style%20Library/PMOCustom/js/IssuesDueDate.js');
    LoadSodByKey('IssuesDueDate.js', null);
    //LoadSodByKey("TasksDueDate.js", function () {
    //   console.log("Hello world!")
	//});
    var taskFieldsContext = {};
    taskFieldsContext.Templates = {};
    taskFieldsContext.Templates.Fields = {
        "OverDueDays": { 
			"View": PMO.ProjectTask.DaysOverDueViewTemplate,
			"DisplayForm": PMO.ProjectTask.DaysOverDueViewTemplate
			}		
    };
	
	SPClientTemplates.TemplateManager.RegisterTemplateOverrides(taskFieldsContext);
}


// This function provides the rendering logic for list view
PMO.ProjectTask.DaysOverDueViewTemplate = function(ctx) {

	 //get list Title	 
	
	 var overdue = ctx.CurrentItem[ctx.CurrentFieldSchema.Name]; 
     //return "<div style='background-color: #e5e5e5; width: 100px;  display:inline-block;'><div style='width: " + overdue.replace(/\s+/g, '') + "; background-color: #0094ff;'> &nbsp;</div></div>&nbsp;" + overdue; 	 
	 var _dueDateValue = ctx.CurrentItem.DueDate;  // the value of the due date field
	 var _status = ctx.CurrentItem.Status;
	 var today = new Date();  // the current date
	 today.setHours(0, 0, 0, 0);  // we just need the date part, so set the time to 00:00:00
	 if (_status==='Active')
	 {
	    if (_dueDateValue!="")
		{
			var _dueDate = new Date(_dueDateValue);  // convert the due date value to a variable of type Date
			if (_dueDate == 'undefined' || !_dueDate || _dueDate >= today) {
				return "";
			}
			else if (_dueDate < today) 
			{
				var diff = today - _dueDate;  // calculate the difference 
				var noOfDays = Math.round(diff / (24 * 60 * 60 * 1000));  // normalize the difference to days
				return noOfDays;  // return the string that should be displayed
				
			}
		}
		else 
			return "";
		
	 }
	 else
		 return "";
}

//CSR-override for MDS disabled site 
PMO.ProjectTask.IssuesFieldRendering();

if (typeof _spPageContextInfo != "undefined" && _spPageContextInfo != null) {    		
	// CSR-override for MDS enabled site
	RegisterModuleInit(_spPageContextInfo.siteServerRelativeUrl + "/Style%20Library/PMOCustom/js/IssuesDueDate.js", PMO.ProjectTask.IssuesFieldRendering); 
}