'use strict';
(function(){		
	var app = angular.module("PMOReportService",['AppBaseModule']);
	//ProjectInformationService
	app.factory('projectInformationService',['$http','baseService',function($http,baseService){	
	var listTitle = "Project%20Statement";		
	var projects = {};	
	
	projects.getList = function getList(siteUrl){			
		var query = "Items?$select=ID,Title,Status_x0020_Meeting_x0020_Weekd,Current_x0020_Stage,Project_x0020_Status,Exclude_x0020_from_x0020_Reports,Exclude_x0020_from_x0020_Project&$top=1";			
		return baseService.getRequest(siteUrl,listTitle,query);
	};	
	return projects;
	}]);
	// StatusReportService
	app.factory('statusReportService',['baseService',function(baseService){	
	var listTitle = "Status Report";
	var type = getListItemType(listTitle);	
	
	
	var getList = function getList(siteUrl){			
		var query = "Items?$select=ID,Title";			
		return baseService.getRequest(siteUrl,listTitle,query);
	};
	var checkItem = function checkItem(siteUrl,statusreport){
		var query = "Items?$select=ID";
		if (statusreport.StartDate!=undefined && statusreport.StartDate!==""){		
			var dStart = new Date(statusreport.StartDate);
			var dStartISO = dStart.toISOString();
			var filterQuery = String.format("$filter=Status_x0020_Start_x0020_Date eq datetime'{0}'", dStartISO);	
			query+= "&" + filterQuery;			
		}		
		
		if (statusreport.EndDate!=undefined && statusreport.EndDate!==""){		
			var dEnd = new Date(statusreport.EndDate);		
			var dEndISO = dEnd.toISOString();
			query+= String.format(" and Status_x0020_End_x0020_Date eq datetime'{0}'", dEndISO);
		}		
		
		return baseService.getRequest(siteUrl,listTitle,query);
	};
	var addItem = function addItem(siteUrl,statusreport){	
		var item = {
			"__metadata" : {
				"type" : type
			},
			"Title": "Report from " + statusreport.StartDate.toLocaleDateString() + " to " + statusreport.EndDate.toLocaleDateString(),
			"Status_x0020_Start_x0020_Date": statusreport.StartDate,
			"Status_x0020_End_x0020_Date": statusreport.EndDate,						
			"Current_x0020_Stage" : statusreport.ProjectPhase,
			"Budget" : statusreport.Budget,
			"Health" : statusreport.Schedule,
			"Tasks_x0020_Completed" : statusreport.CompletedTasks,
			"Upcoming_x0020_Tasks" : statusreport.UpcomingTasks,
			"Reported_x0020_Risks"	: statusreport.ReportedRisks,
			"Reported_x0020_Issues"	: statusreport.ReportedIssues
		};			
		return baseService.addRequest(siteUrl,listTitle,item);
	};
	
	return {
		getList: getList,
		checkItem: checkItem,
		addItem: addItem
		};
	}]);
	//Workstream Service
	app.factory("workstreamService",['baseService',function(baseService){		
		var getWorkstream = function getWorkstream(siteUrl){
			var listTitle = "Project%20Statement";			
			var query = "Items?$select=WorkstreamsId";
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		var getListWorkstream = function getListWorkstream(siteUrl,filter){	
			var listTitle = "Project%20Workstreams";
			var query = "Items?$Select=ID,Title" +  filter;			
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		return {getWorkstream: getWorkstream,
				getListWorkstream: getListWorkstream
		};
	}]);
	//Issue Service
	app.factory('issueService',['baseService',function(baseService){	
		var listTitle = "Issues";
		var Issues = {};		
		Issues.getActiveIssues = function getActiveIssues(siteUrl,endDate){			
			var query = "Items?$select=ID,Title,DueDate,WorkstreamsId&$filter=Status eq 'Active'";
			if(endDate!=undefined && endDate!==""){
				var dEnd = new Date(endDate);
				var dEndISO = dEnd.toISOString();
				var filterQuery = String.format(" and DueDate le datetime'{0}'", dEndISO);	
				query+= filterQuery;
			}
			query+= "&$orderby=Reporting_x0020_Order";			
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		Issues.getActiveIssuesforStatusReport = function getActiveIssuesforStatusReport(siteUrl){			
			var query = "Items?$select=ID,Title,Status,Reporting_x0020_Order,DueDate,WorkstreamsId&$filter=Status eq 'Active' and ((Exclude_x0020_from_x0020_Reports ne 0 and Exclude_x0020_from_x0020_Reports ne 1) or Exclude_x0020_from_x0020_Reports eq 0)&$orderby=Reporting_x0020_Order";				
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		return Issues;
	}]);
	//Risk Service
	app.factory('riskService',['baseService',function(baseService){	
		var listTitle = "Risks";
		var Risks = {};
		Risks.getRisks = function getRisks(siteUrl,endDate){
			var query = "Items?$select=ID,Title,WorkstreamsId";
			if(endDate!=undefined && endDate!==""){			
				var dEnd = new Date(endDate);
				var dEndISO = dEnd.toISOString();
				var filterQuery = String.format("$filter=DueDate le datetime'{0}'", dEndISO);
				query+= "&" + filterQuery;
			}
			query+= "&$orderby=Reporting_x0020_Order";
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		Risks.getTop3Risks = function getRisksStatusReport(siteUrl){
			var query = "Items?$select=ID,Title,WorkstreamsId&$filter=((Exclude_x0020_from_x0020_Reports ne 0 and Exclude_x0020_from_x0020_Reports ne 1) or Exclude_x0020_from_x0020_Reports eq 0)&$orderby=Reporting_x0020_Order&$top=3";
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		return Risks;
	}]);
	//Task Service
	app.factory('taskService',['baseService',function(baseService){	
		var listTitle = "Tasks";
		var Tasks = {};
		Tasks.overdueTasks = function overdueTasks(siteUrl,startDate,endDate){
			var query = "Items?$select=ID,Title,Status,Created,DueDate,Modified,WorkstreamsId&$filter=Status ne 'Completed'";
			if(startDate!=undefined && startDate!==""){
				var dStart = new Date(startDate);
				var dStartISO = dStart.toISOString();				
				query+= String.format(" and Created ge datetime'{0}'", dStartISO);
			}
			if(endDate!=undefined && endDate!==""){
				var dEnd = new Date(endDate);
				var dEndISO = dEnd.toISOString();
				query+= String.format(" and DueDate le datetime'{0}'", dEndISO);//DueDate <[End Date]
			}	
			
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		Tasks.completedTasksLast7days = function completedTasksLast7days(siteUrl,startDate,endDate){
			//$select=ID,Title,Status,StartDate,DueDate,Project_x0020_End_x0020_Date,Modified,Exclude_x0020_from_x0020_Status_,WorkstreamsId&$filter=Status eq 'Completed' and ((Exclude_x0020_from_x0020_Status_ ne 0 and Exclude_x0020_from_x0020_Status_ ne 1) or Exclude_x0020_from_x0020_Status_ eq 0)
			//var query = "Items?$select=ID,Title,Status,Created,DueDate,Exclude_x0020_from_x0020_Reports,StartDate,Project_x0020_End_x0020_Date,WorkstreamsId&$filter=Status eq 'Completed' and Exclude_x0020_from_x0020_Reports eq null";
			var query = "Items?$select=ID,Title,Status,StartDate,DueDate,Project_x0020_End_x0020_Date,Modified,Exclude_x0020_from_x0020_Reports,WorkstreamsId&$filter=Status eq 'Completed' and ((Exclude_x0020_from_x0020_Reports ne 0 and Exclude_x0020_from_x0020_Reports ne 1) or Exclude_x0020_from_x0020_Reports eq 0)";
			if(startDate!=undefined && startDate!==""){
				var dStart = new Date(startDate);
				var dStartISO = dStart.toISOString();
				query+= String.format(" and Created ge datetime'{0}'", dStartISO);
			}
			if(endDate!=undefined && endDate!=""){
				var endDate = new Date(endDate);
				var ISOEndDate = endDate.toISOString();					
				endDate.setDate(endDate.getDate()-7);					
				var ISODateMinus7 = endDate.toISOString();								
				//query+= String.format(" and Modified le datetime'{0}' and Modified ge datetime'{1}'", ISOEndDate, ISODateMinus7);//Modified between [End Date - 7] and [End Date]
				query+= String.format(" and Project_x0020_End_x0020_Date le datetime'{0}' and Project_x0020_End_x0020_Date ge datetime'{1}'", ISOEndDate, ISODateMinus7);//Modified between [End Date - 7] and [End Date]
			}	
			console.log(query);
			return baseService.getRequest(siteUrl,listTitle,query);			
			
		};
		Tasks.completedTasksOver7days = function completedTasksOver7days(siteUrl,startDate,endDate){
			var query = "Items?$select=ID,Title,Status,Created,DueDate,WorkstreamsId&$filter=Status eq 'Completed'";
			if(startDate!=undefined && startDate!==""){
				var dStart = new Date(startDate);
				var dStartISO = dStart.toISOString();
				query+= String.format(" and Created ge datetime'{0}'", dStartISO);
			}
			if(endDate!=undefined && endDate!==""){
				var d = new Date(endDate);
				d.setDate(d.getDate()-7);					
				var dEndISO = d.toISOString();	
				query+= String.format(" and Modified le datetime'{0}'", dEndISO);//Modified <[End Date - 7]
				//query+= String.format(" and Project_x0020_End_x0020_Date le datetime'{0}'", dEndISO);//Modified <[End Date - 7]
			}
			
			return baseService.getRequest(siteUrl,listTitle,query);			
		};		
		Tasks.openTasks = function openTasks(siteUrl){								
			var filterQuery = "$filter=(Status ne 'Completed' or PercentComplete lt 1) and ((Exclude_x0020_from_x0020_Reports ne 0 and Exclude_x0020_from_x0020_Reports ne 1) or Exclude_x0020_from_x0020_Reports eq 0)";			
			var query = "Items?$select=ID,Title,Status,Created,DueDate,WorkstreamsId&" + filterQuery ;
			console.log(query);
			return baseService.getRequest(siteUrl,listTitle,query);
		};
		return Tasks;
	}]);
	
	
})();