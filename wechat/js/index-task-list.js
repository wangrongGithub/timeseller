/*
 * 任务类型和任务列表
 * */
$(function() {

    var page = 1;
    var page_size = 12;
    var type_id = 0;
    var sort_id = 1;
    var schoolName = ""; //学校
    var loading = true; //状态标记
    var over = false; // 当前类型没有任务了

    /*初始化排序*/
    initSort();
    /*先初始化学校和类型，完成后初始化任务列表*/
    initSchool(function() {
        initTaskList();
    }, function() {
        initTypeClick();
    });

    /*初始化排序*/
    function initSort() {
        /* 点击排序 */
        $("#indexSort div").click(function() {
            var sort_id_now = $(this).attr("data-id");
            if (sort_id_now == sort_id) return;
            sort_id = sort_id_now;
            $(this).addClass("current").siblings().removeClass("current");
            page = 1;
            over = false;
            initTaskGetTaskByPage();
        });

        /* 点击刷新 */
        $("#indexSortRight .page-refresh").click(function() {
            page = 1;
            over = false;
            initTaskGetTaskByPage();
        });
    }

    /*初始化学校*/
    function initSchool(callback_initTaskList, callback_typeClick) {
        /*获取类型数据*/
        $.get(ServerUrl + "school/getSchool", function(data) {
            if (data.status == Status.Status_NULL_Result || (data.status == Status.Status_OK && (!data.data.schoolName || data.data.schoolName.length <= 0))) {
                /*还没有选择学校*/
                change_school_alert();
            } else if (data.status == Status.Status_OK) {
                schoolName = data.data.schoolName;
                /*初始化学校*/
                $("#school").text(subString(schoolName, 4, "..."));
                /*设置学校的点击事件*/
                $("#change-school").click(function() {
                    change_school();
                });
                /*初始化学校之后，初始化类型*/
                initTaskType(callback_initTaskList, callback_typeClick);
            } else {
                $.toast("学校获取错误");
            }
        });
    }

    /*初始化类型*/
    function initTaskType(callback_initTaskList, callback_typeClick) {
        /*获取类型数据*/
        $.get(ServerUrl + "task/category", function(data) {
            if (data.status == Status.Status_OK) {
                var types = data.data;
                /*初始化类型*/
                var $sorHtml = $("#indexTaskTypeData");
                var $desHtml = $("#indexTaskTypeDataWrapper").empty();
                for (var i in types) {
                    $sorHtml.children("div").attr("data-id", types[i].catId);
                    $sorHtml.find("img").attr("src", types[i].categoryIcon);
                    $sorHtml.find("p").text(types[i].category);
                    $desHtml.append($sorHtml.html());
                }
                $desHtml.children().eq(0).addClass("current");
                type_id = types[0].id;

                /*类型的回调*/
                callback_typeClick();
                /*初始化类型之后，执行回调*/
                callback_initTaskList();
            } else {
                $.toast("数据获取错误");
            }
        });
    }

    /*设置点击事件*/
    function initTypeClick() {
        /* 点击类型 */
        $("#indexTaskTypeDataWrapper").children("div").on("click", function() {
            var id = $(this).attr("data-id");
            if (id == type_id) return;
            type_id = id;
            $(this).addClass("current").siblings().removeClass("current");
            /*刷新*/
            page = 1;
            over = false;
            initTaskGetTaskByPage();
        });
    }

    /*初始化任务列表*/
    function initTaskList() {
        /*初始化*/
        initTaskGetTaskByPage();

        $("body").infinite().on("infinite", function() {
            /*如果当前类型没有结束，则继续*/
            if (!over) {
                if (loading) return;
                page += 1;
                initTaskGetTaskByPage();
            }
        });

    }

    function initTaskGetTaskByPage() {
        loading = true;
        if (page == 1) {
            $("#task-list").empty();
        }
        $("#task-load-more").show();
        $("#show-no-data").hide();

        getTaskByPage(page, page_size, type_id, sort_id, schoolName, function() {
            loading = false;
            $("#task-load-more").hide();
        });
    }

    /* 获取数据并显示 */
    function getTaskByPage(page, size, type_id, sort_id, school, callback) {
        if (over) {
            callback();
        }

        /*联网获取数据*/
        $.get(ServerUrl + "task/taskhall", {
            page: page,
            pageSize: size,
            type: type_id,
            sortType: sort_id,
            school: school
        }, function(data) {
            if (data.status == Status.Status_OK) {
                var datas = data.data;
                var $goods = $("#task-list");
                /*刷新*/
                if (page == 1) $goods.empty();

                for (var i = 0; i < datas.length; i++) {
                    /*需要将数据传给build()*/
                    var item = build(datas[i]);
                    console.log(datas[i]);

                    $goods.append(item);
                }

                over = false;
                $("#show-no-data").hide();
                /*设置点击事件*/
                clickEvent();

            } else {
                over = true;
                if (page == 1) {
                    $("#show-no-data").show();
                }
                /* 显示没有任务了 */
                // $.toast("没有更多任务了", "text");
            }
            callback();
        });
    }

    /*在这里组装item*/
    /*为了解耦和，将任务item放到了html中，在这里把数据放到模板中，然后再把模板放到适当的位置*/
    function build(data) {
        /*对data进行处理*/
        var $html = $("#taskData");
       if (data.pub == null) {
           return
        }
        $html.find(".image img").attr("src", data.pub.headimgurl);
        $html.find(".money span").text(data.coins);
        $html.find(".name").text(subString(data.pub.nickname, 3, "..."));
        $html.find(".type").text(data.category.category);
        $html.find(".title").text(subString(data.title, 14, "..."));
        $html.find(".time-content").text(data.pubTime);
        $html.find(".describe p").text(data.content);
        //暂时解决无地址item页面偏移问题
        if (data.place.length == 0) {
            $html.find(".place span").text("未填写地址");
        } else {
            $html.find(".place span").text(subString(data.place, 24, "..."));
        }
        $html.find(".right-goods").attr("data-id", data.tid);
        $html.find(".left-user").attr("data-user", data.pubId);
        return $html.html();
    }

    /*设置点击事件*/
    function clickEvent() {
        /*点击goods*/
        $("#taskWrapper .goods-wrapper .content .right-goods").off("click").on("click", function() {
            var id = $(this).attr("data-id");
            location.href = "task.html?id=" + id;
        });

        /*点击头像*/
        $("#taskWrapper .goods-wrapper .content .left-user .image").off("click").on("click", function() {
            var user = $(this).parent().attr("data-user");
            location.href = "user-show.html?id=" + user;
        });
    }
});