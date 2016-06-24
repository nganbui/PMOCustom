(function(){		
			
			var currentSiteAbsoluteURL = "http://pmo.opt-osfns.org/DashBoard/";
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
			
			angular.module("PMOSummary",[])
			.controller("PMOSummaryController",['$scope',function($scope){			
			
			$scope.pmo = {'program':[],'status':[]};
			//define Project
			var Project = function (id, Name, SiteId, Url, ActiveTasks, TaskListUrl, ActiveIssues, IssuesListUrl, ActiveRisks, RisksListUrl, parentId) {
				this.id = id;
				this.Name = Name;
				this.Url = Url;					
				this.SiteId = SiteId;
				this.ActiveTasks = ActiveTasks;
				//this.TotalTasks = TotalTasks;
				this.TaskListUrl = TaskListUrl;
				this.ActiveIssues = ActiveIssues;
				//this.TotalIssues = TotalIssues;
				this.RisksListUrl = RisksListUrl;
				this.ActiveRisks = ActiveRisks;
				//this.TotalRisks = TotalRisks;
				this.IssuesListUrl = IssuesListUrl
				this.IsProgram = false;
				this.Children = 0;
				
				if (parentId !== null) {
					this.treeStructure = "treegrid-" + this.id + " treegrid-parent-" + parentId;
				} else {
					this.treeStructure = "treegrid-" + this.id ;
				}
			};
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
			};
			function getProjectsData(siteURL, isProjectSummaryUpdate, isStatusUpdate) {
				//Get all the subsites for the current sharepoint web of current logined user
				var requestUrl = siteURL + "/_api/web/webs?$select=title,id,url,TemplateId,effectivebasepermissions&$filter=effectivebasepermissions/high ne 0";
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
				});			
			};
			function successGetHierarchyFunction(data, isProjectSummaryUpdate, isStatusUpdate) {
				//Loop thru all webs
				var returnData = data.d.results;
				for (var i = 0; i < returnData.length; i++) {
					//Check if valid entry
					if (returnData[i] != undefined && returnData[i].Title != undefined) {						
							//Check if need to query for Project Information
							//if (isProjectSummaryUpdate) {
								//Make a call to get items from LIST
														
								
								// Call a method to figure of the parent of the current web
								
								//var parentId = getParentforProjectSummary(data.d.results[i].Url, ActiveTasks, TotalTasks, ActiveIssues, TotalIssues, ActiveRisks, TotalRisks);
								var parentId = getParentforProjectSummary(returnData[i].Url);
								//Create the object from the variables
								console.log('Parent ID ' + parentId);
								if (parentId!=null){
									var ActiveTasks = getListData(returnData[i].Url, "Tasks", "?$select=Id,Status&$filter=Status ne 'Completed'");								
									//var TotalTasks = 0;
									//Make a call to get items from LIST								
									//cREATE variables to be bound to model
									var ActiveIssues = getListData(returnData[i].Url, "Issues", "?$select=Id,Status&$filter=Status eq 'Active'");
									//var TotalIssues = 0;
									//Make a call to get items from LIST								
									var ActiveRisks = getListData(returnData[i].Url, "Risks", "?$select=Id,Priority&$filter=Priority eq 'High'");
									//var TotalRisks = 0;		
								}
								var project = new Project($scope.pmo.program.length + 1,
										returnData[i].Title,
										returnData[i].Id,
										returnData[i].Url,
										ActiveTasks,
										
										returnData[i].Url + "/Lists/Tasks",
										ActiveIssues,
										
										returnData[i].Url + "/Lists/Issues",
										ActiveRisks,
										
										returnData[i].Url + "/Lists/Risks",
										parentId);
								
								$scope.pmo.program.push(project);

							//}
							//Check if Status report needs to be fetched
							//if (isStatusUpdate) {	
							if (parentId!=null){
								var statusSummaryResults = getStatusData(returnData[i].Url, "Status Report", "?$select=Id,Title,Health,Budget,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Status_x0020_End_x0020_Date desc");								
								//var parentId = null;
								//Check the parent ID and put it in a variable
								if ($scope.pmo.status.length > 0) {
									var parentSiteId = getParent(returnData[i].Url);
									var idx = $.map($scope.pmo.status, function (item, i) {
											if (item.SiteId === parentSiteId)
												return i;
										})[0];
									if (idx != undefined) {
										parentId = $scope.pmo.status[idx].id;
									}
								}
								//Create an object if result is found
								if (returnData[i] != undefined) {
									if (statusSummaryResults.length > 0) {
									var status = new Status($scope.pmo.status.length + 1,
											returnData[i].Title,
											returnData[i].Id,
											returnData[i].Url,
											statusSummaryResults,
											parentId);
									//Push it into Model
									$scope.pmo.status.push(status);
									}

								}
							//}
							}
							//Recuursivelly calls for each web
							getProjectsData(returnData[i].Url, isProjectSummaryUpdate, isStatusUpdate);
						
					}
				}				
			};
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
						var returnData = data.d.results;
						//for (var i = 0; i < data.d.results.length; i++) {
							if (returnData[0] != undefined) {
								summary.push({
									Id : returnData[0].Id,
									Schedule : returnData[0].Health,
									Budget : returnData[0].Budget,
									PercentComplete : (returnData[0].PercentComplete * 100),
									Url : siteURL + "/Lists/" + listName + "/DispForm.aspx?ID=" + returnData[0].Id,
									Title : returnData[0].Title,									
									Week : returnData[0].Status_x0020_End_x0020_Date
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
				var requestUrl = siteURL + "/_api/lists/getByTitle('" + listName + "')/items" + select;
				var count = 0;
				$.ajax({
					url : requestUrl,
					type : "GET",
					dataType: "json",
					async : false,					
					headers : {
						"Accept" : "application/json;odata=verbose;charset=utf-8"
					},
					success : function (data) {
							var len = data.d.results.length;
							if (len > 0)
								count = len;
							console.log(count);
					},
					error : function () {
							console.log("Could not load the data. 1 "  + requestUrl);
					}
				});
				return count;
			}
			/*function getParentforProjectSummary(siteURL, ActiveTasks, TotalTasks, ActiveIssues, TotalIssues, ActiveRisks, TotalRisks) {
				var parentId = null;
				//Check if any item exists in modal
				if ($scope.pmo.program.length > 0) {
					// get parent ID(GUID) based on SITE URL
					var parentSiteId = getParent(siteURL);
					//Map the GUID from REST call to the GUID in existing model
					var idx = $.map($scope.pmo.program, function (item, i) {
							if (item.SiteId === parentSiteId)
								return i;
						})[0];
					if (idx != undefined) {
						//Get the ID based on GUID match
						parentId = $scope.pmo.program[idx].id;
						
						$scope.pmo.program[idx].ActiveTasks = ActiveTasks;
						$scope.pmo.program[idx].TotalTasks = TotalTasks;
						$scope.pmo.program[idx].TaskListUrl = $scope.pmo.program[idx].Url;
						$scope.pmo.program[idx].ActiveIssues = ActiveIssues;
						$scope.pmo.program[idx].TotalIssues = TotalIssues;
						$scope.pmo.program[idx].IssuesListUrl = $scope.pmo.program[idx].Url;
						$scope.pmo.program[idx].ActiveRisks = ActiveRisks;
						$scope.pmo.program[idx].TotalRisks = TotalRisks;
						$scope.pmo.program[idx].RisksListUrl = $scope.pmo.program[idx].Url;
						$scope.pmo.program[idx].IsProgram = true;
						$scope.pmo.program[idx].Children = $scope.pmo.program[idx].Children + 1;
						// Calls to support teo levels of programs
						getParentforProjectSummary($scope.pmo.program[idx].Url,
							$scope.pmo.program[idx].ActiveTasks,
							$scope.pmo.program[idx].TotalTasks,
							$scope.pmo.program[idx].ActiveIssues,
							$scope.pmo.program[idx].TotalIssues,
							$scope.pmo.program[idx].ActiveRisks,
							$scope.pmo.program[idx].TotalRisks);
					}
				}
				return parentId;
			};*/
			function getParentforProjectSummary(siteURL) {
				var parentId = null;
				//Check if any item exists in modal
				if ($scope.pmo.program.length > 0) {
					// get parent ID(GUID) based on SITE URL
					var parentSiteId = getParent(siteURL);
					//Map the GUID from REST call to the GUID in existing model
					var idx = $.map($scope.pmo.program, function (item, i) {
							if (item.SiteId === parentSiteId)
								return i;
						})[0];
					if (idx != undefined) {
						//Get the ID based on GUID match
						parentId = $scope.pmo.program[idx].id;
						
						
						$scope.pmo.program[idx].IsProgram = true;
						$scope.pmo.program[idx].Children = $scope.pmo.program[idx].Children + 1;
						// Calls to support teo levels of programs
						getParentforProjectSummary($scope.pmo.program[idx].Url);
					}
				}
				return parentId;
			};
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
			};
			
			
			
			//if (isStatusUpdate || isProjectSummaryUpdate) {
				
				getProjectsData(currentSiteAbsoluteURL, isProjectSummaryUpdate, isStatusUpdate);				
			//}
			/*if ($scope.pmo.program.length > 0) {	
				//Hide the spinner and show the other DIV
				projectSummaryLoader.hide();
				$('#projectSummaryContent').show();
				
			} else {
				projectSummaryLoader.text('Project information not found.');
			}
			if ($scope.pmo.status.length > 0) {
				statusReportLoader.hide();				
			} else {
				statusReportLoader.text('Status information not found.');
			}*/
			}])
						
			.directive('onRepeatDirective', function() {
			  return function(scope) {
			    //angular.element(element).css('color','blue');
			    if (scope.$last){
			      projectSummaryLoader.hide();
				  $('#projectSummaryContent').show();
				  //statusReportLoader.hide();
				  
				  console.log("im the last!");
			    }
			    
			  };
			})
			
			.directive('finishedRender', ['$timeout', function ($timeout) {  
				return {
					link: function (scope) {  
						var cmptl = function(){	
							
							$('.programTree').treegrid({
							expanderExpandedClass : 'fa fa-minus-circle',
							expanderCollapsedClass : 'fa fa-plus-circle',
							initialState : 'collapsed'		
							});							
							$(".treegrid-expanded").css("font-weight", "Bold");
							$(".treegrid-collapsed").css("font-weight", "Bold");
							
						}
						$timeout(cmptl,0);
						scope.$on("$destroy",function(event) {
                            $timeout.cancel(cmptl);
							}
						);
					}
				}
			}]);
			
		
	
})();