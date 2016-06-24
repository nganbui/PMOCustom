'use strict';
(function(){		
	var app = angular.module("PMOWorkstreamReport",['PMOReportService']);
	var currentSite = _spPageContextInfo.webAbsoluteUrl;	
	app.controller('ProjectController',['$scope','workstreamService','issueService','riskService','taskService',function($scope,workstreamService,issueService,riskService,taskService){		
		$scope.runReport = false;
		$scope.isDisabled = true;
		$scope.currentURL = _spPageContextInfo.webAbsoluteUrl;	
		$scope.errMessage = "";	
		
		$scope.checkErr = function(startDate,endDate) {	
				$scope.errMessage = "";					
				$scope.runReport = false;
				if($scope.selectedWorkstream!=undefined && $scope.selectedWorkstream.Title!=="" && $scope.errMessage==="")
					$scope.isDisabled = false;							
				if(new Date(startDate) > new Date(endDate)){
				  $scope.errMessage = 'End Date should be greater than start date';				  
				  $scope.runReport = false;
				  $scope.isDisabled = true;
				  return false;
				}			
			};
		$scope.showReport = function() {			
			$scope.runReport = false;
			$scope.isDisabled = true;	
						
			if($scope.selectedWorkstream!=undefined && $scope.selectedWorkstream.Title!=="" && $scope.errMessage==="")
				$scope.isDisabled = false;
			};
		workstreamService.getWorkstream(currentSite)
		.then(function(res){			
		    var result = res.d.results[0];
			if (!jQuery.isEmptyObject(result)){
				$scope.workstream = result.WorkstreamsId.results;			
				var filter = "&$filter=";
				var filerColumn = "ID";	
				$.each($scope.workstream,function(index,item){												
					filter+= filerColumn + " eq " + item + " or "; 
					})
				var query = filter.slice(0,-4);
				$scope.WorkstreamCol = [];
				//var rooturl = _spPageContextInfo.siteAbsoluteUrl + "/_api/Lists/GetByTitle('Project%20Workstreams')/Items?$Select=ID,Title";		
				workstreamService.getListWorkstream(_spPageContextInfo.siteAbsoluteUrl,query)
				.then(function(data){
					var result = data.d.results;
					if (result.length>0){
						$.each(result,function(i,item){
							$scope.WorkstreamCol.push({Title: item.Title,  ID:  item.ID});						
						})
					}				
				})
			}
			
		})		
		.catch (function error(message) {
            console.log('Failure: ' + message);
        });
		
		
		$scope.RunReport = function() { 
			$scope.parameters = {
				"workstream" : $scope.selectedWorkstream.ID ,
				"startdate" : $scope.startDate,
				"enddate" : $scope.endDate	
			  };
			$scope.runReport = true;			
			// list of active issues
			$scope.Issues = [];	
			$scope.Risks = [];
			$scope.OverdueTasks = [];
			$scope.CompletedTasksOver7days = [];
			$scope.CompletedTasksLast7days = [];
			
			issueService.getActiveIssues(currentSite,$scope.parameters.enddate)
			.then(function(res){
				var result = res.d.results;					
				if (result.length > 0){
					$.each(result,function(i,item){							
						if(jQuery.inArray($scope.parameters.workstream,item.WorkstreamsId.results) != -1){							
							$scope.Issues.push({Title: item.Title,  ID:  item.ID});	
						};					
					});	
				}
							
			})
			.catch (function error(message) {
				console.log('Failure: ' + message);
			});
			// list of risks
			
			riskService.getRisks(currentSite,$scope.parameters.enddate)
			.then(function(res){
				var result = res.d.results;					
				if (result.length > 0){				
					$.each(result,function(i,item){						
							if(jQuery.inArray($scope.parameters.workstream,item.WorkstreamsId.results) != -1){							
								$scope.Risks.push({Title: item.Title,  ID:  item.ID});	
							};					
						});				
				}
			})
			.catch (function error(message) {
				console.log('Failure: ' + message);
			});			
			// list of overdueTasks
			
			taskService.overdueTasks(currentSite,$scope.parameters.startdate,$scope.parameters.enddate)
			.then(function(res){
				var result = res.d.results;				
				if (result.length > 0){				
					$.each(result,function(i,item){							
							if(jQuery.inArray($scope.parameters.workstream,item.WorkstreamsId.results) != -1){
									var daysDuedate = "N/A";
									var endDate = new Date();
									if ($scope.parameters.enddate!=undefined && $scope.parameters.enddate!="")
										endDate = $scope.parameters.enddate;
									if (item.DueDate!=undefined && item.DueDate!="")
										daysDuedate = showDays(endDate,item.DueDate);																
									$scope.OverdueTasks.push({Title: item.Title,  ID:  item.ID, DaysPast: daysDuedate});	
							};
							
						});
					}
			})
			.catch (function error(message) {
				console.log('Failure: ' + message);
			});
			// list of completedTasksLast7days
			
			taskService.completedTasksLast7days(currentSite,$scope.parameters.startdate,$scope.parameters.enddate)
			.then(function(res){
				var result = res.d.results;
				if (!jQuery.isEmptyObject(result)){				
					$.each(result,function(i,item){							
							if(jQuery.inArray($scope.parameters.workstream,item.WorkstreamsId.results) != -1){							
								$scope.CompletedTasksLast7days.push({Title: item.Title,  ID:  item.ID});	
							};
							
						});
				}
			})
			.catch (function error(message) {
				console.log('Failure: ' + message);
			});
			// list of completedTasksOver7days
			
			taskService.completedTasksOver7days(currentSite,$scope.parameters.startdate,$scope.parameters.enddate)
			.then(function(res){
				var result = res.d.results;
				if (result.length > 0){				
					$.each(result,function(i,item){							
							if(jQuery.inArray($scope.parameters.workstream,item.WorkstreamsId.results) != -1){							
								$scope.CompletedTasksOver7days.push({Title: item.Title,  ID:  item.ID});	
							};
							
						});
				}
			})
			.catch (function error(message) {
				console.log('Failure: ' + message);
			});
		}
		
		
	}]);
	
	////// end WorkstreamReportController
})();

