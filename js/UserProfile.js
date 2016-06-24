  $(document).ready(function(){
    var fullname = $("input[title='Full Name']")
	lastname = $("input[title='Last Name']")
	email =  $("input[title='Email Address']")
	title =  $("input[title='Job Title']")
	company =  $("input[title='Company']")
	webpage =  $("input[title='Web Page']")
	businessphone =  $("input[title='Business Phone']")
	mobilephone =  $("input[title='Mobile Number']")
	address =  $("textarea[title='Address']")
	//city =  $("input[id='City']")
	accountName = $("input[title='Project Contact Name']")
	username = $("input[id='Project_x0020_Contact_x0020_Name_6e43516d-723e-4e86-801f-cebcc9edd303_$ClientPeoplePicker_HiddenInput']");
	siteCollectionURL = _spPageContextInfo.siteAbsoluteUrl;
	
	accountName.blur(function(){
		if (username!=undefined && username[0]!=undefined){
			console.log(username[0]);
			if (username[0].defaultValue!=null){
				var json = JSON.parse(username[0].defaultValue);
				console.log(json);
				console.log(json[0].Key);
				var targetUser = json[0].Key;
				if (targetUser.indexOf("|")>0)
					targetUser = targetUser.substring(targetUser.indexOf("|")+1);
				//targetUser = targetUser.replace(/\\/g,"\\\\");
				console.log(targetUser);
				//var userProfileURL = "http://pmo.opt-osfns.org/_api/SP.UserProfiles.PeopleManager/getpropertiesfor(@v)?@v='optdev\nbui'";
				var userProfileURL = siteCollectionURL + "/_api/SP.UserProfiles.PeopleManager/getpropertiesfor(@v)?@v=" + "'" + targetUser + "'";					
				$.ajax({
				  url: userProfileURL,
				  type: "GET",
				  headers: { "accept": "application/json;odata=verbose" },
				  success: function (data) {
							   if (data.d!=undefined){
									fullname.val(data.d.DisplayName); 
									email.val(data.d.Email);
									title.val(data.d.Title);					
									webpage.val(data.d.PersonalUrl);
									var last_name = data.d.UserProfileProperties!=undefined ? data.d.UserProfileProperties.results[6].Value : "";						
									var workphone = data.d.UserProfileProperties!=undefined ? data.d.UserProfileProperties.results[10].Value : "";
									var deparment = data.d.UserProfileProperties!=undefined ? data.d.UserProfileProperties.results[11].Value : "";
									var city = data.d.UserProfileProperties!=undefined ? data.d.UserProfileProperties.results[52].Value : "";						
									lastname.val(last_name); 
									businessphone.val(workphone);
									company.val(deparment);
									//city.val(city);												
									console.log(data.d);
							   }
						},
					error: function (data) {
						console.log(JSON.stringify(data));
					}
				});	
			}
				
		}
	  });
  });
	
 
    							
