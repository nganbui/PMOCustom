$(document).ready(function() { 
//$('#Risk_x0020_Factor_93848aac-040c-4ac2-a07d-1d52adbe0c3a_\\$NumberField').after(' <a href="http://pmo.opt-osfns.org/DashBoard/SFMPO/SFMProjectGovernance/_layouts/15/WopiFrame.aspx?sourcedoc=/DashBoard/SFMPO/SFMProjectGovernance/SiteAssets/SFM_Risk%20Log.xlsx&action=default" target="_blank">Click Me</a>');
$('#Risk_x0020_Factor_93848aac-040c-4ac2-a07d-1d52adbe0c3a_\\$NumberField').after(' <a href="#" onclick="showDialog(this);">Check Risk Matrix</a></br>');
$('#Risk_x0020_Factor_93848aac-040c-4ac2-a07d-1d52adbe0c3a_\\$NumberField').after('<div id="popupdiv" title="Basic modal dialog" style="display: none"><img style="width: 433px" height:"684" src="http://pmo.opt-osfns.org/DashBoard/PublishingImages/riskfactor1.png"></img><div>');
//$("select[title='Applicable Workstream possible values'] > option").remove();
//$('#Workstreams_79dc07d5-28a0-4014-8449-e871ae012af0_SelectCandidate > option').remove();
//$('#Workstreams_79dc07d5-28a0-4014-8449-e871ae012af0_SelectCandidate').append('<option value="5">item 5</option>') 
});

function showDialog(e) {
	$("#popupdiv").dialog({
title: "SFM Risk Matrix",
width: 520,
height: 800,
modal: true,
buttons: {
Close: function(event,ui) {
$(this).dialog('close');

}
/* create: function(event, ui) { 
    var widget = $(this).dialog("widget");
    $(".ui-dialog-titlebar-close", widget).css("background","#9BC4E2");
   } */
}
}).prev(".ui-dialog-titlebar").css("background","#9BC4E2");
}
 //var stsOpen = new ActiveXObject("SharePoint.OpenDocuments.3");
//stsOpen.ViewDocument3(window,"http://pmo.opt-osfns.org/DashBoard/SFMPO/SFMProjectGovernance/SiteAssets/SFM_Risk%20Log.xlsx",0,'');   

//var strLocation="http://pmo.opt-osfns.org/DashBoard/SFMPO/SFMProjectGovernance/SiteAssets/SFM_Risk%20Log.xlsx";
//if (window.ActiveXObject) {
     //   try {
      //      var objExcel;
    //        objExcel = new ActiveXObject("Excel.Application");
     //       objExcel.Visible = true;
     //       objExcel.Workbooks.Open(strLocation, true);
    //    }
   //     catch (e) {
  //          alert (e.message);
  //      }
//    }
 //       alert ("Your browser does not support this.");
 //   }

 //} 
