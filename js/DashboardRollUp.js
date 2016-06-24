//Defines the structure of the project information
var Project = function (id, Name, SiteId, Url, ActiveTasks, TotalTasks, TaskListUrl, ActiveIssues, TotalIssues, IssuesListUrl, ActiveRisks, TotalRisks, RisksListUrl, parentId) {
	this.id = id;
	this.Name = Name;
	this.Url = ko.observable(Url);
	this.SiteId = SiteId;
	this.ActiveTasks = ko.observable(ActiveTasks);
	this.TotalTasks = ko.observable(TotalTasks);
	this.TaskListUrl = ko.observable(TaskListUrl);
	this.ActiveIssues = ko.observable(ActiveIssues);
	this.TotalIssues = ko.observable(TotalIssues);
	this.RisksListUrl = ko.observable(RisksListUrl);
	this.ActiveRisks = ko.observable(ActiveRisks);
	this.TotalRisks = ko.observable(TotalRisks);
	this.IssuesListUrl = ko.observable(IssuesListUrl);
	this.IsProgram = ko.observable(false);
	this.Children = ko.observable(0);
	if (parentId !== null) {
		this.treeStructure = "treegrid-" + this.id + " treegrid-parent-" + parentId;
	} else {
		this.treeStructure = "treegrid-" + this.id;
	}
	
	this.TaskPercentage = ko.computed(function () {
			if (this.TotalTasks() === 0) {
				return 0;
			} else {
				var per = (this.ActiveTasks() / this.TotalTasks()) * 100;
				if (per < 10) {
					return 10;
				} else {
				return Math.round(per * 100) / 100;
				}
			}

		}, this);
	this.IssuesPercentage = ko.computed(function () {
			if (this.TotalIssues() === 0) {
				return 0;
			} else {
				var per = ((this.ActiveIssues() / this.TotalIssues()) * 100);
				if (per < 10) {
					return 10;
				} else {
					return per;
				}
				return Math.round(per * 100) / 100;
			}

		}, this);
	this.RisksPercentage = ko.computed(function () {
			if (this.TotalRisks() === 0) {
				return 0;
			} else {
				var per = ((this.ActiveRisks() / this.TotalRisks()) * 100);
				if (per < 10) {
					return 10;
				} else {
					return per;
				}
				return Math.round(per * 100) / 100;
			}

		}, this);
}

//Defines the structure for Status Reports
var Status = function (id, Name, SiteId, Url, StatusReports, parentId) {
	this.id = id;
	this.Name = Name;
	this.Url = Url;
	this.SiteId = SiteId;
	

	if (parentId !== null) {
		this.treeStructure = "treegrid-" + this.id + " treegrid-parent-" + parentId;
	} else {
		this.treeStructure = "treegrid-" + this.id;
	}
	
	if (StatusReports.length > 0) {
		this.Title = StatusReports[0].Title;
		this.Week = StatusReports[0].Week;
		this.Schedule = StatusReports[0].Schedule;
		this.Budget = StatusReports[0].Budget;
		this.PercentComplete = StatusReports[0].PercentComplete;
		this.Id = StatusReports[0].Id;
		this.ReportUrl = StatusReports[0].Url;		
	} else {
		this.Title = "";
		this.Week = "";
		this.Schedule = "";
		this.Budget = "";
		this.PercentComplete = "";
		this.Id = "";
		this.ReportUrl = "";				
		this.treeStructure = "hideRow";
	}
}

//Defines the Strcuture of Knookout Model
// The view model is an abstract description of the state of the UI, but without any knowledge of the UI technology (HTML)
var viewModel = {
	program : [],
	status : []
};
$(document).ready(function () {
	// Get the contextual URL of the current ShatrePoint web
	var currentSiteAbsoluteURL = _spPageContextInfo.webAbsoluteUrl;
	//Get reference to Spinner
	var projectSummaryLoader = $("#projectSummaryLoader");
	//Get reference to Status Report spinner
	var statusReportLoader = $("#statusReportLoader");

	//Check if relevant HTML is found on the page and set the vaariable to dictate if REST calles are needed
	var isProjectSummaryUpdate = false;
	var isStatusUpdate = false;
	if (projectSummaryLoader.length > 0) {
		isProjectSummaryUpdate = true;
		$('#projectSummaryContent').hide();
	}
	if (statusReportLoader.length > 0) {
		isStatusUpdate = true;
		$('.statusTree').hide();
	}
	//If HTML is present for either one, load the data
	if (isStatusUpdate || isProjectSummaryUpdate) {
		getProjectsData(currentSiteAbsoluteURL, isProjectSummaryUpdate, isStatusUpdate);
	}

	ko.bindingHandlers.dateString = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);
        var pattern = allBindings.datePattern || 'MM/dd/yyyy';
        $(element).text(valueUnwrapped.toString(pattern));
    }
}
	//Binds the data to the Knookout 
	ko.applyBindings(viewModel);
	//Check if atleast one Program found
	if (viewModel.program.length > 0) {	
		//Hide the spinner and show the other DIV
		projectSummaryLoader.hide();
		$('#projectSummaryContent').show();
		// Call J QUERY TREEGRID to render it in tree format and overwrite the expand and collapse icons
		$('.programTree').treegrid({
			expanderExpandedClass : 'fa fa-minus-circle',
			expanderCollapsedClass : 'fa fa-plus-circle',
			initialState : 'collapsed' 
		});
	} else {
		projectSummaryLoader.text('Project information not found.');
	}
	//Check if atleast one Status Report found
	
	if (viewModel.status.length > 0) {
		statusReportLoader.hide();
		$('.statusTree').show();
		$('.statusTree').treegrid({
			expanderExpandedClass : 'fa fa-minus-circle',
			expanderCollapsedClass : 'fa fa-plus-circle',
			initialState : 'collapsed' 
		});
	} else {
		statusReportLoader.text('Status information not found.');
	}
	$(".treegrid-expanded").css("font-weight", "Bold");
	$(".treegrid-collapsed").css("font-weight", "Bold");
	
	
	
});
//check current logined user has "ElavatedView" permission to make REST API request
function isHasbrowseDirectories(siteURL) {
    var flag = false;
    var requestUrl = siteURL + "/_api/Web/effectiveBasePermissions";

    // execute AJAX request
    $.ajax({
        url: requestUrl,
        type: "GET",
        headers: { "ACCEPT": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            var permissions = new SP.BasePermissions();
            permissions.fromJson(data.d.EffectiveBasePermissions);
            flag = permissions.has(SP.PermissionKind.browseDirectories);    			
        },
        error: function () {
            console.log("permission failed: " + requestUrl);			
        }
    });
    return flag;
}

// Reccursive method to populate model
function successGetHierarchyFunction(data, isProjectSummaryUpdate, isStatusUpdate) {
	//Loop thru all webs
	for (var i = 0; i < data.d.results.length; i++) {
		//Check if valid entry
		if (data.d.results[i] != undefined && data.d.results[i].Title != undefined) {
			//check current user has 'browseDirectories' permission			
			hasPermission = isHasbrowseDirectories(data.d.results[i].Url);				
			if (hasPermission){
				//Check if need to query for Project Information
				if (isProjectSummaryUpdate) {
					//Make a call to get items from LIST
					var tasksSummaryResults = getListData(data.d.results[i].Url, "Tasks", "?$select=Id,Status");
					//cREATE variables to be bound to model
					var ActiveTasks = $.map(tasksSummaryResults, function (item, i) {						
							if ((item.Status.toLowerCase() !== "completed"))
								return i;
						}).length;
					var TotalTasks = tasksSummaryResults.length;
					//Make a call to get items from LIST
					var issuesSummaryResults = getListData(data.d.results[i].Url, "Issues", "?$select=Id,Status");
					//cREATE variables to be bound to model
					var ActiveIssues = $.map(issuesSummaryResults, function (item, i) {						
							if ((item.Status.toLowerCase() === "active"))
								return i;
						}).length;
					var TotalIssues = issuesSummaryResults.length;
					//Make a call to get items from LIST
					var risksSummaryResults = getListData(data.d.results[i].Url, "Risks", "?$select=Id,Priority");
					var ActiveRisks = $.map(risksSummaryResults, function (item, i) {						
							if ((item.Priority.toLowerCase() === "high"))
								return i;
						}).length;
					var TotalRisks = risksSummaryResults.length;
					// Call a method to figure of the parent of the current web
					var parentId = getParentforProjectSummary(data.d.results[i].Url, ActiveTasks, TotalTasks, ActiveIssues, TotalIssues, ActiveRisks, TotalRisks);
					//Create the object from the variables
					var project = new Project(viewModel.program.length + 1,
							data.d.results[i].Title,
							data.d.results[i].Id,
							data.d.results[i].Url,
							ActiveTasks,
							TotalTasks,
							data.d.results[i].Url + "/Lists/Tasks",
							ActiveIssues,
							TotalIssues,
							data.d.results[i].Url + "/Lists/Issues",
							ActiveRisks,
							TotalRisks,
							data.d.results[i].Url + "/Lists/Risks",
							parentId);

					viewModel.program.push(project);

				}
				//Check if Status report needs to be fetched
				if (isStatusUpdate) {
					//get Status report from List for the current web
					//var statusSummaryResults = getStatusData(data.d.results[i].Url, "Status Report", "?$select=Id,Title,Health0,Budget,Week_x0020_Ending,PercentComplete&$top=1&$orderby=Week_x0020_Ending%20desc");
					var statusSummaryResults = getStatusData(data.d.results[i].Url, "Status Report", "?$select=Id,Title,Health,Budget,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Modified desc");
					//var numberofReport = getStatusData(data.d.results[i].Url, "Status Report", "?$select=Id,Title,Health0,Budget,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Modified desc");
					var parentId = null;
					//Check the parent ID and put it in a variable
					if (viewModel.status.length > 0) {
						var parentSiteId = getParent(data.d.results[i].Url);
						var idx = $.map(viewModel.status, function (item, i) {
								if (item.SiteId === parentSiteId)
									return i;
							})[0];
						if (idx != undefined) {
							parentId = viewModel.status[idx].id;
						}
					}
					//Create an object if result is found
					if (data.d.results[i] != undefined) {
						if (statusSummaryResults.length > 0) {
						var status = new Status(viewModel.status.length + 1,
								data.d.results[i].Title,
								data.d.results[i].Id,
								data.d.results[i].Url,
								statusSummaryResults,
								parentId);
						//Push it into Model
						viewModel.status.push(status);
						}

					}
				}
				//Recuursivelly calls for each web
				getProjectsData(data.d.results[i].Url, isProjectSummaryUpdate, isStatusUpdate);
			}
		}
	}
}

function getParentforProjectSummary(siteURL, ActiveTasks, TotalTasks, ActiveIssues, TotalIssues, ActiveRisks, TotalRisks) {
	var parentId = null;
	//Check if any item exists in modal
	if (viewModel.program.length > 0) {
		// get parent ID(GUID) based on SITE URL
		var parentSiteId = getParent(siteURL);
		//Map the GUID from REST call to the GUID in existing model
		var idx = $.map(viewModel.program, function (item, i) {
				if (item.SiteId === parentSiteId)
					return i;
			})[0];
		if (idx != undefined) {
			//Get the ID based on GUID match
			parentId = viewModel.program[idx].id;
			
			viewModel.program[idx].ActiveTasks(viewModel.program[idx].ActiveTasks() + ActiveTasks);
			viewModel.program[idx].TotalTasks(viewModel.program[idx].TotalTasks() + TotalTasks);
			viewModel.program[idx].TaskListUrl(viewModel.program[idx].Url());
			viewModel.program[idx].ActiveIssues(viewModel.program[idx].ActiveIssues() + ActiveIssues);
			viewModel.program[idx].TotalIssues(viewModel.program[idx].TotalIssues() + TotalIssues);
			viewModel.program[idx].IssuesListUrl(viewModel.program[idx].Url());
			viewModel.program[idx].ActiveRisks(viewModel.program[idx].ActiveRisks() + ActiveRisks);
			viewModel.program[idx].TotalRisks(viewModel.program[idx].TotalRisks() + TotalRisks);
			viewModel.program[idx].RisksListUrl(viewModel.program[idx].Url());
			viewModel.program[idx].IsProgram(true);
			viewModel.program[idx].Children(viewModel.program[idx].Children() + 1);
			// Calls to support teo levels of programs
			getParentforProjectSummary(viewModel.program[idx].Url(),
				viewModel.program[idx].ActiveTasks(),
				viewModel.program[idx].TotalTasks(),
				viewModel.program[idx].ActiveIssues(),
				viewModel.program[idx].TotalIssues(),
				viewModel.program[idx].ActiveRisks(),
				viewModel.program[idx].TotalRisks());
		}
	}
	return parentId;
}
function getProjectsData(siteURL, isProjectSummaryUpdate, isStatusUpdate) {
	//Get all the subsites for the current sharepoint web
	var requestUrl = siteURL + "/_api/web/webs?$select=Title,url,Id";
	$.ajax({
		url : requestUrl,
		type : "GET",
		async : false,
		headers : {
			"Accept" : "application/json;odata=verbose;charset=utf-8"
		},
		success : function (data) {
			//if found call success method
			successGetHierarchyFunction(data, isProjectSummaryUpdate, isStatusUpdate);
		},
		error : function (xhr) {
			console.log("Could not load the data. " + xhr.statusText + " " + requestUrl);
		}
	}); ;
}
//Method to get Status Report Information
function getStatusData(siteURL, listName, selectAndFilter) {
	var summary = [];
	var requestUrl = siteURL + "/_api/lists/getByTitle('" + listName + "')/items" + selectAndFilter;
	$.ajax({
		url : requestUrl,
		type : "GET",
		async : false,
		headers : {
			"Accept" : "application/json;odata=verbose;charset=utf-8"
		},
		success : function (data) {

			//for (var i = 0; i < data.d.results.length; i++) {
				if (data.d.results[0] != undefined) {
					summary.push({
						Id : data.d.results[0].Id,
						Schedule : data.d.results[0].Health,
						Budget : data.d.results[0].Budget,
						PercentComplete : (data.d.results[0].PercentComplete * 100),
						Url : siteURL + "/Lists/" + listName + "/DispForm.aspx?ID=" + data.d.results[0].Id,
						Title : data.d.results[0].Title,
						//Week : ko.observable(new Date(data.d.results[i].Week_x0020_Ending))
						Week : ko.observable(new Date(data.d.results[0].Status_x0020_End_x0020_Date))
						//Status End Date
					})
				}
			//}
			
				
		},
		error : function (xhr) {
			console.log("Could not load the data. " + xhr.statusText + " " + requestUrl);
		}
	}); ;
	return summary;
}

//Reusuable REST call for LISTS based on select filter
function getListData(siteURL, listName, select) {
	var summary = [];
	var requestUrl = siteURL + "/_api/lists/getByTitle('" + listName + "')/items" + select;
	$.ajax({
		url : requestUrl,
		type : "GET",
		async : false,
		headers : {
			"Accept" : "application/json;odata=verbose;charset=utf-8"
		},
		success : function (data) {

			for (var i = 0; i < data.d.results.length; i++) {
				if (data.d.results[i] != undefined) {
					summary.push({
						Id : data.d.results[i].Id,
						Status : data.d.results[i].Status,
						Priority : data.d.results[i].Priority
					})
				}
			}
		},
		error : function (xhr) {
			console.log("Could not load the data. " + xhr.statusText + " " + requestUrl);
		}
	}); ;
	return summary;
}

// get parent ID(GUID) based on SITE URL
function getParent(siteURL) {
	var requestUrl = siteURL + "/_api/Web/ParentWeb?$select=Id";
	var parentId = null;
	$.ajax({
		url : requestUrl,
		type : "GET",
		async : false,
		headers : {
			"Accept" : "application/json;odata=verbose;charset=utf-8"
		},
		success : function (data) {
			if (data.d.Id != undefined) {
				parentId = data.d.Id;
			}
		},
		error : function (xhr) {
			console.log("Could not load the data. " + xhr.statusText + " " + requestUrl);
		}
	});
	return parentId;
}
