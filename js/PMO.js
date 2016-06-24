function replaceAnchorTagOnClickEventAndHref(aTag, siteURL, docTemplateURL, docLibraryURL) {
  aTag.click(function() {
	// Handle PMO home page hyperlink update to open new document instance based on content type (note - function lives in portal root common JS)
    createNewDocumentInstance(siteURL, docTemplateURL, docLibraryURL);
    return false;
  }); // End onclick event for aTag to open document in New Window
  
  aTag.attr("href", "#");
}

// function to replace the home page Anchor tages under "forms" to open new document instance based on default document template assigned to the corresponding content type
function replaceHomePagePMOFormsAnchorTags() {
  // Find the anchor tag that needs to be set with the onclick event
  var aTag = $("a:contains('New Goal')");
  if (aTag.length > 0) {
    replaceAnchorTagOnClickEventAndHref(aTag, 
      									"http://pmo.opt-osfns.org/", 
  		 								"http://pmo.opt-osfns.org/DoE%20Strategic%20Technology%20Plan%20Goals/Forms/StrategicTechnologyPlanGoal/Goal%20Template.docx", 
  										"http://pmo.opt-osfns.org/DoE%20Strategic%20Technology%20Plan%20Goals/");
  }
}

$(document).ready(function() {

  // replace the Anchor tags on home page
  replaceHomePagePMOFormsAnchorTags();

}); // end of document

