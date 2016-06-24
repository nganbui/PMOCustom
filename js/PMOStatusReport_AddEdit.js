var PMOStatusTitle = null;
var PMOStatusWeekEnding = null;
var PMOStatusCurrentPhase = null;
var PMOStatusPercentComplete = null;
var PMOStatusProjectStatusComments = null;
var PMOStatusBody = null;
var PMOStatusActivitiesPlanned = null;
function PreSaveAction() {
	var BWSiteURL = null;
	//get BW URL from Project Statement
	getListItems(_spPageContextInfo.webAbsoluteUrl, "Project%20Statement", "?$select=BW%5Fx0020%5FSite%5Fx0020%5FLink", function (data) {
		if (data.d.results.length > 0) {
			BWSiteURL = data.d.results[0].BW_x0020_Site_x0020_Link;
			addCrossDomainListItem(BWSiteURL, 'Project Status Reports', {
				'WeekEnding' : PMOStatusWeekEnding.val(),
				'Title' : PMOStatusTitle.val(),
				'CurrentPhase' : PMOStatusCurrentPhase.val(),
				'PercentComplete' : PMOStatusPercentComplete.val(),
				'ProjectStatusComments' : PMOStatusProjectStatusComments.val(),
				'Body' : PMOStatusBody.val(),
				'ActivitiesPlanned' : PMOStatusActivitiesPlanned.val()
			}, function (data) {
				console.log(JSON.stringify(data));
			},
				function (data) {
				return confirm("Status Report could not be pushed to BW. Please confirm if you still want to save the status report in this site?");
			});
		} else {
			alert("Please enter the Project Statement before adding a status report");
			return false;
		}
	},
		function (data) {
		alert("There was an error reading Project Statement. Please contact AppDev Sharepoint Team.");
		return false;
	});
	//
return true;
}

// document DOM Ready Function
$(document).ready(function () {
	PMOStatusTitle = $("input[title='Title']");
	PMOStatusWeekEnding = $("input[title='Week Ending']"); ;
	PMOStatusCurrentPhase = $("select[title='Current Stage']");
	PMOStatusProjectStatusComments = $("textarea[title='Status Report Comments']");
	PMOStatusBody = $("textarea[title='Major Accomplishments']");
	PMOStatusActivitiesPlanned = $("textarea[title='Major Activities Planned']");
	PMOStatusPercentComplete = $("input[title='% Complete']"); ;
});
