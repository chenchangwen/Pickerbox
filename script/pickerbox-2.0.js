/*
    jQuery Pickerbox v2.0 - 2013-06-01
    (c) Kevin 21108589@qq.com
	license: http://www.opensource.org/licenses/mit-license.php
*/

 var defaults = {
     id: '',                         //对象ID
     title: '',                      //标题
     height: '100%',                 //高度
     width: '100%',                  //宽度
     text: '',                       //已选文本
     value: '',                      //已选值
     ismultiple: true,               //是否多选
     iframeid: '',                   //父窗口id
     url:'template1.html',
     pickergird: {                   //数据窗口的表格对象
         fieldtext: "",              //对象的文本
         fieldvalue: ""              //对象的值
     },
     showtype:"select"
 };

 var element = {
     out: {
         value: { id: 'temppickervalue' },
         text: { id: 'temppickertext' },
         picker: { id: 'temppickerid' },
         count: { id: 'temppickercount' },
         btn: { id: 'temppickerbtn' },
         innerbtn: { id: 'pickerinnerbtn' },
         style: 'pickerbox',
         warpdiv: { id: 'temppickerdiv' },
         iframe: { id: 'temppickeriframeid' },
         build: function() {
             var html = "<div id='" + element.out.warpdiv.id + "'><input id='" + element.out.text.id + "' class='" + element.out.style + "' type='hidden'/><input  id='" + element.out.value.id + "' class='" + element.out.style + "' type='hidden' /><input id='" + element.out.count.id + "' class='" + element.out.style + "' type='hidden'/><input id='" + element.out.btn.id + "' class='" + element.out.style + "' type='hidden'/><input type='hidden' class='" + element.out.style + "' id='" + element.out.picker.id + "'/><input type='hidden' class='" + element.out.style + "' id='" + element.out.iframe.id + "'/></div>";
             top.$("body").after(html);
         }
     }
 };
 var box = '';
//对象级别定义
(function ($) {
    $.fn.pickerbox = function (options) {
        var opts = $.extend({
        }, defaults, options);
        this.each(function() { 
            box.init(opts, $(this));
        });
    };
  
    //设置内容
    $.fn.pickerbox.setContent = function (p) {
        var o = $.pickerbox.getObject(p.id + "_content");
        if (o.length==0 || o.attr("tagName").toUpperCase() == "INPUT" ) {
            o.val(p.content);
        } else
            o.html(p.content);
        $.pickerbox.getObject(p.id + "_count").text(p.count);
        $.pickerbox.getObject(p.id + "_value").val(p.value);
    };
    
    box = {
        $self: '',
        element: {
            $content: '',
            content: {
                id: '',
                build: function (opts) {
                    validate(opts);
                    var p = opts;
                    var txt = p.text.split(",");
                    var val = p.value.split(",");
                    var h = '100%';
                    if (browser.isie7() || browser.isie6()) {
                        h = 'auto';
                    }
                    var html = "<select id='" + box.element.content.id + "' multiple='multiple' style='border:0;height:"+h+";width:100%'>";
                    var count = 0;
                    if (p.value != "") {
                        for (var i = 0; i < val.length; i++) {
                            html += "<option value='" + val[i] + "'>" + txt[i] + "</option>";
                            count++;
                        }
                    }
                    html += "</select>";
                    box.$self.html(html);
                    box.element.$count = $("#" + opts.id + '_count');
                    box.element.$content = $("#" + opts.id + '_content');

                    if (browser.isie7() || browser.isie6()) {
                        box.element.$content.css({ "width": box.element.$content.parent().css("width") });
                        box.$self.css("height", box.element.$content.css("height"));
                    }
                    
                    box.element.$count.text(count);
                }
            },
            $count: '',
            count: {
                id: '',
                set: function (id) {
                    $("#" + id + "_count").text($("#" + id + "_content>option").length);
                }
            },
            $value: '',
            value: {
                id: '',
                get: function() {
                    var v = picker.element.$value.val();
                    if (v.substr(v.length - 1, 1) == ',') {
                        return v;
                    } else if (v.length > 0) {
                        return v + ',';
                    }
                    return '';
                },
                set: function (value) {
                    if (value.substr(value.length - 1, 1) == ',') {
                        box.element.$value.val(value);
                    } else if (value.length > 0) {
                        box.element.$value.val(value + ',');
                    }
                }
            },
            $input:'',
            input: {
                id: '',
                build: function(opts) {
                    validate(opts);
                    var p = opts;
                    var txt = p.text.split(",");
                    var str = "";
                    for (var i = 0; i < txt.length; i++) {
                        str += txt[i] + ',';
                    }
                    
                    var html = "<input id ='" + box.element.content.id + "' readonly=readonly style='width:100%;' />";
                    box.$self.html(html);
                    box.$self.val(str.substr(0, str.length - 1));
                    box.element.$input = $("#" + opts.id + '_content');
                    
                    box.element.$input.click(function () {
                        showWindow(opts);
                    });
                }
            },
            button: {
                build: function () {
                    top.$("#" + element.out.btn.id).unbind("click").bind("click", function () {
                        $("#" + element.out.innerbtn.id).click();
                        var pid = $("#" + element.out.btn.id).attr("pickerboxid") == undefined ? top.$("#" + element.out.btn.id).attr("pickerboxid") : $("#" + element.out.btn.id).attr("pickerboxid");
                    
                        var val = $.pickerbox.getValueById(pid) == '' ? '空' : $.pickerbox.getValueById(pid);
                        var txt = $.pickerbox.getTextById(pid + "_content") == '' ? '空' : $.pickerbox.getTextById(pid + "_content");
                        var json = { id: pid, value: val, text: txt };
                        var obj = '';
                        if (top.box[pid] != undefined) {
                            obj = top.box[pid];
                            if (obj.onselected != "" && typeof obj.onselected == "function") {
                                obj.onselected(json);
                            }
                        } else if (box[pid] != undefined) {
                            obj = box[pid];
                            if (obj.onselected != "" && typeof obj.onselected == "function") {
                                obj.onselected(json);
                            }
                        }
                    });
                }
            },
            bindEvent: function (opts) {
                //onselected回调函数
                if (opts.onselected != undefined) {
                    box[opts.id] = {
                        onselected: function(p) {
                            opts.onselected(p);
                        }
                    };
                } else {
                    box[opts.id] = {
                        onselected: function () {}
                    };
                }
            }
        },
        init: function (opts, el,callback) {
            opts.id = box.createId(el);
            opts.showtype = opts.showtype == "" ? "select" : opts.showtype;
            box.element.content.id = opts.id+ "_content";
            box.element.value.id = opts.id + '_value';
            box.element.count.id = opts.id + '_count';
            
            box.$self = $("#" + opts.id);
            box.$self.attr("iframeid", opts.iframeid);
 
            var self = box.$self;
            self.after("<input id='" + box.element.value.id + "' type='hidden'/>");
            box.element.$value = $("#" + opts.id + '_value');
            // box.element.$content.css({ "width": "100%", "height": opts.height });

            if (opts.showtype == "select") {
                self.panel({
                    width: opts.width,
                    height: opts.height,
                    title: opts.title + ' 已选:<span style="color:red" id=' + box.element.count.id + '>0</span>条记录',
                    tools: [{
                            iconCls: 'icon-add',
                            handler: function() {
                                showWindow(opts);
                            }
                        }, {
                            iconCls: 'icon-cut',
                            handler: function() { del(opts); }
                        }]
                });
                box.element.content.build(opts);
            }
            else if (opts.showtype == "input") {
                box.element.input.build(opts);
                box.$self.css({ "width": opts.width});
            }
            box.element.button.build(opts,callback);
            box.element.value.set(opts.value);
            box.element.bindEvent(opts);

        },
        createId: function(obj) {
            var id = obj.attr("id");
            if (id == undefined || id == '') {
                var newid = new Date().getTime();
                obj.attr("id", newid);
                return newid;
            } else {
                return id;
            }
        },
        //键值
        keyvalue: {
            del: function (newkey,opts) {
                var oldvalue = $("#" + opts.id + "_value").val().split(',');
                var strvalue = '';
                for (var i = 0; i < oldvalue.length - 1; i++) {
                    if (oldvalue[i] != newkey.value) {
                        strvalue += oldvalue[i] + ',';
                    }
                }
                $("#" + opts.id + "_value").val(strvalue);
            }
        }
        
    };

    function validate(opts) {
        var p = opts;
        try {
            if (p.value.split(',').length != p.text.split(',').length) {
                throw new Error("错误:元素的id为" + p.id + '值不匹配.');
            }
        } catch (e) {
            alert(e.message);
        }

        if (p.value == '' || p.text == '') {
            p.count = 0;
            p.content = '';
            p.value = '';
            $.fn.pickerbox.setContent(p);
            return;
        }
    }

    function del(opts) {
        var boxobj = $("#" + opts.id+"_content");
        var newkey = {};
        $("#" + opts.id + "_content> option:selected").each(function () {
            var arrlist =$("#" + opts.id +"_value").val().split(",");
            var o = $(this);
            var index = o.index();
            for (var i = 0; i < arrlist.length; i++) {
                if (arrlist[i] == o.attr("value")) {
                    newkey.value = arrlist[i];
                    newkey.text = o.text();
                    $("#" + opts.id + "_content>option[value='" + o.attr("value") + "']").remove();
                    if (boxobj.children().length > index) {
                        boxobj.get(0).selectedIndex = index;
                    }
                    else {
                        boxobj.get(0).selectedIndex = index - 1;
                    }
                    box.keyvalue.del(newkey, opts);
                    box.element.count.set(opts.id);
                }
            }
        });
        
    }

    function showWindow(opts) {
        var p = opts;
        var url =  p.url + "?d=" + new Date().getTime();
        url += "&iframeid=" + p.iframeid;
        url += (p.ismultiple == true ? "&ismultiple=true" : "&ismultiple=false");
        url += "&pickerbox=" + p.id;
        url += "&fieldtext=" + p.pickergird.fieldtext + "&fieldvalue=" + p.pickergird.fieldvalue;
        if ($("#" + p.id+"_content").attr("tagName").toUpperCase() == "INPUT") {
            url += "&tagname=input";
        }
        var target = $("#colorbox").length > 0 ? window : top;
        var h = '605px';
        var w = '1060px';
        if (browser.isie6() || browser.isie7()) {
            h = '625px';
            w = '1062px';
        }
 
        target.$.colorbox({ href: url, width: w, height: h, iframe: true });
        top.$("#"+element.out.value.id).val($.pickerbox.getValueById(p.id));
        top.$("#"+element.out.text.id).val($.pickerbox.getContentById(p.id+"_content"));
        top.$("#"+element.out.count.id).val($.pickerbox.getCountById(p.id));
    }
})($);

//命名空间定义

$.pickerbox = {
    //获得已选数量
    getCountById: function (id) {
        return $.pickerbox.getObject(id + "_count").text();
    },
    //获得Html内容
    getContentById: function (id) {
        var obj = $.pickerbox.getObject(id);
        if (obj.attr("tagName").toUpperCase() == "INPUT") {
            return obj.val();
        }
        return obj.html();
    },
    //获取值
    getValueById: function (id) {
        var obj = $.pickerbox.getObject(id+"_value");
        var value = obj.val();
    
        if (value.substr(value.length - 1, 1) == ',') {
            return value.substr(0, value.length - 1);
        }
        else {
            return value;
        }
    },
    //获取已选的文本
    getTextById: function (id) {
        var text = '';
        var obj = $.pickerbox.getObject(id);
        if (obj.attr("tagName").toUpperCase() == "INPUT") {
            return obj.val();
        }
        else {
            $.pickerbox.getObject(id).children("option").each(function () {
                if ($(this).text() != '')
                    text += $(this).text() + ",";
            });
            return text.substr(0, text.length - 1);
        }
    },
    getObject: function (id) {
        var iframevalue = top.$("#" + element.out.iframe.id).val();
        if (iframevalue != "temppickeriframeid" && iframevalue != "") {
            if (top.$("#" + iframevalue).contents().find("#" + id).length >= 1) {
                return top.$("#" + iframevalue).contents().find("#" + id);
            }
            return top.$("#" + id).attr('id') == undefined ? $("#" + id) : top.$("#" + id);
        }
        return top.$("#" + id).attr('id') == undefined ? $("#" + id) : top.$("#" + id);
    }
};

var browser = {
    isie6: function () {
        return $.browser.msie && ($.browser.version == "6.0");
    },
    isie7: function () {
        return $.browser.msie && ($.browser.version == "7.0");
    }
};


$(document).ready(function () {
    //判断这个页面是否被iframe引用 或者还没添加中间传值元素,中间传值元素只允许存在一个.
    if (location.href == top.location.href || $("a[class='" + element.out.style + "']").length == 0) {
        $("body").append("<input id='"+element.out.innerbtn.id+"' value='pickerinnerbtn' type='hidden'></input>");
        $("#" + element.out.innerbtn.id).click(function () {
            var pid = top.$("#" + element.out.picker.id).val();
            var p = {
                id: pid,
                count: top.$("#"+element.out.count.id).val(),
                text: top.$("#"+element.out.text.id).val(),
                value: top.$("#"+element.out.value.id).val(),
                content: top.$("#"+element.out.text.id).val()
            };
            $("#" + pid+"_content").pickerbox.setContent(p);
        });
        //写入中间传值使用的元素
        if (top.$("#" + element.out.warpdiv.id).length == 0) {
            element.out.build();
        }
    }
});
 
