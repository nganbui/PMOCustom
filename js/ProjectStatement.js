'use strict';
(function(){		
	var currentURL = _spPageContextInfo.webAbsoluteUrl;	
	currentURL = currentURL.replace(/ /g, '%20');		
	var msg = "Click link here to update";
	
	function getProjectStatement(siteURL, listTitle) {
		var projectInfo = {};
		var requestUrl = siteURL + "/_api/Web/Lists/getByTitle('" + listTitle + "')/" + "Items?$select=ID,Title,Project_x0020_Description,Current_x0020_Stage,Project_x0020_Status,WorkstreamsId,Project_x0020_Team/Title,Project_x0020_Manager/Title&$expand=Project_x0020_Team,Project_x0020_Manager&top=1";		
		//console.log(requestUrl);
		$.ajax({
		url:  requestUrl,
		method: "GET",
		headers: {
		"Accept": "application/json; odata=verbose"
		},
		success: function(response) {
			if (response.d.results!=undefined && response.d.results.length > 0){	
				projectInfo.ID = response.d.results[0]!=undefined? response.d.results[0].Id : "";			
				projectInfo.Title = response.d.results[0].Title!=null? response.d.results[0].Title : "";
				projectInfo.Description = response.d.results[0].Project_x0020_Description!=null? response.d.results[0].Project_x0020_Description : "";							
				projectInfo.Status = response.d.results[0]!=undefined? response.d.results[0].Project_x0020_Status : "";
				projectInfo.CurrentPhase = response.d.results[0]!=undefined? response.d.results[0].Current_x0020_Stage : null;
				projectInfo.ProjectManager = response.d.results[0].Project_x0020_Manager.Title!=null? response.d.results[0].Project_x0020_Manager.Title : null;	
				projectInfo.ProjectTeam = "";
				if (response.d.results[0].Project_x0020_Team.results!=null){
					$.each(response.d.results[0].Project_x0020_Team.results,function(i,item){
						projectInfo.ProjectTeam+= item.Title + "; ";
					})
					
				}
					
				projectInfo.Workstream = response.d.results[0]!=undefined? response.d.results[0].WorkstreamsId : "";	
				
			}
		},
		error: function(response) {
			console.log('error get Project Statement: ' + response + siteURL);
		},
		async: false
		});
		return projectInfo;		
	}
	function checkProjectStatement(){
		var resProjectInfo = getProjectStatement(currentURL,"Project%20Statement");
		//console.log(resProjectInfo);
		if ($.isEmptyObject(resProjectInfo)){
			$("#projectSummaryNotice").html("<span class=\"projSummaryNotice\"><i class=\"fa fa-cog fa-spin fa-3x fa-fw margin-bottom\"></i>  Please update the project information. All fields are missing.</span>");
			var link = currentURL + "/Lists/Project%20Statement/NewForm.aspx";
			$("#projectInfoLink").html('<span><a href=' + link + '>' + msg + '</a></span>');
		}
		else if (resProjectInfo.CurrentPhase == null || resProjectInfo.ProjectManager == null || resProjectInfo.ProjectTeam == "" || resProjectInfo.Workstream.results.length <=0){
			var missingFields = "";
			//var currentphase = resProjectInfo.CurrentPhase == null? "Current Project Phase" : "",
			//workstream = resProjectInfo.Workstream.results.length <=0 ? "Workstream" : "",
			//projectmanager = resProjectInfo.ProjectManager == null? "Project Manager" : "",
			//projectteam = resProjectInfo.ProjectTeam == ""? "Project Team" : "",
			if (resProjectInfo.CurrentPhase == null)
				missingFields+= " Current Project Phase,";
			if (resProjectInfo.Workstream.results.length <=0)
				missingFields+= " Workstream,";
			if (resProjectInfo.ProjectManager == null)
				missingFields+= " Project Manager,";
			if (resProjectInfo.ProjectTeam == "")
				missingFields+= " Project Team,";
			missingFields = missingFields.substring(0,missingFields.length-1);
			//missingFields = String.format("{0} {1} {2} {3} fields {4}", currentphase, workstream, projectmanager, projectteam, " are missing.");
			missingFields = String.format("{0} {1} ",missingFields, " are missing.");
			
			$("#projectSummaryNotice").html("<span class=\"projSummaryNotice\"><i class=\"fa fa-cog fa-spin fa-3x fa-fw margin-bottom\"></i>  Please update the project information, the " + missingFields + "</span>");
			var link = currentURL + "/Lists/Project%20Statement/EditForm.aspx?ID=" + resProjectInfo.ID;
			$("#projectInfoLink").html('<span><a href=' + link + '>' + msg + '</a></span>');			
		}
		else{
		  var link = currentURL + "/Lists/Project%20Statement/DispForm.aspx?ID=" + resProjectInfo.ID;
		  var html = 
          " <table  class=\"table table-striped table-condensed\">\n" +        
          "   <tbody>\n" +
          "     <tr>\n" +
          "       <td>Project Name</td>\n" +
          "       <td>" + resProjectInfo.Title + "</td>\n" +
          "     </tr>\n" +
		  "     <tr>\n" +
          "       <td>Project Description</td>\n" +
          "       <td>" + resProjectInfo.Description + "</td>\n" +
          "     </tr>\n" +
		  "     <tr>\n" +
          "       <td>Current Project Phase</td>\n" +
          "       <td>" + resProjectInfo.CurrentPhase + "</td>\n" +
          "     </tr>\n" +
		  "     <tr>\n" +
		  "       <td>Project Manager</td>\n" +
          "       <td>" + resProjectInfo.ProjectManager + "</td>\n" +
          "     </tr>\n" +
		  "     <tr>\n" +
          "       <td>Project Team</td>\n" +
          "       <td>" + resProjectInfo.ProjectTeam + "</td>\n" +
          "     </tr>\n" +
          "   </tbody>\n" +
          " </table>\n" +
		  " <div class=\"moreInfo\"><i class=\"fa fa-arrow-circle-right\" aria-hidden=\"true\"></i><a href='" + link + "'> More information</a></div>\n";
        
          
			$("#projectInfoLink").html("<div class=\"table-responsive\">" + html + "</div>");
		}
	}
	checkProjectStatement();    
	

})();
