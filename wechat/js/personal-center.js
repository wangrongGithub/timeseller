/**
 * Created by fengziboboy on 2017/5/22.
 */
/*
 * 个人中心
 * */
$(function() {

    // 设置点击事件
    clickEvent();
    // 任务和发布之间切换
    alterNavbar();



    // 获取个人信息
    $.get(ServerUrl + "my/user", function(datas) {
        if (datas.status == Status.Status_OK) {
            $.toast("数据获取成功");
            // 展示个人资料界面
            initUserInfoAtCenter(datas.data);

        } else {
            $.toast("数据获取错误");
        }
    });
    /**初始化用户中心处的简要用户信息 */
    function initUserInfoAtCenter(datas) {
        $("#user_golds").text(datas[0].goldCoins);
        $(".personal-main-top-user-img img").attr("src", datas[0].headimgurl);
        $(".personal-main-top-user-img").attr("user-id", datas[0].uid);
        $("#user-name").text(datas[0].nickname);
        if (datas[0].sex == "女") {
            $(".personal-main-top-username img").attr("src", "../img/personCenter/gender-girl.png")
        }
        $("#user-school").text(datas[1].schoolName);
        $("#user-school").attr("school-id", datas[1].schoolId);
         if (datas[2]) {
                $(".btn").attr("class", "btn true");
                //再获取一次数据
        
            }else{
                $(".btn").attr("class", "btn false");
        }
    }

    /*设置页面顶部点击事件*/
    function clickEvent() {
        /*点击头像*/
        $(".personal-main-top-user .personal-main-top-user-img").off("click").on("click", function() {
            var id = $(this).attr("user-id");
            location.href = "user-show.html?id=" + id;
        });
        // 点击签到
       $(".btn").click(function () {
           var userId = $(".personal-main-top-user-img").attr("user-id");
            $.get(ServerUrl + "my/signIn/" + userId, function(datas) {
                if (datas.status == Status.Status_OK) {
                    $.alert("签到成功", function(){
                        $.get(ServerUrl + "my/user", function (datas) {
                            if (datas.status == Status.Status_OK) {
                                $.toast("数据获取成功");
                                // 展示个人资料界面
                                initUserInfoAtCenter(datas.data);
                            } else {
                                $.toast("数据获取错误");
                            }
                        });
                    });
                };
            });
        });    
        /*点击账户值*/
        $(".tiaozhuan").off("click").on("click", function() {
            location.href = "money.html";
        });

    }



    /* * * * * * * * * *
     * 我的任务列表加载
     * * * * * * * * * */
    $(function() {
        /*联网获取数据*/
        $.get(ServerUrl + "my/myTask", function(taskDatas) {
            if (taskDatas.status == Status.Status_OK) {
                $.toast("数据获取成功");
                /*初始化任务列表*/
                initTaskList(taskDatas);
            } else if (taskDatas.status == Status.Status_NULL_Result) {
                $.toast("没有任何任务");
                $("#user-task-load-more").hide();
                $("#task-show-no-data").show();
            } else {
                $.toast("数据获取错误/无任务");
            }
        });
        /**任务状态 */
        var taskTypes = [
            { typeId: 1, typeImage: "../img/personCenter/taskDoing.png", typeName: "未完成" },
            { typeId: 2, typeImage: "../img/personCenter/taskDone.png", typeName: "已完成" },

        ];


        /*初始化任务列表*/
        function initTaskList(datas) {
            /*初始化*/
            initTaskGetTaskByPage(datas);
            var loading = true; //状态标记

            $("#tab3").infinite(200).on("infinite", function() {
                if (loading) return;
                datas.page += 1;
                initTaskGetTaskByPage(datas);
            });

        }

        function initTaskGetTaskByPage(datas) {
            taskLoading = true;
            if (datas.page == 1) {
                $("#user-task-list").empty();

            }
            $("#user-task-load-more").show();
            getTaskByPage(datas, function() {
                taskLoading = false;
                $("#user-task-load-more").hide();
            });
        }


        function getTaskByPage(taskDatas, callback) {
            setTimeout(function() {
                /*获取展示页面数据*/

                var $goods = $("#user-task-list");
                /*刷新*/
                if (taskDatas.page == 1) $goods.empty();

                var taskDatasDetail = taskDatas.data;
                if (taskDatasDetail.length == 0) {
                    $("#user-publish-load-more").css("display", "none");
                }
                for (var i = 0; i < taskDatasDetail.length; i++) {
                    /*需要将数据传给buildTask()*/
                    var item = buildTask(taskDatasDetail[i]);
                    $goods.append(item);
                }

                // 设置点击事件
                clickEvent();
                callback();
            }, 1000);
        }

        /*在这里组装task item*/
        /*为了解耦和，将任务item放到了html中，在这里把数据放到模板中，然后再把模板放到适当的位置*/
        function buildTask(data) {
            /*对taskDatasDetail进行处理*/
            var $html = $("#userTaskData");
            $html.find(".personal-mytask-content-body").attr("myTask-id", data.tid);
            if ((data.recStateId == 1) || (data.recStateId == 2)) {
                $html.find(".personal-mytask-content-rightTop").css(({ "background": "", "background-size": "" }));
                $html.find(".personal-mytask-content-leftTop").css(({ "background": "url(../img/personCenter/taskDoing.png)", "background-size": "100%" }));
            } else {
                $html.find(".personal-mytask-content-leftTop").css(({ "background": "", "background-size": "" }));
                $html.find(".personal-mytask-content-rightTop").css(({ "background": "url(../img/personCenter/taskDone.png)", "background-size": "100%" }));

            }
            $html.find(".title").text(data.title.length > 10 ? data.title.substr(0, 10) + "..." : data.title);
            $html.find(".type img").attr("src", "../img/personCenter/categoryType-" + data.category.catId + ".png");;
            $html.find(".type p").text(data.category.category);
            $html.find(".describe p").text(data.content);
            return $html.html();
        }

        /*设置点击事件*/
        function clickEvent() {
            /*点击 任务 goods*/
            $("#userTaskWrapper .user-goods-wrapper .personal-mytask-content .personal-mytask-content-body").off("click").on("click", function() {
                var taskId = $(this).attr("myTask-id");
                location.href = "task.html?id=" + taskId;
            });

            /*点击任务item的操作*/
            $("#userTaskWrapper .user-goods-wrapper .personal-mytask-content .personal-mytask-content-body .top .operation").off("click").on("click", function() {
                //弹出对话框
                var opertionTaskId = $("#userTaskWrapper .user-goods-wrapper .personal-mytask-content .personal-mytask-content-body").attr("myTask-id");
                $.get(ServerUrl + "my/myTask", function(datas) {
                    if (datas.status == Status.Status_OK) {
                        var taskDatas = datas.data;
                        for (var i = 0; i < taskDatas.length; i++) {
                            /*需要将数据传给buildTask()*/
                            if (taskDatas[i].tid == opertionTaskId) var desTask = i;
                        }
                        if (taskDatas[desTask].recStateId == 4) {
                            // $.actions({
                            //     title: "选择操作",
                            //     onClose: function() {
                            //         console.log("close");
                            //     },
                            //     actions: [{
                            //         text: "评论",
                            //         className: 'color-primary',
                            //         onClick: function() {
                            //             location.href = "comment.html?tid=" + taskDatas[desTask].tid;
                            //         }
                            //     }]
                            // });
                        } else if (taskDatas[desTask].recStateId == 2) {
                            $.actions({
                                title: "选择操作",
                                onClose: function() {
                                    console.log("close");
                                },
                                actions: [{
                                        text: "编辑",
                                        className: "color-warning",
                                        onClick: function() {
                                            location.href = "modifyTask.html" + taskDatas[i].tid;;
                                        }
                                    },
                                    {
                                        text: "取消",
                                        className: 'color-danger',
                                        onClick: function() {
                                            $.alert("你选择了“取消”");
                                        }
                                    }
                                ]
                            });
                        } else {
                            $.actions({
                                title: "选择操作",
                                onClose: function() {
                                    console.log("close");
                                },
                                actions: [{
                                        text: "发布",
                                        className: "color-primary",
                                        onClick: function() {
                                            $.alert("发布成功");
                                        }
                                    },
                                    {
                                        text: "编辑",
                                        className: "color-warning",
                                        onClick: function() {
                                            $.alert("你选择了“编辑”");
                                        }
                                    }
                                ]
                            });
                        }
                    } else {
                        $.toast("数据获取错误");
                    }
                });

                //防止点击事件冒泡触发
                stopBubbling(event);
            });

        }

    });


    /* * * * * * * * * * *
     * 我的发布列表加载
     * * * * * * * * * */
    $(function() {

        $.get(ServerUrl + "my/myPub", function(pubDatas) {
            if (pubDatas.status == Status.Status_OK) {
                $.toast("数据获取成功");
                /*初始化发布列表*/
                initPublishList(pubDatas);

            } else if (pubDatas.status == Status.Status_NULL_Result) {
                $.toast("没有任何发布");
                $("#user-publish-load-more").hide();
                $("#publish-show-no-data").show();
            } else {
                $.toast("数据获取错误/无任务");
            }
        });

        /*初始化发布列表*/
        function initPublishList(pubDatas) {
            /*初始化*/
            var loading = true;
            initGetPublishByPage(pubDatas);

            $("#tab3").infinite(200).on("infinite", function() {
                if (loading) return;
                pubDatas.page += 1;
                initGetPublishByPage(pubDatas);
            });

        }

        function initGetPublishByPage(datas) {
            pubLoading = true;
            if (datas.page == 1) {
                $("#user-publish-list").empty();
            }
            $("#user-publish-load-more").show();
            getPublishByPage(datas, function() {
                pubLoading = false;
                $("#user-publish-load-more").hide();
            });
        }


        function getPublishByPage(datas, callback) {

            setTimeout(function() {

                var $goods = $("#user-publish-list");
                /*刷新*/
                if (datas.page == 1) $goods.empty();
                var pubDatasDetail = datas.data;

                for (var i = 0; i < pubDatasDetail.length; i++) {
                    /*需要将数据传给build()*/
                    var item = buildPub(pubDatasDetail[i]);
                    $goods.append(item);
                }

                // 设置点击事件
                clickEvent();
                callback();
            }, 1000);
        }

        /*在这里组装item*/
        /*为了解耦和，将发布item放到了html中，在这里把数据放到模板中，然后再把模板放到适当的位置*/
        function buildPub(data) {
            /** 发布状态 */
            var stutusTypes = [
                { typeId: 0, typeImage: "../img/personCenter/pubWaitDo.png", typeName: "待接手" },
                { typeId: 1, typeImage: "../img/personCenter/pubDoing.png", typeName: "进行中" },
                { typeId: 2, typeImage: "../img//personCenter/pubCancel.png", typeName: "已取消" },
                { typeId: 3, typeImage: "../img/personCenter/pubDone.png", typeName: "已完成" },
				
				{ typeId: 4, typeImage: "../img/personCenter/pubDone.png", typeName: "已完成" },
                { typeId: 5, typeImage: "../img/personCenter/outdate.png", typeName: "已过期" }

            ];
            /*对data进行处理*/
            var $html = $("#userPublishData");
            //获取的状态只有描述没有编号，所以用到了这句转换
            $html.find(".personal-mypub-content-body").attr("myPub-id", data.tid);
            $html.find(".status-image img").attr("src", stutusTypes[data.pubStateId - 1].typeImage);
            $html.find(".status-name").text(stutusTypes[data.pubStateId - 1].typeName);
            $html.find(".title").text(data.title.length > 10 ? data.title.substr(0, 10) + "..." : data.title);
            $html.find(".type img").attr("src", "../img/personCenter/categoryType-" + data.category.catId + ".png");;
            $html.find(".type p").text(data.category.category);
            $html.find(".describe p").text(data.content);
            return $html.html();
        }
        /*设置点击事件*/
        function clickEvent() {
            /*点击 发布 goods*/
            $("#userPublishWrapper .user-goods-wrapper .personal-mypub-content .personal-mypub-content-body").off("click").on("click", function() {
                var pubId = $(this).attr("myPub-id");
                location.href = "task.html?id=" + pubId;
            });

            /*点击发布item的操作,不同状态的任务，操作内容选项不一样*/
            $("#userPublishWrapper .user-goods-wrapper .personal-mypub-content .personal-mypub-content-body .operation").off("click").on("click", function() {
                //弹出对话框
                var opertionPubId = $("#userPublishWrapper .user-goods-wrapper .personal-mypub-content .personal-mypub-content-body").attr("myPub-id");
                $.get(ServerUrl + "my/myPub", function(datas) {
                    if (datas.status == Status.Status_OK) {
                        var pubDatas = datas.data;

                        for (var i = 0; i < pubDatas.length; i++) {
                            /*需要将数据传给buildTask()*/
                            if (pubDatas[i].tid == opertionPubId) {
                                var desPub = i
                            };
                        }
                        if (pubDatas[desPub].pubStateId == 4) {
                            // $.actions({
                            //     title: "选择操作",
                            //     onClose: function() {
                            //         console.log("close");
                            //     },
                            //     actions: [{
                            //         text: "评论",
                            //         className: 'color-primary',
                            //         onClick: function() {
                            //             location.href = "comment.html?tid=" + pubDatas[desPub].tid;
                            //         }
                            //     }]
                            // });
                        } else if (pubDatas[desPub].pubStateId == 2) {
                            $.actions({
                                title: "选择操作",
                                onClose: function() {
                                    console.log("close");
                                },
                                actions: [{
                                        text: "编辑",
                                        className: "color-warning",
                                        onClick: function() {
                                            location.href = "modifyTask.html?tid=" + pubDatas[desPub].tid;
                                        }
                                    },
                                    {
                                        text: "取消任务",
                                        className: 'color-danger',
                                        onClick: function() {
                                            $.alert("你选择了“取消”");
                                        }
                                    }
                                ]
                            });
                        } else {
                            $.actions({
                                title: "选择操作",
                                onClose: function() {
                                    console.log("close");
                                },
                                actions: [{
                                        text: "发布",
                                        className: "color-primary",
                                        onClick: function() {
                                            $.alert("发布成功");
                                        }
                                    },
                                    {
                                        text: "编辑",
                                        className: "color-warning",
                                        onClick: function() {
                                            location.href = "modifyTask.html?tid=" + pubDatas[desPub].tid;
                                        }
                                    }
                                ]
                            });
                        }
                    } else {
                        $.toast("数据获取错误");
                    }
                });

                //防止点击事件冒泡触发
                stopBubbling(event);
            });
        }
    });

    /* 切换 任务和发布 navBar */
    function alterNavbar() {
        var ITEM_ON = "personal-main-top-navbar-item-on";

        var showTab = function(a) {
            var $a = $(a);
            if ($a.hasClass(ITEM_ON)) return;
            var href = $a.attr("href");

            if (!/^#/.test(href)) return;

            $a.parent().find("." + ITEM_ON).removeClass(ITEM_ON);
            $a.addClass(ITEM_ON);

            var bd = $a.parents(".weui-tab").find(".personal-main-bottom");

            bd.find(".personal-task--active").removeClass("personal-task--active");

            $(href).addClass("personal-task--active");
        }

        $.showTab = showTab;

        $(document).on("click", ".personal-main-top-navbar-item", function(e) {
            var $a = $(e.currentTarget);
            var href = $a.attr("href");
            if ($a.hasClass(ITEM_ON)) return;
            if (!/^#/.test(href)) return;

            e.preventDefault();

            showTab($a);
        });

    }

    //防止点击事件冒泡触发
    function stopBubbling(e) {
        e = window.event || e;
        if (e.stopPropagation) {
            e.stopPropagation(); //阻止事件 冒泡传播
        } else {
            e.cancelBubble = true; //ie兼容
        }
    }

});