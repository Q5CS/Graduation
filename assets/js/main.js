var pageNum = 9;
var noSwipe = [0, 7, 8];
var loged = false;
var user = {};
// 页面事件
var e = {
    1: function () {
        $(".item-1 .btn-login").unbind().click(function () {
            if (!playing && first) switchPlay(); // 放歌
            if (loged) {
                myslider.next(); // 登录了就直接跳过
                return;
            }
            layer.open({
                content: `
                    <h3 style="text-align:center">请输入校园网账号和密码</h3>
                    <div class="input-group">
                        <input type="text" id="input-un" class="form-control" placeholder="姓名 / 手机号">
                    </div>
                    <div class="input-group">
                        <input type="password" id="input-pw" class="form-control" placeholder="密码">
                    </div>
                    <br>
                    <div class="checkbox">
                        <label>
                            <input id="agree" type="checkbox" checked> 我同意授权相关信息用于分析和展示
                        </label>
                    </div>
                    <br>
                    <div class="center"><button id="btn-do-login" class="button button-primary button-rounded">登录</button></div>
                `,
                success: function (elem) {
                    console.log(elem);
                    $("#agree").click(function () {
                        if ($('#agree').prop('checked')) {
                            $("#btn-do-login").show();
                        } else {
                            $("#btn-do-login").hide();
                        }
                    });

                    $("#btn-do-login").click(function () {
                        var un = $("#input-un").val();
                        var pw = $("#input-pw").val();
                        if (!un || !pw) {
                            alert("用户名和密码不能为空！");
                            return;
                        }
                        $("#btn-do-login").attr("disabled", "true");
                        $("#btn-do-login").html("正在分析，请稍候");
                        login(un, pw, function (status, err_msg) {
                            if (status > 0) {
                                layer.closeAll();
                                myslider.next();
                            } else {
                                alert(err_msg);
                            }
                            $("#btn-do-login").removeAttr("disabled");
                            $("#btn-do-login").html("登录");
                        });
                    });
                }
            });
        });
    },
    8: function () {
        $("#say-btn").unbind().click(function () {
            layer.open({
                content: '提交后，不可以修改哦！<br>想好了吗？',
                btn: ['确定啦', '我再看看'],
                yes: function (index) {
                    post(function () {
                        myslider.next();
                    });
                    layer.close(index);
                }
            });
        });
    },
    9: function () {
        $(".btn-share").unbind().click(function () {
            mobShare.ui.init();
            mobShare.ui.open();
        });
    }
};

// 初始化滑动组件
var myslider = new iSlider({
    wrap: '#wrap',
    item: '.item',
    onslide: function (index) {
        console.log(index);
        $('body').addClass('loaded'); //去除加载hover
        // 换背景
        if (index != 0 && index != 8) {
            $("#bg2").show();
            $(".cloud").show();
            $(".flight").show();
            $("#bg1").hide();
        } else {
            $("#bg1").show();
            $("#bg2").hide();
            $(".cloud").hide();
            $(".flight").hide();
        }
        // 隐藏和显示下方箭头
        if (index + 1 == pageNum || noSwipe.indexOf(index) != -1) {
            $(".sprite_global").hide();
        } else {
            $(".sprite_global").show();
        }
        // 触发相关事件
        try {
            e[index + 1]();
        } catch (err) {};
        setData();
    },
    noslide: noSwipe, //禁止滑动的页面，由按钮控制
    speed: 600,
    lastLocate: false,
    loadingImgs: [
        "assets/img/bg1.jpg",
        "assets/img/bg2.jpg",
        "assets/img/pages/1/1.png",
        "assets/img/pages/2/1.png",
        "assets/img/pages/3/1.png",
        "assets/img/pages/4/1.png",
        "assets/img/pages/5/1.png",
        "assets/img/pages/6/1.png"
    ] //图片预加载
});
console.info(myslider);

function setData() {
    //输出数据
    $("#score-from").html(user.from);
    $("#score-to").html(user.to);
    p = ((user.from - user.to) / user.from * 100).toFixed(1);
    $("#score-percent").html(p);
    if (user.stay) {
        $("#steps").html("四千");
    } else {
        $("#steps").html("两千五百");
    }
    //根据名字出一个数字
    rNum = user.name.charCodeAt();
    n1 = rNum % 4;
    n2 = rNum % 3;
    n3 = rNum % 2;
    var k1 = ["健康", "初心", "勇气", "希望"];
    var k2 = ["勤奋", "奋斗", "成长"];
    var k3 = ["幸福", "一鸣惊人"];
    $("#keyword1").html(k1[n1]);
    $("#keyword2").html(k2[n2]);
    $("#keyword3").html(k3[n3]);
}


// 与服务端交互
function login(un, pw, callback) {
    $.ajax({
        type: "POST",
        url: "https://record2018.qz5z.ren/api/main/getInfo",
        data: {
            "un": un,
            "pw": pw
        },
        dataType: "json",
        success: function (res) {
            if (res.status < 0) {
                callback(res.status, res.msg);
            } else {
                user = res;
                loged = true;
                callback(res.status);
            }
        }
    });
}

// 写给自己
function post(callback) {
    var uid = user.uid;
    var name = user.name;
    var email = $("#say-email").val();
    var t1 = $("#say-t1").val();
    var t2 = $("#say-t2").val();
    if (!email || !t1 || !t2) {
        layer.open({
            content: '仔细检查，不许留空哦！',
            btn: '我知道了'
        });
        return;
    }
    var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
    if (!reg.test(email)) {
        layer.open({
            content: '邮箱格式有误，请检查！',
            btn: '我知道了'
        });
        return;
    }
    $("#say-btn").attr("disabled", "true");
    $("#say-btn").html("正在保存，请稍候");
    $.ajax({
        type: "POST",
        url: "https://record2018.qz5z.ren/api/main/post",
        data: {
            "uid": uid,
            "name": name,
            "email": email,
            "text1": t1,
            "text2": t2
        },
        dataType: "json",
        success: function (res) {
            $("#say-btn").removeAttr("disabled");
            $("#say-btn").html("写好啦");
            if (res.status < 0) {
                layer.open({
                    content: res.msg,
                    btn: '我知道了'
                });
            } else {
                layer.open({
                    content: res.msg,
                    btn: '我知道了'
                });
                callback();
            }
        }
    });
}

// BGM
var playing = false;
var first = true;
var bgmElm = document.getElementById("bgm");

function switchPlay() {
    if (playing) {
        $('.music-btn').attr('src', 'assets/img/music-off.png');
        playing = false;
        bgmElm.pause();
    } else {
        $('.music-btn').attr('src', 'assets/img/music.png');
        playing = true;
        first = false;
        bgmElm.volume = 0.2;
        bgmElm.play();
    }
}
bgmElm.oncanplay = function () {
    if (!playing) switchPlay();
};
document.addEventListener("WeixinJSBridgeReady", function () {
    if (!playing) switchPlay();
}, false);

$('.music-btn').click(function () {
    switchPlay();
});