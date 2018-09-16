/**
 * Created by ALISURE on 2017/5/16.
 *
 * 发布不成功有可能是AccessToken过期了。
 * 可以到服务器的日志文件中查看。
 */
$(function() {
showImage();
submitImage();
    function showImage(){
        var count=0; 
        var tmpl = '<li class="weui-uploader__file" style="background-image:url(#url#)"></li>',  
                $gallery = $("#gallery"),  
                $galleryImg = $("#galleryImg"),  
                $uploaderInput = $("#uploaderInput"),  
                $uploaderFiles = $("#uploaderFiles");  
                $uploaderInput.on("change", function(e) {  
                    var src, url = window.URL || window.webkitURL || window.mozURL,  
                    files = e.target.files;
                    for(var i = 0, len = files.length; i < len; ++i) {
                        // console.log($uploaderFiles[0].children.length);
                        count++;
                        if(count>2){
                            $("#weui-uploader__input-box").css('display','none');
                        }
                        if(count>3){
                            alert("只能上传3张图片");
                            count--;
                            return;
                        }  
                        var file = files[i];  
                        var size=file.size;
                        if(size>1024*1024*5){
                            alert("图片不能超过5M");
                            return;
                        }
                        if(url) {  
                            src = url.createObjectURL(file);
                        } else {  
                            src = e.target.result;  
                        }  
                        $uploaderFiles.append($(tmpl.replace('#url#', src)));       
                    }   
                });  
            var index; //第几张图片  
            $uploaderFiles.on("click", "li", function() {  
                index = $(this).index();  
                $galleryImg.attr("style", this.getAttribute("style"));  
                $gallery.fadeIn(100);  
            });  
            //点击span隐藏，不要直接点gallery就隐藏，删不掉图片
            $("#galleryImg").click(function() { 
                $gallery.fadeOut(100);  
            });  
            //删除图片  
            $(".weui-gallery__del").click(function() { 
                count=$uploaderFiles[0].children.length-1;
                console.log(count);
                $("#weui-uploader__input-box").css('display','block');
                $gallery.fadeOut(100);  
                $uploaderFiles.find("li").eq(index).remove();  
            });  
    }
    var images="";
    function submitImage(){
         var count=0;
        $('.zjxfjs_file').on('change', function (event) {
                var files = event.target.files;
                for (var i = 0, len = files.length; i < len; i++) {
                    count++;
                    if(count>3){
                        return;
                    }
                    var file = files[i];
                    var size=file.size;
                    // console.log(size);
                    if(size>1024*1024*5){
                        return;
                    }
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        // var imgName=$("#uploaderInput").val(); 
                        // console.log(imgName); 
                        var img = new Image();
                        img.src = e.target.result;         
                        img.onload = function () {  
                            // console.log("123");
                            // 不要超出最大宽度  
                            var w = Math.min(10000, img.width);  
                            // 高度按比例计算  
                            var h = img.height * (w / img.width);  
                            var canvas = document.createElement('canvas');  
                            var ctx = canvas.getContext('2d');  
                            // 设置 canvas 的宽度和高度  
                            canvas.width = w;  
                            canvas.height = h;  
                            ctx.drawImage(img, 0, 0, w, h); 
        　　　　　　　　　　　　
                            var base64 = canvas.toDataURL('image/jpeg',0.6);  
                            // console.log(base64);
                           //console.log(base64);
                            // 插入到预览区  
                            // var image_key="image"+count;
                            // console.log(image_key);
                            console.log(base64);

                            images=images+base64;
                            console.log(images);  
                            // if(i==0){
                            //     images.image1=base64;
                            // }
                            // if(i==1){
                            //     images.image2=base64;
                            // }
                            // if(i==2){
                            //     images.image3=base64;
                            // }
                        }
                    };
                    reader.readAsDataURL(file);
                }
                console.log(images);
                
                // images=JSON.stringify(images); 

            }); 
    }
    /*表单的一些参数*/
    var task_params = {
        /*任务名称的最大长度*/
        task_name_length: 10,
        /*任务描述的最大长度*/
        task_describe_length: 200,
        /*私密信息的最大长度*/
        task_secret_length: 200,
        /*图片的最大数量*/
        task_image_max_length: 3,

        /*设置时间*/
        task_time_min_time: "2017-01-01",
        task_time_max_time: "2020-12-31",

        /*用户金币数量*/
        task_money_number: 0,

        /*联系方式预选*/
        task_link_id: 3,
        task_link_max_length: 11,

        /*用户所在学校*/
        school: ""
    };
    var type_params = null;
    var link_params = [
        { link_id: 1, link_text: "微信号", link_input_type: "text" },
        { link_id: 2, link_text: "QQ号", link_input_type: "number" },
        { link_id: 3, link_text: "手机号", link_input_type: "number" }
    ];

    /*初始化用户信息*/
    initUserAbout();

    /*初始化表单*/
    init_form();
    /* keyup事件 */
    check_form();
    /* change/blur事件 */
    save_form();
    /* 提交事件 */
    submit_form();

    /*初始化表单*/
    function init_form() {
        /*设置任务名称的限制*/
        $("#task-name").attr("placeholder", "不超过" + task_params.task_name_length + "个字");

        /*设置任务描述的限制*/
        $("#task-describe").attr("placeholder", "请简单的描述一下任务，不超过" + task_params.task_describe_length + "个字");
        $("#task-describe-length").text("0");
        $("#task-describe-max-length").text(task_params.task_describe_length);

        /*设置私密信息的限制*/
        $("#task-secret").attr("placeholder", "说点悄悄话吧，只对任务接手者可见。如果任务中不需要，可以选择不填。不能超过" + task_params.task_secret_length + "个字");
        $("#task-secret-length").text("0");
        $("#task-secret-max-length").text(task_params.task_secret_length);

        /*设置图片*/
        // dealImage();

        /*设置类型*/
        initType();

        /*设置时间*/
        $("#task-time-begin").datetimePicker({
            rotateEffect: true,
            min: task_params.task_time_min_time,
            max: task_params.task_time_max_time,
            value: getTimeAddHour(),
            onClose: function() {
                var time = $("#task-time-begin").val();
                var now_time = getTimeAddHour();
                if (now_time > time) {
                    $.alert("开始时间大于当前时间，如果存在错误请修改");
                }
            }
        });
        $("#task-time-end").datetimePicker({
            rotateEffect: true,
            min: task_params.task_time_min_time,
            max: task_params.task_time_max_time,
            value: getTimeAddHour(2),
            onClose: function() {
                var time = $("#task-time-end").val();
                var now_time = getTimeAddHour();
                if (now_time > time) {
                    $("#task-time-end").val(getTimeAddHour(2));
                    $.alert("结束时间小于当前时间，存在错误请修改");
                }
            }
        });

        /*设置联系方式*/
        initLink(task_params.task_link_id, "");
    }

    /*处理表单，keyup事件*/
    function check_form() {
        var task_name_length_too_long_msg = "任务名称不能超过" + task_params.task_name_length + "个字";
        var task_describe_length_too_long_msg = "任务描述不能超过" + task_params.task_describe_length + "个字";
        var task_secret_length_too_long_msg = "私密信息不能超过" + task_params.task_describe_length + "个字";
        var task_money_less_than_have_msg = "总金币只有" + task_params.task_money_number + ",请重新输入";
        var task_money_less_than_0_msg = "不要调皮了，正常点";
        var task_link_length_too_long_msg = "联系方式的长度不能超过" + task_params.task_link_max_length + "";

        /*检查 任务名称*/
        $("#task-name").keyup(function() {
            var value = $(this).val();
            if (value.length > task_params.task_name_length) {
                $(this).val(value.substr(0, task_params.task_name_length));
                $.alert(task_name_length_too_long_msg);
            }
        });
        /*检查 任务描述*/
        $("#task-describe").keyup(function() {
            var value = $(this).val();
            /*实时设置长度*/
            $("#task-describe-length").text(value.length);
            /*检查长度是否超过限制*/
            if (value.length > task_params.task_describe_length) {
                $(this).val(value.substr(0, task_params.task_describe_length));
                $("#task-describe-length").text(task_params.task_describe_length);
                $.alert(task_describe_length_too_long_msg);
            }
        });
        /*检查 私密信息*/
        $("#task-secret").keyup(function() {
            var value = $(this).val();
            /*实时设置长度*/
            $("#task-secret-length").text(value.length);
            /*检查长度是否超过限制*/
            if (value.length > task_params.task_secret_length) {
                $(this).val(value.substr(0, task_params.task_secret_length));
                $("#task-secret-length").text(task_params.task_secret_length);
                $.alert(task_secret_length_too_long_msg);
            }
        });

        /*检查金币*/
        $("#task-money").keyup(function() {
            var value = $(this).val();
            /*大于最大值*/
            if (value > task_params.task_money_number) {
                $(this).val(0);
                $.alert(task_money_less_than_have_msg);
            }
            /*小于0*/
            if (value < 0) {
                $(this).val(0);
                $.alert(task_money_less_than_0_msg);
            }
        });

        /*检查联系方式*/
        $("#task-link-input").keyup(function() {
            /*联系方式的值*/
            var link = $(this).val();
            /*若联系方式不是微信号，则检查长度*/
            if ($(this).attr("type") == "number") {
                if (link.length > task_params.task_link_max_length) {
                    $(this).val(link.substr(0, task_params.task_link_max_length));
                    $.alert(task_link_length_too_long_msg);
                }
            }
        });

    }

    /*临时保存数据, change/blur事件*/
    function save_form() {
        /*响应选择联系方式，同时保存值*/
        $("#task-link-select").change(function() {
            setLinkMethod($(this).val(), "");
        });
    }

    /*提交表单*/
    function submit_form() {
        $("#submit").click(function() {
            /*如果没有足够的金币，不能发布任务*/
            if (task_params.task_money_number <= 0) {
                $.alert("您没有足够的积分，不能发布任务！", function() {});
            }

            // var images = [];
            console.log(images);
            /*图片*/
            // $("#uploaderFiles li").each(function() {

            //     images[images.length] = $(this).css("background-image").split("\"", 3)[1];
            //     console.log(images);
            // });

            

            /*获取并组装表单项*/
            var datas = {
                title: $("#task-name").val(),
                content: $("#task-describe").val(),
                words: $("#task-secret").val(),
                startTime: $("#task-time-begin").val(),
                endTime: $("#task-time-end").val(),
                catId: $("#task-type").val(),
                place: $("#task-place").val(),
                coins: $("#task-money").val(),
                rewards: $("#task-other-money").val(),
                school: task_params.school,
                images: images,
                weixin: "",
                qq: "",
                telephone: ""
            };
            console.log(datas);
            /*检查表单项*/
            if (datas.title.length == 0) {
                $.alert("任务名称不能为空");
                $("#task-name").focus();
                return;
            }
            if (datas.title.length > task_params.task_name_length) {
                $.alert("任务名称的长度不能超过" + task_params.task_name_length + "个字");
                $("#task-name").focus();
                return;
            }
            if (datas.content.length == 0) {
                $.alert("任务描述不能为空");
                $("#task-describe").focus();
                return;
            }
            if (datas.content.length > task_params.task_describe_length) {
                $.alert("任务描述的长度不能超过" + task_params.task_describe_length + "个字");
                $("#task-describe").focus();
                return;
            }
            if (datas.words.length > task_params.task_secret_length) {
                $.alert("私密信息的长度不能超过" + task_params.task_secret_length + "个字");
                $("#task-secret").focus();
                return;
            }
            if ($("#task-time-begin").val() > $("#task-time-end").val()) {
                $.alert("结束时间早于开始时间，存在错误请修改");
                $("#task-time-end").focus();
                return;
            }
            if (datas.coins > task_params.task_money_number) {
                $.alert("总金币只有" + task_params.task_money_number + ",请重新输入");
                $("#task-describe").focus();
                return;
            }

            /* 由于前后端接口没有统一，所以需要在提交数据时进行转换 */
            var task_link_select = $("#task-link-select").val();
            var task_link_input = $("#task-link-input").val();
            if (task_link_input.length == 0) {
                $.alert("联系方式不能为空");
                $("#task-link-input").focus();
                return;
            } else {
                /* 联系方式是正常的，可以转换 */
                if (task_link_select == 1) {
                    datas.weixin = task_link_input;
                } else if (task_link_select == 2) {
                    datas.qq = task_link_input;
                } else if (task_link_select == 3) {
                    datas.telephone = task_link_input;
                }
            }

            /*检查是否有金币或酬劳，没问题（有金币或酬劳/用户确认没有金币或酬劳）后上传数据到服务器*/
            var is_money_ok = true;
            if ((datas.coins.length == 0 || datas.coins <= 0) && datas.reward.length == 0) {
                is_money_ok = false;
                $.confirm("确定发布任务不给金币或酬劳吗？", function() {
                    is_money_ok = true;
                }, function() {
                    if (datas.coins.length == 0 || datas.coins == 0) {
                        $("#task-money").focus();
                    }
                });
            }
            if (is_money_ok) {
                /*上传服务器*/
                $.confirm("确定发布任务吗？", function() {
                    console.log(datas);
                    uploadData(datas);
                });
            }

        });
    }

    /*-------------------------------------------------------*/
    /*---------------------- 提交表单 -----------------------*/
    /*
     * 数据上传思路：
     * 1.先上传图片
     * 2.再上传数据
     *
     * 图片上传思路：
     * 1.用户选择图片,获取localIds;
     * 2.根据localIds上传图片至微信的服务器,返回mediaId;
     * 3.前端根据mediaId请求自己的服务器去微信的服务器下载图片,返回资源地址;
     * 4.前端根据资源地址获取图片;
     */
    /*上传数据到服务器*/
    function uploadData(datas) {
        /**
         * 先上传图片。
         * 成功后，再提交表单。
         **/
        $.showLoading("任务上传中");
        // uploadImageByFor(datas, uploadOtherData);
        uploadOtherData(datas);
    }
    /*上传其他数据的回调函数*/
    function uploadOtherData(datas) {
        // console.log(datas.valueOf());
        console.log(datas);

        // datas.images = datas.images.join("ALISURE");

        $.post(ServerUrl + "task/publish" ,datas, function(data) {
            $.hideLoading();
            if (data.status == Status.Status_OK) {
                $.alert("任务上传成功", function() {
                    location.href = ServerUrl + "web/wechat/view/task.html?id=" + data.data;
                });
            } else {
                $.alert("任务上传失败", function() {

                });
            }
        });
    }
    /*上传图片：并行上传*/
    function uploadImageByFor(datas, callback) {
        var image_urls = [];
        /*错误标识：标识是否是第一次出现错误*/
        var had_first_error_flog = false;
        var localIds = datas.images;

        /*没有图片，直接上传*/
        if (localIds.length == 0) callback(datas);

        for (var i = 0; i < localIds.length; i++) {
            wx.uploadImage({
                localId: localIds[i], // 需要上传的图片的本地ID，由chooseImage接口获得
                isShowProgressTips: 0, // 默认为1，显示进度提示
                success: function(res) {
                    var serverId = res.serverId; // 返回图片的服务器端ID
                    /*如果之前没有出现过错误，继续。*/
                    if (!had_first_error_flog) {
                        /*请求服务器下载图片*/
                        downImage(serverId, function(data) {
                            /*图片上传成功*/
                            if (data.status == Status.Status_OK) {
                                /*保存图片地址*/
                                var image_url = data.data;
                                image_urls[image_urls.length] = image_url;
                                /*若全部图片上传成功，上传非图片数据*/
                                if (image_urls.length == datas.images.length) {
                                    /*添加图片地址后上传数据*/
                                    datas.images = image_urls;
                                    /*通过回调上传数据*/
                                    callback(datas);
                                }
                            } else {
                                /*第一次出现错误*/
                                if (!had_first_error_flog) {
                                    had_first_error_flog = true;
                                    $.alert("数据上传出现错误：" + data.status, function() {
                                        $.hideLoading();
                                    });
                                }
                            }
                        });
                    }
                },
                fail: function(res) {
                    /*第一次出现错误*/
                    if (!had_first_error_flog) {
                        had_first_error_flog = true;
                        $.alert("数据上传出现错误fail--：" + JSON.stringify(res), function() {
                            $.hideLoading();
                        });
                    }
                }
            });
        }
    }
    /*上传图片:串行上传*/
    function uploadImageBySync(datas, callback, image_urls) {
        if (typeof image_urls == "undefined" || image_urls == undefined || image_urls.length == 0) image_urls = [];

        /*没有图片，直接上传*/
        if (datas.images.length == 0) callback(datas);

        var localId = datas.images.pop();
        wx.uploadImage({
            localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function(res) {
                var serverId = res.serverId; // 返回图片的服务器端ID
                /*请求服务器下载图片*/
                downImage(serverId, function(data) {
                    /*图片上传成功*/
                    if (data.status == Status.Status_OK) {
                        /*保存图片地址*/
                        var image_url = data.data;
                        image_urls[image_urls.length] = image_url;

                        //其他对serverId做处理的代码
                        if (datas.images.length > 0) {
                            uploadImageBySync(datas, callback, image_urls);
                        } else if (datas.images.length == 0) {
                            /*添加图片地址后上传数据*/
                            datas.images = image_urls;
                            /*通过回调上传数据*/
                            callback(datas);
                        }
                    } else {
                        $.alert("数据上传出现错误：" + data.status, function() {
                            $.hideLoading();
                        });
                    }
                });
            },
            fail: function(res) {
                $.alert("数据上传出现错误：" + JSON.stringify(res), function() {
                    $.hideLoading();
                });
            }
        });
    }
    /*---------------------- 提交表单 -----------------------*/
    /*-------------------------------------------------------*/


    /*设置类型*/
    function initType() {
        /*获取类型数据*/
        $.get(ServerUrl + "task/category", function(data) {
            if (data.status == Status.Status_OK) {
                type_params = data.data;
                setType(type_params, type_params[0].category);
            } else {
                $.toast("数据获取错误");
            }
        });
    }
    /*设置类型*/
    function setType(type_params, default_value) {
        var $task_type = $("#task-type").empty();
        for (var index in type_params) {
            if (type_params[index].category == default_value) { /*设置默认值*/
                $task_type.append("<option value='" + type_params[index].catId + "' selected='selected'>" + type_params[index].category + "</option>");
            } else {
                $task_type.append("<option value='" + type_params[index].catId + "'>" + type_params[index].category + "</option>");
            }
        }
    }

    /*获取用户相关的信息*/
    function initUserAbout() {
        /*获取类型数据*/
        $.get(ServerUrl + "my/user", function(data) {
            if (data.status == Status.Status_OK) {
                var userinfo = data.data[0];
                var schoolInfo = data.data[1];
                if (schoolInfo == null || !schoolInfo.schoolName) {
                    /*还没有选择学校*/
                    change_school_alert();
                }
                /*设置学校*/
                task_params.school = schoolInfo.schoolName;
                /*设置金币*/
                task_params.task_money_number = userinfo.goldCoins;
                $("#task-money").attr("placeholder", "总金币数量为: " + task_params.task_money_number);

                /*检查*/
                if (task_params.school.length == 0) {
                    $.alert("请设置学校！", function() {
                        location.href = "user-edit.html";
                    });
                } else if (task_params.task_money_number <= 0) {
                    $.alert("您没有足够的积分，不能发布任务！", function() {});
                }
            } else {
                $.toast("数据获取错误");
            }
        });
    }

    /*设置联系方式*/
    function initLink(link_id, value) {
        /*设置联系方式下拉列表*/
        set_link(link_id);
        /*设置联系方式*/
        setLinkMethod(link_id, value);
    }
    /*设置联系方式下拉列表:link_id为默认值*/
    function set_link(link_id) {
        var $link = $("#task-link-select").empty();
        for (var index in link_params) {
            if (link_params[index].link_id == link_id) { /*设置默认值*/
                $link.append("<option value='" + link_params[index].link_id + "' selected='selected'>" + link_params[index].link_text + "</option>");
            } else {
                $link.append("<option value='" + link_params[index].link_id + "'>" + link_params[index].link_text + "</option>");
            }
        }
    }
    /*初始化联系方式/响应选择联系方式：类型为link_id,值为value*/
    function setLinkMethod(link_id, value) {
        /*获取要设置的列表的索引*/
        for (var index in link_params) {
            if (link_params[index].link_id == link_id) { /*设置*/
                $("#task-link-method").text(link_params[index].link_text);
                $("#task-link-input").attr("type", link_params[index].link_input_type)
                    .attr("placeholder", "请填写" + link_params[index].link_text).val(value);
                break;
            }
        }
    }

    /*图片处理*/
    function dealImage() {
        /*初始化*/
        $("#uploaderFiles-max-number").text(task_params.task_image_max_length);
        $("#uploaderFiles-number").text(0);

        /*关闭*/
        $("#uploaderFiles-gallery span").click(function() {
            $(this).parent().hide();
        });
        /*删除*/
        $("#uploaderFiles-gallery i").click(function() {
            /*隐藏*/
            $("#uploaderFiles-gallery").hide();
            /*删除*/
            var data_for_delete = $("#uploaderFiles-gallery span").attr("data-for-delete");
            $("#uploaderFiles li[data-for-delete=" + data_for_delete + "]").remove();
            /*修改数字*/
            var image_number = $("#uploaderFiles li").size();
            $("#uploaderFiles-number").text(image_number);

            /*数量未达到上限就解禁添加图片*/
            if (image_number == task_params.task_image_max_length) {
                $("#uploaderInput").parent().show();
            }
        });
        /*添加*/
        $("#uploaderInput").click(function() {
            var count = task_params.task_image_max_length - $("#uploaderFiles li").size();
            if (count <= 0) return;
            wx.chooseImage({
                count: count, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function(res) {
                    // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    var localIds = res.localIds;
                    for (var i in localIds) {
                        /*设置界面*/
                        var li_number = $("#uploaderFiles li").size() + 1;
                        $("#uploaderFiles").append(
                            '<li class="weui-uploader__file" data-for-delete="' + li_number +
                            '" style="background-image:url(' + localIds[i] + ')"></li>');
                        $("#uploaderFiles-number").text(li_number);

                        /*数量达到上限就禁止添加图片*/
                        if (li_number == task_params.task_image_max_length) {
                            $("#uploaderInput").parent().hide();
                            break;
                        }

                        /*绑定事件*/
                        imageClickEvent();
                    }
                }
            });
        });


        /*绑定图片点击事件*/
        function imageClickEvent() {
            /*显示某一张图片*/
            $("#uploaderFiles li").off("click").on("click", function() {
                var img = $(this).css("background-image");
                var $span = $("#uploaderFiles-gallery span");
                $span.css("background-image", img).hide();
                $span.parent().fadeIn();
                $span.delay(300);
                $span.fadeIn("slow");
                /*用于删除*/
                $span.attr("data-for-delete", $(this).attr("data-for-delete"));
            });
        }

    }


    /*修改任务*/
    function set_data() {
        /* 获取数据 */
        $.get(ServerUrl + "task/task/" + taskId, function(data) {
            if (data.status == Status.Status_OK && data.data) {
                show_data(data.data);
            } else {
                $.toast("不能修改", "text");
                history.go(-1);
            }
        });

        /* 设置数据 */
        function show_data(datas) {
            /*设置任务名称*/
            $("#task-name").val(datas.title);
            /*设置任务描述*/
            $("#task-describe").val(datas.content);
            /*设置私密信息*/
            $("#task-secret").val(datas.secret_message);
            /*设置时间*/
            $("#task-time-begin").datetimePicker({
                rotateEffect: true,
                min: task_params.task_time_min_time,
                max: task_params.task_time_max_time,
                value: datas.pubDate,
                onClose: function() {
                    var time = $("#task-time-begin").val();
                    var now_time = getTimeAddHour();
                    if (now_time > time) {
                        $.alert("开始时间大于当前时间，如果存在错误请修改");
                    }
                }
            });
            $("#task-time-end").datetimePicker({
                rotateEffect: true,
                min: task_params.task_time_min_time,
                max: task_params.task_time_max_time,
                value: datas.endDate,
                onClose: function() {
                    var time = $("#task-time-end").val();
                    var now_time = getTimeAddHour();
                    if (now_time > time) {
                        $("#task-time-end").val(getTimeAddHour(2));
                        $.alert("结束时间小于当前时间，存在错误请修改");
                    }
                }
            });
            /*设置金币*/
            $("#task-money").val(datas.goldCoins);
            /*设置地点*/
            $("#task-place").val(datas.place);
            /*设置酬金*/
            $("#task-other-money").val(datas.reward);

            /*设置图片*/
            // dealImage();

            /*设置类型*/
            if (type_params) {
                setType(type_params, datas.type);
            }

            /*设置联系方式*/
            if (datas.weixin) {
                initLink(1, datas.weixin);
            } else if (datas.qq) {
                initLink(2, datas.qq);
            } else if (datas.telephone) {
                initLink(3, datas.telephone);
            }
        }
    }
    /*修改时，上传图片外的数据*/
    function uploadOtherDataForModify(datas) {
        console.log(datas.valueOf());
        datas.id = tid;
        $.post(ServerUrl + "task/edit", datas, function(data) {
            $.hideLoading();
            if (data.status == Status.Status_OK) {
                $.toast("任务修改成功");
                history.go(-1);
            } else {
                $.toast("任务修改失败:" + data.statusCode);
            }
        });
    }

});