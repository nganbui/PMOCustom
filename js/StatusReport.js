
$(document).ready(function () {
	var Health = $("select[title='Health']");
	var Reason = $("div[id^='Reason']");
	if (Health.val() !== '(3) Critical') {
		Reason.closest('tr').hide();
	}
	Health.change(function () {
		if ($(this).val() === '(3) Critical') {
			Reason.closest('tr').show();
		}

	});
});
