$(function() {

    // 设置点击投诉事件
    isComplaint();
    /* keyup事件 */
    check_form();
    /* 提交事件 */
    submit_form();

    //获取用户id
    var taskId = getSearchValue(location.search, "tid");
    //评价或者投诉类型,1:发布者->接手者  2:接手者->发布者
    var comType = getSearchValue(location.search, "type");

    var $oStar = $("#star");
    var aLi = $oStar.find("li");
    var oUl = $oStar.find("ul")[0];
    var oSpan = $oStar.find("span")[1];
    var oP = $oStar.find("p")[0];
    var i = iScore = iStar = 0;
    var aMsg = [
        "很不满意|我非常不爽",
        "不满意|不好不好",
        "一般|一般",
        "满意|还不错",
        "非常满意|服务特别好"
    ]
    for (i = 1; i <= aLi.length; i++) {
        aLi[i - 1].index = i;
        //鼠标移过显示分数
        aLi[i - 1].onmouseover = function() {
            fnPoint(this.index);
            //浮动层显示
            oP.style.display = "block";
            //计算浮动层位置
            oP.style.left = oUl.offsetLeft + this.index * this.offsetWidth - 104 + "px";
            //匹配浮动层文字内容
            oP.innerHTML = "<em><b>" + this.index + "</b> 分 " + aMsg[this.index - 1].match(/(.+)\|/)[1] + "</em>" + aMsg[this.index - 1].match(/\|(.+)/)[1]
        };
        //鼠标离开后恢复上次评分
        aLi[i - 1].onmouseout = function() {
            fnPoint();
            //关闭浮动层
            oP.style.display = "none"
        };
        //点击后进行评分处理
        aLi[i - 1].onclick = function() {
            iStar = this.index;
            oP.style.display = "none";
            oSpan.innerHTML = "<strong id='comment-grade'>" + (this.index) + " 分</strong> (" + aMsg[this.index - 1].match(/\|(.+)/)[1] + ")"
        }
    }
    //评分处理
    function fnPoint(iArg) {
        //分数赋值
        iScore = iArg || iStar;
        for (i = 0; i < aLi.length; i++) aLi[i].className = i < iScore ? "on" : "";
    }

    // 投诉开关
    function isComplaint() {
        $("#isComplaint").click(function() {
            $("#complaint-content").toggle();
        });

    }

    /*处理表单，keyup事件*/
    function check_form() {
        // 评价描述
        $("#comment-describe").keyup(function() {
            var value = $(this).val();
            /*实时设置长度*/
            $("#comment-describe-length").text(value.length);
            /*检查长度是否超过限制*/
            if (value.length > 200) {
                $(this).val(value.substr(0, 200));
                $("#comment-describe-length").text(200);
                $.alert("请简单评价，不超过200字");
            }
        });
        // 投诉描述
        $("#complaint-describe").keyup(function() {
            var value = $(this).val();
            /*实时设置长度*/
            $("#complaint-describe-length").text(value.length);
            /*检查长度是否超过限制*/
            if (value.length > 200) {
                $(this).val(value.substr(0, 200));
                $("#complaint-describe-length").text(200);
                $.alert("请简单描述投诉内容，不超过200字");
            }
        });
    }

    /*提交表单*/
    function submit_form() {

        /* 提交评论*/
        $("#comment-submit").click(function() {

            /*获取并组装表单项*/
            var datas = {
                tid: taskId,
                commentGrade: ($("#comment-grade").val() * 2), //数据库分数范围1-10
                commentContent: $("#comment-describe").val(),
                commentType: comType
            };

            /*检查表单项*/

            /*如果没有选择评分，不能发表评论*/
            if ("undefined" == typeof($("#comment-grade").val())) {
                alert("请选择评分星数");
            } else {
                /*上传服务器*/
                $.confirm("确定提交评价吗？", function() {
                    uploadCommentData(datas);
                });
            }

        });

        /* 提交评论*/
        $("#complaint-submit").click(function() {
            /*如果没有足够的金币，不能发布任务*/

            /*获取并组装表单项*/
            var datas = {
                tid: taskId,
                commentContent: $("#complaint-describe").val(),
                complaintType: comType
            };
            /*如果没有选择评分，不能发表投诉*/
            if ("undefined" == typeof($("#complaint-describe").val())) {
                alert("投诉内容不能为空");
            } else {
                /*上传服务器*/
                $.confirm("确定提交投诉吗？", function() {
                    uploadComplaintData(datas);
                });
            }

        });
    }

    // 提交评价表单
    function uploadCommentData(datas) {

        $.showLoading("评价提交中");
        $.post(ServerUrl + "comment/comment/" + taskId, datas, function(data) {
            $.hideLoading();
            if (data.status == Status.Status_OK) {
                $.alert("评价成功", function() {
                    location.href = ServerUrl + "web/wechat/view/personCenter.html";
                });
            } else {
                $.alert("啊哦~评价失败", function() {

                });
            }
        });
    }

    // 提交投诉表单
    function uploadComplaintData(datas) {

        $.showLoading("投诉提交中");
        $.get(ServerUrl + "comment/complaint/" + taskId, datas, function(data) {
            $.hideLoading();
            if (data.status == Status.Status_OK) {
                $.alert("投诉成功", function() {
                    location.href = ServerUrl + "web/wechat/view/personCenter.html";
                });
            } else {
                $.alert("啊哦~投诉失败，请重新尝试，或者直接发投诉内容到公众号，客服会处理的哦", function() {

                });
            }
        });
    }
});