angular.module('bookings.controllers', [])

.controller('HospitalCtrl', function($scope) {
    $scope.hospitals = [{
        "hostName": "\u56db\u5ddd\u7701\u4eba\u6c11\u533b\u9662",
        "hostNo": "001"
    }, {
        "hostName": "\u56db\u5ddd\u5927\u5b66\u534e\u897f\u533b\u9662",
        "hostNo": "002"
    }, {
        "hostName": "\u56db\u5ddd\u5927\u5b66\u534e\u897f\u7b2c\u4e8c\u533b\u9662",
        "hostNo": "007"
    }, {
        "hostName": "\u56db\u5ddd\u7701\u5987\u5e7c\u4fdd\u5065\u9662",
        "hostNo": "006"
    }, {
        "hostName": "\u56db\u5ddd\u5927\u5b66\u534e\u897f\u53e3\u8154\u533b\u9662",
        "hostNo": "005"
    }, {
        "hostName": "\u6210\u90fd\u4e2d\u533b\u836f\u5927\u5b66\u9644\u5c5e\u533b\u9662.\u56db\u5ddd\u7701\u4e2d\u533b\u9662",
        "hostNo": "008"
    }, {
        "hostName": "\u6210\u90fd\u519b\u533a\u603b\u533b\u9662",
        "hostNo": "003"
    }, {
        "hostName": "\u6210\u90fd\u5e02\u7b2c\u4e00\u4eba\u6c11\u533b\u9662",
        "hostNo": "009"
    }, {
        "hostName": "\u6210\u90fd\u5e02\u7b2c\u4e8c\u4eba\u6c11\u533b\u9662",
        "hostNo": "004"
    }, {
        "hostName": "\u53cc\u6d41\u7b2c\u4e00\u4eba\u6c11\u533b\u9662",
        "hostNo": "122"
    }, {
        "hostName": "\u56db\u5ddd\u7701\u9aa8\u79d1\u533b\u9662\u6210\u90fd\u4f53\u80b2\u533b\u9662",
        "hostNo": "121"
    }, {
        "hostName": "\u90fd\u6c5f\u5830\u4eba\u6c11\u533b\u9662",
        "hostNo": "014"
    }]
})


.controller("DeptsCtrl", function($scope, $stateParams, BookingsService, LoadingService) {
    LoadingService.show('正在加载医院门诊……');
    BookingsService.getDepts($stateParams.hostNo).then(function(items) {
        LoadingService.hide();
        $scope.depts = items;
        $scope.hostNo = $stateParams.hostNo;
    });
})

.controller('DoctorsCtrl', function($scope, $stateParams, BookingsService, LoadingService) {
    $scope.hostNo = $stateParams.hostNo;
    $scope.deptNo = $stateParams.deptNo;
    $scope.deptName = $stateParams.deptName;
    LoadingService.show('正在加载医生列表……');

    BookingsService.getDoctors($scope.hostNo, $scope.deptNo, $scope.deptName)
        .then(function(items) {
            LoadingService.hide();
            $scope.doctors = items;
        });
})

.controller("ScheduleCtrl", function($scope, $stateParams, $ionicModal, BookingsService, LoadingService) {

    var hostNo = $stateParams.hostNo,
        doctorName = $scope.doctorName = $stateParams.doctorName,
        deptName = $scope.deptName = $stateParams.deptName,
        parseHTML = function(html) {
            var re = /<(.*)>/;
            if (!re.test(html)) {
                $scope.errorMessage = "账号异常,请尝试用3G/4G网络访问！";
                return [];
            }

            var splitRegexp = /(.*)\((\d+)\)/,
                result = [];
            var $elements = angular.element(html).find("p");
            for (var index = 0, l = $elements.length; index < l; index++) {
                var $element = $elements.eq(index),
                    text = $element.text(),
                    matches = text.match(splitRegexp),
                    item = {};
                item['date'] = matches[1];
                item["remaining"] = parseInt(matches[2], 10);
                if (item["remaining"] == 0) continue;
                item['workId'] = $element.find("a").attr("id").split("_")[2];
                item["time"] = $element.parent().parent().children().eq(0).text();
                result.push(item);
            }

            result = result.sort(function(a, b) {
                return b['remaining'] - a['remaining'];
            });
            return result;
        };

    $scope.reloadSchedules = function(refresh) {
        !refresh && LoadingService.show("正在加载医生出诊时间……")
        BookingsService.getSchedulesForDoctor(hostNo, deptName, doctorName)
            .then(function(html) {
                !refresh && LoadingService.hide();
                $scope.schedules = parseHTML(html);
                if( !$scope.errorMessage && $scope.schedules.length == 0 ){
                    $scope.infoMessage = "来迟了，已经全被预约了！";
                }
                refresh && $scope.$broadcast('scroll.refreshComplete');
            });
    }

    $scope.book = function(schedule) {
        $scope.modal.show();
    }

    $scope.hideModal = function() {
        $scope.modal.hide();
    }

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.reloadSchedules();

    $ionicModal.fromTemplateUrl('templates/bookings-booking.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });


})

.controller('HistoryCtrl', function($scope, BookingsService, LoadingService, storage) {

    var userInfo = storage.get('userInfo') || {
            cardNo: '0002492136',
            userName: '姜姝婷'
        },
        parseHTML = function(html) {
            var $element = angular.element(html),
                $elements = $element.find("tr"),
                result = [];

            angular.forEach($elements, function($tr, index) {
                if (index == 0) return;
                var $children = angular.element($tr).find("td"),
                    item = {};
                item["dept"] = $children.eq(1).text();
                item["doctorName"] = $children.eq(2).text();
                item["date"] = $children.eq(4).text();
                item["status"] = $children.eq(5).text();
                result.push(item);
            });

            return result;
        };

    if (!userInfo) {
        $scope.errorMessage = "请设置用户信息";
        return;
    }

    $scope.reloadHistory = function(refresh) {
        !refresh && LoadingService.show('正在加载预约历史……');
        refresh && $scope.$broadcast('scroll.refreshComplete');
        BookingsService.getRegHistory(userInfo["cardNo"], userInfo["userName"])
            .then(function(html) {
                !refresh && LoadingService.hide();
                $scope.histories = parseHTML(html);
            })
    }

    $scope.reloadHistory();

});