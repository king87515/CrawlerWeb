$(function () {

    // -----------------------------------------------
    // MULTIPLE EMAIL SETUP
    // -----------------------------------------------
    // $("#InputEmail").emailinput();
    // let data = [
    //     "admin@jqueryscript.net",
    //     "admin@cssscript.com"
    // ];
    // console.log(typeof data);
    $("#InputEmail").email_multiple({
        // data: data,
        reset: true
    });

    var inserting_id = null;

    // -----------------------------------------------
    // SETTING BUTTON
    // -----------------------------------------------
    $("#setting_form").submit(function (event) {
        if ($("#InputEmail").val() == "" || $('#InputEmailContainer').find('.all-mail').find('.email-ids').length === 0) {
            alert("請輸入Email");
        } else {
            // var inputemail = $("#InputEmail").val().split(';');
            // console.log(inputemail);
            let emailLength = $('#InputEmailContainer').find('.all-mail').find('.email-ids').length;
            let inputemail = [];
            console.log(emailLength);
            for (let i = 0; i < emailLength; i++) {
                let str = $('#InputEmailContainer').find('.all-mail').find('.email-ids:eq(' + i + ')').text();
                str = str.slice(0, str.length - 1);
                inputemail.push(str);
            }
            console.log(inputemail);

            var url = (inserting_id == null) ? '' : ('/' + inserting_id);
            var type = (inserting_id == null) ? 'POST' : 'PATCH';

            $.ajax({
                url: "/db/keywords" + url,
                dataType: 'json',
                type: type,
                async: true,
                data: {
                    KeywordEmail: inputemail,
                    KeywordStartSunday: $("#sunday").is(":checked"),
                    KeywordStartMonday: $("#monday").is(":checked"),
                    KeywordStartTuesday: $("#tuesday").is(":checked"),
                    KeywordStartWednesday: $("#wednesday").is(":checked"),
                    KeywordStartThursday: $("#thursday").is(":checked"),
                    KeywordStartFriday: $("#friday").is(":checked"),
                    KeywordStartSaturday: $("#saturday").is(":checked"),
                    KeywordTimeFrom: $("#InputTimeFrom").val(),
                    KeywordTimeTo: $("#InputTimeTo").val(),
                    KeywordTimes: parseInt($('#InputFrequencyTime').val()),
                    KeywordFrequency: $("#InputFrequency").val(),
                    KeywordQueryRecord: Date.now(),
                    KeywordMOEA: $("#KeywordMOEA").val(),
                    KeywordMOEAIC: $("#KeywordMOEAIC").val(),
                    KeywordMOST: $("#KeywordMOST").val(),
                    KeywordMOPS: '',
                    KeywordGOOGLE: '',
                    KeywordSearchMOEA: $("#KeywordSearchMOEA").is(":checked"),
                    KeywordSearchMOEAIC: $("#KeywordSearchMOEAIC").is(":checked"),
                    KeywordSearchMOST: $("#KeywordSearchMOST").is(":checked"),
                    KeywordSearchMOPS: $("#KeywordSearchMOPS").is(":checked"),
                    KeywordSearchGOOGLE: $("#KeywordSearchGOOGLE").is(":checked"),
                    KeywordValid: $("#KeywordValid").is(":checked"),
                },
                success: function (msg_data) {
                    location.reload();
                    // console.log(msg_data);
                },
                error: function (xmlhttprequest, textstatus, message) {
                    console.log(xmlhttprequest);
                }
            });
        }

        event.preventDefault();
    });


    // -----------------------------------------------
    // JSGRID
    // -----------------------------------------------

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "auto",
        autoload: true,
        sorting: true,

        editing: true,
        paging: true,
        thisTab: this,
        noDataContent: "<span class='unselectable' unselectable='on' style='white-space:nowrap; width:100%; text-align:center;'>　</span>"
            + "<span style='position: fixed;'><span class='unselectable' unselectable='on' style='white-space:nowrap; width:100%; text-align:center;'> </span></span>"
            + "<div style='width:3205px; height:0.1px;'></div>",
        rowClick: function (args) { },
        controller: {
            loadData: function (filter) {
                criteria = filter;
                var data = $.Deferred();
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    url: "/db/keywords",
                    async: true,
                    data: filter
                }).done(function (response) {
                    data.resolve(response);
                });
                return data.promise();
            }
        },
        fields: [
            {
                title: "啟用排程", type: "text", width: 75, align: "center",
                itemTemplate: function (value, item) {
                    var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                    var $a = $("<table  ==border=1 frame=void rules=rows width='100%' style='border-spacing: 20px; overflow:hidden; word-wrap:break-word; table-layout:fixed;'>")

                    if (item.KeywordValid !== undefined) {
                        if (item.KeywordValid) $a.append("<tr><th style='vertical-align: middle;text-align: center;'><i class='fas fa-check'></i></th></tr>");
                        else $a.append("<tr><th style='vertical-align: middle;text-align: center;'><i class='fas fa-times'></i></th></tr>");
                    }
                    $a.append("</table>");
                    $result = $result.add($a);
                    return $result;
                }
            },
            {
                name: "KeywordEmail", title: "Email", type: "text", width: 250, align: "center",
                itemTemplate: function (value, item) {
                    var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                    var $a = $("<table  ==border=1 frame=void rules=rows width='100%' style='border-spacing: 20px; overflow:hidden; word-wrap:break-word; table-layout:fixed;'>")
                    for (var i = 0; i < value.length; i++) {
                        $a.append("<tr><td>" + value[i] + "</td></tr>");
                    }
                    $a.append("</table>");
                    $result = $result.add($a);
                    return $result;
                }
            },
            {
                title: "啟用時間", type: "text", width: 150, align: "center",
                itemTemplate: function (value, item) {
                    var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                    var $a = $("<table  ==border=1 frame=void rules=rows width='100%' style='border-spacing: 20px; overflow:hidden; word-wrap:break-word; table-layout:fixed;'>")
                    if (item.KeywordTimeFrom !== undefined && item.KeywordTimeTo !== undefined) $a.append("<tr><th>" + item.KeywordTimeFrom + "~" + item.KeywordTimeTo + "</th></tr>");
                    if (item.KeywordStartSunday) $a.append("<tr><td>星期日</td></tr>");
                    if (item.KeywordStartMonday) $a.append("<tr><td>星期一</td></tr>");
                    if (item.KeywordStartTuesday) $a.append("<tr><td>星期二</td></tr>");
                    if (item.KeywordStartWednesday) $a.append("<tr><td>星期三</td></tr>");
                    if (item.KeywordStartThursday) $a.append("<tr><td>星期四</td></tr>");
                    if (item.KeywordStartFriday) $a.append("<tr><td>星期五</td></tr>");
                    if (item.KeywordStartSaturday) $a.append("<tr><td>星期六</td></tr>");
                    $a.append("</table>");
                    $result = $result.add($a);
                    return $result;
                }
            },
            {
                name: "KeywordFrequency", title: "搜尋頻率", type: "text", width: 150, align: "center",
                itemTemplate: function (value, item) {
                    var str = "";
                    switch (item.KeywordTimes) {
                        case 1:
                            str += "每隔 1 天";
                            break;
                        case 2:
                            str += "每隔 12 小時";
                            break;
                        case 4:
                            str += "每隔 6 小時";
                            break;
                        case 24:
                            str += "每隔 1 小時";
                            break;
                        case 48:
                            str += "每隔 30 分鐘";
                            break;
                        case 144:
                            str += "每隔 10 分鐘";
                            break;
                        default:
                            str += "每隔 1 天";
                            break;
                    }
                    str += ('(' + item.KeywordFrequency + ')');
                    return str;
                }
            },
            {
                title: "網頁查詢 （關鍵字）", type: "text", width: 400, align: "center",
                itemTemplate: function (value, item) {
                    var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments);
                    var $a = $("<table border=1 frame=void rules=rows width='100%' style='border-spacing: 20px; overflow:hidden; word-wrap:break-word; table-layout:fixed;'>")

                    var KeywordMOEA = '';
                    if (item.KeywordMOEA != '') KeywordMOEA = '（關鍵字：' + item.KeywordMOEA + '）';
                    var KeywordMOEAIC = '';
                    if (item.KeywordMOEAIC != '') KeywordMOEAIC = '（關鍵字：' + item.KeywordMOEAIC + '）';
                    var KeywordMOST = '';
                    if (item.KeywordMOST != '') KeywordMOST = '（關鍵字：' + item.KeywordMOST + '）';
                    // var KeywordGOOGLE = '';
                    // if (item.KeywordGOOGLE != '') KeywordGOOGLE = '（關鍵字：' + item.KeywordGOOGLE + '）';


                    if (item.KeywordSearchMOEA) $a.append("<tr><td>經濟部本部新聞" + KeywordMOEA + "</td></tr>");
                    if (item.KeywordSearchMOEAIC) $a.append("<tr><td>投審會最新公告" + KeywordMOEAIC + "</td></tr>");
                    if (item.KeywordSearchMOST) $a.append("<tr><td>科技部新聞資料" + KeywordMOST + "</td></tr>");
                    if (item.KeywordSearchMOPS) $a.append("<tr><td>公開資訊觀測站即時重大訊息</td></tr>");
                    if (item.KeywordSearchGOOGLE) $a.append("<tr><td>Google搜尋引擎查詢</td></tr>");

                    $a.append("</table>");
                    $result = $result.add($a);
                    return $result;
                }
            },
            {
                type: "control", width: 80,
                itemTemplate: function (value, item) {
                    $edit = $("<input>").attr('type', 'button')
                        .addClass("jsgrid-button jsgrid-edit-button")
                        .on("click", function () {
                            editrow(item);
                            return false;
                        });

                    $delete = $("<input>").attr('type', 'button')
                        .attr('title', 'Delete')
                        .addClass("jsgrid-button jsgrid-delete-button")
                        .on("click", function () {
                            var answer = window.confirm("確定刪除?");
                            if (answer) {
                                $.ajax({
                                    url: "/db/keywords" + '/' + item._id,
                                    dataType: 'json',
                                    type: "DELETE",
                                    async: true,
                                    success: function (msg_data) {
                                        inserting_id = null;
                                        location.reload();
                                    },
                                    error: function (xmlhttprequest, textstatus, message) {
                                        console.log(xmlhttprequest);
                                    }
                                });
                            }
                            else {
                                return false;
                            }
                        });
                    $edit = $edit.add($delete);
                    return $edit;
                },
                headerTemplate: function (value, item) {
                    $insert = $("<input>").attr('type', 'button')
                        .addClass("jsgrid-button jsgrid-mode-button jsgrid-insert-mode-button")
                        .on("click", function () {
                            insertrow();
                            return false;
                        });
                    return $insert;
                },
            }
            // { name: "KeywordQueryRecord", title: "時間紀錄", type: "text", width: 150, align: "center", editButton: false }
        ]
    });

    function editrow(item) {
        inserting_id = item._id;
        $("#setting_submit").text('更新');
        console.log(item.KeywordEmail);
        var input_email = '';
        for (var i = 0; i < item.KeywordEmail.length; i++) {
            input_email += item.KeywordEmail[i];
            if (i != item.KeywordEmail.length - 1)
                input_email += ';';
        }
        // let emailLength = $('#InputEmailContainer').find('.all-mail').find('.email-ids').length;
        // let emailData = [];
        // console.log(emailLength);
        // for (let i = 0; i < emailLength; i++) {
        //     let str = $('#InputEmailContainer').find('.all-mail').find('.email-ids:eq('+i+')').text();
        //     str.slice(0,str.length-1);
        //     emailData.push(str);
        // }
        // console.log(emailData);
        // $("#InputEmail").email_multiple({
        //     data: emailData,
        // });

        // console.log(input_email);
        $('#InputEmailContainer').remove();
        $('#TableContainer').append("<div id='InputEmailContainer'><input class='form-control' id='InputEmail'></div>");
        // console.log(input_email);
        // console.log(input_email.split(';'));
        // $("#InputEmail").email_multiple({
        //     data: item.KeywordEmail,
        // });
        $("#InputEmail").email_multiple({
            data: item.KeywordEmail,
            //reset: true
        });

        $("#sunday").prop("checked", item.KeywordStartSunday);
        $("#monday").prop("checked", item.KeywordStartMonday);
        $("#tuesday").prop("checked", item.KeywordStartTuesday);
        $("#wednesday").prop("checked", item.KeywordStartWednesday);
        $("#thursday").prop("checked", item.KeywordStartThursday);
        $("#friday").prop("checked", item.KeywordStartFriday);
        $("#saturday").prop("checked", item.KeywordStartSaturday);
        $('#InputTimeFrom').val(item.KeywordTimeFrom);
        $('#InputTimeTo').val(item.KeywordTimeTo);

        $('#InputFrequencyTime').val((item.KeywordTimes == undefined) ? 1 : item.KeywordTimes);
        $('#InputFrequency').val(item.KeywordFrequency);
        $('#KeywordMOEA').val(item.KeywordMOEA);
        $('#KeywordMOEAIC').val(item.KeywordMOEAIC);
        $('#KeywordMOST').val(item.KeywordMOST);
        $('#KeywordGOOGLE').val(item.KeywordGOOGLE);
        $('#KeywordSearchMOEA').prop("checked", item.KeywordSearchMOEA);
        $('#KeywordSearchMOEAIC').prop("checked", item.KeywordSearchMOEAIC);
        $('#KeywordSearchMOST').prop("checked", item.KeywordSearchMOST);
        $('#KeywordSearchMOPS').prop("checked", item.KeywordSearchMOPS);
        $('#KeywordSearchGOOGLE').prop("checked", item.KeywordSearchGOOGLE);

        $('#KeywordValid').prop("checked", item.KeywordValid);
        // console.log(item);
    }

    function insertrow() {
        inserting_id = null;
        $("#setting_submit").text('設定');

        $('#InputEmailContainer').remove();
        $('#TableContainer').append("<div id='InputEmailContainer'><input class='form-control' id='InputEmail'></div>");
        $("#InputEmail").email_multiple({
            reset: true
        });

        $("#sunday").prop("checked", false);
        $("#monday").prop("checked", false);
        $("#tuesday").prop("checked", false);
        $("#wednesday").prop("checked", false);
        $("#thursday").prop("checked", false);
        $("#friday").prop("checked", false);
        $("#saturday").prop("checked", false);
        $('#InputTimeFrom').val('');
        $('#InputTimeTo').val('');

        $('#InputFrequencyTime').val(1);
        $('#InputFrequency').val('');
        $('#KeywordMOEA').val('');
        $('#KeywordMOEAIC').val('');
        $('#KeywordMOST').val('');
        $('#KeywordGOOGLE').val('');
        $('#KeywordSearchMOEA').prop("checked", false);
        $('#KeywordSearchMOEAIC').prop("checked", false);
        $('#KeywordSearchMOST').prop("checked", false);
        $('#KeywordSearchMOPS').prop("checked", false);
        $('#KeywordSearchGOOGLE').prop("checked", false);

        $('#KeywordValid').prop("checked", false);
    }
});