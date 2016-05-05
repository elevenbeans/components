require('../../zepto/touch');
       let win = window,
        resizeEvt = 'onorientationchange' in win ? 'orientationchange' : 'resize';

class Sticky {

    constructor(options) {
        var check_node = $(options).get(0);
        if(check_node && check_node.nodeType){
            window.console && console.log("mui/tabs/sticky的该用法已经废弃，请尽快切换使用插件的用法！");
            return new (require("./tabs"))(options,arguments[1]).plug(new Sticky(options));
        }
        options = this.options = options || {};
        if(!options.offsetTop){options.offsetTop=0;}
    }

    pluginInitializer(tabs){
        //如果没有设置stickytop 则获取自身的top值
        var me =this,
            el = tabs.$el;
        if(!me.options.offsetTop){
            me.options.offsetTop = el.offset().top
        }
        me.tabs=tabs;
        //获取一下容器的高度
        me.elHeight = el.height();
        //不支持原生sticky
        if(me.options.disableNativeSticky || !Sticky.supportSticky()){
            me.$pholder = $('<div style="display:none;height: '+ me.elHeight +'px"></div>').insertAfter(el);

            me.stickyChange = 1;
            $(win).on('scroll touchmove',() => {
                win.rAF(function(){
                    me._stickyEvt();
                })
            });
            //旋转屏幕时
            //判断是否处于fixed定位，处于fixed定位需要获取J_navPholder的offsets
            $(win).on(resizeEvt,() =>{
                //setTimeout 用于低端机页面重新渲染
                win.rAF(() => {
                    var $navOset;
                    //如果el存在fixed定位 则获取占位符的定位信息
                    if(el.hasClass('fixed')){
                        $navOset = me.$pholder;
                    }else{
                        $navOset = el;
                    }
                    //重新设置一下offsetTop位置
                    me.options.offsetTop = $navOset.show().offset().top;
                    $(win).trigger('scroll');
                })
            });

        }else{
            el.addClass('sticky');
        }
        //监听事件 展开时若导航不在顶部的话，则吸顶
        tabs.on('open',() => {
            var offsetTop = $(win).scrollTop();
            if(offsetTop < me.options.offsetTop){
                win.scrollTo(0,me.options.offsetTop);
            }
        });
    }

    _stickyEvt() {
        let me = this,
            el = me.tabs.$el;
        if (win.scrollY > this.options.offsetTop) {
            if (me.stickyChange === 1) {
                me.stickyChange = 0;
                el.addClass('fixed');
                me.$pholder.show();
            }
        } else {
            if (me.stickyChange === 0) {
                me.stickyChange = 1;
                el.removeClass('fixed');
                me.$pholder.hide();
            }
        }
    }


    static supportSticky() {
        var t, n = '-webkit-sticky',
            e = document.createElement("i");
        e.style.position = n;
        t = e.style.position;
        e = null;
        return t === n;
    }
}

module.exports = Sticky;