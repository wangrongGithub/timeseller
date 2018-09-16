/**
 * Created by fengziboboy on 2017/11/17.
 */
$(function() {

    clickEvent();
    //获取用户id
    var userId = getSearchValue(location.search, "id");

    /*设置点击事件*/
    function clickEvent() {
        /*点击头像*/
        $(".user-info-show .user-edit-btn").off("click").on("click", function() {
            var id = 1;
            location.href = "user-edit.html?id=" + id;
        });
    }

    $.get(ServerUrl + "my/showinfo/" + userId, function(datas) {
        if (datas.status == Status.Status_OK) {
            $.toast("数据获取成功");
            // 展示个人资料界面
            showUserInfo(datas.data);
        } else {
            $.toast("数据获取错误");
        }
    });

    // 展示个人数据
    function showUserInfo(datas) {
        // 判断访问页面者的是否为本人
        $.get(ServerUrl + "my/user", function(mydatas) {
            if (mydatas.status == Status.Status_OK) {
                if (datas[0].openid == mydatas.data[0].openid) {
                    init_show_data(datas, 1);
                } else {
                    init_show_data(datas, 0);
                }
            } else {
                $.toast("数据获取错误");
            }
        });
    }

    /*初始化界面*/
    function init_show_data(datas, isSelf) {
        $(".headimg").attr("src", datas[0].headimgurl);
        $("#user-name").text(datas[0].nickname);
        // 性别暂时只有男女
        $("#user-gender").text(datas[0].sex);

        // $("#user-address").text(datas[1].province);
        // $("#user-school").text(datas[1].schoolName);

        $("#user-address").text(datas[1] ? datas[1].province: "");
        $("#user-school").text(datas[1] ? datas[1].schoolName: "");

        //本人显示编辑按钮
        if (isSelf) {
            $("#user-tel").text(datas[0].phone);
            $("#user-tel").css("display", "block");
            $(".user-edit-btn").css("display", "block");
        }
        //如果用户没有上传学生证，使用默认提示图（也就是不变）
        if (datas[0].card != null) {
            var card_img = "../../../" + datas[0].card;
            $("#user-card-show img").attr("src", card_img);
        }
    }
});