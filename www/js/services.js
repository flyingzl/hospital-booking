angular.module('bookings.services', [])

.factory('LoadingService', ['$ionicLoading', function($loading) {

    return {

        show: function(text) {
            text = text || '正在加载数据...'
            $loading.show({
                template: '<ion-spinner icon="android" class="spinner"></ion-spinner>' + '<span>' + text + '</span>'
            });
        },

        hide: function() {
            $loading.hide();
        }
    }

}])

.factory('BookingsService', ['$http', '$q', 'LoadingService', 'bookingsConfig',
    function($http, $q, loading, config) {

        var sendRequest = function(action, params) {
            var defer = $q.defer(),
                url = config.BASE_URL + config.ACTION + action;
            params['d'] = +new Date();

            $http.get(url, {
                params: params
            }).success(function(items) {
                defer.resolve(items);
            }).error(function() {
                loading.hide();
            });

            return defer.promise;
        };

        return {

            // 获取指定医院的部门列表
            getDepts: function(hostNo) {
                var params = {
                    hosNo: hostNo
                };
                return sendRequest(config.DEPT_ACTION_URL, params);
            },

            // 获取指定医院下指定部门的医生列表
            getDoctors: function(hostNo, deptNo, deptName) {
                var params = {
                    hosNo: hostNo,
                    deptNo: deptNo,
                    deptName: deptName
                };
                return sendRequest(config.DOCTER_ACTION_URL, params);

            },

            // 获取医生的日程安排
            getSchedulesForDoctor: function(hostNo, deptName, doctorName) {
                var params = {
                    hosid: hostNo,
                    docid: doctorName,
                    deptid: deptName
                };
                return sendRequest(config.DOCTER_SCHEDULE, params);
            },

            // 获取用户预订记录
            getRegHistory: function(cardNo, userName) {
                var params = {
                    cardno: cardNo,
                    type: 1,
                    name: userName
                };

                return sendRequest(config.USER_REG_LIST, params);
            },

            // 校验一卡通卡号是否正确合法
            validateCardNo: function(hostNo, cardNo) {
                var params = {
                    hosNo: hostNo,
                    hosCard: cardNo
                };
                
                return sendRequest(config.VALID_CARD, params);
            },

            // 预约医生
            bookDoctor: function( params ){

                return sendRequest(config.REG_URL, params);
            }
        }
    }
])

.factory("storage", ["$window", function($window) {

    var storage = $window.localStorage;

    return {

        get: function(key) {
            var value = storage.getItem(key);
            try {
                value = JSON.parse(value);
            } catch (e) {}
            return value;
        },

        set: function(key, value) {
            angular.isObject(value) && (value = JSON.stringify(value));
            storage.setItem(key, value);
        }
    }

}]);
