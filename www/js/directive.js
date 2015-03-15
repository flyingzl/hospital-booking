angular.module('bookings.directive', [])
    .directive("vcode", ['bookingsConfig', function(config) {
        return {
            restrict: 'E',
            replace: true,
            template: '<img src="#" />',
            link: function($scope, $element) {
                var refreshCode = function() {
                    $element.attr("src", config.BASE_URL + config.VCODE + "?d=" + Math.random());
                };
                $scope.$on('modal.shown', function() {
                    refreshCode();
                });
                
                $element.attr("src", config.BASE_URL + config.VCODE)
                    .on('click', function(evt) {
                        refreshCode();
                    });

            }
        }
    }])