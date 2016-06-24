'use strict';
(function(){
	var app = angular.module("PMODashboard",['AppBaseModule','PMO.FilterProject','angularUtils.directives.dirPagination']);		
	var currentURL = _spPageContextInfo.webAbsoluteUrl;	
	
	//////////////////////////////////////////////////////////////
	//PMOSummaryController
	//preparing status report data for all projects under DashBoard/
	//$select=Title,Id,Url,ServerRelativeUrl,WebTemplate,effectivebasepermissions&$filter=WebTemplate eq 'PROJECTSITE' and effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0
	//?$select=Title,Id,Url,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0
	/////////////////////////////////////////////////////////////
	app.controller("PMOSummaryController",['$scope','$window',function($scope,$window){	
	$scope.projectStatus = {
			 options: [{
					id: 1,
						name: 'Active'
					}, 
					{
						id: 2,
						name: 'Completed'
					},
					{
						id: 3,
						name: 'Pending'
					},
					{
						id: 4,
						name: 'On Hold'
					},
					{
						id: 4,
						name: 'Terminated'
					}
					],
			 selectedOption: {id:1,name:'Active'} //This sets the default value of the select in the ui
			 };
	//$scope.selectedStatus = "Active";	
	$scope.projects = [];	
	//$scope.statusReport = [];
	//$scope.tree = [];
	
	var i = 1;
	///////////////////////////////////////////////////
	// Get all sites under PO
	///////////////////////////////////////////////////
	$.ajax({
		url: currentURL + "/_api/web/webs?$select=Title,Id,Url,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0",
		method: "GET",
		headers: {
		"Accept": "application/json; odata=verbose"
		},
		success: function(subsites) {
			if (subsites.d.results!=undefined && subsites.d.results.length>0){
				var projInfo = {
					IsProject : false,			
					Status : "",
					ExcludeFromProjectSummary : false,
					ExcludeFromStatusSummary : false	
				};
				$.each(subsites.d.results, function(index) {
					// check if find Project Information
					var resProjectInfo = getProjectStatement(this.Url,"Project%20Statement");					
					if (!$.isEmptyObject(resProjectInfo)){
						projInfo.IsProject = resProjectInfo.IsProject,
						projInfo.Status = resProjectInfo.Status;
						projInfo.ExcludeFromProjectSummary = resProjectInfo.ExcludeFromProjectSummary!=null? resProjectInfo.ExcludeFromProjectSummary : false;
						projInfo.ExcludeFromStatusSummary = resProjectInfo.ExcludeFromStatusSummary!=null? resProjectInfo.ExcludeFromStatusSummary: false;
					}
					// adding to project dashoard if ExcludeFromProjectSummary is false
					if (projInfo.ExcludeFromProjectSummary==false){					
						$scope.projects.push({ 
							Id: i,
							Title: this.Title,
							Url: this.Url,
							IsProject : projInfo.IsProject,
							Status : projInfo.Status,
							ExcludeFromProjectSummary : projInfo.ExcludeFromProjectSummary,
							ExcludeFromStatusSummary : projInfo.ExcludeFromStatusSummary,
							//ProjectInformation: projInfo,
							treeStructure:'treegrid-' + i
							});
					}
					var parentId = i;
					i++;			
					getSubSites(this.Url, this.Title, parentId);
			    });
			}
			
		},
		error: function(subsites) {
			console.log('error 3');
		},
		async: false
	});
	console.log($scope.projects);	
	//console.log($scope.statusReport);
	//console.log($scope.tree);	
	/////////////////////////////////////////////////////////////
	// iterate site and call recursive to get child
	////////////////////////////////////////////////////////////
	function getSubSites(SubSiteUrl, SubSiteTitle, parentId) {	
		//console.log(SubSiteUrl);
		$.ajax({
		url:  SubSiteUrl + "/_api/web/webs?$select=Title,Id,Url,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0",
		method: "GET",
		headers: {
		"Accept": "application/json; odata=verbose"
		},
		success: function(subsites) {
			if (subsites.d.results!=undefined && subsites.d.results.length>0){	
				$.each(subsites.d.results, function(index) {					
					// project Information by default
					var projInfo = {
						IsProject : false,			
						Status : "",
						ExcludeFromProjectSummary : false,
						ExcludeFromStatusSummary : false	
					};
					// check if find Project Information
					var resProjectInfo = getProjectStatement(this.Url,"Project%20Statement");					
					if (!$.isEmptyObject(resProjectInfo)){
						projInfo.IsProject = resProjectInfo.IsProject,
						projInfo.Status = resProjectInfo.Status;
						projInfo.ExcludeFromProjectSummary = resProjectInfo.ExcludeFromProjectSummary!=null? resProjectInfo.ExcludeFromProjectSummary : false;
						projInfo.ExcludeFromStatusSummary = resProjectInfo.ExcludeFromStatusSummary!=null? resProjectInfo.ExcludeFromStatusSummary: false;
					}									
					// adding to project dashoard if ExcludeFromProjectSummary is false
					if (projInfo.ExcludeFromProjectSummary==false){
						$scope.projects.push({ 
						Id: i,
						Title: this.Title,
						Url: this.Url,
						//ProjectInformation: projInfo,
						IsProject : projInfo.IsProject,
						Status : projInfo.Status,
						ExcludeFromProjectSummary : projInfo.ExcludeFromProjectSummary,
						ExcludeFromStatusSummary : projInfo.ExcludeFromStatusSummary,
						treeStructure: 'treegrid-' + i + ' treegrid-parent-'+ parentId
						});	
						
						
					}					
					// adding to status report dashboard if ExcludeFromStatusSummary is false
					/*if (projInfo.ExcludeFromStatusSummary==false && projInfo.Status==='Active'){
						var resStatusReport = getStatusReport(this.Url,"Status Report");					
						$scope.statusReport.push({SiteURL: this.Url, Sitename: this.Title, StatusReport: resStatusReport});
					}*/
					var j = i;
					i++;						
					getSubSites(this.Url, this.Title, j);
					
				});
			}
		},
		error: function(subsites) {
			console.log('error: ' + subsites + SubSiteUrl);
		},
		async: false
		});
	}	
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// get Project Information : Project Status, Exclude from ProjectSummary, Exlude from StatusSummary
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	function getProjectStatement(siteURL, listTitle) {
		var projectInfo = {};
		siteURL = siteURL.replace(/ /g, '%20');			
		var requestUrl = siteURL + "/_api/Web/Lists/getByTitle('" + listTitle + "')/";
		$.ajax({
		url:  requestUrl + "Items?$select=ID,Title,Status_x0020_Meeting_x0020_Weekd,Current_x0020_Stage,Project_x0020_Status,Exclude_x0020_from_x0020_Reports,Exclude_x0020_from_x0020_Project&top=1",
		method: "GET",
		headers: {
		"Accept": "application/json; odata=verbose"
		},
		success: function(response) {
			if (response.d.results!=undefined){
				projectInfo.IsProject = true;				
				projectInfo.Status = response.d.results[0]!=undefined? response.d.results[0].Project_x0020_Status : "";
				projectInfo.ExcludeFromProjectSummary = response.d.results[0]!=undefined? response.d.results[0].Exclude_x0020_from_x0020_Project : false;
				projectInfo.ExcludeFromStatusSummary = response.d.results[0]!=undefined? response.d.results[0].Exclude_x0020_from_x0020_Reports : false;	
				//console.log(projectInfo);
			}
		},
		error: function(response) {
			console.log('error get Project Statement: ' + response + siteURL);
		},
		async: false
		});
		return projectInfo;		
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// get Status Report has Exlude from StatusSummary is false
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	function getStatusReport(siteURL, listTitle) {
		var statusReport = {Id:0,ReportUrl:"",Name:"",Health:"",Budget:"",PercentComplete:"",Week:""};
		var projectURL = siteURL.replace(/ /g, '%20');				
		var requestUrl = projectURL + "/_api/Web/Lists/getByTitle('" + listTitle + "')/";
		$.ajax({
		url:  requestUrl + "items?$select=Id,Title,Health,Budget,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Status_x0020_End_x0020_Date desc",
		method: "GET",
		headers: {
		"Accept": "application/json; odata=verbose"
		},
		success: function(res) {
			if (res.d.results!=undefined && res.d.results.length>0){
					var result = res.d.results[0];
					statusReport.Id = result.Id;					
					statusReport.ReportUrl = projectURL + "/Lists/Status%20Report/DispForm.aspx?ID=" + res.d.results[0].Id;
					statusReport.Name = result.Title;
					statusReport.Health = result.Health;
					statusReport.Budget = result.Budget;
					statusReport.PercentComplete = result.PercentComplete*100;
					statusReport.Week = result.Status_x0020_End_x0020_Date;//$filter('date')(result.Status_x0020_End_x0020_Date, "fullDate"); 
				}
		},
		error: function(response) {
			console.log('error get Status Report: ' + response + projectURL);
		},
		async: false
		});
		return statusReport;		
	}
	
	
}]);

	//////////////////////////////////////////////////////////////
	//PMOStatusController
	//preparing status report data for all projects under DashBoard/	
	/////////////////////////////////////////////////////////////
	app.controller("PMOStatusController",['$scope','$http','baseService',function($scope,$http,baseService){				
		$scope.statusReports = [];		
		$scope.isEmpty = function (arr) {
			var existInArray = false;
			for(var i=0;i<arr.length;i++){
				if(arr[i].StatusReport.Id > 0){
					existInArray=true;
					break;
				}
			}
			return existInArray;
		}
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
			var requestUrl = url + "/_api/web/webs/?$select=Title,Url,Id,ServerRelativeUrl,effectivebasepermissions&$filter=effectivebasepermissions/high ne 176 and effectivebasepermissions/high ne 0";
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
		function getReportfromProject(siteUrl, siteTitle,reportList){
			var listTitle = "Status Report";
			var query = "items?$select=Id,Title,Health,Budget,Current_x0020_Stage,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Status_x0020_End_x0020_Date desc";													
			var results = baseService.getRequest(siteUrl,listTitle,query);
			//get status report from Active Project and Exclude_x0020_from_x0020_Reports==false from Project Statement
			var listProjectStatement = "Project Statement";
			var queryProjectStatement = "items?$select=ID,Title,Status_x0020_Meeting_x0020_Weekd,Current_x0020_Stage,Project_x0020_Status,Exclude_x0020_from_x0020_Reports,Exclude_x0020_from_x0020_Project&top=1";
			var resultsProjectStatement = baseService.getRequest(siteUrl,listProjectStatement,queryProjectStatement);
			resultsProjectStatement.then(function(resProjectStatement){
				if (resProjectStatement.d.results!=undefined && resProjectStatement.d.results.length>0){
					var resultProjectStatement = resProjectStatement.d.results[0];										
					if (resultProjectStatement.Project_x0020_Status==='Active' && !resultProjectStatement.Exclude_x0020_from_x0020_Reports){
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
			})
			.catch(function error(message){
				console.log("Error when get report: " + message);
			});
			
		};
		
		
	}]);
	
	
	////////////////////////////////////////////////////////////////////////
	//Filter Module: should be moved to app.js
	//Filter based on Project Status on Dashboard page
	////////////////////////////////////////////////////////////////////////
	
	angular.module('PMO.FilterProject',[])
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
	})
	

	

})();
//////////////////////////////////
// DOM finished load
/////////////////////////////////
$(document).ready(function() {
	$('#projectSummaryLoader').hide();
	$('#projectSummaryContent').show();
	
	function getJson(url) 
	{
		return $.ajax({       
		   url: url,   
		   type: "GET", 			
		   contentType: "application/json;odata=verbose",
		   headers: { 
			  "Accept": "application/json;odata=verbose"
		   }
		});
	}
	/////////////////////////////////////////////////////////////
	// lazy loading: make rest api call when clicking on project
	////////////////////////////////////////////////////////////
	window.updateItemCount = function updateItemCount(rowId){
		var url = $("#" + rowId + " td").attr("siteURL");
		//console.log(url);
		var urlTasks = url + "/_api/web/lists/getbytitle('Tasks')/items?$select=Id,Status&$filter=Status ne 'Completed'";
		var urlIssues = url + "/_api/web/lists/getbytitle('Issues')/items?$select=Id,Status&$filter=Status eq 'Active'";						
		var urlRisks = url + "/_api/web/lists/getbytitle('Risks')/items?$select=Id,Priority&$filter=Priority eq 'High'";						
		getJson(urlTasks)
		.done(function(data)
		{
			var itemsCount = data.d.results.length; //get items count
			if (itemsCount >0){
				var link = "<a href='" +  url + "/Lists/Tasks/upcoming.aspx' target='_blank'>" + itemsCount + "</a>";
				//console.log(itemsCount);
				$('#' + rowId + ' .tasks').html(link);
			}

		})
		.fail(
		function(error){
			console.log("updateItemCount Tasks: " + JSON.stringify(error));
		});
		getJson(urlIssues)
		.done(function(data)
		{
			var itemsCount = data.d.results.length; //get items count
			if (itemsCount >0){
				var link = "<a href='" + url + "/Lists/Issues/active.aspx' target='_blank'>" + itemsCount + "</a>";
				//console.log(itemsCount);
				$('#' + rowId + ' .issues').html(link);
			}
			
		})
		.fail(
		function(error){
			console.log("updateItemCount Issues" + JSON.stringify(error));
		});
		getJson(urlRisks)
		.done(function(data)
		{
			var itemsCount = data.d.results.length; //get items count
			if (itemsCount >0){
				var link = "<a href='" +  url + "/Lists/Risks/active.aspx' target='_blank'>" + itemsCount + "</a>";
				//console.log(itemsCount);
				$('#' + rowId + ' .risks').html(link);
			}
		})
		.fail(
		function(error){
			console.log("updateItemCount Risks : "+ JSON.stringify(error));
		});	
	}
	///////////////////////////
	//Expand All Button
	///////////////////////////
	 $('.expandcollapse').click(function() {		        
        if ($(this).attr('state')==="0" ) {            
			$('.treeProgram').treegrid('expandAll');
			$(this).attr('state',1);
			$(this).html("<i class=\"fa fa-minus-circle\"></i> Collapse All");			
        }
        // otherwise, collapse all
        else {            
            $('.treeProgram').treegrid('collapseAll');
			$(this).attr('state',0);	
			$(this).html("<i class=\"fa fa-plus-circle\"></i> Expand All");			
        }
    });	
	/////////////////////////////////////////////////////
	// render projects with treegrid boostrap version 2.0
	////////////////////////////////////////////////////	
	$('.treeProgram').treegrid({
			expanderExpandedClass: 'fa fa-minus-circle',
			expanderCollapsedClass: 'fa fa-plus-circle',
			initialState:'collapsed',
			onExpand: function() {                
			var id = $(this).attr("id");
			var obj = $('#'+id).treegrid('getChildNodes');
			$.each(obj,function(index){					
				if (obj.treegrid("isLeaf")) {
					var rowId = obj[index].id;											
					updateItemCount(rowId);
				}
				
			})
			
		}			
		});
	
	$(".treegrid-expanded").css("font-weight", "Bold");
	$(".treegrid-collapsed").css("font-weight", "Bold");
	
	$('.treeProgram').find('tr').each(function(){				
		if ($(this).treegrid("isLeaf") && !$(this).hasClass('treegrid-0') && $(this).css('display') != 'none'){
			var rowId = $(this).attr("id");															
			updateItemCount(rowId);
		}
		
		if ($(this)!=undefined && !$(this).treegrid("isLeaf")){	
			var len = "(" + $(this).treegrid('getChildNodes').length + ")";
			var rowId = $(this).attr("id");					
			$('#' + rowId + ' td > a').css("font-weight", "Bold");
			//$('#' + rowId + ' .itemCount').text(len);
			
		}
		
	});	
	//ending render with treeGrid
});