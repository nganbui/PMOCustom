$(document).ready(function () {
	$('nobr:contains("Predecessors")').closest('tr').hide(); 
	CheckPermissionOnWeb();
	removeFunction();
    ApplicableWorkstream();
		var vars = [],
		hash;
		var q = document.URL.split('?')[1];
		if (q != undefined) {
			q = q.split('&');
			for (var i = 0; i < q.length; i++) {
				hash = q[i].split('=');
				vars.push(hash[1]);
				vars[hash[0]] = hash[1];
			}
		}
		 ProjectPhase();
		if (vars['RootFolder'] != undefined) 
		{
			if (vars['RootFolder'].length > 0) {
	
	             var cpp=vars['RootFolder'].split("%2D%20").pop();
				 var projectphasevalue=cpp.split("%2F")[0];
				 var finalValue=projectphasevalue.replace("%2D","-");
				 if(finalValue=="" || finalValue=="Controlling")
				 {
					 ProjectPhase();
				 }
			
				else
				{
						$("select[title='Current Project Phase']").val(finalValue);
						//  $("ms-rtestate-write ms-taxonomy-writeableregion ms-inputBox ms-inputBoxActive").val(vars['RootFolder'].split("%20").pop());
					
				}
			
		  
		}
		else
		    {
			ProjectPhase();
		    }
     }
	

	
	});
	
function CheckPermissionOnWeb() 
{
    context = new SP.ClientContext.get_current();

    web = context.get_web();

    this._currentUser = web.get_currentUser();

    context.load(this._currentUser);

    context.load(web,'EffectiveBasePermissions');

    context.executeQueryAsync(Function.createDelegate(this, this.onSuccessMethod), Function.createDelegate(this, this.onFailureMethod));  
}
function onSuccessMethod(sender, args) 
    {
        if (web.get_effectiveBasePermissions().has(SP.PermissionKind.managePermissions)) 
        {
           //$('select[title="Predecessors possible values"]').hide();
		   $('nobr:contains("Predecessors")').closest('tr').show(); 
        }
    }
	
	
function removeFunction()
{
	removeButton = $("input[id='Workstreams_79dc07d5-28a0-4014-8449-e871ae012af0_RemoveButton']");
	removeButton.click(function(){		 		
		ApplicableWorkstream();
	});
}
	
function ProjectPhase()
{
	 var targetURL = _spPageContextInfo.webAbsoluteUrl 

       var ApplicableWorkstreamRESTQuery=targetURL+"/_api/lists/getbytitle('Project Statement')/items?$select=Current_x0020_Stage";



  $.ajax(
  {
    cache: false,
    url: ApplicableWorkstreamRESTQuery,
    type: 'GET',
    dataType: 'json',
    async: false,
    headers: {
      "accept": "application/json;odata=verbose;charset=utf-8"
    }, // end of get
    success: function (data) 
    {   
    	$("select[title='Current Project Phase']").val(data.d.results[0].Current_x0020_Stage);
		//$('td.ms-formlabel:contains("Current Project Phase")').siblings(".ms-formbody").innerHtml(data.d.results[0].Current_x0020_Stage);
		
    }, //end of success			
    error: function ajaxError(response) 
    {
      alert(response.status + ' ' + response.statusText);
    } // end of error			
   
  }); //end of ajax
} 
function ApplicableWorkstream()
{

	   var targetURL = _spPageContextInfo.webAbsoluteUrl 

       var ApplicableWorkstreamRESTQuery=targetURL+"/_api/lists/getbytitle('Project Statement')/items?$select=WorkstreamsId";



  $.ajax(
  {
    cache: false,
    url: ApplicableWorkstreamRESTQuery,
    type: 'GET',
    dataType: 'json',
    async: false,
    headers: {
      "accept": "application/json;odata=verbose;charset=utf-8"
    }, // end of get
    success: function (data) 
    {   
      osuccess(data); 
    }, //end of success			
    error: function ajaxError(response) 
    {
      alert(response.status + ' ' + response.statusText);
    } // end of error			
   
  }); //end of ajax
  
  }
  function osuccess(odata)
{
   var purl = _spPageContextInfo.siteAbsoluteUrl + "/_api/lists/GetByTitle('Project Workstreams')/Items?$select=ID,Title";
   var res = odata.d.results;
   var arrayLength = res.length;
   for (var i = 0; i < arrayLength; i++) 
   {
    WorkstreamsId = res[i].WorkstreamsId.results;
    
   }
  
   $.ajax({
                    url: purl,
                    method: "GET",
                    headers: { "Accept": "application/json; odata=verbose" },
                    async: false,
                    success: function (data) { psuccess(data) }
                        ,
                    error: function (data) {
                        alert("Error: "+ JSON.stringify(data));
                    }
                });
//
  }
function psuccess(odata)
{ 
   $("select[Title='Applicable Workstream possible values'] option").remove();
   var res = odata.d.results;
   var arrayLength = WorkstreamsId.length;
   for (var i = 0; i < arrayLength; i++) 
   {
   var index = WorkstreamsId[i];
   var title = getTitle(res,index);
    $("select[Title='Applicable Workstream possible values']").append('<option value='+index+'>'+title+'</option>');
     $("select[Title='Applicable Workstream selected values'] option").each(function (i,selected) {
               str = $(selected).text();
   

             if(str.trim()==title.trim()) 

         {
            $("select[Title='Applicable Workstream possible values'] option[value='"+ $(this).val() +"']").remove();
          
 

         }
        //else
		// {
 
		  //    
      //  }
   });
   }
  }
function getTitle(oarray, index)
{
var arrayLength = oarray.length;
var ret = "";
for (var i = 0; i < arrayLength; i++) 
 {
  if(oarray[i].ID == index)
  {
    ret = oarray[i].Title;
   }
  }
return ret;
}
