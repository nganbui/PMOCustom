'use strict';
(function(){
	var app = angular.module("PMOStatus",['AppBaseModule']);		
	//var currentURL = _spPageContextInfo.webAbsoluteUrl;	
	var currentURL = "http://pmo.opt-osfns.org/DashBoard/";	
	app.controller("PMOStatusController",['$scope','$http','baseService',function($scope,$http,baseService){	
	//preparing status report data for all projects under DashBoard/		
	$scope.statusReports = [];	
	function getProject(data){
		var result = data.d.results;
		if (result!=undefined && result.length>0){
			$.each(result,function(i,item){					
				getProgram(item.Url);
				var count = item.ServerRelativeUrl.replace(/[^/]/g, '').length;	//check isProgram	
				if (count > 2 && item.Title.toLowerCase().indexOf("(po)") == -1){
					var statusReport = getReportfromProject(item.Url);
					if (statusReport.Week!="")
						$scope.statusReports.push({SiteURl: item.Url, Sitename: item.Title, StatusReport: statusReport});	
				}
				
				
		});
		}
				
	};
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
	
	getProgram(currentURL);
	
	function getReportfromProject(siteUrl){		
		var statusReport = {};
		var listTitle = "Status Report";
		var query = "items?$select=Id,Title,Health,Budget,Status_x0020_End_x0020_Date,PercentComplete&$top=1&$orderby=Status_x0020_End_x0020_Date desc";													
		var results = baseService.getRequest(siteUrl,listTitle,query);
		results.then(function(res){	
			if (res.d.results!=undefined && res.d.results.length>0){
				statusReport.Id = res.d.results[0].Id;
				statusReport.ReportUrl = siteUrl + "/Lists/Status%20Report/DispForm.aspx?ID=" + res.d.results[0].Id;
				statusReport.Name = res.d.results[0].Title;
				statusReport.Health = res.d.results[0].Health;
				statusReport.Budget = res.d.results[0].Budget;
				statusReport.PercentComplete = res.d.results[0].PercentComplete*100;
				statusReport.Week = res.d.results[0].Status_x0020_End_x0020_Date;
				statusReport.Week = res.d.results[0].Status_x0020_End_x0020_Date;
								
			}
			
			
		})
		.catch(function error(message){
			console.log("Error when get report: " + message);
		});
		return statusReport;
		
	};
	
	//getReportfromProject("http://devpmo.opt-osfns.org/DashBoard/PMOPO/ProjectorPhase1/");	
//alert(statusReport)	;
	
}]);

})();