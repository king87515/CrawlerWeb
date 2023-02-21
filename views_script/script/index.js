$(function () {

    // -----------------------------------------------
    // MULTIPLE EMAIL SETUP
    // -----------------------------------------------
    $("#InputEmail").email_multiple({
        // data: data,
        reset: true
    });


    // -----------------------------------------------
    // SEARCH
    // -----------------------------------------------

    var keyword = "";
    var page = -1;

    var returndata;
    var loadText = function () {
        return new Promise(function (resolve, reject) {
            Swal.fire({
                title: "匯入中...",
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            })
            setTimeout(function () {
                resolve();
            }, 100)
        })
    };

    $("#search_form").submit(function (event) {
        loadText();
        $.ajax({
            url: "/realtime_search",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            async: true,
            data: JSON.stringify({
                InputKeyword: $('#InputKeyword').val(),
                InputWebpage: $('#InputWebpage').val()
            }),
            success: function (data) {
                returndata = data;
                keyword = $('#InputKeyword').val();
                page = parseInt($('#InputWebpage').val());

                $("#jsGrid").jsGrid("loadData", data);
                $("#jsGrid").jsGrid("refresh");
                console.log(data);
                // Swal.fire({
                //     type: 'success',
                //     title:"完成"
                // });
                Swal.fire({
                    icon: 'success',
                    title: '完成',
                    showConfirmButton: false,
                    timer: 1000
                });
            },
            error: function (xmlhttprequest, textstatus, message) {
                console.log(xmlhttprequest);
            }
        });

        event.preventDefault();
    });



    // -----------------------------------------------
    // SEND
    // -----------------------------------------------
    $("#send_form").submit(function (event) {
        if ($("#InputEmail").val() == "" || $('#InputEmailContainer').find('.all-mail').find('.email-ids').length === 0) {
            alert("請輸入Email");
        } else {
            let emailLength = $('#InputEmailContainer').find('.all-mail').find('.email-ids').length;
            let email_send_to = [];
            console.log(emailLength);
            for (let i = 0; i < emailLength; i++) {
                let str = $('#InputEmailContainer').find('.all-mail').find('.email-ids:eq(' + i + ')').text();
                str = str.slice(0, str.length - 1);
                email_send_to.push(str);
            }

            var webstr = '';
            switch (page) {
                case 0:
                    webstr = '經濟部本部新聞';
                    break;
                case 1:
                    webstr = '投審會最新公告';
                    break;
                case 2:
                    webstr = '科技部新聞資料';
                    break;
                case 3:
                    webstr = '公開資訊觀測站即時重大訊息';
                    break;
                case 4:
                    webstr = 'Google搜尋引擎查詢';
                    break;
                default: break;
            }
            console.log(email_send_to);
            for (var i = 0; i < email_send_to.length; i++) {
                $.ajax({
                    url: "/sendemail",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    type: 'POST',
                    async: true,
                    data: JSON.stringify({
                        InputWebpage: page,
                        EmailTo: email_send_to[i],
                        EmailTitle: webstr + '（關鍵字：' + keyword + '）',
                        EmailBody: returndata,
                    }),
                    success: function (data) {
                        // alert('Email 已寄發!');
                        console.log(data);
                        Swal.fire({
                            icon: 'success',
                            title: '已寄送',
                            showConfirmButton: false,
                            timer: 1000
                        });
                    },
                    error: function (xmlhttprequest, textstatus, message) {
                        console.log(xmlhttprequest);
                    }
                });
            }
        }
        event.preventDefault();
    });


    $("#jsGrid").jsGrid({
        height: "90%",
        width: "100%",

        autoload: false,
        paging: true,

        controller: {
            loadData: function (filter) {
                var deferred = $.Deferred();

                for (var i = 0; i < filter.length; i++) {
                    filter.num = i + 1;
                }
                // console.log(filter);
                deferred.resolve(filter);
                return deferred.promise();
            }
        },

        rowRenderer: function (data) {
            var item = data;

            // 資料處理
            var time = ("時間： "
                + ((item.date == null) ? "" : item.date + " ")
                + ((item.time == null) ? "" : item.time + " "));

            var stock = ((item.symbol != null) || (item.name != null)) ? $("<strong>").text(item.symbol + " | " + item.name + " | ") : "";

            var coll;
            // 資料輸出
            var $info = $("<div style='margin-left: 20px; margin-right: 20px;'>").addClass("client-info")
                .append($("<br>"))
                .append($("<p style='font-size: 16px;'>").text(time))
                .append($("<p style='font-size: 18px;'>")
                    .append(stock)
                    .append($("<a>").append($("<strong>").text(item.text)).attr("href", item.href)))
                .append($("<p style='font-size: 14px;'>").text(item.detail.substring(0, 100) + " ..."));

            return $("<tr style='border-bottom:1pt #eeeeee solid;'>").append($("<td>").append($info));
        },

        fields: [
            { title: "搜尋結果" }
        ]
    });


    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

});
