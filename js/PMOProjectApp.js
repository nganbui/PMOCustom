	'use strict';	
	var appWeb = _spPageContextInfo.webAbsoluteUrl.replace(/ /g, '%20');	
	angular.module('PMOReportBuilder',[])	
	.directive("datepicker", function () {
	  return {
			restrict: "A",
			require: "ngModel",
			link: function (scope, elem, attrs, ngModelCtrl) {
			  var updateModel = function (dateText) {
				scope.$apply(function () {
				  ngModelCtrl.$setViewValue(dateText);
				});
			  };
			  var options = {
				dateFormat: "mm/dd/yy",
				onSelect: function (dateText) {
				  updateModel(dateText);
				}
			  };
			  elem.datepicker(options);
			}
		  }
	})
	// Factory
	//base service
	.factory('baseService',["$http", "$q",function($http,$q){
		var urlBase = String.format("{0}/_api/Web/Lists", appWeb);
		
		var getRequest = function(listTitle,query){
		var url = String.format("{0}/getByTitle('{1}')/{2}", urlBase,listTitle,query); 
		var deferred = $q.defer();
		$http({
				url: url,
				method:'GET',
				headers:{
					"accept":"application/json;odata=verbose",
					"content-Type":"application/json;odata=verbose"
				}
			})
			.success(function(result) {
				deferred.resolve(result);				
			})
			.error(function(result, status) {
					deferred.reject(status);
			});
			return deferred.promise;
		};
		return { getRequest: getRequest};		
	}])
	//list workstream from root site PMO
	.factory("workstreamListService",["$http", "$q",function($http,$q){
		var rooturl = _spPageContextInfo.siteAbsoluteUrl + "/_api/Lists/GetByTitle('Project%20Workstreams')/Items?$Select=ID,Title";		
		
		var getListWorkstream = function(query){		
		var url = String.format("{0}{1}", rooturl, query);	
		var deferred = $q.defer();
		$http({
				url: url,
				method:'GET',
				headers:{
					"accept":"application/json;odata=verbose",
					"content-Type":"application/json;odata=verbose"
				}
			})
			.success(function(result) {
				deferred.resolve(result);
			})
			.error(function(result, status) {
					deferred.reject(status);
			});
			return deferred.promise;
		};		
		
		return {getListWorkstream: getListWorkstream};
		
	}])
	//Workstream Service
	.factory("workstreamService",['baseService',function(baseService){
		var listTitle = "Project%20Statement";
		var query = "Items?$select=WorkstreamsId";
		
		var getWorkstream = function(){			
			return baseService.getRequest(listTitle,query);
		};
		return {getWorkstream: getWorkstream};
	}])
	//Issue Service
	.factory('issueService',['baseService',function(baseService){	
		var listTitle = "Issues";		
		var getActiveIssues = function(endDate){
			var query = "Items?$select=ID,Title,DueDate,WorkstreamsId";
			if(endDate!=undefined && endDate!==""){
				var dEnd = new Date(endDate);
				var dEndISO = dEnd.toISOString();
				var filterQuery = String.format("$filter=Status eq 'Active' and DueDate le datetime'{0}'&$orderby=Reporting_x0020_Order desc", dEndISO);	
				query+= "&" + filterQuery;
			}			
			return baseService.getRequest(listTitle,query);			
		};
		return {getActiveIssues: getActiveIssues};
	}])
	//Risk Service
	.factory('riskService',['baseService',function(baseService){	
		var listTitle = "Risks";				
		var getRisks = function(endDate){
			var query = "Items?$select=ID,Title,WorkstreamsId";
			if(endDate!=undefined && endDate!==""){			
				var dEnd = new Date(endDate);
				var dEndISO = dEnd.toISOString();
				var filterQuery = String.format("$filter=DueDate le datetime'{0}'&$orderby=Reporting_x0020_Order desc", dEndISO);
				query+= "&" + filterQuery;
			}
			return baseService.getRequest(listTitle,query);
		};
		return {getRisks: getRisks};
	}])
	//Task Service
	.factory('taskService',['baseService',function(baseService){	
		var listTitle = "Tasks";		
		var Tasks = {};
		//tasks ne 'Completed' and DueDate < [End Date]
		Tasks.overdueTasks = function(startDate,endDate){
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
			
			return baseService.getRequest(listTitle,query);
		};
		//tasks eq 'Completed' and Modified between [End Date - 7] and [End Date]
		Tasks.completedTasksLast7days = function(startDate,endDate){
			var query = "Items?$select=ID,Title,Status,Created,DueDate,WorkstreamsId&$filter=Status eq 'Completed'";
			if(startDate!=undefined && startDate!==""){
				var dStart = new Date(startDate);
				var dStartISO = dStart.toISOString();
				query+= String.format(" and Created ge datetime'{0}'", dStartISO);
			}
			if(endDate!=undefined && endDate!=""){
				var dMinus7 = new Date(endDate);
				var ISOEndDate = dMinus7.toISOString();				
				dMinus7.setDate(dMinus7.getDate()-7);					
				var ISODateMinus7 = dMinus7.toISOString();				
				query+= String.format(" and Modified le datetime'{0}' and Modified ge datetime'{1}'", ISOEndDate, ISODateMinus7);//Modified between [End Date - 7] and [End Date]
			}	
				
			return baseService.getRequest(listTitle,query);
		};
		//tasks eq 'Completed' and //Modified <[End Date - 7]
		Tasks.completedTasksOver7days = function(startDate,endDate){
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
			}
			
			return baseService.getRequest(listTitle,query);
		};
		return Tasks;
	}])
	
	//controller
	.controller('ProjectController',['$scope','workstreamService','workstreamListService','issueService','riskService','taskService',function($scope,workstreamService,workstreamListService,issueService,riskService,taskService){		
		$scope.runReport = false;
		$scope.isDisabled = true;
		$scope.currentURL = appWeb;	
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
		workstreamService.getWorkstream()
		.then(function(res){			
			$scope.workstream = res.d.results[0].WorkstreamsId.results;
			
			var filter = "&$filter=";
			var filerColumn = "ID";	
			$.each($scope.workstream,function(index,item){												
				filter+= filerColumn + " eq " + item + " or "; 
				})
			var query = filter.slice(0,-4);
			$scope.WorkstreamCol = [];
			workstreamListService.getListWorkstream(query)
			.then(function(data){
				var result = data.d.results;
				if (result.length>0){
					$.each(result,function(i,item){
						$scope.WorkstreamCol.push({Title: item.Title,  ID:  item.ID});						
					})
				}				
			})
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
			
			issueService.getActiveIssues($scope.parameters.enddate)
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
			
			riskService.getRisks($scope.parameters.enddate)
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
			
			taskService.overdueTasks($scope.parameters.startdate,$scope.parameters.enddate)
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
			
			taskService.completedTasksLast7days($scope.parameters.startdate,$scope.parameters.enddate)
			.then(function(res){
				var result = res.d.results;
				if (result.length > 0){				
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
			
			taskService.completedTasksOver7days($scope.parameters.startdate,$scope.parameters.enddate)
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
		
		
	}])
	

