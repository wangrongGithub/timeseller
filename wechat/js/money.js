/**
 * Created by ALISURE on 2017/4/18.
 */
$(function () {
    /*先暂时弄成一次加载完的，因为涉及到月份。。。*/

    $("#wrapper ul").empty();
    $("#task-load-more").show();
    getMoneyHistory(function () {
        $("#task-load-more").hide();
    });

    function getMoneyHistory(callback) {
        /*联网获取数据*/
        $.get( ServerUrl + "my/moneyChange", function (data) {
            if(data.status == Status.Status_OK){
                $("#show-no-data").hide();
                show_data(data.data);
            }else{
                $("#show-no-data").show();
            }
            /*执行回调*/
            callback();
        });
    }

    function show_data(datas) {
        /*增加分割的标志*/
        var fenge_name = "";
        /*设置金币*/
        var $tasks = $("#wrapper ul");
        for (var i = 0; i < datas.length; i++) {
            /*设置分割*/
            var time_info = deal_time(datas[i].changeTime);
            if(time_info.top != fenge_name){
                fenge_name = time_info.top;
                $tasks.append(build_fenge(time_info.top));
            }
            /*需要将数据传给build()*/
            $tasks.append(build(datas[i], time_info));
        }
        /*设置点击事件*/
        $("#wrapper .money-wrapper .content").click(function () {
            var tid = $(this).attr("data-id");
            location.href = "task.html?id=" + tid;
        });
    }

    /*在这里组装item。为了解耦和，将任务item放到了html中，在这里把数据放到模板中，然后再把模板放到适当的位置*/
    function build(data, time_info) {
        /*对data进行处理*/
        var $html = $("#data");
        $html.find(".top").text(time_info.top);
        $html.find(".time").text(time_info.bottom);

        var $goldCoins = $html.find(".goldCoins");
        var goldCoins = parseInt(data.changeCoins);
        if(goldCoins >= 0){
            $goldCoins.text("+" + goldCoins);
            $goldCoins.addClass("zheng");
        }else{
            $goldCoins.text("-" + Math.abs(goldCoins));
            $goldCoins.addClass("fu");
        }
        $html.find(".reason").text(data.changeReason);
        $html.find(".content").attr("data-id", data.tid);
        return $html.html();
    }

    /*分割线*/
    function build_fenge(name) {
        var $fenge = $("#fenge");
        $fenge.find(".title").text(name);
        return $fenge.html();
    }

    function deal_time(time) {
        var result = {
            top: "",
            bottom: ""
        };
        if(time.length != 19){
            result.top = time;
            result.bottom = time;
            return result;
        }

        var date = new Date(Date.now());
        var now_year = date.getFullYear();
        var now_month = parseInt(date.getMonth()) + 1;
        var now_day = parseInt(date.getDay()) + 1;

        var money_year = time.substr(0, 4);
        var money_month = time.substr(5, 2);
        var money_day = time.substr(8, 2);

        if(now_year == money_year){ /*当年*/
            if(now_month == money_month){ /*当月*/
                if(now_day == money_day){ /*当天*/
                    result.top = "今天";
                    result.bottom = time.substr(11, 8);
                }else{
                    result.top = "本月";
                    result.bottom = time.substr(5, 11);
                }
            }else{
                result.top = (money_month >= 10 ? money_month : money_month.substr(1, 1)) + "月";
                result.bottom = time.substr(5, 11);
            }
        }else{
            result.top = money_year + "年";
            result.bottom = time.substr(5, 11);
        }
        return result;
    }

});
