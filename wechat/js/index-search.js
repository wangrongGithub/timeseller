/**
 * Created by ALISURE on 2017/5/16.
 */

$(function () {
    /*输入框获取焦点的时候*/
    $("#searchInput").focus(function () {
        location.href = "searchPage.html"
    });
    $("#searchInput").click(function () {
        location.href = "searchPage.html"
    });
    /*点击搜索文字的时候*/
    $("#searchText").click(function () {
        location.href = "searchPage.html"
    });
});