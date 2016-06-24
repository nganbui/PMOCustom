'use strict';
(function(){		
	var app = angular.module("PMOStatusReport",['PMOReportService']);		
	var rootUrl = _spPageContextInfo.siteAbsoluteUrl + "/DashBoard/";
	////// StatusReportController	
	app.controller("StatusReportController",['$scope','$http','$q','$timeout','$window','projectInformationService','statusReportService','taskService','riskService','issueService',function($scope,$http,$q,$timeout,$window,projectInformationService,statusReportService,taskService,riskService,issueService){	
	//preparing status report data for all projects under DashBoard/
	var projects = [];	
	function getProject(data){
		var result = data.d.results;
		if (result!=undefined && result.length>0){
			$.each(result,function(i,item){							
				getProgram(item.Url);
				var count = item.ServerRelativeUrl.replace(/[^/]/g, '').length;	//check isProgram	
				if (count > 2 && item.Title.toLowerCase().indexOf("(po)") == -1){
					var statusReport = getReportfromProject(item.Url);					
					projects.push({SiteURl: item.Url, StatusReport: statusReport});	
				}				
								
				
		});
		}
				
	};
	function getProgram(url){
		var requestUrl = url + "/_api/web/webs/?$select=Title,Url,Id,ServerRelativeUrl";	
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
	
	//getProgram(rootUrl);	
	//collect data from Risks, Issues and Tasks list of each particular project
	function getReportfromProject(siteUrl){
		var statusreport = {};		
		projectInformationService.getList(siteUrl)
		.then(function(res){
			var result = res.d.results[0];			
			if (!jQuery.isEmptyObject(result)){
				if (result.Status_x0020_Meeting_x0020_Weekd!=undefined && result.Status_x0020_Meeting_x0020_Weekd!=""){
					//var previousDay = Date.today().addDays(-1);
					//var previousWeek = Date.today().addDays(-1).addWeeks(-1);
					//only run if today is weekly meetingday of the project						
					if (Date.getDayNumberFromName(result.Status_x0020_Meeting_x0020_Weekd)==Date.today().getDay()){						
						//statusreport.EndDate = previousDay;
						//statusreport.StartDate = previousWeek;
						//report from last week to today
						var weeklyMeetingDay = 'last ' + result.Status_x0020_Meeting_x0020_Weekd;	// return last week(for example:last Thursday)						
						var startDate = Date.parse(weeklyMeetingDay); //Thu Jan 21 00:00:00 EST 2016
						var endDate = Date.today().addDays(-1);//Date.today();
						statusreport.StartDate = startDate;										//Date.parse(previousDay.toString('M/d/yyyy')).addWeeks(-1);
						statusreport.EndDate = endDate						
						statusreport.ProjectPhase = "";
						if (result.Current_x0020_Stage!=undefined)
							statusreport.ProjectPhase = result.Current_x0020_Stage;
						statusreport.Schedule = "(1) On Schedule";
						statusreport.Budget = "(1) On Schedule";
						$q.all([issueService.getActiveIssues(siteUrl,""), riskService.getRisks(siteUrl,""), taskService.completedTasksLast7days(siteUrl,"",endDate), taskService.upcomingTasks(siteUrl)]).then(function(data){
							console.log(data[0], data[1], data[2], data[3]);
							//Issues
							var issues = data[0].d.results;
							if (issues!=undefined && issues.length > 0){
								statusreport.ReportedIssues	= "<ul>";
								$.each(issues,function(i,item){
									var link = "<a href='" + siteUrl + "/Lists/Issues/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;						
									statusreport.ReportedIssues+="<li>" + link + "</li>";				
									});	
								statusreport.ReportedIssues+= "</ul>";
							}	
							//Risks
							var risks = data[1].d.results;
							if (risks!=undefined && risks.length > 0){				
								statusreport.ReportedRisks = "<ul>";
								$.each(risks,function(i,item){	
									var link = "<a href='" + siteUrl + "/Lists/Risks/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;
									statusreport.ReportedRisks+="<li>" + link + "</li>";							
									});	
								statusreport.ReportedRisks+= "</ul>";
							}
							//CompletedTasks
							var completedtasks = data[2].d.results;
							if (completedtasks!=undefined && completedtasks.length > 0){	
								statusreport.CompletedTasks = "<ul>";					
								$.each(completedtasks,function(i,item){
									var link = "<a href='" + siteUrl + "/Lists/Tasks/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;						
									statusreport.CompletedTasks+="<li>" + link + "</li>";							
									});
								statusreport.CompletedTasks+= "</ul>";
							}
							//UpcomingTasks
							var opentasks = data[3].d.results;
							if (opentasks!=undefined && opentasks.length > 0){	
								statusreport.UpcomingTasks = "<ul>";					
								$.each(opentasks,function(i,item){
									var link = "<a href='" + siteUrl + "/Lists/Tasks/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;							
									statusreport.UpcomingTasks+="<li>" + link + "</li>";						
									});
								statusreport.UpcomingTasks+= "</ul>";
							}
						});
					}
				}				
				
			}
		})
		.catch(function error(message){
			console.log("Error when get project information: " + message);
		});
		return statusreport;
	}
	////////////////////
	 $scope.getMessage = function() { 
        $timeout(function() { 
          $scope.$apply(function() { 
            //wrapped this within $apply 
            $scope.message = 'Fetched after 3 seconds';  
            //console.log('message:' + $scope.message); 
			//RunStatusReport();
          }); 
        }, 3000); 
      } 
       
     $scope.getMessage(); 
     
	// Run Status Report
	function RunStatusReport(){		
		var promises = [];		
		$.each(projects, function(i,item){
			// just update status report for the project has weekly meetingday is today		
			if (!$.isEmptyObject(item.StatusReport)){
				statusReportService.checkItem(item.SiteURl,item.StatusReport)
				.then(function(res){
					var result = res.d.results[0];
					if (result==undefined)
						promises.push(statusReportService.addItem(item.SiteURl,item.StatusReport));
				})
				.catch(function error(message){
					console.log("Error check an item existed: " + message);
				});	
			}	
		});
		$q.all(promises).then(function(res){
				$scope.message = 'Run Status Report Successful after 5 seconds'; 
				console.log("Run Status Report Successful");				
			});	
	};
	
	/*$scope.RunStatusReport = function (){
		$timeout(function() {
			angular.element('#runStatusReport').triggerHandler('click');
		  }, 3600);
		
	};*/
	}]);
	////// end StatusReportController
})();



	
