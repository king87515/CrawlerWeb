$(function () {

    // -----------------------------------------------
    // JSGRID SETTING
    // -----------------------------------------------
    var listedmachinerycompanies_fields = [
        { name: "Number", title: "No.", align: "center", editing: false },
        { name: "CompanyCode", title: "公司代號", type: "text", align: "center" },
        { name: "CompanyAbbreviation", title: "公司簡稱", type: "text", align: "center" },
        { type: "control", width: 80, headerTemplate: function () { return; } }
    ]

    var listedmachinerykeywords_fields = [
        { name: "Number", title: "No.", align: "center", editing: false },
        { name: "MachineryKeyword", title: "關鍵字", type: "text", align: "center" },
        { type: "control", width: 80, headerTemplate: function () { return; } }
    ]

    var listedcompanies_fields = [
        { name: "Number", title: "No.", align: "center", editing: false },
        { name: "CompanyCode", title: "公司代號", type: "text", align: "center" },
        { name: "CompanyAbbreviation", title: "公司名稱關鍵字", type: "text", align: "center" },
        { type: "control", width: 80, headerTemplate: function () { return; } }
    ]

    var nonlistedcompanies_fields = [
        { name: "Number", title: "No.", align: "center", editing: false },
        { name: "CompanyAbbreviation", title: "公司名稱關鍵字", type: "text", align: "center" },
        { type: "control", width: 80, headerTemplate: function () { return; } }
    ]

    var googlekeywords_fields = [
        { name: "Number", title: "No.", align: "center", editing: false },
        { name: "GoogleSearchKeyword", title: "關鍵字", type: "text", align: "center" },
        { type: "control", width: 80, headerTemplate: function () { return; } }
    ]

    var listedgooglepages_fields = [
        { name: "Number", title: "No.", align: "center", editing: false },
        { name: "GooglePagesName", title: "網站名稱", type: "text", align: "center" },
        { name: "GooglePagesURL", title: "網站網址", type: "text", align: "center" },
        { type: "control", width: 80, headerTemplate: function () { return; } }
    ]


    $("#jsGrid").jsGrid({
        width: "100%",
        height: "auto",

        inserting: true,
        editing: true,
        sorting: true,
        paging: true,

        autoload: false,
        pageSize: 15,

        deleteConfirm: "確定刪除?",
        noDataContent: "<span class='unselectable' unselectable='on' style='white-space:nowrap; width:100%; text-align:center;'>　</span>"
            + "<span style='position: fixed;'><span class='unselectable' unselectable='on' style='white-space:nowrap; width:100%; text-align:center;'> </span></span>"
            + "<div style='width:3205px; height:0.1px;'></div>",

        rowClick: function (args) { },
        onItemUpdating: function (args) {
            console.log($("input[name=select]:checked").val());
            switch ($("input[name=select]:checked").val()) {
                case 'listedmachinerycompanies':
                    if ((args.item.CompanyCode === "") || (args.item.CompanyAbbreviation === "")) {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'listedmachinerykeywords':
                    if (args.item.MachineryKeyword === "") {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'listedcompanies':
                    if ((args.item.CompanyCode === "") || (args.item.CompanyAbbreviation === "")) {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'nonlistedcompanies':
                    if (args.item.CompanyAbbreviation === "") {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'googlekeywords':
                    if (args.item.GoogleSearchKeyword === "") {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'listedgooglepages':
                    if ((args.item.GooglePagesName === "") || (args.item.GooglePagesURL === "")) {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                default:
                    break;
            }
        },
        onItemInserting: function (args) {
            switch ($("input[name=select]:checked").val()) {
                case 'listedmachinerycompanies':
                    if ((args.item.CompanyCode === "") || (args.item.CompanyAbbreviation === "")) {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'listedmachinerykeywords':
                    if (args.item.MachineryKeyword === "") {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'listedcompanies':
                    if ((args.item.CompanyCode === "") || (args.item.CompanyAbbreviation === "")) {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'nonlistedcompanies':
                    if (args.item.CompanyAbbreviation === "") {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'googlekeywords':
                    if (args.item.GoogleSearchKeyword === "") {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                case 'listedgooglepages':
                    if ((args.item.GooglePagesName === "") || (args.item.GooglePagesURL === "")) {
                        args.cancel = true;
                        alert("欄位不得為空白!");
                    }
                    break;
                default:
                    break;
            }
        },
        onItemUpdated: function (args) {
            console.log("onItemUpdated args:", args);
            updateData($("input[name=select]:checked").val()
                , args.item._id, args.item.CompanyCode
                , args.item.CompanyAbbreviation
                , args.item.MachineryKeyword
                , args.item.GoogleSearchKeyword
                , args.item.GooglePagesName
                , args.item.GooglePagesURL
            );
            getData($("input[name=select]:checked").val());
        },
        onItemInserted: function (args) {
            console.log("onItemInserted args:", args);
            postData($("input[name=select]:checked").val()
                , args.item.CompanyCode
                , args.item.CompanyAbbreviation
                , args.item.MachineryKeyword
                , args.item.GoogleSearchKeyword
                , args.item.GooglePagesName
                , args.item.GooglePagesURL
            );
            getData($("input[name=select]:checked").val());
        },
        onItemDeleted: function (args) {
            deleteData($("input[name=select]:checked").val(), args.item._id);
            getData($("input[name=select]:checked").val());
        },
        controller: {
            loadData: function (filter) {
                console.log(filter);
                criteria = filter;
                for (var i = 0; i < criteria.length; i++) {
                    criteria[i]['Number'] = (i + 1);
                }
                return criteria;
            }
        },

        fields: listedmachinerycompanies_fields
    });



    // -----------------------------------------------
    // RADIO CHANGE
    // -----------------------------------------------
    $('input[type=radio][name=select]').change(function () {
        switch (this.value) {
            case 'listedmachinerycompanies':
                $("#jsGrid").jsGrid("option", "fields", listedmachinerycompanies_fields);
                $("#jsGrid").jsGrid("option", "inserting", true);
                getData('listedmachinerycompanies');
                $("#jsGrid").jsGrid("option", "pageIndex", 1);
                break;
            case 'listedmachinerykeywords':
                $("#jsGrid").jsGrid("option", "fields", listedmachinerykeywords_fields);
                $("#jsGrid").jsGrid("option", "inserting", true);
                getData('listedmachinerykeywords');
                $("#jsGrid").jsGrid("option", "pageIndex", 1);
                break;
            case 'listedcompanies':
                $("#jsGrid").jsGrid("option", "fields", listedcompanies_fields);
                $("#jsGrid").jsGrid("option", "inserting", true);
                getData('listedcompanies');
                $("#jsGrid").jsGrid("option", "pageIndex", 1);
                break;
            case 'nonlistedcompanies':
                $("#jsGrid").jsGrid("option", "fields", nonlistedcompanies_fields);
                $("#jsGrid").jsGrid("option", "inserting", true);
                getData('nonlistedcompanies');
                $("#jsGrid").jsGrid("option", "pageIndex", 1);
                break;
            case 'googlekeywords':
                $("#jsGrid").jsGrid("option", "fields", googlekeywords_fields);
                $("#jsGrid").jsGrid("option", "inserting", true);
                getData('googlekeywords');
                $("#jsGrid").jsGrid("option", "pageIndex", 1);
                break;
            case 'listedgooglepages':
                $("#jsGrid").jsGrid("option", "fields", listedgooglepages_fields);
                $("#jsGrid").jsGrid("option", "inserting", true);
                getData('listedgooglepages');
                $("#jsGrid").jsGrid("option", "pageIndex", 1);
                break;
            default:
                break;
        }
    });

    // -----------------------------------------------
    // PAGE SETUP
    // -----------------------------------------------
    $("#jsGrid").jsGrid("option", "fields", listedmachinerycompanies_fields);
    $("#jsGrid").jsGrid("option", "inserting", true);
    getData('listedmachinerycompanies');

    // -----------------------------------------------
    // REQUEST
    // -----------------------------------------------
    function getData(routes) {
        $.ajax({
            type: "GET",
            dataType: 'json',
            url: "/db/" + routes,
            async: false,
            success: function (data) {
                $("#jsGrid").jsGrid("loadData", data);
                $("#jsGrid").jsGrid("refresh");
            }
        });
    }

    function postData(routes, CompanyCode, CompanyAbbreviation, MachineryKeyword, GoogleSearchKeyword, GooglePagesName, GooglePagesURL) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: "/db/" + routes,
            async: false,
            data: {
                CompanyCode: CompanyCode,
                CompanyAbbreviation: CompanyAbbreviation,
                MachineryKeyword: MachineryKeyword,
                GoogleSearchKeyword: GoogleSearchKeyword,
                GooglePagesName: GooglePagesName,
                GooglePagesURL: GooglePagesURL
            },
            success: function (data) {
                console.log(data);
            }
        });
    }

    function updateData(routes, vid, CompanyCode, CompanyAbbreviation, MachineryKeyword, GoogleSearchKeyword, GooglePagesName, GooglePagesURL) {
        console.log("updateData vid:", vid);
        $.ajax({
            type: 'PATCH',
            dataType: 'json',
            url: "/db/" + routes + '/' + vid,
            async: false,
            data: {
                CompanyCode: CompanyCode,
                CompanyAbbreviation: CompanyAbbreviation,
                MachineryKeyword: MachineryKeyword,
                GoogleSearchKeyword: GoogleSearchKeyword,
                GooglePagesName: GooglePagesName,
                GooglePagesURL: GooglePagesURL
            },
            success: function (data) {
                console.log(data);
            }
        });
    }

    function deleteData(routes, vid) {
        $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: "/db/" + routes + '/' + vid,
            async: false,
            success: function (data) {
                console.log(data);
            }
        });
    }
});
