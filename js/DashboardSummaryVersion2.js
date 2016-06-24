'use strict';
(function(){
	var app = angular.module("PMODashboard",['AppBaseModule','treeGrid','angularUtils.directives.dirPagination']);		
	var currentURL = _spPageContextInfo.webAbsoluteUrl;	
	//var userid = _spPageContextInfo.userId;
	//var perMask = _spPageContextInfo.webPermMasks;
	//var isAppWeb = _spPageContextInfo.isAppWeb;
	//console.log(isAppWeb);
	//var userid = _spPageContextInfo.userId;
	
	//////////////////////////////////////////////////////////////
	//PMOSummaryController
	//show all projects under PMO Dashboard
	//$select=Title,Id,Url,ServerRelativeUrl,WebTemplate,effectivebasepermissions&$filter=WebTemplate eq 'PROJECTSITE' and effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0
	//?$select=Title,Id,Url,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0
	/////////////////////////////////////////////////////////////
	app.controller("PMOSummaryController",['$scope','$http', '$q','baseService',function($scope,$http,$q,baseService){
    ///////////////////////////////////////
	
	$scope.projectStatus = ['Active','Completed','On Hold','Pending','Terminated'];	
	$scope.filterString = "Active";
	var sites = [];
	$scope.dataHasLoaded = false;
	$scope.userhasFullControl = false;
	$scope.col_defs = [		 	     		  
						{
							field: "OpenTasks",
							displayName: "Open Tasks",
							cellTemplate: "<a href='{{row.branch.Url}}/Lists/Tasks/upcoming.aspx' target='_blank'>{{ row.branch[col.field] }}</a>"
						},
						{
							field: "ActiveIssues",
							displayName: "Active Issues",
							cellTemplate: "<a href='{{row.branch.Url}}/Lists/Issues/active.aspx' target='_blank'>{{ row.branch[col.field] }}</a>"
						},
						{
							field: "HighRisks",
							displayName: "Critical/High Risks",
							cellTemplate: "<a href='{{row.branch.Url}}/Lists/Risks/active.aspx' target='_blank'>{{ row.branch[col.field] }}</a>"
						}				  
					];
	
	//check current user permission
	function getUserWebPermissionREST() { 
		//Permission to show or hide Filter by Project Status
		var perm = new SP.BasePermissions();  
		perm.set(SP.PermissionKind.manageWeb);
		$.ajax({  
			url: currentURL + "/_api/web/doesuserhavepermissions(@v)?@v={'High':'" + perm.$4_1.toString() + "', 'Low':'" + perm.$5_1.toString() + "'}",  
			type: "GET",  
			headers: { "accept": "application/json;odata=verbose" },  
			success: function (data) {  
				var d = data.d.DoesUserHavePermissions;  
	  
				if (d === true) {  
					//Show Check Box if Full Control 
					$scope.userhasFullControl = true;
					// adding 'Status' to col_defs
					$scope.col_defs.push({
									field: "Status",
									displayName: "Status",			
									filterable : true
								  });	
				}  
				else {  
					//hide Check Box  
				}  
	  
			},  
			error: function (err) {  
				alert(JSON.stringify(err));  
			}  
	  
		});  
	}  
	getUserWebPermissionREST();
	////////////////////////////////////
	function walkDirectory(path) {
			//var siteUrl = path + "/_api/web/webs?$select=Title,Id,Url,ServerRelativeUrl,effectivebasepermissions,ParentWeb&$expand=ParentWeb&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0";						
			var siteUrl = path + "/_api/web/webs?$select=Title,Id,Url,ServerRelativeUrl,ParentWeb&$expand=ParentWeb,effectivebasepermissions&$filter=effectivebasepermissions/high gt 176";						
			return baseService.getRequestUrl(siteUrl).then(function(entries) {				
					return $q.all(entries.map(function(e) {
						if (e.Url==undefined) {
							// Do something
							console.log("not found ");
							return null;  // Don't wait for anything
						} else {							
							if (path==currentURL)
								sites.push({Name:e.Title,Url:e.Url,Id:e.Id,ParentId:null,Status:"Active",ExcludeFromProjectSummary:"No",IsProject:false});
							else
								sites.push({Name:e.Title,Url:e.Url,Id:e.Id,ParentId:e.ParentWeb.Id,Status:"Active",ExcludeFromProjectSummary:"No",IsProject:false,OpenTasks:"",ActiveIssues:"",HighRisks:""});							
							return walkDirectory(e.Url);
						}
					}));
				});
    };	
	walkDirectory(currentURL).then(function(){
		console.log(sites);			
		$.each(sites,function(i,item){
			var listProjectStatement = "Project Statement";
			var queryProjectStatement = "items?$select=ID,Title,Status_x0020_Meeting_x0020_Weekd,Current_x0020_Stage,Project_x0020_Status,Exclude_x0020_from_x0020_Reports,Exclude_x0020_from_x0020_Project&top=1";
			var resultsProjectStatement = baseService.getRequest(item.Url,listProjectStatement,queryProjectStatement);
			$q.when(resultsProjectStatement).then(
				function handleResolve(value) {							
					item.ExcludeFromProjectSummary = "No";
					if (value.d.results[0]!=undefined && value.d.results[0].Exclude_x0020_from_x0020_Project===true)
						item.ExcludeFromProjectSummary = "Yes";
					item.IsProject = true;
					item.Status	= (value.d.results[0]!=undefined && value.d.results[0].Project_x0020_Status!=null) ? value.d.results[0].Project_x0020_Status : "Active";
					//						
					var listTasks = "Tasks";
					var queryTasks = "/items?$select=Id,Status&$filter=Status ne 'Completed'";
					var resultsTasks = baseService.getRequest(item.Url,listTasks,queryTasks);
					resultsTasks.then(function(res){
						item.OpenTasks = res.d.results.length > 0 ? res.d.results.length : "";
					});
					var listRisks = "Risks";
					var queryRisks = "/items?$select=Id,Priority&$filter=Priority eq 'High'";
					var resultsRisks = baseService.getRequest(item.Url,listRisks,queryRisks);
					resultsRisks.then(function(res){
						item.HighRisks = res.d.results.length > 0 ? res.d.results.length : "";
					});
					var listIssues = "Issues";
					var queryIssues = "/items?$select=Id,Status&$filter=Status eq 'Active'";
					var resultsIssues = baseService.getRequest(item.Url,listIssues,queryIssues);
					resultsIssues.then(function(res){
						item.ActiveIssues = res.d.results.length > 0 ? res.d.results.length : "";
					})
				});
			
		});		
		$scope.tree_data = getTree(sites, 'Id', 'ParentId');
		$scope.dataHasLoaded = true;			
		console.log($scope.tree_data);
		//$rootScope.$broadcast('MyServiceReady');
	});
	
	var tree;
	$scope.my_tree = tree = {};
	$scope.expanding_property = "Name";			
	
	$scope.my_tree_handler = function (branch) {
		console.log('you clicked on');
		console.log(branch.children);		
	}
	function getTree(data, primaryIdName, parentIdName){
		if(!data || data.length==0 || !primaryIdName ||!parentIdName)
			return [];

		var tree = [],
			rootIds = [],
			item = data[0],
			primaryKey = item[primaryIdName],
			treeObjs = {},
			parentId,
			parent,
			len = data.length,
			i = 0;
		
		while(i<len){
			item = data[i++];
			primaryKey = item[primaryIdName];			
			treeObjs[primaryKey] = item;
			parentId = item[parentIdName];

			if(parentId){
				parent = treeObjs[parentId];	

				if(parent.children){
					parent.children.push(item);
				}
				else{
					parent.children = [item];
				}
			}
			else{
				rootIds.push(primaryKey);
			}
		}

		for (var i = 0; i < rootIds.length; i++) {
			tree.push(treeObjs[rootIds[i]]);
		};

		return tree;
	}
	//////////////////////////////////////
	}]);

	//////////////////////////////////////////////////////////////
	//PMOStatusController
	//preparing status report data for all projects under DashBoard/	
	/////////////////////////////////////////////////////////////
	app.controller("PMOStatusController",['$scope','$http','$q','baseService',function($scope,$http,$q,baseService){				
		$scope.statusReports = [];		
		/*$scope.isEmpty = function (arr) {
			var existInArray = false;
			for(var i=0;i<arr.length;i++){
				if(arr[i].StatusReport.Id > 0){
					existInArray=true;
					break;
				}
			}
			return existInArray;
		}*/
		// iterate projects of each PO -> call report from each project -> adding it to statusReport array
		function getProject(data){
			var result = data.d.results;
			if (result!=undefined && result.length>0){
				$.each(result,function(i,item){					
					getProgram(item.Url);
					var count = item.ServerRelativeUrl.replace(/[^/]/g, '').length;	//check isProgram?	
					if (count > 2 && item.Title.toLowerCase().indexOf("(po)") == -1){						
						getReportfromProject(item.Url, item.Title, $scope.statusReports);
					}
					
					
			});
			}
					
		};
		// get PO under Dashboard site
		// for each program get projects under this PO
		function getProgram(url){			
			//var requestUrl = url + "/_api/web/webs/?$select=Title,Url,Id,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0";
			var requestUrl = url + "/_api/web/webs/?$select=Title,Url,Id,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high gt 176";
			$http({
				url: requestUrl,
				method:'GET',
				headers:{
					"accept":"application/json;odata=verbose",
					"content-Type":"application/json;odata=verbose"
				}
			})
			.success(function(result) {
				getProject(result);			
			})
			.error(function(result, status) {
				console.log(status);	
			});
			
		};	
		// call getProgram function
		getProgram(currentURL);
		// get report for each project: top 1 order by Status_x0020_End_x0020_Date desc
		function getReportfromProject(siteUrl, siteTitle, reportList){
			//get status report from Active Project and Exclude_x0020_from_x0020_Reports==false from Project Statement
			var listProjectStatement = "Project Statement";
			var queryProjectStatement = "items?$select=ID,Title,Status_x0020_Meeting_x0020_Weekd,Current_x0020_Stage,Project_x0020_Status,Exclude_x0020_from_x0020_Reports,Exclude_x0020_from_x0020_Project&top=1";
			var resultsProjectStatement = baseService.getRequest(siteUrl,listProjectStatement,queryProjectStatement);			
			$q.when(resultsProjectStatement).then(
				function handleResolve(value) {							
					if (value.d.results!=undefined && value.d.results.length>0){
						var resultProjectStatement = value.d.results[0];						
						if (resultProjectStatement!=undefined && resultProjectStatement.Project_x0020_Status==='Active' && !resultProjectStatement.Exclude_x0020_from_x0020_Reports){
							var listTitle = "Status Report";
							var query = "items?$select=Id,Title,Health,Budget,Current_x0020_Stage,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Status_x0020_End_x0020_Date desc";													
							var results = baseService.getRequest(siteUrl,listTitle,query);
							results.then(function(res){									
								if (res.d.results!=undefined && res.d.results.length>0){
									var statusReport = {};
									var result = res.d.results[0];
									statusReport.Id = result.Id;	
									statusReport.ProjectURL = siteUrl;
									statusReport.ProjectName = siteTitle;
									statusReport.ReportUrl = siteUrl + "/Lists/Status%20Report/DispForm.aspx?ID=" + res.d.results[0].Id;								
									statusReport.CurrentPhase = result.Current_x0020_Stage!=undefined? result.Current_x0020_Stage : "";
									statusReport.Health = result.Health;
									statusReport.Budget = result.Budget;
									statusReport.PercentComplete = result.PercentComplete*100;
									statusReport.Week = result.Status_x0020_End_x0020_Date;//$filter('date')(result.Status_x0020_End_x0020_Date, "fullDate"); 
									reportList.push(statusReport);
								}
								
								
							})
							.catch(function error(message){
								console.log("Error when get project statement: " + message);
							});
						}
					}
				});
			
		};
		
		
	}]);
	
	
	////////////////////////////////////////////////////////////////////////
	//Filter Module: should be moved to app.js
	//Filter based on Project Status on Dashboard page
	////////////////////////////////////////////////////////////////////////
	
	/*angular.module('PMO.FilterProject',[])
	.filter('filterStatus',function(){
		return function(projects,selectStatus){
			var newProjects = [];
			angular.forEach(projects,function(project){				
				if (project.Status==selectStatus.name || project.Status=='')
						newProjects.push(project);
					
			});
			return newProjects;
		};
		console.log(newProjects);
	})*/
	

	

})();
//////////////////////////////////
// DOM finished load
/////////////////////////////////
