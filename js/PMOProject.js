(function(){
	var overrideCtx = {};
	overrideCtx.Templates = {};
	overrideCtx.Templates.Fields = {
		'Title':{'View':hideColumn}		
	};
	SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();
function hideColumn(ctx){	
	// value of the current field
	//var currentValue = ctx.CurrentFieldValue;
	// the list item object
	//var item = ctx.CurrentItem;
	// get the schema for the field
	//var field = ctx.CurrentFieldSchema;
	var fieldVal = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];
	return "<div>hello</div>";
}