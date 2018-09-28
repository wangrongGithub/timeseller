/**
 * Created by ALISURE on 2017/5/22.
 */
$(function() {

    var link_params = [
        { link_id: 1, link_text: "微信号", link_input_type: "text" },
        { link_id: 2, link_text: "QQ号", link_input_type: "number" },
        { link_id: 3, link_text: "手机号", link_input_type: "number" }
    ];

    /* 状态参数 */
    var status = {
        statusCode: 0, /* 返回的状态码 */

        error: 0, /* 出现问题 */
        pub_accept: 1, /* 接手状态：用户是发布者 */
        rec_accept: 2, /* 接手状态：用户是路人 */
        pub_execute: 3, /* 进行中：用户是发布者 */
        rec_execute: 4, /* 进行中：用户是接手者 */
        pub_cancel: 5, /* 取消：用户是发布者 */
        rec_cancel: 6, /* 取消：用户是接手者 */
        pub_completed: 7, /* 已经完成：用户是发布者 */
        rec_completed: 8, /* 已经完成：用户是接手者 */
        pub_end: 9, /* 结束：用户是发布者 */
        rec_end: 10 /* 结束：用户是接手者 */
    };

    /* 获取任务ID */
    var taskId = getSearchValue(location.search, "id");
    /*是否来自模板*/
    var fromTemplate = getSearchValue(location.search, "from") != "";

    /* 执行入口 */
    getData(function(datas) {
        console.log(datas);
        var task = datas.task;
        /* 预处理数据：处理私密信息和联系方式 */
        // task.catId != 4 表示不是组队
        if (status.statusCode == status.rec_accept && (task.catId != 4)) { /* 接手状态：用户是路人 */
            // task.words = "***************（接手后才可见)";
            task.task_link_select = link_params[0].link_text;
            task.task_link_input = "********（接手后才可见)";
        } else { /* 其他情况完全显示联系方式 */
            if (task.weixin) {
                task.task_link_select = link_params[0].link_text;
                task.task_link_input = task.weixin;
            } else if (task.qq) {
                task.task_link_select = link_params[1].link_text;
                task.task_link_input = task.qq;
            } else if (task.telephone) {
                task.task_link_select = link_params[2].link_text;
                task.task_link_input = task.telephone;
            }
            /*显示接收人信息*/
            var rec_info = task.rec;
            if (rec_info && rec_info != null) {
                show_rec_info(rec_info);
            }
        }

        /* 初始化界面 */
        init_data(task);
        /* 初始化按钮 */
        init_status_and_operation(task);
        /* 初始化图片 */
        if(task.images!=""&&task.images!=null){
            task.images=task.images.slice(1).split(";");
            console.log(task.images);
            init_image(task.images);
        }
    });

    function getData(callback_deal_data) {
        $.get(ServerUrl + "task/task/" + taskId, function(data) {
            if (data.status == Status.Status_OK) {
                status.statusCode = data.data.statusCode;
                if (status.statusCode != status.error && data.data.task && data.data.task != null) { /* 处理数据 */
                    callback_deal_data(data.data);
                    return;
                }
            }
            $.alert("任务不存在", function() {
                closeWindowOrBack(fromTemplate);
            });
        });
    }

    /* 初始化界面 */
    function init_data(datas, type) {
        $("#publish-wrapper").show();

        $("#pub-icon img").attr("src", datas.pub.headimgurl);
        $("#pub-goldCoins span").text(datas.pub.goldCoins);
        $("#pub-nickname").text(subString(datas.pub.nickname, 5, "..."));

        $("#task-name-detail").text(datas.title);
        $("#task-describe-detail").text(datas.content);
        // $("#task-secret-detail").text(datas.words);
        $("#task-time-begin-detail").text(datas.startTime);
        $("#task-time-end-detail").text(datas.endTime);
        $("#task-type-detail").text(datas.category.category);
        $("#task-place-detail").text(datas.place);
        $("#task-money-detail").text(datas.coins);
        $("#task-other-money-detail").text(datas.rewards.length == 0 ? "无" : datas.rewards);

        /* 设置联系方式 */
        var $select = $("#task-link-select-detail");
        var $content = $("#task-link-content-detail");
        var $method = $("#task-link-method-detail");
        $select.text(datas.task_link_select).parent().show();
        $method.text(datas.task_link_select).parent().show();
        $content.text(datas.task_link_input).parent().show();

        /*设置头像可点击*/
        $("#publish-wrapper .left-user .image").click(function() {
            location.href = "user-show.html?id=" + datas.pubId;
        });
      // 如果任务类型是“组队”，就隐藏接手按钮
        if(datas.category.category=="组队"){
            $(".weui-btn-area").attr("style","display:none;");
        }
    }

    /* 初始化按钮 */
    function init_status_and_operation(task) {
        var time = "";
        if (status.statusCode == status.error) { /*行为不正常*/
            /*不会执行到这里*/
        } else if (status.statusCode == status.pub_accept) { /* 接手状态：用户是发布者 */
            $("#operation1").text("取消").click(function() {
                $.confirm("确定要取消吗？", function() {
                    service_cancel(taskId);
                });
            });
        } else if (status.statusCode == status.rec_accept) { /* 接手状态：用户是路人 */
            $.get(ServerUrl + "my/user", function(res){
                console.log(res);
                var coin=res.data[0].goldCoins;
                if(coin<10){
                    $.alert("金币小于10不能接手任务")
                    setTimeout(function(){
                        location.href="index.html";
                    },3000)
                }
            })
            $("#operation1").text("接手").click(function() {
                $.confirm("确定要接手任务吗？", function() {
                    service_accept(taskId);
                });
            });
        } else if (status.statusCode == status.pub_execute) { /* 进行中：用户是发布者 */
            set_status_info("进行中", "接手时间", deal_time(task.recTime));
            $("#operation1").text("正在进行中，不能取消").click(function() {
                $.alert("正在进行中，您可以联系接手者，随时掌握动态");
                closeWindowOrBack(fromTemplate);
            });
        } else if (status.statusCode == status.rec_execute) { /* 进行中：用户是接手者 */
            set_status_info("进行中", "接手时间", deal_time(task.recTime));
            $("#operation1").text("确认完成").click(function() {
                $.confirm("确定要确认完成吗？", function() {
                    service_ack(taskId);
                });
            });
            $("#operation2").text("取消").show().click(function() {
                $.confirm("确定要取消吗？", function() {
                    service_cancel(taskId);
                });
            });
        } else if (status.statusCode == status.pub_completed) { /* 已经完成：用户是发布者 */
            set_status_info("请确认", "完成时间", deal_time(task.recCompleteTime));
            $("#operation1").text("接手者已经完成，请确认").click(function() {
                service_ack(taskId);
            });
        } else if (status.statusCode == status.rec_completed) { /* 已经完成：用户是接手者 */
            set_status_info("等待确认", "完成时间", deal_time(task.recCompleteTime));
            $("#operation1").text("已经完成，等待发布者确认").click(function() {
                $.confirm(fromTemplate ? "关闭页面？" : "返回上一页？", function() {
                    closeWindowOrBack(fromTemplate);
                });
            });
        } else if (status.statusCode == status.pub_cancel) { /* 已经取消：用户是发布者 */
            time = deal_time(task.pubCancelTime);
            if(time.length <= 5){time = deal_time(task.recCancelTime);}
            set_status_info("已取消", "取消时间", time);
            $("#operation1").text("已经取消").click(function() {
                $.confirm(fromTemplate ? "关闭页面？" : "返回上一页？", function() {
                    closeWindowOrBack(fromTemplate);
                });
            });
        } else if (status.statusCode == status.rec_cancel) { /* 已经取消：用户是接手者 */
            time = deal_time(task.recCancelTime);
            if(time.length <= 5){time = deal_time(task.pubCancelTime);}
            set_status_info("已取消", "取消时间", time);
            $("#operation1").text("已经取消").click(function() {
                $.confirm(fromTemplate ? "关闭页面？" : "返回上一页？", function() {
                    closeWindowOrBack(fromTemplate);
                });
            });
        } else if (status.statusCode == status.pub_end) { /* 已经结束：用户是发布者 */
            set_status_info("已结束", "结束时间", deal_time(task.pubCompleteTime));
            $("#operation1").text("任务已结束").click(function() {
                $.confirm(fromTemplate ? "关闭页面？" : "返回上一页？", function() {
                    closeWindowOrBack(fromTemplate);
                });
            });
        } else if (status.statusCode == status.rec_end) { /* 已经结束：用户是接手者 */
            set_status_info("已结束", "结束时间", deal_time(task.pubCompleteTime));
            $("#operation1").text("任务已结束").click(function() {
                $.confirm(fromTemplate ? "关闭页面？" : "返回上一页？", function() {
                    closeWindowOrBack(fromTemplate);
                });
            });
        }
    }

    /*处理时间*/
    function deal_time(time) {
        return (time != null && time.length >= 11) ? time.substr(5, 11) : "";
    }

    /* 初始化图片 */
    function init_image(items) {
        if (items == null) {
            $("#uploaderFiles-num-detail").text("无");
            $("#uploaderFiles-detail").empty()
        } else {
            // items = items.split("ALISURE");
            var html = "";
            for (var i in items) {
                items[i] = ServerUrl + items[i].split("\\").join("/");
                html += "<li class=\"weui-uploader__file\" style=\"background-image:url(" + items[i] + "\")></li>";
            }
            $("#uploaderFiles-num-detail").text(items.length);
            $("#uploaderFiles-detail").empty().append(html);
            /*设置查看图片*/
            look_image(items);
        }
    }

    /* 查看图片 */
    function look_image(items) {
        /*设置图片浏览*/
        var look_image = $.photoBrowser({
            items: items,
            onSlideChange: function(index) {},
            onOpen: function() {},
            onClose: function() {}
        });

        /*点击图片，进入图片浏览模式*/
        $("#uploaderFiles-detail li").click(function() {
            var index = $(this).index();
            location.hash = "gallery";
            look_image.open(index);
        });

    }

    /*显示接单者的信息*/
    function show_rec_info(rec_info) {
        $("#rec-info").show();
        $("#rec-info .head img").attr("src", rec_info.headimgurl);
        $("#rec-info .nickname span").text(rec_info.nickname);
        var link = "";
        if (rec_info.phone != null && rec_info.phone.length > 0) {
            link = "手机号：" + rec_info.phone;
        } else if (rec_info.weixin != null && rec_info.weixin.length > 0) {
            link = "微信号：" + rec_info.weixin;
        } else if (rec_info.qq != null && rec_info.qq.length > 0) {
            link = "QQ号：" + rec_info.qq;
        }
        $("#rec-info .link").text(link.length > 0 ? link : "没有设置联系方式");
        /*设置头像可点击*/
        $("#rec-info .head img").click(function() {
            location.href = "user-show.html?id=" + rec_info.uid;
        });
    }

    function set_status_info(left_status, right_str, right_time) {
        $("#rec-info .left").text(left_status);
        var $right = $("#rec-info .right>div");
        $right.eq(0).text(right_str);
        $right.eq(1).text(right_time);
    }

    /* 接手任务 */
    function service_accept(id) {
        $.post(ServerUrl + "task/takeOver/" + id, function(data) {
            if (data.status == Status.Status_OK) { /* 接手成功 */
                $.alert("接手成功", function() {
                    location.reload(true);
                });
            } else {
                $.alert("接手失败", function() {
                    history.back();
                });
            }
        });
    }
    /* 确认任务完成 */
    function service_ack(id) {
        $.get(ServerUrl + "task/taskStatus/" + id, {
            means: 0
        }, function(data) {
            if (data.status == Status.Status_OK) { /* 成功 */
                $.alert("确认成功", function() {
                    location.reload(true);
                });
            } else {
                $.alert(fromTemplate ? "确认失败，关闭页面" : "确认失败，返回上一页", function() {
                    closeWindowOrBack(fromTemplate);
                });
            }
        });
    }
    /* 取消 */
    function service_cancel(id) {
        $.get(ServerUrl + "task/taskStatus/" + id, {
            means: 1
        }, function(data) {
            if (data.status == Status.Status_OK) { /* 成功 */
                $.alert("取消成功", function() {
                    location.reload(true);
                });
            } else {
                $.confirm(fromTemplate ? "取消失败，关闭页面?" : "取消失败，返回上一页?", function() {
                    closeWindowOrBack(fromTemplate);
                });
            }
        });
    }

});