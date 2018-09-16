/**
 * Created by ALISURE on 2017/5/22.
 */
/* 搜索框 */
$(function () {

    var param = {
        page: 1,
        loading: true,  //状态标记
        over: false,  // 当前类型没有任务了
        search: ""
    };

    initEvent();
    initPrompt();
    initSearch();

    /*初始化事件*/
    function initEvent() {
        /*获取焦点*/
        $(document).ready(function () {
            $("#searchInput").focus();
        });

        /*点击软键的搜索按钮*/
        $("#search-form").submit(function () {
            var $search_input = $("#searchInput");
            var search = $search_input.val();
            if(search.length == 0) search = $search_input.attr("data-default");
            /* 启动搜索过程 */
            beginSearch(search);
            return false;
        });
        /*点击清空按钮*/
        $("#searchClear").click(function () {
            $("#searchInput").val("");
            $("#searchInput").focus();
            /*更新搜索*/
            updatePrompt();
        });
        /*当内容改变时*/
        $("#searchClear").change(function () {
            var value = $("#searchInput").val();
            if(value.length == 0) $("#searchClear").hide(); else $("#searchClear").show();
        });

        /*点击取消按钮*/
        $("#searchCancel").click(function () {
            history.go(-1);
        });
    }

    /* 初始化搜索提示 */
    function initPrompt() {
        /*初始化*/
        init();
        /*初始化*/
        function init() {
            /* 默认不显示历史搜索 */
            $("#historySearch").hide();
            $("#historySearchContent").hide();
            /* 默认不显示常用搜索 */
            $("#commonSearch").hide();
            $("#commonSearchContent").hide();
        }
        updatePrompt();
    }
    /* 更新搜索提示 */
    function updatePrompt() {
        $("#search-prompt").show();
        $("#wrapper").hide();

        /* 常用搜索 */
        $.get(ServerUrl + "search/popularHistory",function (data) {
            if(data.status == Status.Status_OK){
                initPromptCommon(data.data);
            }else{
                /*没有常用搜索*/
            }
        });
        /* 历史搜索 */
        $.get(ServerUrl + "search/searchHistory",function (data) {
            if(data.status == Status.Status_OK){
                for(var prompt in data.data){
                    data.data[prompt] = data.data[prompt].searchRecord;
                }
                initPromptHistory(data.data);
            }else{
                /*没有历史搜索*/
            }
        });

        function initPromptCommon(prompts) {
            initPrompt("#search-prompt-common", prompts);
            /* 显示常用搜索 */
            $("#commonSearch").show();
            $("#commonSearchContent").show();
        }
        function initPromptHistory(prompts) {
            initPrompt("#search-prompt-history", prompts);
            /* 显示历史搜索 */
            $("#historySearch").show();
            $("#historySearchContent").show();
        }
        function initPrompt(elm_id, prompts) {
            var $prompt = $(elm_id).empty();
            for(var prompt in prompts){
                $prompt.append('<div class="item" data-search="' + prompts[prompt] + '">' + prompts[prompt]  + '</div>');
            }
            /*点击*/
            $(elm_id + " .item").click(function () {
                var search = $(this).attr("data-search");
                beginSearch(search);
                /*这样用户可以清空！*/
                $("#searchInput").val(search);
            });
        }
    }


    /*启动搜索入口*/
    function beginSearch(search) {
        $("#search-prompt").hide();
        $("#wrapper").show();
        /*设置启动搜索的状态*/
        param.page = 1;
        param.loading = true;
        param.over = false;
        param.search = search;
        /*加载下一页*/
        Load();
    }
    /*初始化搜索*/
    function initSearch() {
        /* 加载 */
        $(document.body).infinite().on("infinite", function() {
            /* 如果没有加载完且没有正在加载，则继续加载，否则直接返回*/
            if(!param.over && !param.loading){
                Load();
            }
        });
    }

    /* 加载下一页*/
    function Load() {
        param.loading = true;
        if(param.page == 1)$("#wrapper ul").empty();
        $("#task-load-more").show();
        getTaskByPage(function () {
            param.page += 1;
            param.loading = false;
            $("#task-load-more").hide();
        });
    }

    /* 获取第page页，并显示*/
    function getTaskByPage(callback) {
        /*联网获取数据*/
        $.get(ServerUrl + "search/search",{
            keyWord: param.search,
            page: param.page
        },function (data) {
            if(data.status == Status.Status_OK){
                if(data.data.length == 0){ /* 表明已经没有任务了 */
                    param.over = true;
                    if(param.page == 1){
                        $("#show-no-data").show();
                    }else{
                        $.toast("没有更多了", "text");
                    }
                }else{ /* 有任务 */
                    $("#show-no-data").hide();
                    showResult(data.data);
                }
            }else/* if(data.status == Status.Status_NULL_Result)*/{ /* 空结果 */ /*表明出现问题...*/
                param.over = true;
                if(param.page == 1){
                    $("#show-no-data").show();
                }
            }

            /* 执行完成后的回掉 */
            callback();
        });
    }

    /* 获取数据后展示 */
    function showResult(datas) {
        var $goods = $("#wrapper ul");
        for (var i = 0; i < datas.length; i++) {
            var item = build(datas[i]);
            $goods.append(item);
        }
        /*设置点击事件*/
        clickEvent();
    }

    /*在这里组装item*/
    /*为了解耦和，将任务item放到了html中，在这里把数据放到模板中，然后再把模板放到适当的位置*/
    function build(data) {
        /*对data进行处理*/
        var $html = $("#data");
        $html.find(".image img").attr("src",data.pub.headimgurl);
        $html.find(".money span").text(data.pub.goldCoins);
        $html.find(".name").text(subString(data.pub.nickname, 4, "..."));
        $html.find(".type").text(data.category.category);
        $html.find(".title").text(subString(data.title, 10, "..."));
        $html.find(".time-content").text(data.pubTime);
        $html.find(".describe p").text(data.content);
        $html.find(".place span").text(subString(data.place, 20, "..."));
        $html.find(".right-goods").attr("data-id", data.tid);
        $html.find(".left-user").attr("data-user", data.pubId);
        return $html.html();
    }

    /*设置点击事件*/
    function clickEvent() {
        /*点击goods*/
        $("#wrapper .goods-wrapper .content .right-goods").off("click").on("click", function () {
            var id = $(this).attr("data-id");
            location.href = "task.html?id=" + id;
        });

        /*点击头像*/
        $("#wrapper .goods-wrapper .content .left-user .image").off("click").on("click", function () {
            var user = $(this).parent().attr("data-user");
            location.href = "user-show.html?id=" + user;
        });
    }

});

