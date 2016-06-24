function replaceAnchorTagOnClickEventAndHref(aTag, siteURL, docTemplateURL, docLibraryURL) {
  aTag.click(function() {
	// Handle appdev home page hyperlink update to open new document instance based on content type (note - function lives in portal root common JS)
    createNewDocumentInstance(siteURL, docTemplateURL, docLibraryURL);
    return false;
  }); // End onclick event for aTag to open document in New Window
  
  aTag.attr("href", "#");
}

// function to replace the home page Anchor tages under "forms" to open new document instance based on default document template assigned to the corresponding content type
function replaceHomePageAppDevFormsAnchorTags() {
  // Find the anchor tag that needs to be set with the onclick event
  var aTag = $("a:contains('Meeting Minutes Status')");
  if (aTag.length > 0) {
	 var targetURL = _spPageContextInfo.webAbsoluteUrl +  "/Shared%20Documents";
    replaceAnchorTagOnClickEventAndHref(aTag, 
      									"http://pmo.opt-osfns.org/", 
  		 								"http://pmo.opt-osfns.org/Templates/Forms/PMO Meeting Minutes/Meeting_Minutes.docx", 
  										targetURL);
  } 
  
}

$(document).ready(function() {

  // replace the Anchor tags on home page
  replaceHomePageAppDevFormsAnchorTags();
  
  
}); // end of document

	