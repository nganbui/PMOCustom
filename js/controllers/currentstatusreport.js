'use strict';
(function(){		
	var app = angular.module("PMOStatusReport",['PMOReportService']);		
	////// StatusReportController
	var currentURL = _spPageContextInfo.webAbsoluteUrl;
	
	app.controller("StatusReportController",['$scope','projectInformationService','statusReportService','taskService','riskService','issueService',function($scope,projectInformationService,statusReportService,taskService,riskService,issueService){
	var statusreport = {};
	$scope.disabled = true;
	// define startDate and endDate of status Report based on MeetingWeekday given by Project Information
	projectInformationService.getList(currentURL)
	.then(function(res){
		var result = res.d.results[0];
		//if (result.Status_x0020_Meeting_x0020_Weekd!=undefined){
			//alert(Date.getDayNumberFromName(result.Status_x0020_Meeting_x0020_Weekd));
			//alert(Date.today().addDays(-1));
			//var previousDay = Date.today().addDays(-1);
			//var previousWeek = Date.today().addDays(-1).addWeeks(-1);			
			var currentDate = Date.today();
			console.log(currentDate);
			var previousWeek = Date.today().addWeeks(-1);			
							
			//if (Date.getDayNumberFromName(result.Status_x0020_Meeting_x0020_Weekd)==Date.today().getDay()){
				statusreport.EndDate = currentDate ;
				statusreport.StartDate = previousWeek;
				//var weeklyMeetingDay = 'last ' + result.Status_x0020_Meeting_x0020_Weekd;				
				//var previousDay = Date.parse(weeklyMeetingDay); //Thu Jan 21 00:00:00 EST 2016
				//statusreport.StartDate = Date.parse(previousDay.toString('M/d/yyyy')).addWeeks(-1);
				//statusreport.EndDate = previousDay;
				statusreport.ProjectPhase = result!=undefined ? result.Current_x0020_Stage : "";
				statusreport.Schedule = "(1) On Schedule";
				statusreport.Budget = "(1) On Schedule";
				//get completedTasksLast7days
				taskService.completedTasksLast7days(currentURL,"",currentDate)
				.then(function(res){
					var result = res.d.results;
					statusreport.CompletedTasks = "<ul>";					
					$.each(result,function(i,item){
						var link = "<a href='" + currentURL + "/Lists/Tasks/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;						
						statusreport.CompletedTasks+="<li>" + link + "</li>";							
						});
					statusreport.CompletedTasks+= "</ul>";					
				})
				.catch (function error(message) {
					Console.log('Failure: ' + message);
				});
				//open tasks
				taskService.openTasks(currentURL)
				.then(function(res){
					var result = res.d.results;
					statusreport.UpcomingTasks = "<ul>";					
					$.each(result,function(i,item){
						var link = "<a href='" + currentURL + "/Lists/Tasks/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;
						//alert(link);
						statusreport.UpcomingTasks+="<li>" + link + "</li>";						
						});
					statusreport.UpcomingTasks+= "</ul>";
				})
				.catch (function error(message) {
					Console.log('Failure: ' + message);
				});
				//top 3 risks order by Reporting_Order
				riskService.getTop3Risks(currentURL)
				.then(function(res){
					var result = res.d.results;				
					statusreport.ReportedRisks = "<ul>";
					$.each(result,function(i,item){	
						var link = "<a href='" + currentURL + "/Lists/Risks/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;
						statusreport.ReportedRisks+="<li>" + link + "</li>";							
						});	
					statusreport.ReportedRisks+= "</ul>";
				})
				.catch (function error(message) {
					Console.log('Failure: ' + message);
				});	
				//active issues
				issueService.getActiveIssuesforStatusReport(currentURL)
				.then(function(res){
					var result = res.d.results;	
					statusreport.ReportedIssues	= "<ul>";
					$.each(result,function(i,item){
						var link = "<a href='" + currentURL + "/Lists/Issues/DispForm.aspx?ID=" + item.ID + "' target='_blank'>" + item.Title + "</a>" ;						
						statusreport.ReportedIssues+="<li>" + link + "</li>";				
						});	
					statusreport.ReportedIssues+= "</ul>";
				})
				.catch (function error(message) {
					Console.log('Failure: ' + message);
				});	
			//}
					
		//}
		$scope.disabled = false;
	})
	.catch(function error(message){
		console.log("Error when get project information: " + message);
	});
	
	//Get list status report
	/*$scope.StatusReport = [];
	statusReportService.getList(currentURL)
	.then(function(res){
		var result = res.d.results;				
		$.each(result,function(i,item){							
				//if(jQuery.inArray($scope.parameters.workstream,item.WorkstreamsId.results) != -1){							
					$scope.StatusReport.push({Title: item.Title,  ID:  item.ID});	
				//};					
			});	
		console.log("list item successful");
		
	})
	.catch(function error(message){
		console.log("Error when list items: " + message);
	});*/
	// Run Status Report
	function ShowMessage()
	{
		alert('Run Report successful');
		window.location.href = currentURL + '/Lists/Status%20Report/AllItems.aspx';
	}
	$scope.RunStatusReport = function RunStatusReport(){		
		if (statusreport.StartDate!=undefined && statusreport.EndDate!=undefined){
			statusReportService.checkItem(currentURL,statusreport)
			.then(function(res){
				var result = res.d.results[0];				
				if (result==undefined){
					statusReportService.addItem(currentURL,statusreport)
					.then(function(response){						
						ShowMessage();
					})
					.catch(function error(message){
						console.log("Error when insert an item to list: " + message);
					});
				}
				else
					alert('Status Report from ' + statusreport.StartDate + " to " + statusreport.EndDate + " has been run.");
			})
			.catch(function error(message){
				console.log("Error check an item existed: " + message);
			});			
		}
		
	};
	}]);
	////// end StatusReportController
})();



	
