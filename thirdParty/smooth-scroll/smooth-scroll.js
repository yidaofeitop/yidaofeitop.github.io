(function($) {
	"use strict";
	$(document).ready(function() {

		//dom elements
		var $homeLinks = $("a[href^='#']"),
		$body = $("html, body");

		//settings	
		var settings = {
			navOffset : 55,
			scrollTime : 1000
		};

		//events
		$homeLinks.on("click", clickOnHomeLinks);

		function moveToTarget(pos) {
			$body.stop().animate({scrollTop : pos - settings.navOffset}, settings.scrollTime);
		};

		//functions
		function clickOnHomeLinks(e) {
			var $this = $(this),
			//解决中文乱码问题
			target = decodeURIComponent(decodeURIComponent($this.attr("href"))), 
			targetPosition = $(target).offset().top;

			e.preventDefault();
			moveToTarget(targetPosition);
		};

	});
})(jQuery);