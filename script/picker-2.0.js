/*
    jQuery Pickerbox v2.0 - 2013-05-30
    (c) Kevin 21108589@qq.com
	license: http://www.opensource.org/licenses/mit-license.php
*/

var defaults = {
    panel: {
        datagrid: {
            pagination: true,
            rownumbers: true,
            columns: [],
            loadMsg:"载入中..."
        },
        tree: {
            isVisible: false
        },
        searchbutton: {
            onclick:function() {}   
        }
    },
    ismultiple: $.query.get('ismultiple') == 'true' ? true : false
    
//    navbar: {
//        columns: [],
//        queryurl: '' //查询url
//    },
};

var search = function (where) {
};

var windowWidth = '1000';

//定义对象
var picker = {
/*公开方法*/
    searchText: {
        getText: function () {
            return picker.element.panel.$searchtext.val();
        }
    },
    reload: function (where) {
        picker.element.panel.$grid.datagrid('reload', { where: where });
    }
    ,
/**/
    $self: '',
    id: "pickerpanel",
    element: {
        $parent: '', $value: '', $text: '', $pickerbox: '',
        text: {
            id: 'pickertext'
        },
        value:
        {
            id: 'pickervalue',
            get: function() {
                var v = picker.element.$value.val();
                if (v.substr(v.length - 1, 1) == ',') {
                    return v;
                } else if (v.length > 0) {
                    return v + ',';
                }
                return '';
            },
            set: function(value) {
                if (value.substr(value.length - 1, 1) == ',') {
                    picker.element.$value.val(value);
                } else if(value.length>0){
                    picker.element.$value.val(value+',');
                }
            }
        },
        out: {
            value: {id: 'temppickervalue'},
            text: {id: 'temppickertext'},
            picker: {id: 'temppickerid'},
            count: {id: 'temppickercount'},
            btn:{id: 'temppickerbtn'},
            pickerbox:{id: ''},
            iframe: { id: 'temppickeriframeid' }
        },
        panel: {
            $grid: '',$tree: '',$top: '',
            $content: '',
            $button: '',
            $count: '',
            $searchtext: '', $searchbutton: '',
            search: {
                text: {
                    id: 'searchtext'
                },
                button: {
                    id: 'searchbtn'
                },
                onclick:'',
            },
            grid: {
                id: 'pickergrid',
                width: '745',
                build: function() {
                    var tb = "<div id='tb' style='padding:1px;height:auto'><div style='margin-bottom:1px'><span class='searchbox' style='overflow:inherit'><input type='text' id='"+picker.element.panel.search.text.id+"' value='' class='searchbox-text searchbox-prompt' />搜索:<span><span class='searchbox-button' id='searchbtn'></span></span></span></div></div>";
                    $("body").append(tb);
                    var t = defaults.panel.datagrid.title == '' ? '数据列表' : defaults.panel.datagrid.title;
                    var grid = "<table id='" + picker.element.panel.grid.id + "'  title='" + t + "'></table>";
                    var div;
                    if (defaults.panel.tree.isVisible) {
                        div = "<div style='margin-left:5px;float:left'>" + grid + "</div>";
                    } else
                        div = "<div style='float:left;'>" + grid + "</div>";
                    picker.$self.append(div);
                    picker.element.panel.$grid = $("#" + picker.element.panel.grid.id);
                    picker.element.panel.$searchtext = $("#" + picker.element.panel.search.text.id);
                    picker.element.panel.$searchbutton = $("#" + picker.element.panel.search.button.id);
                    picker.element.panel.$searchtext.focus();
                }
            },
            content: {
                id: 'content',
                build: function () {
                    var select = "<select id='"  +picker.element.panel.content.id + "' multiple='multiple' class='box'></select>";
                    var div = "<div style='margin:5px auto;width:" + windowWidth + "px;float:left;'>" + select + "</div>";
                    $("body").append(div);
                    
                    $("#" + picker.element.panel.content.id).panel({
                        title: '已选:<span style="color:red" id=' + picker.element.panel.count.id + '>0</span>条记录',
                        tools: [{
                            iconCls: 'icon-cut',
                            handler: function() { picker.box.button.del(); }
                        }]
                    });
                    picker.element.panel.$count = $("#" + picker.element.panel.count.id);
                }
            },
            button: {
                build: function() {
                    var html = "<div style='text-align: center;margin:0 auto;float:left;width:" + windowWidth + "px'><a id='finish' data-options=\"iconCls:'icon-save'\" class=\"easyui-linkbutton l-btn\" href=\"#\"><span class=\"l-btn-left\"><span class=\"l-btn-text icon-save l-btn-icon-left\">确定</span></span></a>" + "<a id='cancel' class=\"easyui-linkbutton l-btn\" data-options=\"iconCls:'icon-cancel'\" href=\"javascript:void(0)\" style='margin-left:15px'><span class=\"l-btn-left\"><span class=\"l-btn-text icon-cancel l-btn-icon-left\">关闭</span></span></a>" +"</div>";
                    $("body").append(html);
                }
            },
            tree: {
                id: 'tree',
                width: 250,
                height: 300,
                build: function() {
                    var html = "<div style='width: auto; float: left; min-height: 1px; width: " + picker.element.panel.tree.width + "px;' ><ul id=" + picker.element.panel.tree.id + " class='ztree' style='background: white; margin-top: 0px; height:321px;width:" + (picker.element.panel.tree.width - 12) + "px'></ul></div>";
                    picker.$self.append(html);
                    var obj = $("#" + picker.element.panel.tree.id);
                    var t = defaults.panel.tree.title == '' ? '目录' : defaults.panel.tree.title;
                    obj.panel({
                        title: t,
                        width: picker.element.panel.tree.width
                    });
                    loadTree();
                }
            },
            navbar: {
                build: function() {
                    var html = "<div class='panel' style='width: " + windowWidth + "px'><div class='panel-header' style='line-height: 20px; *line-height: 18px'><div class='panel-title' id ='panel-title'></div><div class='panel-tool'><span class='searchbox'><input type='text' id='searchText' class='searchbox-text searchbox-prompt' />查询:<span><span class='searchbox-button' id='searchbtn'></span></span></span></div></div></div>";
                    $("#" + picker.id).before(html);
                }
            },
            count: {
                id: 'count',
                get: function() {
                    return picker.element.panel.$count.text();
                },
                set: function () {
                    picker.element.panel.$count.text($("#" + picker.element.panel.content.id + ">option").length);
                }
            },
            //panel初始化
            init: function() {
                if (defaults.panel.tree.isVisible) {
                    picker.element.panel.tree.build();
                }
                picker.element.panel.grid.build();
                picker.element.panel.content.build();
                picker.element.panel.button.build();
                picker.element.panel.$content = $("#" + picker.element.panel.content.id);

            }
        },
        init: function (opts) {

            var pickerpanel = '<div id="pickerpanel" style="margin: 0 auto; width: 1000px"></div>';
            var pickerinput = "<input value='' id='pickervalue' type='hidden' /><input value='' id='pickertext' type='hidden' />";
            var pickerhtml = pickerpanel + pickerinput;
            $("body").html(pickerhtml);
 
            picker.$self = $("#" + picker.id);
            
            defaults = $.extend(true, defaults, opts);
            
            picker.element.$value = $("#"+ picker.element.value.id);
            picker.element.$text = $("#" + picker.element.text.id);
           
            picker.element.out.pickerbox.id = $.query.get('pickerbox');
 
            picker.grid.fieldtext = $.query.get('fieldtext');
            picker.grid.fieldvalue = $.query.get('fieldvalue');
            
            picker.element.panel.init();
        }
    },
 
    //键值
    keyvalue: {
        add: function(kvobj) {
            picker.element.$value.val(kvobj.value + "," + picker.element.$value.val());
            picker.element.$text.val(kvobj.text + "," + picker.element.$text.val());
        },
        del: function (newkey) {
            var oldvalue = picker.element.$value.val().split(',');
            var oldtext = picker.element.$text.val().split(',');
            var strvalue = '';
            var strtext = '';
            for (var i = 0; i < oldvalue.length - 1; i++) {
                if (oldvalue[i] != newkey.value && oldtext[i] != newkey.text) {
                    strvalue += oldvalue[i] + ',';
                    strtext += oldtext[i] + ',';
                }
            }
            picker.element.$value.val(strvalue);
            picker.element.$text.val(strtext);
        }
    },
    //创建
    build: function (options) {
 
        picker.element.init(options);
        if ($.query.get('pickerbox') != "") {
            var outvalueid = picker.element.out.value.id;
            if (parent.$("#" + outvalueid).length == 0 && top.$("#" + outvalueid).length == 0 || top.$("#" + outvalueid) == '') {
                picker.element.$value.val('');
                picker.element.panel.$content.html('');
            } else {
                var target = parent;
                if (parent.$("#" + outvalueid).val() == undefined)
                    target = top;
                var val = target.$("#" + outvalueid).val();
                //picker.element.$value.val(val);
                picker.element.value.set(val);
 
                var text = '';
                if ($.query.get('tagname') == "input" && val != '') {
                    var html = '';
                    var pickertext = (parent.$("#" + picker.element.out.pickerbox.id).val()).toString().split(',');
                    picker.element.$value.val(picker.element.$value.val() + ",");
                    var pickervalue = picker.element.$value.val().split(",");
                    for (var i = 0; i < pickertext.length; i++) {
                        text += pickertext[i] + ',';
                        html += "<option value='" + pickervalue[i] + "'>" + pickertext[i] + "</option>";
                    }
                    picker.element.panel.$content.html(html);
                    picker.element.$text.val(text);
                } else {
                    picker.element.panel.$content.html(target.$("#" + picker.element.out.text.id).val());
               
                    picker.element.panel.$content.children("option").each(function () {
                        if ($(this).text() != undefined)
                            text += $(this).text() + ',';
                    });
                    picker.element.$text.val(text);
                }
            }
        }
        picker.grid.datagrid();
        picker.bindEvent();
    },
    //关闭
    close: function() {
        parent.$.fn.colorbox.close();
    },
    //完成
    finish: function() {
        picker.setValue();
        parent.$.fn.colorbox.close();
    },
    //绑定事件
    bindEvent: function() {
        (function() {
            $("#finish").bind("click", function() {
                picker.finish();
            });
            
            //绑定搜索,回车事件
            if (defaults.panel.searchbutton.onclick != undefined) {
                search = defaults.panel.searchbutton.onclick;
                $('html').keydown(function (e) {
                    if (e.keyCode == 13) {
                        search();
                    }
                });
                $("#" + picker.element.panel.search.button.id).bind("click", function() {
                    search();
                });
            }

            $("#cancel").bind("click", function() {
                picker.close();
            });
        })();
    },
    //设置值到pickerbox
    setValue: function() {
        var id = picker.element.out.pickerbox.id;
        if (id != "" && id != null)
            setValueToPickerBox(top);
//            if (picker.element.out.parent.id == true) {
//                setValueToPickerBox(top);
//            } else {
//                setValueToPickerBox(picker.element.out.parent.id);
//            }
    }
};

//picker.tag继承
picker.tag = {
    datatag: function (opts) {
        var len = opts.tag.columns.length;
        if (opts.tag.columns[0] == 0) {
            $("#panel-title").css("height", "20px");
            return;
        }
        var html = '';
        var navindex = $.query.get('navindex');
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < opts.tag.columns[i].length; j++) {
                html += "<a id='tag" + j + "'class='navindex' href='javascript:void(0)' style='display:none'>" + opts.tag.columns[i][j].name + "</a>  ";
            }
        }
        if (html != '')
            $("#panel-title").html(html);
        //等于false 默认全部显示
        if (navindex == "false") {
            $("a[class='navindex']").show();
        }
        //否则检测对应索引
        else {
            if (navindex.substr(navindex.length - 1, 1) == ',') {
                navindex = navindex;
            }
            else
                navindex = navindex + ',';

            for (i = 0; i < navindex.split(',').length; i++) {
                $("a[id='tag" + navindex[i] + "']").show();
            }
        }
        picker.tag.bindEvent(opts);
    },
    query: function (opts) {
        picker.element.panel.$grid.datagrid({
            url: opts.tag.queryurl
        });
    },
    bindEvent: function (opts) {
        $("#panel-title>a").each(function (i) {
            $(this).unbind('click').bind('click', function () {
                picker.element.panel.$grid.datagrid({
                    url: opts.tag.columns[0][i].url,
                    columns: opts.datagrid.columns
              });
            });
        });
    }
};

 
//picker.box继承
picker.box = {
    getValueArray:function () {
        return picker.element.$value.val().split(",");
    },
    //获取box的值
    getValue: function () {
        return picker.element.$value.val();
    },
    //获取box的文本以,号分割
    getText: function () {
        var str = '';
        var pickertext =picker.element.$text.val().split(',');
        if (pickertext.length == 1)
            return pickertext;
        for (var i = 0; i < pickertext.length - 1; i++) {
            str += pickertext[i] + ",";
        }
        return str.substr(0, str.length - 1);
    },
    //获取box的内容
    getContent: function () {
        return picker.element.panel.$content.html();
    },
    //设置box数量
    setCount: function () {
        picker.element.panel.$count.text(picker.element.$value.val().split(",").length - 1);
    },
    //删除
    del: function (rowindex, rowdata) {
        var arrlist = picker.element.$value.val().split(",");
        var newkey = {};
        for (var i = 0; i < arrlist.length; i++) {
            if (arrlist[i] == rowdata[picker.grid.fieldvalue]) {
                newkey.value = arrlist[i];
                newkey.text = rowdata[picker.grid.fieldtext];
                $("#" + picker.element.panel.content.id + " option[value='" + rowdata[picker.grid.fieldvalue] + "']").remove();
                picker.keyvalue.del(newkey);
            }
        }
     
        if (picker.grid.checkbox.getCheckbox(false).length > 0) {
            picker.grid.checkbox.getHeaderRow().attr("checked", false);
        }
        picker.element.panel.count.set();
    },
    //删除全部
    delAll: function (rows) {
        var arrlist = picker.element.$value.val().split(",");
        var newkey = {};
        for (var j = 0; j < rows.length; j++) {
            for (var i = 0; i < arrlist.length; i++) {
                if (arrlist[i] == rows[j][picker.grid.fieldvalue]) {
                    $("#" + picker.element.panel.content.id + " option[value='" + rows[j][picker.grid.fieldvalue] + "']").remove();
                    newkey.value = rows[j][picker.grid.fieldvalue];
                    newkey.text = rows[j][picker.grid.fieldtext];
                    picker.keyvalue.del(newkey);
                }
            }
        }
        picker.element.panel.count.set();
    },
    //单选项移动
    singleMove: function () {
        var row = picker.grid.getSelectRow();
        picker.element.panel.$content.html('');
        picker.element.$value.val(row.selectedvalue+',');
        picker.element.$text.val(row.selectedtext);
        picker.element.panel.$content.append("<option value='" + row.selectedvalue + "'>" + row.selectedtext + "</option>");
        picker.element.panel.$count.text("1");
    },
    //移动项
    move: function () {
        if (!defaults.ismultiple){
            picker.box.singleMove();
        }
        else {
            var row = picker.grid.checkbox.getSelections();
            var len = row.length;
            var newkey = {};
            for (var i = 0; i < len; i++) {
                var txt = row[i][picker.grid.fieldtext];
                var val = row[i][picker.grid.fieldvalue];
                var arrlist = picker.element.$value.val().split(",");
                var sum = 0;
                //如果只选了一个对象
                if (len == 1) {
                    newkey.value = val;
                    newkey.text = txt;
                    picker.keyvalue.add(newkey);
                    picker.element.panel.$content.append("<option value='" + val + "'>" + txt + "</option>");
                    break;
                }
                else {
                    //循环判断是否存在已选择的对象
                    for (var j = 0; j < arrlist.length - 1; j++) {
                        if (arrlist[j] == val && arrlist[j]!="") {
                            sum++; //return;
                        }
                    }
                    //如果没有重复的选择对象
                    if (sum == 0) {
                        picker.element.$value.val(picker.element.$value.val() + val +",");
                        picker.element.$text.val( picker.element.$text.val() + txt+ ",");
                        picker.element.panel.$content.append("<option value='" + val + "'>" + txt + "</option>");
                    }
                }
            }
            picker.grid.unSelectRow();
        }
    }
};

//picker.button继承
picker.box.button = {
    //清空
    clear: function () {
        picker.element.$value.val("");
        picker.grid.checkbox.clearSelections();
        picker.element.panel.$content.html('');
        picker.element.panel.$count.text("0");
        picker.element.$text.val("");
    },
    //删除
    del: function () {
        var boxobj = picker.element.panel.$content;
        var newkey = {};
        $("#" + picker.element.panel.content.id + " > option:selected").each(function () {
            var arrlist = picker.element.$value.val().split(",");
            var o = $(this);
            var index = o.index();
            for (var i = 0; i < arrlist.length; i++) {
                if (arrlist[i] == o.attr("value")) {
                    newkey.value = arrlist[i];
                    newkey.text = o.text();
                    $("#" + picker.element.panel.content.id + ">option[value='" + o.attr("value") + "']").remove();
                    //清除对应checkbox
                    picker.grid.checkbox.unCheckbox(arrlist[i]);
                    if (boxobj.children().length > index) {
                        boxobj.get(0).selectedIndex = index;
                    }
                    else {
                        boxobj.get(0).selectedIndex = index - 1;
                    }
                    if (picker.grid.checkbox.getCheckbox().length == 0) {
                        picker.grid.checkbox.getHeaderRow().attr("checked", false);
                    }
                }
            } 
        });
        picker.keyvalue.del(newkey);
        picker.grid.unSelectRow();
    }
};


//设置值到pickerbox
function setValueToPickerBox(target) {
    var tpicker = picker.element.out;
 
    target.$("#" + tpicker.picker.id).val(picker.element.out.pickerbox.id);
    target.$("#" + tpicker.value.id).val(picker.element.value.get());
    if ($.query.get('tagname') == "input") {
        target.$("#" + tpicker.text.id).val(picker.box.getText());
    }
    else
        target.$("#" + tpicker.text.id).val(picker.box.getContent());
    
    target.$("#" + tpicker.count.id).val(picker.element.panel.count.get());
    var iframeid = $.query.get("iframeid") == true ? "temppickeriframeid" : $.query.get("iframeid");
    target.$("#" + tpicker.iframe.id).val(iframeid);
    target.$("#"+tpicker.btn.id).attr("pickerboxid", picker.element.out.pickerbox.id);
    target.$("#"+tpicker.btn.id).click();
    
}

//for easyui datagrid and override it.
picker.grid = {
    datagrid: function () {
        var opts = defaults.panel;
        var gridobj = picker.element.panel.$grid;
        var w = opts.datagrid.width == undefined ? picker.element.panel.grid.width : opts.datagrid.width;
        if (!defaults.panel.tree.isVisible) {
            w = windowWidth;
        }
        gridobj.datagrid({
            url: opts.datagrid.url,
            width: w,     
            height: '361',
            toolbar: '#tb',
            singleSelect: defaults.ismultiple==true?false:true,
            pagination: opts.datagrid.pagination == undefined ? false : defaults.panel.datagrid.pagination,
            rownumbers: opts.datagrid.rownumbers == undefined ? false : defaults.panel.datagrid.rownumbers,
            loadMsg: opts.datagrid.loadMsg,
            fitColumns: true,
            columns: opts.datagrid.columns,
            onLoadSuccess: function () {
                function bindRowsEvent() {
                    var panel = gridobj.datagrid('getPanel');
                    var rows = panel.find('tr[datagrid-row-index]');
                    rows.unbind('click').bind('click', function () {
                        return false;
                    });
                    rows.find('div.datagrid-cell-check input[type=checkbox]').unbind().bind('click', function (e) {
                        var index = $(this).parent().parent().parent().attr('datagrid-row-index');
                        if ($(this).attr('checked')) {
                            gridobj.datagrid('selectRow', index);
                            picker.box.move();
                        } else {
                            gridobj.datagrid('unselectRow', index);
                        }
                        e.stopPropagation();
                    });
                    //header row
                    if (defaults.ismultiple == true) {
                        rows = panel.find('tr');
                        rows.find('div.datagrid-header-check input[type=checkbox]').unbind().bind('click', function (e) {
                            if ($(this).attr('checked')) {
                                gridobj.datagrid('selectAll');
                                picker.box.move();
                            } else {
                                gridobj.datagrid('unselectAll');
                            }
                            e.stopPropagation();
                        });
                    }
                }
                setTimeout(function () {
                    bindRowsEvent();
                }, 10);
                picker.grid.showSelectedRow();
            },
            onUnselect: function (rowIndex, rowData) {
                picker.box.del(rowIndex, rowData);
            },
            onUnselectAll: function (rows) {
                picker.box.delAll(rows);
            }
        });
        var p = gridobj.datagrid('getPager');
        $(p).pagination({
            pageNumber: 1,
            pageList: [10, 20, 30, 40, 50],    //可以设置每页记录条数的列表 
            beforePageText: '第',  //页数文本框前显示的汉字 
            afterPageText: '页  共 {pages} 页',
            displayMsg: '当前显示 {from} - {to} 条记录 共 {total} 条记录',
//            onSelectPage: function (pageNumber, pageSize) {
//                gridobj.datagrid('reload', {
//                    'currentPage': pageNumber,
//                    'pageSize': pageSize
//                });
//                
//            }
            onChangePageSize: function() {
                picker.grid.showSelectedRow();
            }
        });
    },
    checkbox: {
        //获取所有checkbox对象
        getCheckbox: function (type) {
            var panel = picker.element.panel.$grid.datagrid('getPanel');
            var rows = panel.find('tr[datagrid-row-index]');
            if (type)
                return rows.find('div.datagrid-cell-check input[type=checkbox]:checked');
            else {
                return rows.find('div.datagrid-cell-check input[type=checkbox]:not(input:checked)');
            }
        },
        //获取头行
        getHeaderRow: function () {
            var panel = picker.element.panel.$grid.datagrid('getPanel');
            var rows = panel.find('tr');
            return rows.find('div.datagrid-header-check input[type=checkbox]');
        },
        //清空所有选项
        clearSelections: function () {
            picker.grid.checkbox.getHeaderRow().attr("checked", false);
            picker.element.panel.$grid.datagrid('clearSelections');
        },
        //获取所有已选择的行
        getSelections: function () {
            return picker.element.panel.$grid.datagrid('getSelections');
        },
        //取消选择
        unCheckbox: function (selectedvalue) {
            var rows = picker.element.panel.$grid.datagrid('getRows');
            for (var i = 0; i < rows.length; i++) {
                if (rows[i][picker.grid.fieldvalue] == selectedvalue) {
                    picker.element.panel.$grid.datagrid('unselectRow', i);
                }
            }
        }
    },
    getRows: function () {
        return picker.element.panel.$grid.datagrid('getRows');
    },
    getSelectRow: function () {
        var row = picker.element.panel.$grid.datagrid('getSelected');
        var text = '', value = '';
        if (typeof (row[picker.grid.fieldtext] == "Object")) {
            text = row[picker.grid.fieldtext];
        }
        if (typeof (row[picker.grid.fieldvalue] == "Object")) {
            value = row[picker.grid.fieldvalue];
        }
        var r = {
            selectedtext: text,
            selectedvalue: value
        };
        return r;
    },
    fieldtext: "",
    fieldvalue: "",
    //取消/选择行
    unSelectRow: function () {
        var panel = picker.element.panel.$grid.datagrid('getPanel');
        var rows = panel.find('tr[datagrid-row-index]');
        var len = rows.find('div.datagrid-cell-check input[type=checkbox]:checked').length;
        var totallen = rows.find('div.datagrid-cell-check input[type=checkbox]').length;
        if (len == totallen) {
            picker.grid.checkbox.getHeaderRow().attr("checked", true);
        } else {
            picker.grid.checkbox.getHeaderRow().attr("checked", false);
        }
        picker.element.panel.count.set();
    },
    //显示已选行
    showSelectedRow: function () {
        var rows = picker.element.panel.$grid.datagrid('getRows');
        for (var i = 0; i < rows.length; i++) {
            var arrlist = picker.element.$value.val().split(",");
            for (var j = 0; j < arrlist.length; j++) {
               
                if (rows[i][picker.grid.fieldvalue] == arrlist[j]) {
                         picker.element.panel.$grid.datagrid('selectRow', i);
                }
            }
        }
        if (picker.grid.checkbox.getCheckbox(true).length == parseInt(rows.length)) {
            picker.grid.checkbox.getHeaderRow().attr("checked", true);
        }
        else {
            picker.grid.checkbox.getHeaderRow().attr("checked", false);
        }
        picker.element.panel.count.set();
    }
};

 