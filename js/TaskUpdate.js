function PreSaveAction() 
{ 
	var currentDate = new Date(),
	currentDateConvert = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' +  currentDate.getFullYear();
	var percentComplete = $("input[title='% Complete']").val(),
	taskStatus = $("select[title='Task Status'] option:selected").text(),
	actualEndDate = $("input[title='Actual End Date']");
	//alert(actualEndDate.val());
	if (percentComplete == 100 || taskStatus === 'Completed'){
		if (actualEndDate.val()=="")
			actualEndDate.val(currentDateConvert);				
	}
	//if ((percentComplete < 100 && (taskStatus === 'Completed' || taskStatus != 'Completed')) || (taskStatus !='Completed' && (percentComplete == 100 || percentComplete < 100)))
	else {
		actualEndDate.val("");		
	}	
	return true; 	
}
