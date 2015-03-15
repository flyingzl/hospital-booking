angular.module('bookings.filters', [])

.filter("weekFormat", function(){

	return function( date ){

		var weekdays = {
			"0" : "星期天",
			"1" : "星期一",
			"2" : "星期二",
			"3" : "星期三",
			"4" : "星期四",
			"5" : "星期五",
			"6" : "星期六"
		}

		return date  + weekdays[moment( date ).format( 'd' )];
	}

})